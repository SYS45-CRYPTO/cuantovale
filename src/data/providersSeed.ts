import { Provider } from '../types';

export const INITIAL_PROVIDERS: Provider[] = [
  {
    provider_id: 'prov-mad-01',
    company_name: 'Iberia Foc Industrial S.L.',
    legal_name: 'Iberia Foc Industrial Sistemas de Protección S.L.',
    email: 'licitaciones@iberiafoc.es',
    phone: '+34 912 340 891',
    website: 'https://iberiafoc.es',
    regions: ['Madrid', 'Toledo', 'Guadalajara'],
    postcodes: ['28001', '28800', '45001'],
    services: {
      active_fire: true,
      passive_fire: true,
      maintenance: true,
      engineering: true,
      industrial: true
    },
    minimum_project_value: 3000,
    shared_leads: true,
    exclusive_leads: false,
    verified: false,
    status: 'DISCOVERED',
    notes: 'Especialista en proyección de mortero de lana de roca y pintura intumescente con laboratorio móvil de ensayo.',
    active_leads_count: 0
  },
  {
    provider_id: 'prov-mad-02',
    company_name: 'Soluciones Pasivas del Centro S.L.',
    legal_name: 'Soluciones Pasivas de Protección Contra Incendios S.L.',
    email: 'proyectos@pasivascentro.com',
    phone: '+34 916 882 104',
    website: 'https://pasivascentro.com',
    regions: ['Madrid', 'Segovia', 'Ávila'],
    services: {
      active_fire: false,
      passive_fire: true,
      maintenance: true,
      engineering: true,
      industrial: true
    },
    minimum_project_value: 2500,
    shared_leads: true,
    exclusive_leads: true,
    verified: false,
    status: 'DISCOVERED',
    notes: 'Flota propia de plataformas elevadoras y certificadores colegiados.',
    active_leads_count: 0
  },
  {
    provider_id: 'prov-bcn-01',
    company_name: 'Catalana de Protección Pasiva S.L.',
    legal_name: 'Protecció Passiva Integral de Catalunya S.L.',
    email: 'contacte@protecciopassiva.cat',
    phone: '+34 934 502 910',
    website: 'https://protecciopassiva.cat',
    regions: ['Barcelona', 'Girona', 'Tarragona', 'Lleida'],
    services: {
      active_fire: true,
      passive_fire: true,
      maintenance: true,
      engineering: true,
      industrial: true
    },
    minimum_project_value: 3500,
    shared_leads: true,
    exclusive_leads: true,
    verified: false,
    status: 'DISCOVERED',
    notes: 'Cobertura integral Cataluña. Homologación Applus y departamento de ingeniería para memorias RSCIEI.',
    active_leads_count: 0
  },
  {
    provider_id: 'prov-val-01',
    company_name: 'Levante Fire Engineering S.L.',
    legal_name: 'Levantina de Seguridad y Protección Fuego S.L.',
    email: 'operaciones@levantefire.com',
    phone: '+34 963 811 405',
    website: 'https://levantefire.com',
    regions: ['Valencia', 'Alicante', 'Castellón'],
    services: {
      active_fire: true,
      passive_fire: true,
      maintenance: true,
      engineering: true,
      industrial: true
    },
    minimum_project_value: 2000,
    shared_leads: true,
    exclusive_leads: false,
    verified: false,
    status: 'DISCOVERED',
    notes: 'Gran experiencia en polígonos de Ribarroja, Paterna y Sagunto.',
    active_leads_count: 0
  },
  {
    provider_id: 'prov-bal-01',
    company_name: 'Baleares Ignifugaciones Técnicas S.L.',
    legal_name: 'Baleares Ignifugaciones y Protección Balear S.L.',
    email: 'info@balearspci.es',
    phone: '+34 971 789 220',
    website: 'https://balearspci.es',
    regions: ['Baleares'],
    services: {
      active_fire: true,
      passive_fire: true,
      maintenance: true,
      engineering: false,
      industrial: true
    },
    minimum_project_value: 4000,
    shared_leads: true,
    exclusive_leads: false,
    verified: false,
    status: 'DISCOVERED',
    notes: 'Base en Palma y cobertura en polígonos de Mallorca e Ibiza.',
    active_leads_count: 0
  }
];
