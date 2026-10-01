export type LeadStatus =
  | 'NEW'
  | 'VERIFICATION_PENDING'
  | 'VERIFIED'
  | 'ROUTED'
  | 'ACCEPTED'
  | 'CONTACTED'
  | 'QUOTE_ISSUED'
  | 'WON'
  | 'LOST'
  | 'INVALID';

export type InvalidReason =
  | 'INVALID_PHONE'
  | 'DUPLICATE'
  | 'OUT_OF_AREA'
  | 'WRONG_SERVICE'
  | 'NO_CONSENT'
  | 'FAKE'
  | 'UNCONTACTABLE';

export type LeadModel = 'SHARED' | 'PREMIUM' | 'EXCLUSIVE';

export type PCIService =
  | 'ignifugacion'
  | 'mantenimiento'
  | 'instalacion'
  | 'proyecto'
  | 'legalizacion'
  | 'inspeccion_oca';

export type ConfidenceLevel = 'ALTO' | 'MEDIO' | 'BAJO';

export interface CalculatorIgnifugacionInputs {
  province: string;
  approxNaveSurface: number; // m2 planta de nave
  structuralSurface?: number; // m2 reales de estructura a tratar (opcional)
  structureType: 'acero' | 'hormigon' | 'madera' | 'no_se';
  fireResistance: 'R30' | 'R60' | 'R90' | 'R120' | 'otra' | 'no_se';
  systemPreference: 'pintura_intumescente' | 'mortero' | 'placa' | 'no_se';
  heightAccess: 'normal' | 'altura_importante' | 'no_se';
  state: 'nueva' | 'ya_protegida' | 'rehabilitacion' | 'no_se';
}

export interface CalculationResult {
  minEstimate: number;
  maxEstimate: number;
  medianEstimate: number;
  unit: string;
  confidence: ConfidenceLevel;
  confidenceReason: string;
  estimatedStructuralM2: number;
  isEstimatedStructuralM2: boolean;
  costBreakdown: {
    materialYAplicacionMin: number;
    materialYAplicacionMax: number;
    mediosAuxiliaresMin: number;
    mediosAuxiliaresMax: number;
    ensayoCertificadoMin: number;
    ensayoCertificadoMax: number;
  };
  keyCostDrivers: string[];
  missingVariables: string[];
  methodologyNote: string;
  sourceReference: string;
  lastUpdated: string;
}

export interface Lead {
  lead_id: string;
  created_at: string;
  service: PCIService;
  province: string;
  postcode: string;
  property_type: string;
  approx_square_meters: number;
  need_status: 'nueva_instalacion' | 'mantenimiento' | 'adecuacion' | 'legalizacion' | 'requerimiento_inspeccion' | 'otro';
  timeframe: 'cuanto_antes' | 'menos_1_mes' | '1_3_meses' | 'mas_adelante' | 'no_se';
  
  // Contact
  name: string;
  company?: string;
  phone: string;
  email: string;
  comments?: string;
  
  // Dynamic fields
  dynamic_fields: {
    structure_type?: string;
    required_fire_resistance?: string;
    system_preference?: string;
    structural_surface?: number;
    height_access?: string;
    extinguishers?: number;
    bie_count?: number;
    detection_installed?: boolean;
    sprinklers?: boolean;
    existing_project?: boolean;
    inspection_requirement?: boolean;
  };
  
  // Attachments metadata
  attachment_notes?: string;

  // Acquisition & Tracking
  source_page: string;
  source_channel: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  gclid?: string;

  // Calculator connection
  calculator_used: boolean;
  calculator_result_min?: number;
  calculator_result_max?: number;
  calculator_confidence?: ConfidenceLevel;

  // Consent
  consent_accepted: boolean;
  consent_timestamp: string;
  consent_version: string;

  // Status & Routing
  status: LeadStatus;
  invalid_reason?: InvalidReason;
  assigned_provider_ids: string[]; // Max 2
  provider_responses?: {
    provider_id: string;
    assigned_at: string;
    status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CONTACTED';
    contacted_at?: string;
    quoted_amount?: number;
    notes?: string;
  }[];

  // Environment & Commercial Truth (Requirement 2 & 24)
  record_type?: 'PRODUCTION_REAL' | 'QA' | 'SEED' | 'SIMULATION';
  is_pilot?: boolean;
  payment_status?: 'PRICE_AGREED' | 'INVOICED' | 'PAID' | 'UNPAID';

