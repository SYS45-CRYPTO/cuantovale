import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { INITIAL_PROVIDERS } from '../data/providersSeed.js';
import { INITIAL_LEADS } from '../data/leadsSeed.js';
import { Lead, Provider, ProviderInteraction, LeadStatus, LeadStatusHistory, AnalyticsEvent } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read firebase-applet-config.json
let db: Firestore;
let isFirestoreReady = false;

try {
  const configPath = path.resolve(__dirname, '..', '..', 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const rawConfig = fs.readFileSync(configPath, 'utf-8');
    const firebaseConfig = JSON.parse(rawConfig);

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    
    // Support custom database ID if present in config
    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }
    isFirestoreReady = true;
    console.log(`[CuántoVale Firestore] Initialized with project ${firebaseConfig.projectId}`);
  } else {
    console.warn('[CuántoVale Firestore] firebase-applet-config.json not found');
  }
} catch (err) {
  console.error('[CuántoVale Firestore] Failed to initialize Firestore SDK:', err);
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

// Memory fallback cache for local dev resilience
let memoryLeads: Map<string, Lead> = new Map();
let memoryProviders: Map<string, Provider> = new Map();
let memoryHistory: LeadStatusHistory[] = [];
let memoryAnalytics: AnalyticsEvent[] = [];

// Seed memory initially
INITIAL_PROVIDERS.forEach(p => memoryProviders.set(p.provider_id, {
  ...p,
  status: 'DISCOVERED',
  verified: false,
  record_type: 'SEED',
  stated_wtp_shared: null,
  stated_wtp_exclusive: null,
  interactions: []
}));
INITIAL_LEADS.forEach(l => memoryLeads.set(l.lead_id, {
  ...l,
  record_type: 'SEED'
}));

// ----------------------------------------------------
// MIGRATION & BOOTSTRAP LOGIC (Requirement 4 & 24)
// ----------------------------------------------------
export async function bootstrapDatabase(): Promise<void> {
  if (!isFirestoreReady || !db) return;

  try {
    // 1. Seed or sync providers
    const provCol = collection(db, 'providers');
    const provSnapshot = await getDocs(provCol);
    
    if (provSnapshot.empty) {
      console.log('[CuántoVale DB] Bootstrapping providers collection into Firestore...');
      for (const prov of INITIAL_PROVIDERS) {
        const provData: Provider = {
          ...prov,
          status: 'DISCOVERED',
          verified: false,
          record_type: 'SEED',
          stated_wtp_shared: null,
          stated_wtp_exclusive: null,
          interactions: [],
          active_leads_count: 0
        };
        await setDoc(doc(db, 'providers', prov.provider_id), provData);
        memoryProviders.set(prov.provider_id, provData);
      }
    } else {
      provSnapshot.docs.forEach(d => {
        const p = d.data() as Provider;
        memoryProviders.set(p.provider_id, p);
      });
      console.log(`[CuántoVale DB] Loaded ${provSnapshot.size} providers from Firestore`);
    }

    // 2. Check and migrate local JSON leads from /data/db if they exist
    const localDbFile = path.resolve(__dirname, '..', '..', 'data', 'db', 'leads.json');
    let diskLeads: Lead[] = [];
    if (fs.existsSync(localDbFile)) {
      try {
        diskLeads = JSON.parse(fs.readFileSync(localDbFile, 'utf-8'));
      } catch {}
    }

    const leadsCol = collection(db, 'leads');
    const leadsSnapshot = await getDocs(query(leadsCol, limit(1)));

    if (leadsSnapshot.empty) {
      console.log('[CuántoVale DB] Migrating initial leads to Firestore...');
      const sourceLeads = diskLeads.length > 0 ? diskLeads : INITIAL_LEADS;
      for (const lead of sourceLeads) {
        const taggedLead: Lead = {
          ...lead,
          record_type: lead.record_type || 'SEED'
        };
        await setDoc(doc(db, 'leads', lead.lead_id), taggedLead);
        memoryLeads.set(lead.lead_id, taggedLead);
      }
    } else {
      const allLeadsSnapshot = await getDocs(leadsCol);
      allLeadsSnapshot.docs.forEach(d => {
        const l = d.data() as Lead;
        memoryLeads.set(l.lead_id, l);
      });
      console.log(`[CuántoVale DB] Loaded ${allLeadsSnapshot.size} leads from Firestore`);
    }
  } catch (err) {
    console.error('[CuántoVale DB] Error during bootstrap:', err);
  }
}

// ----------------------------------------------------
// DATABASE API INTERFACE
// ----------------------------------------------------

export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  if (!isFirestoreReady || !db) {
    return { ok: true, latencyMs: 0 };
  }
  try {
    const provCol = collection(db, 'providers');
    await getDocs(query(provCol, limit(1)));
    return { ok: true, latencyMs: Date.now() - start };
  } catch (err) {
    console.error('[CuántoVale DB] Ping error:', err);
    return { ok: false, latencyMs: Date.now() - start };
  }
}

