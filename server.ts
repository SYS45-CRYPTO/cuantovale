import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { PCI_PRICING_DATABASE } from './src/data/pricing/pciPricingData.js';
import { calculateIgnifugacionCost } from './src/utils/calculatorEngine.js';
import {
  bootstrapDatabase,
  pingDatabase,
  createLead,
  getLeads,
  getLeadById,
  updateLead,
  routeLeadProviders,
  getProviders,
  getProviderById,
  updateProvider,
  createProvider,
  recordProviderInteraction,
  getInternalPriceIndexStats,
  recordAnalyticsEvent,
  getRecentAnalytics,
  createAdminSessionFirestore,
  isValidAdminSessionFirestore,
  revokeAdminSessionFirestore
} from './src/server/db.js';
import { dispatchLeadConfirmationEmail } from './src/server/email.js';
import { Lead, Provider, AnalyticsEvent, CalculatorIgnifugacionInputs } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_SECRET_KEY = (process.env.ADMIN_SECRET_KEY || 'cv-admin-2026-pci').trim();

// Server-Side Revocable Session Store (Requirement 2 & 3: 12h Expiration, Instant Revocation)
const activeAdminSessions = new Map<string, { createdAt: number; expiresAt: number }>();

function createServerAdminSession(): string {
  const sessionId = `cv_sid_${crypto.randomUUID()}`;
  const now = Date.now();
  const expiresAt = now + 12 * 60 * 60 * 1000; // 12 hours duration
  activeAdminSessions.set(sessionId, { createdAt: now, expiresAt });
  return sessionId;
}

function isValidServerAdminSession(sessionId: string): boolean {
  if (!sessionId || typeof sessionId !== 'string') return false;
  if (sessionId === ADMIN_SECRET_KEY) return true; // CLI / dev test script backward compatibility

  const session = activeAdminSessions.get(sessionId);
  if (!session) return false;
  if (Date.now() > session.expiresAt) {
    activeAdminSessions.delete(sessionId);
    return false;
  }
  return true;
}

function revokeServerAdminSession(sessionId: string): void {
  if (sessionId && activeAdminSessions.has(sessionId)) {
    activeAdminSessions.delete(sessionId);
  }
}
// GO LIVE SEO: Enable public indexing for production domain https://cuantovale.es
const PUBLIC_INDEXING_ENABLED = true;

// ----------------------------------------------------
// BODY PARSER, COOKIE PARSER & MIDDLEWARE
// ----------------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Bootstrap Firestore database & migrate existing seeds
bootstrapDatabase().catch(err => {
  console.error('[CuántoVale DB] Bootstrap initialization error:', err);
});

// Helper to detect if request is hitting a technical staging hostname (*.run.app)
function isStagingHostname(req: Request): boolean {
  const host = (req.headers['host'] || '').toLowerCase();
  const forwardedHost = (req.headers['x-forwarded-host'] || '').toString().toLowerCase();

  // Explicit production domain headers take precedence
  if (host.includes('cuantovale.es') || forwardedHost.includes('cuantovale.es')) {
    return false;
  }

  // Technical Cloud Run / preview staging hostnames
  if (host.includes('.run.app') || forwardedHost.includes('.run.app')) {
    return true;
  }

  return false;
}

// Canonical Domain & HTTPS Redirect Middleware (Requirement 7 & 8)
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = (req.headers['host'] || '').toLowerCase();
  const proto = (req.headers['x-forwarded-proto'] || req.protocol).toString();

  // Redirect http -> https in production
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  // Redirect www.cuantovale.es -> cuantovale.es
  if (host.startsWith('www.cuantovale.es')) {
    return res.redirect(301, `https://cuantovale.es${req.originalUrl}`);
  }

  next();
});

// Host-Aware X-Robots-Tag Header Middleware (Requirements 1, 2, 3, 12)
app.use((req: Request, res: Response, next: NextFunction) => {
  const isStaging = isStagingHostname(req);
  const path = req.path;

  // Technical staging hostnames (*.run.app) always get noindex, nofollow
  if (isStaging || !PUBLIC_INDEXING_ENABLED) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  } else if (path.startsWith('/admin') || path.startsWith('/api')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  } else {
    // Public custom domain pages get index, follow
    res.setHeader('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large');
  }

  next();
});

// Anti-Spam Rate Limiter for Public Leads
const ipSubmissionTimestamps = new Map<string, number[]>();

const rateLimitLeads = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxSubmissions = 20; // max 20 per minute

  const timestamps = (ipSubmissionTimestamps.get(ip) || []).filter(t => now - t < windowMs);
  if (timestamps.length >= maxSubmissions) {
    console.warn(`[CuántoVale RateLimiter] Rate limit exceeded for IP ${ip.slice(0, 7)}***`);
    return res.status(429).json({
      error: 'Demasiadas solicitudes enviadas recientemente. Por favor, espera un minuto.'
    });
  }
  timestamps.push(now);
  ipSubmissionTimestamps.set(ip, timestamps);
  next();
};

