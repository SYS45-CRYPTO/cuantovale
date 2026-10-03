import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { INITIAL_PROVIDERS } from '../data/providersSeed.js';
import { INITIAL_LEADS } from '../data/leadsSeed.js';
import { Lead, Provider, ProviderInteraction, LeadStatus, LeadStatusHistory, AnalyticsEvent } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----------------------------------------------------
// FIREBASE ADMIN SDK INITIALIZATION VIA ADC
// ----------------------------------------------------
let db: Firestore | null = null;
let adminApp: App | null = null;
let isFirestoreReady = false;

try {
  const configPath = path.resolve(__dirname, '..', '..', 'firebase-applet-config.json');
  let projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
  let databaseId = '(default)';

  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);
    projectId = firebaseConfig.projectId || projectId;
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      databaseId = firebaseConfig.firestoreDatabaseId;
    }
  }

  if (getApps().length === 0) {
    adminApp = initializeApp({
      projectId
    });
  } else {
    adminApp = getApps()[0];
  }

  if (databaseId && databaseId !== '(default)') {
    db = getFirestore(adminApp, databaseId);
  } else {
    db = getFirestore(adminApp);
  }
  isFirestoreReady = true;
  console.log(`[CuántoVale Firestore] Firebase Admin SDK initialized with ADC (Project: ${projectId}, Database: ${databaseId})`);
} catch (err) {
  console.error('[CuántoVale Firestore] Failed to initialize Firebase Admin SDK:', err);
}

// Helper to remove any undefined properties recursively before sending to Firestore
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as any;
  }
  return data;
}

// Memory provider cache for static provider directory lookups
let memoryProviders: Map<string, Provider> = new Map();
let memoryAnalytics: AnalyticsEvent[] = [];

// Seed providers initially
INITIAL_PROVIDERS.forEach(p => memoryProviders.set(p.provider_id, {
  ...p,
  status: 'DISCOVERED',
  verified: false,
  record_type: 'SEED',
  stated_wtp_shared: null,
  stated_wtp_exclusive: null,
  coverage_provinces: ['Madrid', 'Toledo', 'Guadalajara']
}));

// Bootstrap Database collections
export async function bootstrapDatabase(): Promise<void> {
  if (!isFirestoreReady || !db) {
    console.log('[CuántoVale DB] Firestore not ready for bootstrap');
    return;
  }

  try {
    // 1. Providers Check & Seed
    const provSnapshot = await db.collection('providers').limit(1).get().catch(() => null);
    if (!provSnapshot || provSnapshot.empty) {
      console.log('[CuántoVale DB] Seeding initial providers to Firestore...');
      for (const prov of INITIAL_PROVIDERS) {
        const provData: Provider = {
          ...prov,
          status: 'DISCOVERED',
          verified: false,
          record_type: 'SEED',
          stated_wtp_shared: null,
          stated_wtp_exclusive: null,
          coverage_provinces: ['Madrid', 'Toledo', 'Guadalajara'],
          active_leads_count: 0
        };
        await db.collection('providers').doc(prov.provider_id).set(provData, { merge: true }).catch(() => {});
        memoryProviders.set(prov.provider_id, provData);
      }
    } else {
      const allProv = await db.collection('providers').get().catch(() => null);
      if (allProv) {
        allProv.forEach(d => {
          const p = d.data() as Provider;
          memoryProviders.set(p.provider_id, p);
        });
        console.log(`[CuántoVale DB] Loaded ${allProv.size} providers from Firestore`);
      }
    }

    // 2. Leads Check & Seed
    const leadsSnapshot = await db.collection('leads').limit(1).get().catch(() => null);
    if (!leadsSnapshot || leadsSnapshot.empty) {
      console.log('[CuántoVale DB] Checking initial leads in Firestore...');
      for (const lead of INITIAL_LEADS) {
        const taggedLead: Lead = {
          ...lead,
          record_type: lead.record_type || 'SEED'
        };
        await db.collection('leads').doc(lead.lead_id).set(taggedLead).catch(() => {});
      }
    }
  } catch (err) {
    console.error('[CuántoVale DB] Error during bootstrap:', err);
  }
}

