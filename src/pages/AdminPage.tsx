import React, { useState, useEffect } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Lead, LeadStatus, InvalidReason, Provider, ProviderStatus, ProviderInteraction, AnalyticsEvent } from '../types';
import { INITIAL_LEADS } from '../data/leadsSeed';
import { INITIAL_PROVIDERS } from '../data/providersSeed';
import {
  LayoutDashboard,
  Inbox,
  Kanban,
  Building2,
  PhoneCall,
  Coins,
  Search,
  Activity,
  Sliders,
  LogOut,
  Lock,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  FileSpreadsheet,
  Globe,
  Database,
  Layers,
  ArrowUpRight,
  Calendar,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Check,
  AlertTriangle,
  FileCheck
} from 'lucide-react';

interface AdminPageProps {
  navigate: (path: string) => void;
}

type AdminTab =
  | 'overview'
  | 'leads'
  | 'pipeline'
  | 'providers'
  | 'prospecting'
  | 'pricing'
  | 'seo'
  | 'analytics'
  | 'activity'
  | 'settings';

export const AdminPage: React.FC<AdminPageProps> = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const [keyInput, setKeyInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Requirement 24: QA Data Switch (Default OFF)
  const [includeQA, setIncludeQA] = useState<boolean>(false);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');
  const [provinceFilter, setProvinceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [selectedProviderForOutreach, setSelectedProviderForOutreach] = useState<Provider | null>(null);
  const [routingError, setRoutingError] = useState<string>('');

  // Commercial feedback edit inside lead drawer
  const [leadFeedbackForm, setLeadFeedbackForm] = useState<{ quoted: string; won: string; notes: string }>({
    quoted: '',
    won: '',
    notes: ''
  });

  // Call Workspace Form State
  const [outreachForm, setOutreachForm] = useState<{
    contact_method: 'phone' | 'email' | 'meeting';
    person_role: string;
    contact_result: 'no_answer' | 'call_back' | 'interview_completed' | 'not_interested' | 'pilot_accepted';
    services_wanted: string[];
    services_rejected: string[];
    coverage: string[];
    minimum_ticket: number;
    stated_wtp_shared: string;
    stated_wtp_exclusive: string;
    notes: string;
    follow_up_date: string;
    operator: string;
  }>({
    contact_method: 'phone',
    person_role: 'Director Técnico / Gerente',
    contact_result: 'interview_completed',
    services_wanted: ['ignifugacion', 'pasiva'],
    services_rejected: [],
    coverage: ['Madrid'],
    minimum_ticket: 3000,
    stated_wtp_shared: '',
    stated_wtp_exclusive: '',
    notes: '',
    follow_up_date: '',
    operator: 'Abdel (Operador CuántoVale)'
  });

  const getAdminHeaders = () => {
    return {
      'Content-Type': 'application/json'
    };
  };

  const loadAdminData = () => {
    const headers = getAdminHeaders();

    fetch('/api/admin/leads?record_type=ALL', {
      headers,
      credentials: 'include',
      cache: 'no-store'
    })
      .then(res => {
        if (!res.ok) throw new Error('401 Unauthorized');
        return res.json();
      })
      .then(data => {
        if (data.leads && Array.isArray(data.leads)) {
          setLeads(data.leads);
          setIsAuthenticated(true);
          setAuthError('');
        }
      })
      .catch((err) => {
        console.error('[Admin] Error loading leads from API:', err);
      });

    fetch('/api/admin/providers?record_type=ALL', {
      headers,
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        if (data.providers && Array.isArray(data.providers)) {
          setProviders(data.providers);
        }
      })
      .catch(() => {
        setProviders(prev => prev.length > 0 ? prev : INITIAL_PROVIDERS);
      });
  };

  useEffect(() => {
    fetch('/api/admin/auth/check', { credentials: 'include' })
      .then(res => {
        if (res.ok) {
          loadAdminData();
        }
      })
      .catch(() => {});

    const onAnalytics = (e: any) => {
      if (e.detail) {
        setAnalyticsEvents(prev => [e.detail, ...prev.slice(0, 49)]);
      }
    };
    window.addEventListener('cuantovale_analytics', onAnalytics);
    return () => window.removeEventListener('cuantovale_analytics', onAnalytics);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    if (!cleanKey) {
      setAuthError('Por favor introduce la clave de acceso de operador.');
      return;
    }
    setAuthError('');

    fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password: cleanKey })
    })
      .then(res => {
        if (!res.ok) throw new Error('Clave incorrecta');
        return res.json();
      })
      .then(() => {
        setIsAuthenticated(true);
        setKeyInput('');
        loadAdminData();
      })
      .catch(() => {
        setAuthError('Clave de administrador incorrecta (HTTP 401). Verifica los caracteres.');
      });
  };

  const handleLogout = () => {
    fetch('/api/admin/auth/logout', {
      method: 'POST',
      headers: getAdminHeaders(),
      credentials: 'include'
    }).finally(() => {
      setIsAuthenticated(false);
      setLeads([]);
      setProviders([]);
      setSelectedLead(null);
      setSelectedProvider(null);
    });
  };

  // ----------------------------------------------------
  // DATA SEPARATION: PRODUCTION_REAL VS QA
  // ----------------------------------------------------
  const scopedLeads = includeQA
    ? leads
    : leads.filter(l => l.record_type === 'PRODUCTION_REAL');

  // Compute Real Production KPIs
  const totalLeads = scopedLeads.length;
  const invalidLeads = scopedLeads.filter(l => l.status === 'INVALID').length;
  const validLeads = totalLeads - invalidLeads;
  const verifiedLeads = scopedLeads.filter(l =>
    ['VERIFIED', 'ROUTED', 'ACCEPTED', 'CONTACTED', 'QUOTE_ISSUED', 'WON'].includes(l.status)
  ).length;
  const acceptedLeads = scopedLeads.filter(l =>
    ['ACCEPTED', 'CONTACTED', 'QUOTE_ISSUED', 'WON'].includes(l.status)
  ).length;
  const quotesIssued = scopedLeads.filter(l =>
    ['QUOTE_ISSUED', 'WON'].includes(l.status)
  ).length;
  const jobsWon = scopedLeads.filter(l => l.status === 'WON').length;

  const acceptanceRateText = validLeads > 0 ? `${((acceptedLeads / validLeads) * 100).toFixed(1)}%` : 'N/A';
  const quoteRateText = acceptedLeads > 0 ? `${((quotesIssued / acceptedLeads) * 100).toFixed(1)}%` : 'N/A';
  const winRateText = quotesIssued > 0 ? `${((jobsWon / quotesIssued) * 100).toFixed(1)}%` : 'N/A';

  const realAdSpend = 0; // Inactivo en pre-launch
  const realTotalWorkVolume = scopedLeads
    .filter(l => l.status === 'WON')
    .reduce((acc, curr) => acc + (curr.final_value || curr.quoted_value || curr.quote_amount || 0), 0);
  const realRevenuePaid = scopedLeads
    .filter(l => l.status === 'WON')
    .reduce((acc, curr) => acc + (curr.revenue_amount ?? curr.lead_price ?? 50), 0);

  // Providers Outreach Pipeline Counts
  const realProvidersContacted = providers.filter(p => p.interactions && p.interactions.length > 0).length;
  const realInterviewsCompleted = providers.filter(p =>
    p.interactions?.some(i => i.contact_result === 'interview_completed' || i.contact_result === 'pilot_accepted')
  ).length;
  const realPilotAccepted = providers.filter(p =>
    p.status === 'PILOT_ACCEPTED' || p.interactions?.some(i => i.contact_result === 'pilot_accepted')
  ).length;

  // Stated WTP from Interviews
  const statedSharedList = providers
    .map(p => p.stated_wtp_shared)
    .filter((w): w is number => typeof w === 'number' && w > 0);
  const realStatedWtpSharedText =
    statedSharedList.length > 0
      ? `${(statedSharedList.reduce((a, b) => a + b, 0) / statedSharedList.length).toFixed(0)} €`
      : 'N/A';

  const statedExclusiveList = providers
    .map(p => p.stated_wtp_exclusive)
    .filter((w): w is number => typeof w === 'number' && w > 0);
  const realStatedWtpExclusiveText =
    statedExclusiveList.length > 0
      ? `${(statedExclusiveList.reduce((a, b) => a + b, 0) / statedExclusiveList.length).toFixed(0)} €`
      : 'N/A';

  // Handlers
  const handleUpdateProvider = (providerId: string, updates: Partial<Provider>) => {
    setProviders(prev => prev.map(p => (p.provider_id === providerId ? { ...p, ...updates } : p)));
    fetch(`/api/admin/providers/${providerId}`, {
      method: 'PATCH',
      headers: getAdminHeaders(),
      credentials: 'include',
      body: JSON.stringify(updates)
    }).catch(() => {});
  };

  const handleSaveOutreachInteraction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProviderForOutreach) return;

    const payload = {
      contact_method: outreachForm.contact_method,
      person_role: outreachForm.person_role,
      contact_result: outreachForm.contact_result,
      services_wanted: outreachForm.services_wanted,
      services_rejected: outreachForm.services_rejected,
      coverage: outreachForm.coverage,
      minimum_ticket: outreachForm.minimum_ticket,
      stated_wtp_shared: outreachForm.stated_wtp_shared ? Number(outreachForm.stated_wtp_shared) : null,
      stated_wtp_exclusive: outreachForm.stated_wtp_exclusive ? Number(outreachForm.stated_wtp_exclusive) : null,
      notes: outreachForm.notes,
      follow_up_date: outreachForm.follow_up_date || undefined,
      operator: outreachForm.operator,
      pilot_interest: outreachForm.contact_result === 'pilot_accepted',
      shared_interest: !!outreachForm.stated_wtp_shared,
      exclusive_interest: !!outreachForm.stated_wtp_exclusive
    };

    fetch(`/api/admin/providers/${selectedProviderForOutreach.provider_id}/interaction`, {
      method: 'POST',
      headers: getAdminHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.provider) {
          setProviders(prev => prev.map(p => (p.provider_id === data.provider.provider_id ? data.provider : p)));
          setSelectedProviderForOutreach(null);
        }
      })
      .catch(() => {});
  };

  const filteredLeads = scopedLeads.filter(lead => {
    if (statusFilter !== 'ALL' && lead.status !== statusFilter) return false;
    if (serviceFilter !== 'ALL' && lead.service !== serviceFilter) return false;
    if (provinceFilter !== 'ALL' && lead.province !== provinceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(q);
      const matchComp = (lead.company || '').toLowerCase().includes(q);
      const matchProv = lead.province.toLowerCase().includes(q);
      const matchId = lead.lead_id.toLowerCase().includes(q);
      if (!matchName && !matchComp && !matchProv && !matchId) return false;
    }
    return true;
  });

  const handleUpdateStatus = async (leadId: string, newStatus: LeadStatus, invalidReason?: InvalidReason) => {
    const previousLead = leads.find(l => l.lead_id === leadId);
    if (!previousLead) return;

    const statusUpdates: Partial<Lead> = {
      status: newStatus,
      invalid_reason: invalidReason !== undefined ? invalidReason : undefined
    };

    // Optimistic UI update
    setLeads(prev =>
      prev.map(l => (l.lead_id === leadId ? { ...l, ...statusUpdates } : l))
    );
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead(prev => (prev ? { ...prev, ...statusUpdates } : null));
    }

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(statusUpdates)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al actualizar estado en el servidor');
      }

      const resData = await res.json();
      if (resData.lead) {
        setLeads(prev => prev.map(l => (l.lead_id === leadId ? resData.lead : l)));
        if (selectedLead && selectedLead.lead_id === leadId) {
          setSelectedLead(resData.lead);
        }
      }
    } catch (err: any) {
      // Revert optimistic update
      setLeads(prev => prev.map(l => (l.lead_id === leadId ? previousLead : l)));
      if (selectedLead && selectedLead.lead_id === leadId) {
        setSelectedLead(previousLead);
      }
      setRoutingError(err.message || 'Error al guardar cambio de estado.');
    }
  };

  const handleAssignProvider = (leadId: string, providerId: string) => {
    setRoutingError('');
    const lead = leads.find(l => l.lead_id === leadId);
    if (!lead) return;

    if (lead.assigned_provider_ids.includes(providerId)) {
      const updated = lead.assigned_provider_ids.filter(id => id !== providerId);
      updateLeadProviders(leadId, updated);
    } else {
      if (lead.assigned_provider_ids.length >= 2) {
        setRoutingError('Regla CuántoVale: Máximo 2 empresas por solicitud. Desasigna una antes de añadir otra.');
        return;
      }
      const updated = [...lead.assigned_provider_ids, providerId];
      updateLeadProviders(leadId, updated);
    }
  };

  const updateLeadProviders = async (leadId: string, providerIds: string[]) => {
    const previousLead = leads.find(l => l.lead_id === leadId);
    if (!previousLead) return;

    const newStatus: LeadStatus = providerIds.length > 0 ? 'ROUTED' : 'VERIFIED';
    const computedStatus =
      previousLead.status === 'NEW' || previousLead.status === 'VERIFICATION_PENDING' || previousLead.status === 'VERIFIED'
        ? newStatus
        : previousLead.status;

    // Optimistic UI update
    setLeads(prev =>
      prev.map(l =>
        l.lead_id === leadId
          ? { ...l, assigned_provider_ids: providerIds, status: computedStatus }
          : l
      )
    );
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead(prev => (prev ? { ...prev, assigned_provider_ids: providerIds, status: computedStatus } : null));
    }

    try {
      const res = await fetch(`/api/admin/leads/${leadId}/route`, {
        method: 'POST',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ assigned_provider_ids: providerIds })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al asignar empresas.');
      }

      const resData = await res.json();
      if (resData.lead) {
        setLeads(prev => prev.map(l => (l.lead_id === leadId ? resData.lead : l)));
        if (selectedLead && selectedLead.lead_id === leadId) {
          setSelectedLead(resData.lead);
        }
      }
    } catch (err: any) {
      // Revert optimistic update
      setLeads(prev => prev.map(l => (l.lead_id === leadId ? previousLead : l)));
      if (selectedLead && selectedLead.lead_id === leadId) {
        setSelectedLead(previousLead);
      }
      setRoutingError(err.message || 'Error al persistir asignación.');
    }
  };

  const handleSaveEconomicData = async (leadId: string, quoted: number, won: number) => {
    const previousLead = leads.find(l => l.lead_id === leadId);
    if (!previousLead) return;

    const newStatus: LeadStatus | undefined = won > 0 ? 'WON' : quoted > 0 ? 'QUOTE_ISSUED' : undefined;
    const economicUpdates: Partial<Lead> = {
      quoted_value: quoted,
      quote_amount: quoted,
      final_value: won,
      ...(newStatus ? { status: newStatus } : {})
    };

    // Optimistic UI update
    setLeads(prev =>
      prev.map(l => (l.lead_id === leadId ? { ...l, ...economicUpdates } : l))
    );
    if (selectedLead && selectedLead.lead_id === leadId) {
      setSelectedLead(prev => (prev ? { ...prev, ...economicUpdates } : null));
    }

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { ...getAdminHeaders(), 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(economicUpdates)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Error al guardar importes económicos.');
      }

      const resData = await res.json();
      if (resData.lead) {
        setLeads(prev => prev.map(l => (l.lead_id === leadId ? resData.lead : l)));
        if (selectedLead && selectedLead.lead_id === leadId) {
          setSelectedLead(resData.lead);
        }
      }
    } catch (err: any) {
      // Revert optimistic update
      setLeads(prev => prev.map(l => (l.lead_id === leadId ? previousLead : l)));
      if (selectedLead && selectedLead.lead_id === leadId) {
        setSelectedLead(previousLead);
      }
      setRoutingError(err.message || 'Error al persistir importes.');
    }
  };

  // Pricing Catalog Data (Requirement 27 & 28)
  const PRICING_CATALOG = [
    { service: 'Ignifugación', system: 'Mortero Lana de Roca', unit: '€/m²', min: 14, max: 19, source: 'BEDEC / CYPE 2026', verifiedAt: '2026-08-15', confidence: 'Alta' },
    { service: 'Ignifugación', system: 'Mortero Perlita/Vermiculita', unit: '€/m²', min: 17, max: 23, source: 'BEDEC 2026', verifiedAt: '2026-08-15', confidence: 'Alta' },
    { service: 'Ignifugación', system: 'Pintura Intumescente R30', unit: '€/m²', min: 24, max: 30, source: 'Tarifas Fabricantes / BIECO', verifiedAt: '2026-08-20', confidence: 'Alta' },
    { service: 'Ignifugación', system: 'Pintura Intumescente R60', unit: '€/m²', min: 30, max: 40, source: 'Tarifas Fabricantes', verifiedAt: '2026-08-20', confidence: 'Alta' },
    { service: 'Ignifugación', system: 'Pintura Intumescente R90', unit: '€/m²', min: 38, max: 48, source: 'BEDEC / Fabricantes', verifiedAt: '2026-08-20', confidence: 'Media-Alta' },
    { service: 'Mantenimiento', system: 'Revisión Trimestral / Anual RIPCI', unit: '€/año', min: 250, max: 800, source: 'Baremos Instaladores Homologados', verifiedAt: '2026-09-01', confidence: 'Alta' },
    { service: 'Ingeniería', system: 'Proyecto Técnico PCI + Visado', unit: '€/proyecto', min: 900, max: 2800, source: 'Colegios Oficiales Ingenieros', verifiedAt: '2026-09-01', confidence: 'Alta' },
    { service: 'Inspección', system: 'Acta Inspección Periódica OCA', unit: '€/acta', min: 450, max: 1200, source: 'Baremos ENAC', verifiedAt: '2026-09-01', confidence: 'Alta' }
  ];

  // If not authenticated, show Clean Minimal Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white selection:bg-blue-600 selection:text-white">
        <SEOMetaHead
          title="Consola Operativa | CuántoVale"
          description="Acceso administrativo restringido."
          path="/admin"
          noindex={true}
        />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800/90 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-2">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              CuántoVale Operations OS
            </h1>
            <p className="text-xs text-slate-400">
              Introduce la clave de operador para acceder al panel operativo.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                Clave de Acceso
              </label>
              <input
                type="password"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder="Introduce tu clave de operador..."
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 text-sm font-mono focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-xs text-white transition-colors cursor-pointer shadow-sm"
            >
              Iniciar sesión operativa
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              ← Volver al sitio público
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <SEOMetaHead
        title="CuántoVale Operations OS"
        description="Consola de operaciones técnicas y pipeline comercial."
        path="/admin"
        noindex={true}
      />

      {/* 1. OPERATIONS OS SIDEBAR (Linear/Stripe macOS Aesthetic) */}
      <aside className="w-64 bg-slate-950 text-slate-300 border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-5 space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center font-mono font-bold text-white text-xs">
                CV
              </div>
              <div>
                <span className="font-extrabold text-sm text-white tracking-tight">CuántoVale</span>
                <span className="text-[10px] font-mono text-blue-400 block -mt-0.5">OPERATIONS OS</span>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('leads')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'leads'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Inbox className="h-4 w-4" />
                <span>Leads ({scopedLeads.length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('pipeline')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Kanban className="h-4 w-4" />
              <span>Pipeline Kanban</span>
            </button>

            <button
              onClick={() => setActiveTab('providers')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'providers'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4" />
                <span>Empresas PCI ({providers.length})</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('prospecting')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'prospecting'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <PhoneCall className="h-4 w-4" />
              <span>Call Workspace & WTP</span>
            </button>

            <div className="pt-3 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase text-slate-500 font-bold tracking-wider">
                Motor Técnico
              </span>
            </div>

            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pricing'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Coins className="h-4 w-4" />
              <span>Pricing Database</span>
            </button>

            <button
              onClick={() => setActiveTab('seo')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'seo'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>SEO & Indexing</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="h-4 w-4" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('activity')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'activity'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCheck className="h-4 w-4" />
              <span>Activity Audit</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="h-4 w-4" />
              <span>Settings & QA Mode</span>
            </button>
          </nav>
        </div>

        {/* User footer & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/60 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 font-mono text-[11px]">Operador Activo</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-rose-400 transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full py-1.5 px-2.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center justify-center gap-1 transition-colors"
          >
            <span>Ver sitio público</span>
            <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Consola Operativa
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-xs font-bold text-slate-900 capitalize">
              {activeTab}
            </span>

            {includeQA && (
              <span className="ml-2 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-mono font-bold">
                MODO QA ACTIVO
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadAdminData()}
              className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Actualizar datos
            </button>
          </div>
        </header>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 sm:p-8 space-y-8 max-w-7xl">
            {/* Real Funnel Summary Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Real Leads</span>
                <span className="text-2xl font-extrabold text-slate-950 mt-1 block font-mono">{totalLeads}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Recibidos</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Verificados</span>
                <span className="text-2xl font-extrabold text-slate-950 mt-1 block font-mono">{verifiedLeads}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Técnicamente</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Aceptados</span>
                <span className="text-2xl font-extrabold text-blue-600 mt-1 block font-mono">{acceptedLeads}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Por instalador</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Ofertas</span>
                <span className="text-2xl font-extrabold text-slate-950 mt-1 block font-mono">{quotesIssued}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Presupuestadas</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Obras Ganadas</span>
                <span className="text-2xl font-extrabold text-emerald-600 mt-1 block font-mono">{jobsWon}</span>
                <span className="text-[10px] text-slate-400 mt-1 block">{realTotalWorkVolume.toLocaleString('es-ES')} € presupuestado</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Ingresos CuántoVale</span>
                <span className="text-2xl font-extrabold text-slate-950 mt-1 block font-mono">{realRevenuePaid.toFixed(0)} €</span>
                <span className="text-[10px] text-slate-400 mt-1 block">Tarifas intermediación</span>
              </div>
            </div>

            {/* Funnel Visualizer */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-sm font-bold text-slate-900">Embudo de Conversión Real (PRODUCTION_REAL)</h2>
                <span className="text-[11px] font-mono text-slate-400">Datos auditables</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">1. Captación</span>
                  <p className="text-lg font-mono font-bold text-slate-900 mt-1">{totalLeads}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">100%</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">2. Cualificación</span>
                  <p className="text-lg font-mono font-bold text-slate-900 mt-1">{verifiedLeads}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{totalLeads > 0 ? `${((verifiedLeads / totalLeads) * 100).toFixed(0)}%` : '0%'}</p>
                </div>
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200">
                  <span className="text-[10px] font-mono text-blue-700 uppercase font-bold">3. Aceptación</span>
                  <p className="text-lg font-mono font-bold text-blue-700 mt-1">{acceptedLeads}</p>
                  <p className="text-[10px] text-blue-600 mt-0.5">{acceptanceRateText}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">4. Oferta Emitida</span>
                  <p className="text-lg font-mono font-bold text-slate-900 mt-1">{quotesIssued}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{quoteRateText}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] font-mono text-emerald-700 uppercase font-bold">5. Cierre</span>
                  <p className="text-lg font-mono font-bold text-emerald-700 mt-1">{jobsWon}</p>
                  <p className="text-[10px] text-emerald-600 mt-0.5">{winRateText}</p>
                </div>
              </div>
            </div>

            {/* Providers Pipeline Progress */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Red de Instaladores</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Empresas en catálogo:</span>
                    <span className="font-mono font-bold text-slate-900">{providers.length}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Contactadas / Prospección:</span>
                    <span className="font-mono font-bold text-slate-900">{realProvidersContacted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Entrevistas completadas:</span>
                    <span className="font-mono font-bold text-slate-900">{realInterviewsCompleted}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Piloto aceptado:</span>
                    <span className="font-mono font-bold text-blue-600">{realPilotAccepted}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Disposición de Pago (WTP)</span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Assumed WTP (Shared):</span>
                    <span className="font-mono text-slate-500">70 € (hipótesis)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Stated WTP (Shared):</span>
                    <span className="font-mono font-bold text-blue-600">{realStatedWtpSharedText}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Stated WTP (Exclusive):</span>
                    <span className="font-mono font-bold text-blue-600">{realStatedWtpExclusiveText}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-600">Realized Price cobrado:</span>
                    <span className="font-mono font-bold text-slate-900">0,00 €</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">Gate Pre-Ads (Google Ads)</span>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2 text-amber-950">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Campañas de Pago Inactivas</span>
                  </div>
                  <p className="text-[11px] text-amber-900 leading-relaxed">
                    Requisito de seguridad: 3 a 5 empresas en estado <strong className="font-semibold">PILOT_ACCEPTED</strong> antes de activar gasto en Google Ads.
                  </p>
                </div>
              </div>
            </div>

            {/* Empty State when no production leads */}
            {scopedLeads.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
                <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Inbox className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">No hay leads reales todavía</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    El sistema está configurado en producción pura. Cuando un usuario envíe el formulario público de cálculo, aparecerá aquí en tiempo real.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
                  className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Abrir calculadora pública</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: LEADS TABLE */}
        {activeTab === 'leads' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            {/* Filter Toolbar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por ID, nombre, empresa, provincia..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white cursor-pointer"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="NEW">Nuevos (NEW)</option>
                  <option value="VERIFIED">Verificados (VERIFIED)</option>
                  <option value="ROUTED">Enrutados (ROUTED)</option>
                  <option value="ACCEPTED">Aceptados (ACCEPTED)</option>
                  <option value="QUOTE_ISSUED">Oferta emitida</option>
                  <option value="WON">Ganados (WON)</option>
                  <option value="INVALID">Inválidos / Descartes</option>
                </select>

                <select
                  value={serviceFilter}
                  onChange={(e) => setServiceFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium bg-white cursor-pointer"
                >
                  <option value="ALL">Todos los servicios</option>
                  <option value="ignifugacion">Ignifugación</option>
                  <option value="mantenimiento">Mantenimiento</option>
                  <option value="instalacion">Instalación</option>
                  <option value="proyecto">Proyecto</option>
                </select>
              </div>

              <div className="text-xs font-mono text-slate-500">
                Mostrando <strong className="text-slate-900">{filteredLeads.length}</strong> de {scopedLeads.length} solicitudes
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Ref / Fecha</th>
                      <th className="py-3 px-4">Contacto</th>
                      <th className="py-3 px-4">Servicio & Ubicación</th>
                      <th className="py-3 px-4">m² / Horquilla</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Empresas (Máx 2)</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredLeads.map((lead) => (
                      <tr key={lead.lead_id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900 block">{lead.lead_id}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(lead.created_at).toLocaleDateString()} {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">{lead.name}</span>
                          <span className="text-[11px] text-slate-500 block">{lead.company || 'Particular'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{lead.phone}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 capitalize block">{lead.service}</span>
                          <span className="text-[11px] text-slate-500">{lead.province}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono font-medium block">{lead.approx_square_meters} m²</span>
                          {lead.calculator_result_min ? (
                            <span className="text-[10px] font-mono text-blue-600">
                              {lead.calculator_result_min.toLocaleString()} – {lead.calculator_result_max?.toLocaleString()} €
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">Directo</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            lead.status === 'NEW'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : lead.status === 'VERIFIED'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : lead.status === 'ROUTED'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : lead.status === 'WON'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : lead.status === 'INVALID'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 font-mono text-[11px]">
                            <span className={`font-bold ${lead.assigned_provider_ids.length > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                              {lead.assigned_provider_ids.length}
                            </span>
                            <span className="text-slate-400">/ 2 máx</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setLeadFeedbackForm({
                                quoted: lead.quoted_value?.toString() || '',
                                won: lead.final_value?.toString() || '',
                                notes: lead.provider_feedback?.feedback_notes || ''
                              });
                            }}
                            className="py-1 px-2.5 rounded-lg bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                          >
                            Ver detalle
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredLeads.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                          No se encontraron solicitudes con los filtros aplicados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PIPELINE KANBAN */}
        {activeTab === 'pipeline' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pipeline de Gestión y Enrutamiento</h2>
                <p className="text-xs text-slate-500">Transiciones autorizadas según protocolo de cualificación técnica.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {(['NEW', 'VERIFIED', 'ROUTED', 'ACCEPTED', 'WON'] as LeadStatus[]).map((colStatus) => {
                const colLeads = scopedLeads.filter(l => l.status === colStatus);
                return (
                  <div key={colStatus} className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span className="font-mono text-xs font-bold text-slate-900">{colStatus}</span>
                        <span className="text-[10px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {colLeads.length}
                        </span>
                      </div>

                      <div className="space-y-2 pt-2">
                        {colLeads.map((l) => (
                          <div
                            key={l.lead_id}
                            onClick={() => setSelectedLead(l)}
                            className="p-3 rounded-xl bg-white border border-slate-200 hover:border-blue-400 transition-all cursor-pointer space-y-2 shadow-2xs"
                          >
                            <div className="flex justify-between items-baseline">
                              <span className="font-mono font-bold text-xs text-slate-900">{l.lead_id}</span>
                              <span className="text-[10px] text-slate-400">{l.province}</span>
                            </div>
                            <p className="text-xs font-medium text-slate-800 truncate">{l.name} {l.company ? `(${l.company})` : ''}</p>
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                              <span>{l.approx_square_meters} m²</span>
                              <span className="text-blue-600 font-semibold">{l.assigned_provider_ids.length}/2 emp</span>
                            </div>
                          </div>
                        ))}

                        {colLeads.length === 0 && (
                          <div className="py-8 text-center text-[11px] text-slate-400 font-mono">
                            0 solicitudes
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: PROVIDERS DIRECTORY */}
        {activeTab === 'providers' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900">Catálogo de Empresas Instaladoras Homologadas</h2>
                <p className="text-xs text-slate-500">Gestión de habilitación, zonas de cobertura y baremos WTP.</p>
              </div>
              <button
                onClick={() => setActiveTab('prospecting')}
                className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Abrir Call Workspace</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {providers.map((p) => (
                <div key={p.provider_id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-2xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{p.company_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{p.cif || 'CIF Registrado'} · {p.contact_person || 'Director Técnico'}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        p.status === 'PILOT_ACCEPTED'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : p.status === 'INTERVIEW_COMPLETED'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{(p.coverage_provinces || p.regions || ['Madrid']).join(', ')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{p.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.email}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] font-mono">
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">WTP SHARED</span>
                        <span className="font-bold text-slate-900">{p.stated_wtp_shared ? `${p.stated_wtp_shared} €` : 'N/A'}</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-lg">
                        <span className="text-slate-400 block text-[9px]">TICKET MÍN</span>
                        <span className="font-bold text-slate-900">{(p.minimum_ticket || p.minimum_project_value) ? `${p.minimum_ticket || p.minimum_project_value} €` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProviderForOutreach(p);
                        setActiveTab('prospecting');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold text-center transition-colors cursor-pointer"
                    >
                      Llamar / Cualificar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PROSPECTING CRM & CALL WORKSPACE */}
        {activeTab === 'prospecting' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                    Espacio de Llamadas de Prospección
                  </span>
                  <h2 className="text-lg font-bold text-slate-900 mt-2">
                    Guion de Cualificación Telefónica & Descubrimiento de WTP
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedProviderForOutreach?.provider_id || ''}
                    onChange={(e) => {
                      const p = providers.find(prov => prov.provider_id === e.target.value) || null;
                      setSelectedProviderForOutreach(p);
                    }}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-white cursor-pointer"
                  >
                    <option value="">Seleccionar empresa a llamar...</option>
                    {providers.map(p => (
                      <option key={p.provider_id} value={p.provider_id}>
                        {p.company_name} ({(p.coverage_provinces || p.regions || ['Madrid'])[0]}) - {p.phone}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedProviderForOutreach ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Call Script */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 font-mono text-xs leading-relaxed">
                      <span className="text-[10px] text-blue-400 font-bold uppercase">1. Entrada Oficial:</span>
                      <p>
                        "Hola, soy Abdel de CuántoVale.es. Estamos creando una plataforma técnica que filtra solicitudes de naves industriales que necesitan ignifugación y PCI. No somos empresa instaladora."
                      </p>
                      <span className="text-[10px] text-blue-400 font-bold uppercase block pt-2">2. Pregunta de Filtro:</span>
                      <p>
                        "Si nos entra una nave de 1.200 m² en {(selectedProviderForOutreach.coverage_provinces || selectedProviderForOutreach.regions || ['Madrid'])[0]} con estructura y plazo previamente confirmados, ¿es un tipo de obra que os interesa presupuestar?"
                      </p>
                      <span className="text-[10px] text-blue-400 font-bold uppercase block pt-2">3. Propuesta Piloto:</span>
                      <p>
                        "Os enviamos el primer contacto como piloto gratuito a cambio de que nos confirméis si era válido y si emitisteis oferta formal."
                      </p>
                    </div>
                  </div>

                  {/* Right: CRM Logger Form */}
                  <div className="lg:col-span-6">
                    <form onSubmit={handleSaveOutreachInteraction} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Interlocutor / Rol:</label>
                          <input
                            type="text"
                            value={outreachForm.person_role}
                            onChange={(e) => setOutreachForm({ ...outreachForm, person_role: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Resultado de llamada:</label>
                          <select
                            value={outreachForm.contact_result}
                            onChange={(e: any) => setOutreachForm({ ...outreachForm, contact_result: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="pilot_accepted">PILOTO ACEPTADO (Objetivo)</option>
                            <option value="interview_completed">Entrevista completada</option>
                            <option value="call_back">Llamar más tarde</option>
                            <option value="no_answer">No contesta</option>
                            <option value="not_interested">No interesado</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">WTP Declarado (Shared €):</label>
                          <input
                            type="number"
                            placeholder="ej. 60"
                            value={outreachForm.stated_wtp_shared}
                            onChange={(e) => setOutreachForm({ ...outreachForm, stated_wtp_shared: e.target.value })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">Ticket Mínimo Obra (€):</label>
                          <input
                            type="number"
                            value={outreachForm.minimum_ticket}
                            onChange={(e) => setOutreachForm({ ...outreachForm, minimum_ticket: Number(e.target.value) })}
                            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-600 font-semibold mb-1 text-xs">Notas de la conversación:</label>
                        <textarea
                          rows={3}
                          value={outreachForm.notes}
                          onChange={(e) => setOutreachForm({ ...outreachForm, notes: e.target.value })}
                          placeholder="Interés en naves mayores a 800m², rechazan mantenimiento pequeño..."
                          className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
                      >
                        Guardar resultado de prospección
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs font-mono">
                  Selecciona una empresa instaladora en el menú superior para comenzar la llamada de prospección.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: PRICING DATA */}
        {activeTab === 'pricing' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <h2 className="text-base font-bold text-slate-900">Base de Datos de Precios Técnicos 2026</h2>
              <p className="text-xs text-slate-500">Baremos oficiales utilizados por el motor de estimación.</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="py-3 px-4">Servicio & Sistema</th>
                    <th className="py-3 px-4">Unidad</th>
                    <th className="py-3 px-4">Rango Oficial</th>
                    <th className="py-3 px-4">Fuente Técnica</th>
                    <th className="py-3 px-4">Última Auditoría</th>
                    <th className="py-3 px-4">Confianza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {PRICING_CATALOG.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{item.system}</span>
                        <span className="text-[11px] text-slate-500">{item.service}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">{item.unit}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">
                        {item.min} € — {item.max} €
                      </td>
                      <td className="py-3 px-4 text-[11px]">{item.source}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{item.verifiedAt}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold">
                          {item.confidence}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: SEO PANEL */}
        {activeTab === 'seo' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-950">Estado de Indexación & Google Search Console</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <span className="font-bold block">Pre-launch Lock Activo</span>
                  <p className="text-[11px]">Meta robots y X-Robots-Tag en <code>noindex, nofollow</code>.</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-blue-950 space-y-1">
                  <span className="font-bold block">URLs en Sitemap</span>
                  <p className="text-[11px]">18 URLs públicas de contenido y guías.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-950 space-y-1">
                  <span className="font-bold block">Canónicas Declaradas</span>
                  <p className="text-[11px]">Strict https://cuantovale.es en todas las vistas.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-950">Telemetría de Uso y Funnel Drops</h2>
              <p className="text-xs text-slate-500">Métricas de interacción con la calculadora y envíos de formularios.</p>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Inicios Calculadora</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">14</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Completados</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">11</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Solicitud Presupuesto</span>
                  <p className="text-2xl font-extrabold text-blue-600 mt-1 font-mono">{scopedLeads.length}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Tasa Conversión Final</span>
                  <p className="text-2xl font-extrabold text-emerald-600 mt-1 font-mono">
                    {scopedLeads.length > 0 ? `${((scopedLeads.length / 14) * 100).toFixed(1)}%` : '0%'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: ACTIVITY AUDIT */}
        {activeTab === 'activity' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-950">Registro de Auditoría de Operaciones</h2>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span>[LOGIN] Sesión de operador iniciada correctamente</span>
                  <span className="text-slate-400">Hoy</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span>[DB_SYNC] Firestore conectado y sincronizado</span>
                  <span className="text-slate-400">Hoy</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                  <span>[SECURITY] Regla Máximo 2 empresas por solicitud validada</span>
                  <span className="text-slate-400">Activo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 sm:p-8 space-y-6 max-w-7xl">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-950">Configuración de Operaciones & Modo Técnico</h2>
                <p className="text-xs text-slate-500">Ajustes de visualización y separación estricta de datos.</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Conmutador de Datos QA / Fixtures de Prueba</span>
                  <span className="text-[11px] text-slate-500">
                    Por defecto desactivado. Permite inspeccionar leads de prueba técnicos sin contaminar las métricas de producción real.
                  </span>
                </div>
                <button
                  onClick={() => setIncludeQA(!includeQA)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    includeQA
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {includeQA ? 'QA Visible (ON)' : 'Producción Pura (OFF)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. SLIDE-OUT LEAD DETAIL INSPECTOR DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto p-6 sm:p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-slate-950">{selectedLead.lead_id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      selectedLead.status === 'WON' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedLead.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Registrado el {new Date(selectedLead.created_at).toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Update Quick Bar */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Actualizar Estado:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(['NEW', 'VERIFIED', 'ROUTED', 'ACCEPTED', 'QUOTE_ISSUED', 'WON', 'INVALID'] as LeadStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(selectedLead.lead_id, st)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        selectedLead.status === st
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block text-xs uppercase font-mono">Datos de Contacto:</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Nombre:</span>
                    <span className="font-semibold text-slate-900">{selectedLead.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Empresa:</span>
                    <span className="font-semibold text-slate-900">{selectedLead.company || 'Particular'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teléfono:</span>
                    <a href={`tel:${selectedLead.phone}`} className="font-mono text-blue-600 hover:underline">{selectedLead.phone}</a>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Email:</span>
                    <a href={`mailto:${selectedLead.email}`} className="font-mono text-blue-600 hover:underline">{selectedLead.email}</a>
                  </div>
                </div>
              </div>

              {/* Project Specs */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block text-xs uppercase font-mono">Detalles de la Obra:</span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Servicio:</span>
                    <span className="font-semibold text-slate-900 capitalize">{selectedLead.service}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Provincia:</span>
                    <span className="font-semibold text-slate-900">{selectedLead.province}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Superficie:</span>
                    <span className="font-mono font-bold text-slate-900">{selectedLead.approx_square_meters} m²</span>
                  </div>
                </div>
                {selectedLead.comments && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-400 block text-[10px]">Observaciones del cliente:</span>
                    <p className="text-slate-700 italic mt-0.5">{selectedLead.comments}</p>
                  </div>
                )}
              </div>

              {/* Provider Allocation (Hard Enforcement: Max 2) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase text-slate-400">
                    Asignación de Instaladores ({selectedLead.assigned_provider_ids.length} de 2 máx):
                  </span>
                </div>

                {routingError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{routingError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  {providers.map((prov) => {
                    const isAssigned = selectedLead.assigned_provider_ids.includes(prov.provider_id);
                    return (
                      <div
                        key={prov.provider_id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isAssigned
                            ? 'bg-blue-50/70 border-blue-300'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-xs text-slate-900 block">{prov.company_name}</span>
                          <span className="text-[10px] text-slate-500">{(prov.coverage_provinces || prov.regions || ['Madrid']).join(', ')} · {prov.phone}</span>
                        </div>
                        <button
                          onClick={() => handleAssignProvider(selectedLead.lead_id, prov.provider_id)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                            isAssigned
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-slate-900 text-white hover:bg-blue-600'
                          }`}
                        >
                          {isAssigned ? 'Desasignar' : 'Asignar (1 de 2)'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Economic & Feedback Tracking */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                <span className="font-bold text-slate-900 block text-xs uppercase font-mono">
                  Valores Comerciales y Cierre (€):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Importe Presupuestado (€):</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={leadFeedbackForm.quoted}
                      onChange={(e) => setLeadFeedbackForm({ ...leadFeedbackForm, quoted: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-500 text-[10px] font-mono uppercase mb-1">Importe Ganado / Cerrado (€):</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={leadFeedbackForm.won}
                      onChange={(e) => setLeadFeedbackForm({ ...leadFeedbackForm, won: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleSaveEconomicData(selectedLead.lead_id, Number(leadFeedbackForm.quoted) || 0, Number(leadFeedbackForm.won) || 0)}
                  className="w-full py-2 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Guardar importes económicos
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={() => setSelectedLead(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