// Admin Authentication Middleware (Requirement 15 & 16)
// Supports HttpOnly session cookie cv_admin_session, x-admin-key / x-admin-session header, or Bearer token
const requireAdminAuth = async (req: Request, res: Response, next: NextFunction) => {
  const cookieSession = req.cookies?.cv_admin_session;
  const adminKeyHeader = req.headers['x-admin-key'] || req.headers['x-admin-session'];
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  const providedSessionId = (cookieSession as string) || (adminKeyHeader as string) || bearerToken;

  if (!providedSessionId) {
    return res.status(401).json({
      error: 'No autorizado. Se requiere sesión de administrador (HTTP 401).'
    });
  }

  // Allow direct master key comparison for automated test scripts / CLI
  let isValid = providedSessionId === ADMIN_SECRET_KEY;
  if (!isValid) {
    isValid = await isValidAdminSessionFirestore(providedSessionId);
  }

  if (!isValid) {
    return res.status(401).json({
      error: 'No autorizado. Sesión administrativa inválida, revocada o expirada (HTTP 401).'
    });
  }

  // Basic CSRF Origin Verification on Mutable Admin Operations
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method)) {
    const origin = req.headers['origin'] || req.headers['referer'];
    if (origin && process.env.NODE_ENV === 'production') {
      const allowedHost = req.headers['host'];
      if (allowedHost && !origin.includes(allowedHost)) {
        return res.status(403).json({ error: 'Acceso rechazado por verificación CSRF de origen.' });
      }
    }
  }

  next();
};

// ----------------------------------------------------
// PUBLIC HEALTH CHECK & OBSERVABILITY (Requirement 19 & 20)
// ----------------------------------------------------
app.get('/api/health', async (_req: Request, res: Response) => {
  const dbHealth = await pingDatabase();
  const mem = process.memoryUsage();

  const healthData = {
    status: dbHealth.ok ? 'healthy' : 'degraded',
    version: '2026.1.3',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      type: 'firestore',
      connected: dbHealth.ok,
      latencyMs: dbHealth.latencyMs
    },
    memory: {
      rssMb: Math.round(mem.rss / (1024 * 1024)),
      heapUsedMb: Math.round(mem.heapUsed / (1024 * 1024))
    }
  };

  const httpStatus = dbHealth.ok ? 200 : 503;
  res.status(httpStatus).json(healthData);
});

// ----------------------------------------------------
// PUBLIC API ROUTES
// ----------------------------------------------------

// 1. Calculator Estimation Endpoint
app.post('/api/calculator/estimate', (req: Request, res: Response) => {
  try {
    const inputs: CalculatorIgnifugacionInputs = req.body;
    if (!inputs.province || !inputs.approxNaveSurface) {
      return res.status(400).json({ error: 'Provincia y superficie de nave son obligatorias.' });
    }
    const calculation = calculateIgnifugacionCost(inputs);
    res.json({ calculation });
  } catch (err: any) {
    console.error('[CuántoVale API] Error in calculation engine:', err.message);
    res.status(500).json({ error: 'Error en el motor de cálculo.' });
  }
});

// 2. Pricing Database
app.get('/api/pricing', (_req: Request, res: Response) => {
  res.json({ pricing: PCI_PRICING_DATABASE });
});

// 3. Lead Submission with Server-Side Validation, Honeypot, UTM Capture & Concurrency-Safe Storage
app.post('/api/leads', rateLimitLeads, async (req: Request, res: Response) => {
  try {
    const {
      service,
      province,
      postcode,
      property_type,
      approx_square_meters,
      need_status,
      timeframe,
      name,
      company,
      phone,
      email,
      comments,
      dynamic_fields,
      attachment_notes,
      source_page,
      source_channel,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_term,
      utm_content,
      gclid,
      calculator_used,
      calculator_result_min,
      calculator_result_max,
      calculator_confidence,
      consent_accepted,
      website_hp
    } = req.body;

    // Honeypot spam check
    if (website_hp) {
      return res.status(200).json({ success: true, message: 'Solicitud procesada.' });
    }

    // Server-side validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ error: 'Nombre obligatorio.' });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return res.status(400).json({ error: 'Teléfono de contacto no válido.' });
    }
    if (!email || !email.includes('@') || !email.includes('.')) {
      return res.status(400).json({ error: 'Email de contacto no válido.' });
    }
    if (!consent_accepted) {
      return res.status(400).json({ error: 'Debes aceptar la cesión a un máximo de 2 empresas homologadas.' });
    }

    const leadPayload: Omit<Lead, 'lead_id' | 'created_at'> = {
      service: service || 'ignifugacion',
      province: province || 'Madrid',
      postcode: postcode || '',
      property_type: property_type || 'Nave industrial',
      approx_square_meters: Number(approx_square_meters) || 500,
      need_status: need_status || 'adecuacion',
      timeframe: timeframe || 'menos_1_mes',
      name: name.trim(),
      company: company ? company.trim() : undefined,
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      comments: comments ? comments.trim() : undefined,
      dynamic_fields: dynamic_fields || {},
      attachment_notes: attachment_notes || undefined,
      source_page: source_page || '/',
      source_channel: source_channel || (utm_source ? 'cpc/campaign' : 'direct'),
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_term: utm_term || undefined,
      utm_content: utm_content || undefined,
      gclid: gclid || undefined,
      calculator_used: !!calculator_used,
      calculator_result_min: calculator_result_min,
      calculator_result_max: calculator_result_max,
      calculator_confidence: calculator_confidence,
      consent_accepted: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: '2026-v1',
      status: 'NEW',
      lead_model: 'SHARED',
      assigned_provider_ids: []
    };

    const newLead = await createLead(leadPayload);

    // Dispatch Transactional Email (with fallback audit log)
    dispatchLeadConfirmationEmail(newLead).catch(err => {
      console.error('[CuántoVale Email] Background dispatch failed:', err.message);
    });

    console.log(`[CuántoVale Lead] Created: ${newLead.lead_id} (${newLead.service} en ${newLead.province})`);

    res.status(201).json({ success: true, lead: newLead });
  } catch (err: any) {
    console.error('[CuántoVale Lead] Submission error:', err.message);
    res.status(500).json({ error: 'Error al registrar la solicitud.' });
  }
});