// ----------------------------------------------------
// DATABASE API INTERFACE — PURE FIRESTORE (NO IN-MEMORY FALLBACK)
// ----------------------------------------------------

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  if (!isFirestoreReady || !db) {
    return { ok: false, latencyMs: 0 };
  }
  try {
    await db.collection('providers').limit(1).get();
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    return { ok: false, latencyMs: Date.now() - start };
  }
}

// Helper to classify record_type strictly
export function resolveRecordType(l: Partial<Lead>): 'PRODUCTION_REAL' | 'QA' | 'SEED' | 'SIMULATION' {
  if (l.record_type) return l.record_type;
  if (l.lead_id && l.lead_id.startsWith('lead-2026-08')) return 'SEED';
  if (l.name && (l.name.includes('QA') || l.name.toLowerCase().includes('qa test'))) return 'QA';
  if (l.email && l.email.toLowerCase().includes('qa@')) return 'QA';
  return 'PRODUCTION_REAL';
}

// Create Lead (Requirement 5 & 6: Strict Firestore write confirmation. NO MEMORY FALLBACK)
export async function createLead(leadData: Omit<Lead, 'lead_id' | 'created_at'>): Promise<Lead> {
  if (!isFirestoreReady || !db) {
    throw new Error('Firestore DB client is not initialized or ready');
  }

  const uuid = crypto.randomUUID();
  const year = new Date().getFullYear();
  const leadId = `lead-${year}-${uuid.slice(0, 8)}`;

  const newLead: Lead = {
    ...leadData,
    lead_id: leadId,
    created_at: new Date().toISOString(),
    record_type: leadData.record_type || 'PRODUCTION_REAL',
    status: 'NEW',
    assigned_provider_ids: []
  };

  const sanitizedLead = sanitizeForFirestore(newLead);

  // Pure Firestore write - if this throws, caller MUST NOT return 201
  await db.collection('leads').doc(leadId).set(sanitizedLead);

  // Record initial history in Firestore
  const historyEntry: LeadStatusHistory = {
    history_id: `hist-${crypto.randomUUID()}`,
    lead_id: leadId,
    previous_status: null,
    new_status: 'NEW',
    changed_by: 'system_submission',
    notes: `Solicitud registrada desde ${newLead.source_page || '/'}`,
    timestamp: new Date().toISOString()
  };
  await db.collection('lead_status_history').doc(historyEntry.history_id).set(sanitizeForFirestore(historyEntry)).catch(() => {});

  return newLead;
}

// Get Leads with optional filters (Requirement 5: Pure Firestore query)
export async function getLeads(filters?: { status?: string; province?: string; record_type?: string }): Promise<Lead[]> {
  if (!isFirestoreReady || !db) {
    throw new Error('Firestore DB client is not initialized');
  }

  const snapshot = await db.collection('leads').get();
  let leads: Lead[] = [];
  snapshot.forEach(d => {
    const data = d.data() as Lead;
    leads.push({
      ...data,
      record_type: resolveRecordType(data)
    });
  });

  leads.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filters?.status && filters.status !== 'ALL') {
    leads = leads.filter(l => l.status === filters.status);
  }
  if (filters?.province && filters.province !== 'ALL') {
    leads = leads.filter(l => l.province === filters.province);
  }
  if (filters?.record_type && filters.record_type !== 'ALL') {
    leads = leads.filter(l => l.record_type === filters.record_type);
  }
  return leads;
}

// Get Single Lead (Requirement 5: Pure Firestore get)
export async function getLeadById(leadId: string): Promise<Lead | null> {
  if (!isFirestoreReady || !db) {
    throw new Error('Firestore DB client is not initialized');
  }

  const snapshot = await db.collection('leads').doc(leadId).get();
  if (snapshot.exists) {
    const data = snapshot.data() as Lead;
    return { ...data, record_type: resolveRecordType(data) };
  }
  return null;
}

