import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  Firestore
} from 'firebase/firestore';
import { Lead, Provider, LeadStatusHistory } from './types';
import { INITIAL_LEADS } from './data/leadsSeed';
import { INITIAL_PROVIDERS } from './data/providersSeed';

export const firebaseConfig = {
  projectId: "flawless-repeater-qmn89",
  appId: "1:961949281629:web:cd10035768cc0d6492ccb4",
  apiKey: "AIzaSyD6-GdZ9lo-6VWlHfMMHzL8OIgOdd6nPkI",
  authDomain: "flawless-repeater-qmn89.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-cuntovaleintelig-dd8219a4-b6d2-4fb2-83ba-742db7ff5709",
  storageBucket: "flawless-repeater-qmn89.firebasestorage.app",
  messagingSenderId: "961949281629"
};

let clientDb: Firestore | null = null;

export function getClientDb(): Firestore {
  if (!clientDb) {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    clientDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
  return clientDb;
}

function sanitizeFirestoreDoc(obj: Record<string, any>): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      clean[key] = sanitizeFirestoreDoc(value);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Submit lead directly to Firestore with local storage backup
 */
export async function submitLeadDirectly(leadData: Partial<Lead>): Promise<Lead> {
  const leadId = `lead-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  const fullLead: Lead = {
    lead_id: leadId,
    created_at: now,
    service: leadData.service || 'ignifugacion',
    province: leadData.province || 'Madrid',
    postcode: leadData.postcode || '28001',
    property_type: leadData.property_type || 'industrial',
    approx_square_meters: Number(leadData.approx_square_meters) || 600,
    need_status: (leadData.need_status as any) || 'adecuacion',
    timeframe: leadData.timeframe || '1_3_meses',
    name: leadData.name || 'Cliente',
    company: leadData.company || '',
    phone: leadData.phone || '',
    email: leadData.email || '',
    comments: leadData.comments || '',
    dynamic_fields: leadData.dynamic_fields || {},
    source_page: leadData.source_page || (typeof window !== 'undefined' ? window.location.pathname : '/'),
    source_channel: 'organic_direct',
    utm_source: leadData.utm_source || '',
    utm_medium: leadData.utm_medium || '',
    utm_campaign: leadData.utm_campaign || '',
    utm_content: leadData.utm_content || '',
    gclid: leadData.gclid || '',
    calculator_used: !!leadData.calculator_used,
    calculator_result_min: leadData.calculator_result_min ?? null as any,
    calculator_result_max: leadData.calculator_result_max ?? null as any,
    calculator_confidence: leadData.calculator_confidence ?? null as any,
    consent_accepted: true,
    consent_timestamp: now,
    consent_version: '2026-v1',
    status: 'NEW',
    lead_model: 'SHARED',
    assigned_provider_ids: []
  };

  // 1. Save to Firestore
  try {
    const db = getClientDb();
    const leadRef = doc(db, 'leads', leadId);
    const sanitizedLead = sanitizeFirestoreDoc(fullLead);
    await setDoc(leadRef, sanitizedLead);

    // Initial audit log
    const historyId = `hist-${Date.now()}`;
    const histRef = doc(db, 'lead_status_history', historyId);
    const histData: LeadStatusHistory = {
      history_id: historyId,
      lead_id: leadId,
      previous_status: null,
      new_status: 'NEW',
      timestamp: now,
      changed_by: 'lead_form_public',
      notes: 'Solicitud creada directamente desde cuantovale.es'
    };
    await setDoc(histRef, sanitizeFirestoreDoc(histData)).catch(() => {});
    console.log('[Firestore Client] Successfully stored lead in Firestore:', leadId);
  } catch (firestoreErr) {
    console.warn('[Firestore Client] Direct Firestore write failed, using local backup:', firestoreErr);
  }

  // 2. Backup to browser localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cuantovale_leads_cache') || '[]';
      const parsed = JSON.parse(stored);
      parsed.unshift(fullLead);
      localStorage.setItem('cuantovale_leads_cache', JSON.stringify(parsed.slice(0, 50)));
      window.dispatchEvent(new CustomEvent('cuantovale_lead_created', { detail: fullLead }));
    } catch (e) {
      // ignore localstorage errors
    }
  }

  return fullLead;
}

/**
 * Fetch all leads from Firestore with local fallback
 */
export async function getLeadsDirectly(): Promise<Lead[]> {
  try {
    const db = getClientDb();
    const leadsRef = collection(db, 'leads');
    const q = query(leadsRef, orderBy('created_at', 'desc'));
    const snapshot = await getDocs(q);

    const firestoreLeads: Lead[] = [];
    snapshot.forEach(docSnap => {
      firestoreLeads.push(docSnap.data() as Lead);
    });

    if (firestoreLeads.length > 0) {
      return firestoreLeads;
    }
  } catch (err) {
    console.warn('[Firestore Client] Could not read leads from Firestore:', err);
  }

  // Local storage fallback
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('cuantovale_leads_cache');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {}
  }

  return INITIAL_LEADS;
}