// Create Lead (Multi-instance safe ID + audit trail)
export async function createLead(leadData: Omit<Lead, 'lead_id' | 'created_at'>): Promise<Lead> {
  // Concurrency-safe ID generation (UUID + readable human reference code)
  const uuid = crypto.randomUUID();
  const year = new Date().getFullYear();
  const humanRef = `CV-${year}-${uuid.slice(0, 8).toUpperCase()}`;
  const leadId = `lead-${year}-${uuid.slice(0, 8)}`;

  const newLead: Lead = {
    ...leadData,
    lead_id: leadId,
    created_at: new Date().toISOString(),
    record_type: leadData.record_type || 'PRODUCTION_REAL',
    status: 'NEW',
    assigned_provider_ids: []
  };

  if (isFirestoreReady && db) {
    try {
      const sanitizedLead = sanitizeForFirestore(newLead);
      await setDoc(doc(db, 'leads', leadId), sanitizedLead);
      
      // Record initial history
      const historyEntry: LeadStatusHistory = {
        history_id: `hist-${crypto.randomUUID()}`,
        lead_id: leadId,
        previous_status: null,
        new_status: 'NEW',
        changed_by: 'system_submission',
        notes: `Solicitud registrada desde ${leadData.source_page || '/'}`,
        timestamp: new Date().toISOString()
      };
      await setDoc(doc(db, 'lead_status_history', historyEntry.history_id), sanitizeForFirestore(historyEntry));
    } catch (err) {
      console.error('[CuántoVale DB] Error inserting lead into Firestore:', err);
    }
  }

  memoryLeads.set(leadId, newLead);
  return newLead;
}

// Helper to classify record_type strictly
export function resolveRecordType(l: Partial<Lead>): 'PRODUCTION_REAL' | 'QA' | 'SEED' | 'SIMULATION' {
  if (l.record_type) return l.record_type;
  if (l.lead_id && l.lead_id.startsWith('lead-2026-08')) return 'SEED';
  if (l.name && (l.name.includes('Concurrente') || l.name.includes('Test') || l.name.includes('QA'))) return 'QA';
  if (l.email && (l.email.includes('test') || l.email.includes('example'))) return 'QA';
  return 'SEED';
}