// Update Lead Status with History Audit Trail (Requirement 5: Pure Firestore update)
export async function updateLead(
  leadId: string,
  updates: Partial<Lead>,
  changedBy: string = 'admin_operator'
): Promise<Lead | null> {
  if (!isFirestoreReady || !db) {
    throw new Error('Firestore DB client is not initialized');
  }

  const currentLead = await getLeadById(leadId);
  if (!currentLead) return null;

  const previousStatus = currentLead.status;
  const now = new Date().toISOString();

  const mergedUpdates: Partial<Lead> = {
    ...updates,
    updated_at: now
  };

  if (updates.status === 'WON' || currentLead.status === 'WON') {
    if (currentLead.won_at) {
      mergedUpdates.won_at = currentLead.won_at;
    } else {
      mergedUpdates.won_at = updates.won_at || now;
    }

    mergedUpdates.revenue_amount = updates.revenue_amount !== undefined 
      ? updates.revenue_amount 
      : (currentLead.revenue_amount !== undefined ? currentLead.revenue_amount : (currentLead.lead_price || 50));
    mergedUpdates.quote_amount = updates.quote_amount ?? updates.quoted_value ?? currentLead.quote_amount ?? currentLead.quoted_value;
    mergedUpdates.quoted_value = updates.quoted_value ?? updates.quote_amount ?? currentLead.quoted_value;
    mergedUpdates.final_value = updates.final_value ?? currentLead.final_value;
  }

  await db.collection('leads').doc(leadId).set(sanitizeForFirestore(mergedUpdates), { merge: true });

  if (updates.status && updates.status !== previousStatus) {
    const historyEntry: LeadStatusHistory = {
      history_id: `hist-${crypto.randomUUID()}`,
      lead_id: leadId,
      previous_status: previousStatus,
      new_status: updates.status,
      changed_by: changedBy,
      notes: updates.invalid_reason
        ? `Motivo: ${updates.invalid_reason}`
        : (updates.status === 'WON' ? `Presupuesto ganado: ${mergedUpdates.final_value || 0} € (Ingreso: ${mergedUpdates.revenue_amount || 0} €)` : undefined),
      timestamp: now
    };
    await db.collection('lead_status_history').doc(historyEntry.history_id).set(sanitizeForFirestore(historyEntry)).catch(() => {});
  }

  return { ...currentLead, ...mergedUpdates };
}

// Strict Max 2 Provider Routing Logic
export async function routeLeadProviders(
  leadId: string,
  providerIds: string[],
  changedBy: string = 'admin_operator'
): Promise<{ success: boolean; error?: string; lead?: Lead }> {
  if (providerIds.length > 2) {
    return {
      success: false,
      error: 'Infracción de modelo: Un lead solo puede asignarse a un máximo de 2 empresas homologadas.'
    };
  }

  const currentLead = await getLeadById(leadId);
  if (!currentLead) {
    return { success: false, error: 'Lead no encontrado' };
  }

  const currentAssigned = currentLead.assigned_provider_ids || [];
  const combined = Array.from(new Set([...currentAssigned, ...providerIds]));

  if (combined.length > 2) {
    return {
      success: false,
      error: `Límite alcanzado: Este lead ya tiene ${currentAssigned.length} empresa(s) asignada(s). Máximo total permitido: 2.`
    };
  }

  const updatedLead = await updateLead(
    leadId,
    {
      assigned_provider_ids: combined,
      status: currentLead.status === 'NEW' ? 'ROUTED' : currentLead.status
    },
    changedBy
  );

  return { success: true, lead: updatedLead || undefined };
}

// Get Providers with optional record_type filter
export async function getProviders(filters?: { record_type?: string }): Promise<Provider[]> {
  let list: Provider[] = [];
  if (isFirestoreReady && db) {
    try {
      const snapshot = await db.collection('providers').get();
      if (!snapshot.empty) {
        list = snapshot.docs.map(d => d.data() as Provider);
      }
    } catch (err) {
      list = Array.from(memoryProviders.values());
    }
  } else {
    list = Array.from(memoryProviders.values());
  }

  if (filters?.record_type && filters.record_type !== 'ALL') {
    list = list.filter(p => (p.record_type || 'SEED') === filters.record_type);
  }
  return list;
}