  // Commercial & Feedback Data (Phase 2 Validation)
  lead_price?: number;
  paid_by_provider?: boolean;
  lead_model: LeadModel;
  quoted_value?: number;
  final_value?: number;
  provider_feedback?: {
    was_valid?: boolean;
    was_contacted?: boolean;
    requested_quote?: boolean;
    quote_issued?: boolean;
    quoted_amount?: number;
    job_won?: boolean;
    final_amount?: number;
    would_buy_similar?: boolean;
    feedback_notes?: string;
    submitted_at?: string;
  };
  customer_feedback?: {
    was_contacted?: boolean;
    quotes_received_count?: number;
    hired?: boolean;
    final_amount?: number;
    satisfaction_rating?: number;
    submitted_at?: string;
  };
}

export type ProviderStatus =
  | 'DISCOVERED'
  | 'CONTACT_ATTEMPTED'
  | 'CONTACTED'
  | 'INTERVIEW_COMPLETED'
  | 'NOT_INTERESTED'
  | 'FOLLOW_UP'
  | 'PILOT_ACCEPTED'
  | 'VERIFIED'
  | 'ACTIVE'
  | 'PAUSED';

export interface ProviderInteraction {
  interaction_id: string;
  provider_id: string;
  contact_date: string;
  contact_method: 'phone' | 'email' | 'meeting';
  person_role?: string;
  contact_result: 'no_answer' | 'call_back' | 'interview_completed' | 'not_interested' | 'pilot_accepted';
  services_wanted: string[];
  services_rejected: string[];
  coverage: string[];
  minimum_ticket?: number;
  required_lead_data?: string;
  pilot_interest: boolean;
  shared_interest: boolean;
  exclusive_interest: boolean;
  stated_wtp_shared?: number | null;
  stated_wtp_exclusive?: number | null;
  follow_up_date?: string;
  notes?: string;
  operator: string;
  recorded_at: string;
}

export interface Provider {
  provider_id: string;
  company_name: string;
  legal_name: string;
  cif?: string;
  contact_person?: string;
  email: string;
  phone: string;
  website?: string;
  regions: string[]; // Provinces: Madrid, Barcelona, Valencia, Baleares, etc.
  coverage_provinces?: string[];
  postcodes?: string[];
  services: {
    active_fire: boolean;
    passive_fire: boolean;
    maintenance: boolean;
    engineering: boolean;
    industrial: boolean;
  };
  minimum_project_value: number;
  minimum_ticket?: number;
  shared_leads: boolean;
  exclusive_leads: boolean;
  verified: boolean;
  status: ProviderStatus;
  record_type?: 'PRODUCTION_REAL' | 'QA' | 'SEED' | 'SIMULATION';
  stated_wtp_shared?: number | null;
  stated_wtp_exclusive?: number | null;
  willingness_to_pay?: number;
  interview_notes?: string;
  interactions?: ProviderInteraction[];
  notes?: string;
  active_leads_count: number;
}

export interface PricingItem {
  id: string;
  service: PCIService;
  system: string;
  unit: string;
  min: number;
  median: number;
  max: number;
  province_adjustment: Record<string, number>;
  valid_from: string;
  valid_to: string;
  source: string;
  source_url?: string;
  verified_at: string;
  notes: string;
}

export interface AnalyticsEvent {
  event_name:
    | 'calculator_view'
    | 'calculator_start'
    | 'calculator_step'
    | 'calculator_complete'
    | 'quote_request'
    | 'lead_submit'
    | 'lead_verified'
    | 'lead_accepted'
    | 'provider_contacted'
    | 'quote_issued'
    | 'job_won'
    | 'phone_click'
    | 'email_click'
    | 'whatsapp_click';
  timestamp: string;
  service?: string;
  province?: string;
  page: string;
  step?: number;
  confidence?: ConfidenceLevel;
  lead_id?: string;
}

export interface LeadStatusHistory {
  history_id: string;
  lead_id: string;
  previous_status: LeadStatus | null;
  new_status: LeadStatus;
  changed_by: string;
  notes?: string;
  timestamp: string;
}

export interface BusinessKPIs {
  totalLeads: number;
  validLeads: number;
  acceptedLeads: number;
  quotesIssued: number;
  jobsWon: number;
  acceptanceRate: number; // accepted / valid
  quoteRate: number; // quoted / accepted
  winRate: number; // won / quoted
  totalQuotedValue: number;
  totalContractedValue: number;
  averageContractValue: number;
  // Commercial Validation KPIs (Phase 2)
  providersContacted: number;
  pilotProviders: number;
  activeProviders: number;
  adSpend: number;
  cacLead: number;
  cacAcceptedLead: number;
  actualPaidLeads: number;
  totalRevenue: number;
  grossMargin: number;
  averageWillingnessToPay: number;
}