// Get Leads with optional filters (Requirement 2 & 24)
export async function getLeads(filters?: { status?: string; province?: string; record_type?: string }): Promise<Lead[]> {
  const mergedMap = new Map<string, Lead>();

  // Include in-memory leads
  Array.from(memoryLeads.values()).forEach(l => {
    mergedMap.set(l.lead_id, { ...l, record_type: resolveRecordType(l) });
  });

  if (isFirestoreReady && db) {
    try {
      const leadsCol = collection(db, 'leads');
      const snapshot = await getDocs(leadsCol);
      snapshot.docs.forEach(d => {
        const data = d.data() as Lead;
        mergedMap.set(data.lead_id, {
          ...data,
          record_type: resolveRecordType(data)
        });
      });
    } catch (err) {
      console.error('[CuántoVale DB] Firestore query failed, using memory cache:', err);
    }
  }

  let leads = Array.from(mergedMap.values());
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

// Get Single Lead
export async function getLeadById(leadId: string): Promise<Lead | null> {
  if (memoryLeads.has(leadId)) {
    return memoryLeads.get(leadId)!;
  }
  if (isFirestoreReady && db) {
    try {
      const docRef = doc(db, 'leads', leadId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Lead;
        memoryLeads.set(leadId, data);
        return data;
      }
    } catch (err) {
      console.error('[CuántoVale DB] Error getting lead by ID from Firestore:', err);
    }
  }
  return null;
}

// Update Lead Status with History Audit Trail (Requirement 5)
export async function updateLead(
  leadId: string,
  updates: Partial<Lead>,
  changedBy: string = 'admin_operator'
): Promise<Lead | null> {
  const currentLead = await getLeadById(leadId);
  if (!currentLead) return null;

  const previousStatus = currentLead.status;
  const updatedLead: Lead = { ...currentLead, ...updates };

  if (isFirestoreReady && db) {
    try {
      const docRef = doc(db, 'leads', leadId);
      await updateDoc(docRef, sanitizeForFirestore(updates) as any);

      // Status history entry if status changed
      if (updates.status && updates.status !== previousStatus) {
        const historyEntry: LeadStatusHistory = {
          history_id: `hist-${crypto.randomUUID()}`,
          lead_id: leadId,
          previous_status: previousStatus,
          new_status: updates.status,
          changed_by: changedBy,
          notes: updates.invalid_reason ? `Motivo: ${updates.invalid_reason}` : undefined,
          timestamp: new Date().toISOString()
        };
        await setDoc(doc(db, 'lead_status_history', historyEntry.history_id), sanitizeForFirestore(historyEntry));
      }
    } catch (err) {
      console.error('[CuántoVale DB] Error updating lead in Firestore:', err);
    }
  }

  memoryLeads.set(leadId, updatedLead);
  return updatedLead;
}

// Route Lead to Max 2 Providers
export async function routeLeadProviders(
  leadId: string,
  assignedProviderIds: string[],
  changedBy: string = 'admin_operator'
): Promise<{ success: boolean; error?: string; lead?: Lead }> {
  if (assignedProviderIds.length > 2) {
    return {
      success: false,
      error: 'Regla CuántoVale: Máximo 2 empresas instaladoras por solicitud.'
    };
  }

  const currentLead = await getLeadById(leadId);
  if (!currentLead) {
    return { success: false, error: 'Lead no encontrado' };
  }

  const newStatus: LeadStatus = assignedProviderIds.length > 0 ? 'ROUTED' : 'VERIFIED';
  const updatedLead = await updateLead(
    leadId,
    {
      assigned_provider_ids: assignedProviderIds,
      status: newStatus
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
      const provCol = collection(db, 'providers');
      const snapshot = await getDocs(provCol);
      if (!snapshot.empty) {
        list = snapshot.docs.map(d => d.data() as Provider);
      }
    } catch (err) {
      console.error('[CuántoVale DB] Error getting providers from Firestore:', err);
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

// Record Provider Outreach / Interview Interaction (Requirement 4, 5, 6)
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

  // Derive new status
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
  const providerId = `prov-${crypto.randomUUID().slice(0, 8)}`;
  const newProvider: Provider = {
    ...providerData,
    provider_id: providerId,
    active_leads_count: 0
  };

  if (isFirestoreReady && db) {
    try {
      await setDoc(doc(db, 'providers', providerId), sanitizeForFirestore(newProvider));
    } catch (err) {
      console.error('[CuántoVale DB] Error creating provider in Firestore:', err);
    }
  }

  memoryProviders.set(providerId, newProvider);
  return newProvider;
}

// Get Provider By ID
export async function getProviderById(providerId: string): Promise<Provider | null> {
  if (memoryProviders.has(providerId)) {
    return memoryProviders.get(providerId)!;
  }
  if (isFirestoreReady && db) {
    try {
      const docRef = doc(db, 'providers', providerId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data() as Provider;
        memoryProviders.set(providerId, data);
        return data;
      }
    } catch (err) {
      console.error('[CuántoVale DB] Error getting provider by ID from Firestore:', err);
    }
  }
  return null;
}

// Update Provider (Commercial workflow)
export async function updateProvider(providerId: string, updates: Partial<Provider>): Promise<Provider | null> {
  const currentProvider = await getProviderById(providerId);
  if (!currentProvider) return null;

  const updated: Provider = { ...currentProvider, ...updates };

  if (isFirestoreReady && db) {
    try {
      const docRef = doc(db, 'providers', providerId);
      await updateDoc(docRef, sanitizeForFirestore(updates) as any);
    } catch (err) {
      console.error('[CuántoVale DB] Error updating provider in Firestore:', err);
    }
  }

  memoryProviders.set(providerId, updated);
  return updated;
}

// Internal Statistical Index (Requirement 25 & 26: N, Median, P25, P75)
export async function getInternalPriceIndexStats(filters?: { service?: string; province?: string }) {
  const allLeads = await getLeads(filters);
  const quotes = allLeads
    .map(l => l.final_value || l.quoted_value || (l.provider_feedback?.quoted_amount))
    .filter((v): v is number => typeof v === 'number' && v > 0)
    .sort((a, b) => a - b);

  const n = quotes.length;
  if (n === 0) {
    return { n: 0, median: 0, p25: 0, p75: 0, min: 0, max: 0, isSampleSufficient: false };
  }

  const getPercentile = (p: number) => {
    const index = (p / 100) * (n - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    if (upper >= n) return quotes[n - 1];
    return quotes[lower] * (1 - weight) + quotes[upper] * weight;
  };

  return {
    n,
    min: quotes[0],
    max: quotes[n - 1],
    median: Math.round(getPercentile(50)),
    p25: Math.round(getPercentile(25)),
    p75: Math.round(getPercentile(75)),
    isSampleSufficient: n >= 30 // Requirement 25: Minimum 30 real quotes before public publication
  };
}

// Record Analytics Event
export async function recordAnalyticsEvent(event: AnalyticsEvent): Promise<void> {
  if (isFirestoreReady && db) {
    try {
      const eventId = `evt-${crypto.randomUUID()}`;
      await setDoc(doc(db, 'analytics_events', eventId), sanitizeForFirestore({
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
// FIRESTORE PERSISTENT ADMIN SESSIONS (Requirement FASE 3.4)
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

const memorySessions = new Map<string, AdminSessionDoc>();

export async function createAdminSessionFirestore(rawSessionId: string, adminId = 'operator-abdel'): Promise<AdminSessionDoc> {
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

  memorySessions.set(hash, sessionData);

  if (isFirestoreReady && db) {
    try {
      await setDoc(doc(db, 'admin_sessions', hash), sessionData);
    } catch (err) {
      console.error('[CuántoVale Sessions] Error persisting session to Firestore:', err);
    }
  }

  return sessionData;
}

export async function isValidAdminSessionFirestore(rawSessionId: string): Promise<boolean> {
  if (!rawSessionId || typeof rawSessionId !== 'string') return false;

  const hash = crypto.createHash('sha256').update(rawSessionId).digest('hex');

  let session: AdminSessionDoc | undefined;

  if (isFirestoreReady && db) {
    try {
      const docRef = doc(db, 'admin_sessions', hash);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        session = snap.data() as AdminSessionDoc;
      }
    } catch (err) {
      // Fallback
    }
  }

  if (!session) {
    session = memorySessions.get(hash);
  }

  if (!session) return false;
  if (session.revoked) return false;
  if (Date.now() > session.expires_at_ms) {
    return false;
  }

  // Asynchronously update last_seen_at
  const nowIso = new Date().toISOString();
  session.last_seen_at = nowIso;
  memorySessions.set(hash, session);

  if (isFirestoreReady && db) {
    updateDoc(doc(db, 'admin_sessions', hash), { last_seen_at: nowIso }).catch(() => {});
  }

  return true;
}

export async function revokeAdminSessionFirestore(rawSessionId: string): Promise<void> {
  if (!rawSessionId) return;
  const hash = crypto.createHash('sha256').update(rawSessionId).digest('hex');
  const nowIso = new Date().toISOString();

  const session = memorySessions.get(hash);
  if (session) {
    session.revoked = true;
    session.revoked_at = nowIso;
  }

  if (isFirestoreReady && db) {
    try {
      await updateDoc(doc(db, 'admin_sessions', hash), {
        revoked: true,
        revoked_at: nowIso
      });
    } catch (err) {
      console.error('[CuántoVale Sessions] Error revoking session in Firestore:', err);
    }
  }
}