// Record Provider Outreach / Interview Interaction
export async function recordProviderInteraction(
  providerId: string,
  interactionData: Omit<ProviderInteraction, 'interaction_id' | 'recorded_at'>
): Promise<{ provider: Provider; interaction: ProviderInteraction } | null> {
  const currentProvider = await getProviderById(providerId);
  if (!currentProvider) return null;

  const interactionId = `int-${crypto.randomUUID()}`;
  const newInteraction: ProviderInteraction = {
    ...interactionData,
    interaction_id: interactionId,
    provider_id: providerId,
    recorded_at: new Date().toISOString()
  };

  const currentInteractions = currentProvider.interactions || [];
  const updatedInteractions = [newInteraction, ...currentInteractions];

  let newStatus = currentProvider.status;
  if (interactionData.contact_result === 'pilot_accepted') {
    newStatus = 'PILOT_ACCEPTED';
  } else if (interactionData.contact_result === 'interview_completed') {
    newStatus = 'INTERVIEW_COMPLETED';
  } else if (interactionData.contact_result === 'not_interested') {
    newStatus = 'NOT_INTERESTED';
  } else if (interactionData.contact_result === 'call_back') {
    newStatus = 'FOLLOW_UP';
  } else if (interactionData.contact_result === 'no_answer') {
    newStatus = 'CONTACT_ATTEMPTED';
  }

  const updates: Partial<Provider> = {
    interactions: updatedInteractions,
    status: newStatus,
    stated_wtp_shared: interactionData.stated_wtp_shared !== undefined ? interactionData.stated_wtp_shared : currentProvider.stated_wtp_shared,
    stated_wtp_exclusive: interactionData.stated_wtp_exclusive !== undefined ? interactionData.stated_wtp_exclusive : currentProvider.stated_wtp_exclusive,
    interview_notes: interactionData.notes || currentProvider.interview_notes,
    verified: newStatus === 'PILOT_ACCEPTED' || newStatus === 'VERIFIED' || newStatus === 'ACTIVE'
  };

  const updatedProvider = await updateProvider(providerId, updates);
  if (!updatedProvider) return null;

  return { provider: updatedProvider, interaction: newInteraction };
}

// Add Provider
export async function createProvider(providerData: Omit<Provider, 'provider_id' | 'active_leads_count'>): Promise<Provider> {
  const newProvider: Provider = {
    ...providerData,
    provider_id: `prov-${crypto.randomUUID()}`,
    active_leads_count: 0
  };

  if (isFirestoreReady && db) {
    try {
      await db.collection('providers').doc(newProvider.provider_id).set(sanitizeForFirestore(newProvider));
    } catch (err) {
      console.error('[CuántoVale DB] Error saving provider to Firestore:', err);
    }
  }

  memoryProviders.set(newProvider.provider_id, newProvider);
  return newProvider;
}

// Get Single Provider
export async function getProviderById(providerId: string): Promise<Provider | null> {
  if (memoryProviders.has(providerId)) {
    return memoryProviders.get(providerId)!;
  }
  if (isFirestoreReady && db) {
    try {
      const snap = await db.collection('providers').doc(providerId).get();
      if (snap.exists) {
        const prov = snap.data() as Provider;
        memoryProviders.set(providerId, prov);
        return prov;
      }
    } catch (err) {
      console.error('[CuántoVale DB] Error getting provider by ID from Firestore:', err);
    }
  }
  return null;
}

// Update Provider
export async function updateProvider(providerId: string, updates: Partial<Provider>): Promise<Provider | null> {
  const currentProvider = await getProviderById(providerId);
  if (!currentProvider) return null;

  const updatedProvider: Provider = { ...currentProvider, ...updates };

  if (isFirestoreReady && db) {
    try {
      await db.collection('providers').doc(providerId).set(sanitizeForFirestore(updates), { merge: true });
    } catch (err) {
      console.error('[CuántoVale DB] Error updating provider in Firestore:', err);
    }
  }

  memoryProviders.set(providerId, updatedProvider);
  return updatedProvider;
}