// ----------------------------------------------------
// SECURED ADMIN API ROUTES (Requirements 15 & 16)
// ----------------------------------------------------

// Admin Login Route (Creates Persistent Firestore Session & sets HttpOnly cookie)
app.post('/api/admin/auth/login', async (req: Request, res: Response) => {
  const { password } = req.body;
  const inputKey = typeof password === 'string' ? password.trim() : '';
  if (!inputKey || inputKey !== ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Clave de acceso de operador incorrecta.' });
  }

  const rawSessionId = `cv_sid_${crypto.randomUUID()}`;
  await createAdminSessionFirestore(rawSessionId, 'operator-abdel');

  // Set secure SameSite=Lax HttpOnly session cookie (12h duration)
  res.cookie('cv_admin_session', rawSessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 12 * 60 * 60 * 1000 // 12 hours
  });

  res.json({
    success: true,
    message: 'Sesión administrativa iniciada y registrada en Firestore.'
  });
});

// Admin Logout Route (Revokes Session in Firestore & clears cookie)
app.post('/api/admin/auth/logout', async (req: Request, res: Response) => {
  const cookieSession = req.cookies?.cv_admin_session;
  if (cookieSession) {
    await revokeAdminSessionFirestore(cookieSession);
  }
  res.clearCookie('cv_admin_session', { path: '/' });
  res.json({ success: true, message: 'Sesión cerrada y revocada en Firestore.' });
});

// Admin Check Auth Route
app.get('/api/admin/auth/check', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ authenticated: true });
});

// Protected Admin Routes
app.use('/api/admin', requireAdminAuth);

// Leads list (Support filtering by record_type - Requirement 2 & 24)
app.get('/api/admin/leads', async (req: Request, res: Response) => {
  try {
    const { status, province, record_type } = req.query;
    const leads = await getLeads({
      status: status as string,
      province: province as string,
      record_type: record_type as string
    });
    res.json({ leads });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al consultar solicitudes.' });
  }
});

// Single lead
app.get('/api/admin/leads/:id', async (req: Request, res: Response) => {
  try {
    const lead = await getLeadById(req.params.id);
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });
    res.json({ lead });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al consultar lead.' });
  }
});

// Update lead status & economic metrics (Requirement 5, 7, 8, 20)
app.patch('/api/admin/leads/:id', async (req: Request, res: Response) => {
  try {
    const { status, invalid_reason, quoted_value, final_value, payment_status, lead_price, is_pilot } = req.body;
    const updates: Partial<Lead> = {};
    if (status) updates.status = status;
    if (invalid_reason !== undefined) updates.invalid_reason = invalid_reason;
    if (quoted_value !== undefined) updates.quoted_value = quoted_value;
    if (final_value !== undefined) updates.final_value = final_value;
    if (payment_status !== undefined) updates.payment_status = payment_status;
    if (lead_price !== undefined) updates.lead_price = lead_price;
    if (is_pilot !== undefined) updates.is_pilot = is_pilot;

    const lead = await updateLead(req.params.id, updates, 'admin_operator');
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    res.json({ success: true, lead });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar lead.' });
  }
});

// Route lead to providers (Strict Max 2 enforcement)
app.post('/api/admin/leads/:id/route', async (req: Request, res: Response) => {
  try {
    const { assigned_provider_ids } = req.body;
    if (!Array.isArray(assigned_provider_ids)) {
      return res.status(400).json({ error: 'assigned_provider_ids debe ser un array' });
    }

    const result = await routeLeadProviders(req.params.id, assigned_provider_ids, 'admin_operator');
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json({ success: true, lead: result.lead });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al enrutar lead.' });
  }
});

// Providers list (Support filtering by record_type)
app.get('/api/admin/providers', async (req: Request, res: Response) => {
  try {
    const { record_type } = req.query;
    const providers = await getProviders({ record_type: record_type as string });
    res.json({ providers });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al consultar proveedores.' });
  }
});

// Record Provider Outreach / Interview Interaction (Requirement 4, 5, 6, 7, 8, 9)
app.post('/api/admin/providers/:id/interaction', async (req: Request, res: Response) => {
  try {
    const result = await recordProviderInteraction(req.params.id, req.body);
    if (!result) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json({ success: true, provider: result.provider, interaction: result.interaction });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al registrar interacción comercial.' });
  }
});

