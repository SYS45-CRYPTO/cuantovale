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

// Note: All database mutations must pass exclusively through server-side /api routes (Requirement 1)
// Direct browser mutations to Firestore are strictly prohibited for security & integrity.

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
      const data = docSnap.data() as Lead;
      // Ensure record_type is correctly resolved
      const resolvedRecordType = data.record_type || (data.lead_id?.startsWith('lead-2026-08') ? 'SEED' : 'PRODUCTION_REAL');
      firestoreLeads.push({
        ...data,
        record_type: resolvedRecordType
      });
    });

    if (firestoreLeads.length > 0) {
      return firestoreLeads;
    }
  } catch (err) {
    console.warn('[Firestore Client] Could not read leads from Firestore:', err);
  }

  return [];
}