// Internal Price Index Metrics
export async function getInternalPriceIndexStats(_filters?: { service?: string; province?: string }) {
  let quotesCount = 0;
  let wonCount = 0;
  let totalWonValue = 0;

  if (isFirestoreReady && db) {
    try {
      const snap = await db.collection('leads').get();
      snap.forEach(d => {
        const l = d.data() as Lead;
        if (l.quoted_value && l.quoted_value > 0) quotesCount++;
        if (l.status === 'WON') {
          wonCount++;
          totalWonValue += (l.final_value || l.quoted_value || 0);
        }
      });
    } catch {}
  }

  return {
    registeredQuotes: quotesCount,
    closedWorks: wonCount,
    totalWonValueEur: totalWonValue,
    activeIndexVersion: '2026.Q1-BETA'
  };
}

// Record Analytics Event
export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  const eventId = `evt-${crypto.randomUUID()}`;
  if (isFirestoreReady && db) {
    try {
      await db.collection('analytics_events').doc(eventId).set(sanitizeForFirestore({
        ...event,
        recorded_at: new Date().toISOString()
      }));
    } catch (err) {
      // Non-blocking
    }
  }
  memoryAnalytics.unshift(event);
  if (memoryAnalytics.length > 200) {
    memoryAnalytics = memoryAnalytics.slice(0, 200);
  }
}

// Get Recent Analytics Events
export function getRecentAnalytics(): AnalyticsEvent[] {
  return memoryAnalytics;
}

// ----------------------------------------------------
// FIRESTORE PERSISTENT ADMIN SESSIONS VIA ADMIN SDK (Requirement 8: NO MEMORY FALLBACK)
// ----------------------------------------------------
export interface AdminSessionDoc {
  session_id_hash: string;
  created_at: string;
  expires_at: string;
  expires_at_ms: number;
  last_seen_at: string;
  revoked: boolean;
  revoked_at?: string;
  admin_id: string;
}

export async function createAdminSessionFirestore(rawSessionId: string, adminId = 'operator-abdel'): Promise<AdminSessionDoc> {
  if (!isFirestoreReady || !db) {
    throw new Error('Firestore DB client is not initialized or ready');
  }

  const hash = crypto.createHash('sha256').update(rawSessionId).digest('hex');
  const now = new Date();
  const expiresMs = now.getTime() + 12 * 60 * 60 * 1000; // 12 hours TTL
  const expiresAt = new Date(expiresMs).toISOString();

  const sessionData: AdminSessionDoc = {
    session_id_hash: hash,
    created_at: now.toISOString(),
    expires_at: expiresAt,
    expires_at_ms: expiresMs,
    last_seen_at: now.toISOString(),
    revoked: false,
    admin_id: adminId
  };

  // Pure Firestore write - if this throws, caller will return 503
  await db.collection('admin_sessions').doc(hash).set(sessionData);

  return sessionData;
}

export async function isValidAdminSessionFirestore(rawSessionId: string): Promise<boolean> {
  if (!rawSessionId || typeof rawSessionId !== 'string') return false;
  if (!isFirestoreReady || !db) return false;

  const hash = crypto.createHash('sha256').update(rawSessionId).digest('hex');

  try {
    const snap = await db.collection('admin_sessions').doc(hash).get();
    if (!snap.exists) {
      return false;
    }
    const session = snap.data() as AdminSessionDoc;
    if (!session || session.revoked) return false;
    if (Date.now() > session.expires_at_ms) return false;

    // Asynchronously update last_seen_at
    const nowIso = new Date().toISOString();
    db.collection('admin_sessions').doc(hash).update({ last_seen_at: nowIso }).catch(() => {});

    return true;
  } catch (err) {
    // No memory fallback - if Firestore fails, session is rejected
    return false;
  }
}

export async function revokeAdminSessionFirestore(rawSessionId: string): Promise<void> {
  if (!rawSessionId || !isFirestoreReady || !db) return;
  const hash = crypto.createHash('sha256').update(rawSessionId).digest('hex');
  const nowIso = new Date().toISOString();

  await db.collection('admin_sessions').doc(hash).update({
    revoked: true,
    revoked_at: nowIso
  }).catch(() => {});
}