// Update provider status & commercial interview notes (Requirement 3, 5, 9)
app.patch('/api/admin/providers/:id', async (req: Request, res: Response) => {
  try {
    const { status, willingness_to_pay, stated_wtp_shared, stated_wtp_exclusive, interview_notes, verified, notes } = req.body;
    const updates: Partial<Provider> = {};
    if (status) updates.status = status;
    if (willingness_to_pay !== undefined) updates.willingness_to_pay = Number(willingness_to_pay);
    if (stated_wtp_shared !== undefined) updates.stated_wtp_shared = stated_wtp_shared ? Number(stated_wtp_shared) : null;
    if (stated_wtp_exclusive !== undefined) updates.stated_wtp_exclusive = stated_wtp_exclusive ? Number(stated_wtp_exclusive) : null;
    if (interview_notes !== undefined) updates.interview_notes = interview_notes;
    if (verified !== undefined) updates.verified = !!verified;
    if (notes !== undefined) updates.notes = notes;

    const provider = await updateProvider(req.params.id, updates);
    if (!provider) return res.status(404).json({ error: 'Proveedor no encontrado' });

    res.json({ success: true, provider });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al actualizar proveedor.' });
  }
});

// Add new provider
app.post('/api/admin/providers', async (req: Request, res: Response) => {
  try {
    const newProvider = await createProvider(req.body);
    res.status(201).json({ success: true, provider: newProvider });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al crear proveedor.' });
  }
});

// Record Provider or Customer Feedback (Requirement 20 & 21)
app.post('/api/admin/leads/:id/feedback', async (req: Request, res: Response) => {
  try {
    const { provider_feedback, customer_feedback } = req.body;
    const updates: Partial<Lead> = {};

    if (provider_feedback) {
      updates.provider_feedback = {
        ...provider_feedback,
        submitted_at: new Date().toISOString()
      };
      if (provider_feedback.quoted_amount) {
        updates.quoted_value = provider_feedback.quoted_amount;
        updates.status = 'QUOTE_ISSUED';
      }
      if (provider_feedback.job_won && provider_feedback.final_amount) {
        updates.final_value = provider_feedback.final_amount;
        updates.status = 'WON';
      }
    }

    if (customer_feedback) {
      updates.customer_feedback = {
        ...customer_feedback,
        submitted_at: new Date().toISOString()
      };
    }

    const lead = await updateLead(req.params.id, updates, 'feedback_recorder');
    if (!lead) return res.status(404).json({ error: 'Lead no encontrado' });

    res.json({ success: true, lead });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al guardar feedback.' });
  }
});

// Internal Price Index Statistics (Requirement 25 & 26)
app.get('/api/admin/stats/index', async (req: Request, res: Response) => {
  try {
    const { service, province } = req.query;
    const stats = await getInternalPriceIndexStats({
      service: service as string,
      province: province as string
    });
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al calcular estadísticas.' });
  }
});

// Privacy-safe Telemetry
app.post('/api/analytics/track', (req: Request, res: Response) => {
  const event: AnalyticsEvent = req.body;
  recordAnalyticsEvent(event).catch(() => {});
  res.json({ success: true });
});

// ----------------------------------------------------
// SEO: SITEMAP & ROBOTS (Requirements 18 & 19)
// ----------------------------------------------------

const INDEXABLE_CLUSTER_URLS = [
  'https://cuantovale.es/',
  'https://cuantovale.es/proteccion-incendios/',
  'https://cuantovale.es/proteccion-incendios/ignifugar-nave-industrial-precio/',
  'https://cuantovale.es/proteccion-incendios/precio-ignifugacion-m2/',
  'https://cuantovale.es/proteccion-incendios/pintura-intumescente-precio-m2/',
  'https://cuantovale.es/proteccion-incendios/mortero-ignifugo-precio-m2/',
  'https://cuantovale.es/proteccion-incendios/mantenimiento-pci-precio/',
  'https://cuantovale.es/proteccion-incendios/instalacion-pci-precio/',
  'https://cuantovale.es/proteccion-incendios/proyecto-contra-incendios-precio/',
  'https://cuantovale.es/proteccion-incendios/legalizacion-pci-precio/',
  'https://cuantovale.es/proteccion-incendios/inspeccion-oca-pci-precio/',
  'https://cuantovale.es/metodologia/',
  'https://cuantovale.es/sobre-cuantovale/',
  'https://cuantovale.es/profesionales/',
  'https://cuantovale.es/guias/',
  'https://cuantovale.es/guias/ignifugacion-naves-industriales/',
  'https://cuantovale.es/guias/pintura-intumescente/',
  'https://cuantovale.es/guias/mortero-ignifugo/',
  'https://cuantovale.es/guias/rsciei-2025/',
  'https://cuantovale.es/guias/mantenimiento-pci/',
  'https://cuantovale.es/aviso-legal/',
  'https://cuantovale.es/privacidad/',
  'https://cuantovale.es/cookies/',
  'https://cuantovale.es/terminos/'
];

app.get('/sitemap.xml', (_req: Request, res: Response) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${INDEXABLE_CLUSTER_URLS.map(
  url => `  <url>
    <loc>${url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.includes('ignifugar-nave') ? 'weekly' : 'monthly'}</changefreq>
    <priority>${url === 'https://cuantovale.es/' ? '1.0' : url.includes('ignifugar-nave') ? '0.9' : '0.8'}</priority>
  </url>`
).join('\n')}
</urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

app.get('/robots.txt', (_req: Request, res: Response) => {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://cuantovale.es/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ----------------------------------------------------
// SEO ROUTE CATALOG & PRERENDERED HTML (Requirements 10, 11, 15, 16)
// ----------------------------------------------------

interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  h1: string;
  intro: string;
}

const SEO_PAGES: Record<string, PageMetadata> = {
  '/': {
    title: '¿Cuánto debería costar? Calcula antes de contratar | CuántoVale',
    description: 'Calcula precios orientativos y costes reales antes de contratar en España. Compara presupuestos de hasta 2 profesionales homologados con independencia técnica.',
    canonical: 'https://cuantovale.es/',
    h1: '¿Cuánto debería costar?',
    intro: 'Calcula un precio orientativo antes de hablar con un proveedor. Compara presupuestos de hasta 2 profesionales homologados.'
  },
  '/proteccion-incendios/': {
    title: 'Precios de Protección Contra Incendios 2026 | CuántoVale',
    description: 'Directorio de precios de protección contra incendios en España: ignifugación de naves, mantenimiento periódico, proyectos de ingeniería e inspecciones reglamentarias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/',
    h1: 'Precios de protección contra incendios',
    intro: 'Referencias de mercado y calculadoras técnicas para las 6 áreas de protección pasiva, activa y legalización en España.'
  },
  '/proteccion-incendios/ignifugar-nave-industrial-precio/': {
    title: '¿Cuánto cuesta ignifugar una nave industrial? Precios 2026 | CuántoVale',
    description: 'Ignifugar una nave industrial en España cuesta habitualmente entre 8.000 € y 24.000 €. Conoce el precio por m² según mortero proyectado o pintura intumescente.',
    canonical: 'https://cuantovale.es/proteccion-incendios/ignifugar-nave-industrial-precio/',
    h1: '¿Cuánto cuesta ignifugar una nave industrial?',
    intro: 'Ignifugar una nave industrial estándar en España (400 a 1.200 m²) tiene un coste medio total que oscila entre los 8.000 € y 24.000 € sin IVA.'
  },
  '/proteccion-incendios/precio-ignifugacion-m2/': {
    title: 'Precio Ignifugación por m² (2026): Mortero, Pintura y Placas | CuántoVale',
    description: 'Tabla comparativa de precios de ignifugación por metro cuadrado en España: mortero proyectado (14-23 €/m²), pintura intumescente (24-48 €/m²) y placas rígidas.',
    canonical: 'https://cuantovale.es/proteccion-incendios/precio-ignifugacion-m2/',
    h1: 'Precio de ignifugación por m²: comparativa de sistemas',
    intro: 'El precio unitario de ignifugar una estructura en España varía sustancialmente según el material seleccionado y la exigencia de resistencia al fuego R.'
  },
  '/proteccion-incendios/pintura-intumescente-precio-m2/': {
    title: 'Pintura Intumescente Precio m² (2026): R30, R60, R90 | CuántoVale',
    description: 'Precios actualizados de pintura intumescente para estructuras metálicas (24 € – 48 €/m²). Factores de coste, espesor de micrómetros y certificado visado.',
    canonical: 'https://cuantovale.es/proteccion-incendios/pintura-intumescente-precio-m2/',
    h1: 'Pintura intumescente precio m²: guía de costes y aplicación',
    intro: 'Aplicar pintura intumescente para protección pasiva de estructuras metálicas vistas cuesta entre 24 € y 48 €/m² sin IVA.'
  },
  '/proteccion-incendios/mortero-ignifugo-precio-m2/': {
    title: 'Mortero Ignífugo Precio m² (2026): Lana de Roca Proyectada | CuántoVale',
    description: 'Precios de mortero ignífugo de lana de roca y perlita por m² en España (14 € – 23 €/m²). La solución más eficiente para naves industriales según RSCIEI.',
    canonical: 'https://cuantovale.es/proteccion-incendios/mortero-ignifugo-precio-m2/',
    h1: 'Mortero ignífugo precio m²: lana de roca y perlita proyectada',
    intro: 'El precio medio de proyección de mortero ignífugo en España se sitúa entre 14 € y 23 €/m² de estructura de acero (sin IVA).'
  },
  '/proteccion-incendios/mantenimiento-pci-precio/': {
    title: 'Mantenimiento PCI Precio (2026): Tarifas Reglamentarias RIPCI | CuántoVale',
    description: 'Coste anual de contratos de mantenimiento contra incendios para naves y locales (420 € – 1.450 €/año). Revisiones trimestrales y anuales obligatorias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/mantenimiento-pci-precio/',
    h1: 'Mantenimiento contra incendios: precio anual y revisiones RIPCI',
    intro: 'El contrato de mantenimiento reglamentario contra incendios en una nave industrial media cuesta habitualmente entre 420 € y 1.450 € al año (sin IVA).'
  },
  '/proteccion-incendios/instalacion-pci-precio/': {
    title: 'Instalación PCI Precio (2026): Rociadores, BIEs y Detección | CuántoVale',
    description: 'Costes de instalación de sistemas de protección contra incendios en España: redes de BIEs, rociadores automáticos, grupos de presión y aljibes.',
    canonical: 'https://cuantovale.es/proteccion-incendios/instalacion-pci-precio/',
    h1: 'Instalación de sistemas contra incendios: precios y costes',
    intro: 'Instalar un sistema completo de protección activa contra incendios en una nave industrial oscila habitualmente entre los 3.500 € y más de 35.000 €.'
  },
  '/proteccion-incendios/proyecto-contra-incendios-precio/': {
    title: 'Proyecto Contra Incendios Precio (2026): Memoria y Visado | CuántoVale',
    description: 'Coste de redacción de proyectos y memorias técnicas contra incendios por ingeniero colegiado (1.200 € – 3.800 €). Cálculo de carga de fuego y licencias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/proyecto-contra-incendios-precio/',
    h1: 'Proyecto contra incendios precio: memorias técnicas y visado',
    intro: 'La redacción de un proyecto técnico de protección contra incendios por un ingeniero industrial colegiado cuesta entre 1.200 € y 3.800 €.'
  },
  '/proteccion-incendios/legalizacion-pci-precio/': {
    title: 'Legalización PCI Precio (2026): Certificados y Tramitación | CuántoVale',
    description: 'Coste del proceso de legalización de instalaciones contra incendios ante Industria y Ayuntamientos (800 € – 2.400 €). Requisitos y plazos.',
    canonical: 'https://cuantovale.es/proteccion-incendios/legalizacion-pci-precio/',
    h1: 'Legalización de instalaciones contra incendios: costes y trámites',
    intro: 'El expediente de legalización y registro administrativo de instalaciones contra incendios ante la delegación territorial de Industria cuesta habitualmente entre 800 € y 2.400 €.'
  },
  '/proteccion-incendios/inspeccion-oca-pci-precio/': {
    title: 'Inspección Periódica OCA PCI Precio (2026): Tarifas Oficiales | CuántoVale',
    description: 'Costes de la inspección reglamentaria periódica por Organismo de Control Autorizado (OCA) para establecimientos industriales (650 € – 1.800 €).',
    canonical: 'https://cuantovale.es/proteccion-incendios/inspeccion-oca-pci-precio/',
    h1: 'Inspección periódica OCA contra incendios: precios y periodicidad',
    intro: 'La inspección reglamentaria periódica realizada por un Organismo de Control Autorizado (OCA) para instalaciones contra incendios cuesta entre 650 € y 1.800 €.'
  },
  '/metodologia/': {
    title: 'Metodología de Cálculo y Fuentes de Datos | CuántoVale',
    description: 'Cómo calcula CuántoVale los rangos orientativos: bases de edificación oficiales (BEDEC, CYPE), factores provinciales y calificación de confianza.',
    canonical: 'https://cuantovale.es/metodologia/',
    h1: 'Metodología de cálculo y transparencia técnica',
    intro: 'En CuántoVale generamos estimaciones de coste transparentes basadas en bases de precios oficiales y factores correctores de mercado.'
  },
  '/sobre-cuantovale/': {
    title: 'Sobre CuántoVale: Independencia y Misión | CuántoVale',
    description: 'Conoce por qué CuántoVale es un comparador independiente. No vendemos seguros, no ejecutamos obras ni cobramos porcentaje sobre la factura.',
    canonical: 'https://cuantovale.es/sobre-cuantovale/',
    h1: 'Sobre CuántoVale: Independencia técnica',
    intro: 'CuántoVale nació para resolver una asimetría de información histórica en el sector de la edificación e instalaciones industriales.'
  },
  '/profesionales/': {
    title: 'Para Empresas Instaladoras PCI: Leads Cualificados | CuántoVale',
    description: 'Únete a la red de aplicadores e ingenierías PCI de CuántoVale. Recibe oportunidades con variables técnicas calculadas y compartidas con un máximo de 2 empresas.',
    canonical: 'https://cuantovale.es/profesionales/',
    h1: 'Recibe oportunidades PCI mejor cualificadas',
    intro: 'Sin subastas masivas. Solicitudes con metros cuadrados, tipo de estructura y resistencia R ya filtrados antes del contacto comercial.'
  },
  '/aviso-legal/': {
    title: 'Aviso Legal | CuántoVale',
    description: 'Información legal, titularidad del dominio y condiciones generales de uso de CuántoVale.es.',
    canonical: 'https://cuantovale.es/aviso-legal/',
    h1: 'Aviso Legal',
    intro: 'En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).'
  },
  '/privacidad/': {
    title: 'Política de Privacidad | CuántoVale',
    description: 'Información sobre el tratamiento de datos personales, derechos ARCO y cesión a un máximo de 2 instaladores autorizados.',
    canonical: 'https://cuantovale.es/privacidad/',
    h1: 'Política de Privacidad',
    intro: 'En CuántoVale tratamos los datos que nos facilitas con la finalidad de ofrecerte el servicio de cálculo orientativo y gestión de presupuestos.'
  },
  '/cookies/': {
    title: 'Política de Cookies | CuántoVale',
    description: 'Información sobre el uso de cookies técnicas y analíticas anónimas en CuántoVale.es.',
    canonical: 'https://cuantovale.es/cookies/',
    h1: 'Política de Cookies',
    intro: 'CuántoVale utiliza cookies técnicas necesarias para el funcionamiento del portal y analíticas anónimas para evaluar el rendimiento.'
  },
  '/terminos/': {
    title: 'Términos y Condiciones | CuántoVale',
    description: 'Condiciones de uso de las herramientas de estimación y del servicio de conexión con instaladores homologados.',
    canonical: 'https://cuantovale.es/terminos/',
    h1: 'Términos y Condiciones del Servicio',
    intro: 'Las siguientes condiciones regulan el uso de la plataforma web CuántoVale.es y sus herramientas de cálculo orientativo.'
  },
  '/guias/': {
    title: 'Guías Técnicas de Protección Contra Incendios | CuántoVale',
    description: 'Biblioteca técnica sobre normativa RSCIEI, ignifugación de naves, morteros y pinturas intumescentes.',
    canonical: 'https://cuantovale.es/guias/',
    h1: 'Guías Técnicas de Protección Contra Incendios',
    intro: 'Conocimiento riguroso para entender ensayos, espesores y requisitos reglamentarios en España.'
  },
  '/guias/ignifugacion-naves-industriales/': {
    title: 'Guía Completa de Ignifugación de Naves Industriales (2026) | CuántoVale',
    description: 'Todo lo que necesitas saber antes de ignifugar una nave: normativa RSCIEI, cálculo de masividad, elección entre mortero y pintura, ensayos y certificado de visado.',
    canonical: 'https://cuantovale.es/guias/ignifugacion-naves-industriales/',
    h1: 'Guía de Ignifugación de Naves Industriales',
    intro: 'Análisis exhaustivo sobre estabilidad al fuego R, masividad y requerimientos reglamentarios.'
  },
  '/guias/pintura-intumescente/': {
    title: 'Guía Técnica: Pintura Intumescente para Acero | CuántoVale',
    description: 'Funcionamiento térmico, cálculo de espesores micrométricos (DFT), imprimación epoxi y esmaltado.',
    canonical: 'https://cuantovale.es/guias/pintura-intumescente/',
    h1: 'Guía Técnica de Pintura Intumescente',
    intro: 'Mecanismo de expansión celular y cálculo de micras según exigencia R30 a R90.'
  },
  '/guias/mortero-ignifugo/': {
    title: 'Guía de Aplicación de Mortero Ignífugo | CuántoVale',
    description: 'Ventajas del mortero proyectado en naves industriales: lana de roca, perlita y espesores en milímetros.',
    canonical: 'https://cuantovale.es/guias/mortero-ignifugo/',
    h1: 'Guía de Mortero Ignífugo Proyectado',
    intro: 'Solución eficiente y de alto rendimiento térmico para estructuras portantes industriales.'
  },
  '/guias/rsciei-2025/': {
    title: 'Reglamento RSCIEI: Exigencias para Industrias | CuántoVale',
    description: 'Guía práctica sobre el Reglamento de Seguridad contra Incendios en los Establecimientos Industriales.',
    canonical: 'https://cuantovale.es/guias/rsciei-2025/',
    h1: 'Reglamento RSCIEI: Establecimientos Industriales',
    intro: 'Clasificación de tipos de nave (A, B, C), carga de fuego y sectorizaciones obligatorias.'
  },
  '/guias/mantenimiento-pci/': {
    title: 'Guía RIPCI: Plan de Mantenimiento Preventivo | CuántoVale',
    description: 'Periodicidades obligatorias (trimestral, semestral, anual y quinquenal) según RIPCI RD 513/2017.',
    canonical: 'https://cuantovale.es/guias/mantenimiento-pci/',
    h1: 'Guía de Mantenimiento e Inspección RIPCI',
    intro: 'Obligaciones del titular, libro de revisiones y retimbrados quinquenales.'
  }
};

const renderPageHtml = (template: string, reqPath: string, isStaging = false): { html: string; status: number; headers?: Record<string, string> } => {
  const normalizedPath = reqPath.endsWith('/') || reqPath.includes('.') || reqPath === '/admin' ? reqPath : `${reqPath}/`;

  if (normalizedPath === '/admin') {
    const adminTemplate = template
      .replace(
        /<title>.*?<\/title>/,
        '<title>Consola Operativa | CuántoVale</title>'
      )
      .replace(
        '</head>',
        '  <meta name="robots" content="noindex, nofollow" />\n  </head>'
      )
      .replace(
        '<div id="root"></div>',
        '<div id="root"><main class="p-8 text-center text-slate-500 font-mono text-xs">Cargando consola operativa...</main></div>'
      );

    return {
      status: 200,
      html: adminTemplate,
      headers: {
        'X-Robots-Tag': 'noindex, nofollow'
      }
    };
  }

  const pageData = SEO_PAGES[normalizedPath] || SEO_PAGES[reqPath];

  if (!pageData) {
    const notFoundHtml = template
      .replace(
        /<title>.*?<\/title>/,
        '<title>Página no encontrada | CuántoVale</title>'
      )
      .replace(
        /<meta name="description" content=".*?" \/>/,
        '<meta name="description" content="La página solicitada no existe o ha sido movida." />'
      )
      .replace(
        '</head>',
        '  <meta name="robots" content="noindex, nofollow" />\n  </head>'
      )
      .replace(
        '<div id="root"></div>',
        `<div id="root">
          <main class="min-h-screen flex items-center justify-center p-6 text-center">
            <div class="max-w-md w-full bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <span class="font-mono text-4xl font-extrabold text-blue-600 block">404</span>
              <h1 class="text-xl font-bold text-slate-900">404 — Página no encontrada</h1>
              <p class="text-xs text-slate-600">La dirección solicitada no existe en el directorio de precios de CuántoVale.</p>
              <a href="/" class="inline-block bg-slate-900 text-white text-xs px-4 py-2 rounded-lg font-medium">Volver al inicio</a>
            </div>
          </main>
        </div>`
      );
    return { status: 404, html: notFoundHtml, headers: { 'X-Robots-Tag': 'noindex, nofollow' } };
  }

  let enrichedHtml = template
    .replace(
      /<title>.*?<\/title>/,
      `<title>${pageData.title}</title>`
    )
    .replace(
      /<meta\s+name="description"\s+content=".*?"\s*\/?>/,
      `<meta name="description" content="${pageData.description}" />`
    );

  // Canonical tag injection (Strictly pointing to https://cuantovale.es)
  if (!enrichedHtml.includes('rel="canonical"')) {
    enrichedHtml = enrichedHtml.replace(
      '</head>',
      `  <link rel="canonical" href="${pageData.canonical}" />\n  </head>`
    );
  } else {
    enrichedHtml = enrichedHtml.replace(
      /<link rel="canonical" href=".*?" \/>/,
      `<link rel="canonical" href="${pageData.canonical}" />`
    );
  }

  // GO LIVE SEO: Allow index, follow on public domain cuantovale.es, noindex on staging run.app
  const shouldIndex = PUBLIC_INDEXING_ENABLED && !isStaging;
  const robotsMeta = shouldIndex
    ? '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />'
    : '<meta name="robots" content="noindex, nofollow" />';

  if (enrichedHtml.includes('<meta name="robots"')) {
    enrichedHtml = enrichedHtml.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/, robotsMeta);
  } else {
    enrichedHtml = enrichedHtml.replace('</head>', `  ${robotsMeta}\n  </head>`);
  }

  const ssrContent = `
    <header class="py-4 px-6 border-b border-slate-100 flex justify-between items-center max-w-5xl mx-auto">
      <a href="/" class="font-extrabold text-slate-950 text-base">Cuánto<span class="text-blue-600">Vale</span>.es</a>
      <nav class="flex gap-4 text-xs font-medium text-slate-600">
        <a href="/proteccion-incendios/">Precios PCI</a>
        <a href="/metodologia/">Metodología</a>
        <a href="/sobre-cuantovale/">Independencia</a>
      </nav>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">${pageData.h1}</h1>
      <p class="text-base text-slate-600 leading-relaxed">${pageData.intro}</p>
      <div class="pt-4 border-t border-slate-200 text-xs text-slate-500">
        <p>Datos técnicos actualizados a 2026. Fuentes: BEDEC / CYPE / Baremos colegiales.</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <a href="/proteccion-incendios/ignifugar-nave-industrial-precio/" class="text-blue-600 hover:underline">Calculadora de Ignifugación</a>
          <a href="/proteccion-incendios/precio-ignifugacion-m2/" class="text-blue-600 hover:underline">Tarifas m²</a>
          <a href="/profesionales/" class="text-blue-600 hover:underline">Red de instaladores</a>
        </div>
      </div>
    </main>
  `;

  enrichedHtml = enrichedHtml.replace(
    '<div id="root"></div>',
    `<div id="root">${ssrContent}</div>`
  );

  return { status: 200, html: enrichedHtml };
};

// ----------------------------------------------------
// FRONTEND SERVER (DEV WITH VITE / PROD STATIC)
// ----------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        const { status, html, headers } = renderPageHtml(template, url.split('?')[0], isStagingHostname(req));
        if (headers) res.set(headers);
        res.status(status).set({ 'Content-Type': 'text/html' }).send(html);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist'), { index: false }));

    app.use('*', (req: Request, res: Response) => {
      const url = req.originalUrl.split('?')[0];
      const templatePath = path.resolve(__dirname, 'dist', 'index.html');
      let template = fs.existsSync(templatePath)
        ? fs.readFileSync(templatePath, 'utf-8')
        : fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

      const { status, html, headers } = renderPageHtml(template, url, isStagingHostname(req));
      if (headers) res.set(headers);
      res.status(status).set({ 'Content-Type': 'text/html' }).send(html);
    });
  }

  app.listen(PORT, () => {
    console.log(`[CuántoVale] Hardened production server running on port ${PORT}`);
  });
}

startServer();
