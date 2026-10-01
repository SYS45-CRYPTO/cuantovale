import React, { useState, useEffect } from 'react';
import {
  CalculationResult,
  CalculatorIgnifugacionInputs,
  Lead,
  PCIService
} from '../types';
import { SPANISH_PROVINCES_ALPHABETICAL, getProvinceFromPostcode } from '../data/provinces';
import { trackEvent } from '../utils/analytics';
import { X, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck, Check, Building2, Calculator } from 'lucide-react';

interface LeadModalOrFormProps {
  isOpen: boolean;
  onClose: () => void;
  service?: PCIService;
  calculationResult?: CalculationResult | null;
  calculatorInputs?: CalculatorIgnifugacionInputs | null;
  onSuccess?: (lead: Lead) => void;
}

export const LeadModalOrForm: React.FC<LeadModalOrFormProps> = ({
  isOpen,
  onClose,
  service = 'ignifugacion',
  calculationResult,
  calculatorInputs,
  onSuccess
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [formData, setFormData] = useState({
    service: service,
    province: calculatorInputs?.province || 'Madrid',
    postcode: '',
    property_type: 'Nave industrial',
    approx_square_meters: calculatorInputs?.approxNaveSurface || 600,
    need_status: 'adecuacion' as Lead['need_status'],
    timeframe: 'menos_1_mes' as Lead['timeframe'],

    // Dynamic service fields
    structure_type: (calculatorInputs?.structureType || 'acero') as 'acero' | 'hormigon' | 'madera' | 'no_se',
    required_fire_resistance: calculatorInputs?.fireResistance || 'R90',
    system_preference: calculatorInputs?.systemPreference || 'indiferente',
    extinguishers: 10,
    bie_count: 2,
    detection_installed: true,
    sprinklers: false,

    // Personal Contact Data (Step 3)
    name: '',
    company: '',
    phone: '',
    email: '',
    comments: '',
    consent_accepted: false,
    website_hp: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submittedLead, setSubmittedLead] = useState<Lead | null>(null);

  // Auto-infer province from postcode input
  const handlePostcodeChange = (code: string) => {
    const clean = code.trim();
    setFormData(prev => {
      const inferred = getProvinceFromPostcode(clean);
      return {
        ...prev,
        postcode: clean,
        province: inferred || prev.province
      };
    });
  };

  useEffect(() => {
    if (calculatorInputs) {
      setFormData(prev => ({
        ...prev,
        province: calculatorInputs.province || prev.province,
        approx_square_meters: calculatorInputs.approxNaveSurface || prev.approx_square_meters,
        structure_type: calculatorInputs.structureType || prev.structure_type,
        required_fire_resistance: calculatorInputs.fireResistance || prev.required_fire_resistance,
        system_preference: calculatorInputs.systemPreference || prev.system_preference
      }));
    }
  }, [calculatorInputs]);

  if (!isOpen) return null;

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!formData.approx_square_meters || formData.approx_square_meters <= 0) {
      setErrorMsg('Indica los m² aproximados de tu instalación.');
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    setErrorMsg('');
    setStep(3);
  };

  const handleSubmitFinal = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (formData.website_hp) {
      onClose();
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg('Por favor, indica tu nombre.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      setErrorMsg('Por favor, indica un teléfono de contacto válido.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Por favor, indica un correo electrónico válido.');
      return;
    }
    if (!formData.consent_accepted) {
      setErrorMsg('Debes aceptar las condiciones y la transmisión a un máximo de 2 empresas homologadas.');
      return;
    }

    setLoading(true);

    const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
    const utmSource = urlParams.get('utm_source') || undefined;
    const utmMedium = urlParams.get('utm_medium') || undefined;
    const utmCampaign = urlParams.get('utm_campaign') || undefined;
    const utmTerm = urlParams.get('utm_term') || undefined;
    const utmContent = urlParams.get('utm_content') || undefined;
    const gclid = urlParams.get('gclid') || undefined;

    const leadPayload: Partial<Lead> = {
      service: formData.service as PCIService,
      province: formData.province,
      postcode: formData.postcode || '28000',
      property_type: formData.property_type,
      approx_square_meters: Number(formData.approx_square_meters),
      need_status: formData.need_status,
      timeframe: formData.timeframe,
      name: formData.name,
      company: formData.company,
      phone: formData.phone,
      email: formData.email,
      comments: formData.comments,
      dynamic_fields: {
        structure_type: formData.structure_type,
        required_fire_resistance: formData.required_fire_resistance,
        system_preference: formData.system_preference,
        extinguishers: formData.extinguishers,
        bie_count: formData.bie_count,
        detection_installed: formData.detection_installed,
        sprinklers: formData.sprinklers
      },
      source_page: typeof window !== 'undefined' ? window.location.pathname : '/',
      source_channel: utmSource ? 'cpc/campaign' : 'direct',
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      gclid: gclid,
      calculator_used: !!calculationResult,
      calculator_result_min: calculationResult?.minEstimate,
      calculator_result_max: calculationResult?.maxEstimate,
      calculator_confidence: calculationResult?.confidence,
      consent_accepted: true,
      consent_timestamp: new Date().toISOString(),
      consent_version: '2026-v1',
      status: 'NEW',
      lead_model: 'SHARED',
      assigned_provider_ids: []
    };

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadPayload)
      });

      if (!response.ok) {
        throw new Error('Error al enviar la solicitud');
      }

      const resData = await response.json();
      setSubmittedLead(resData.lead);
      if (onSuccess && resData.lead) {
        onSuccess(resData.lead);
      }

      trackEvent('lead_submit', { service: formData.service, province: formData.province });
    } catch (err: any) {
      setErrorMsg('No se pudo enviar la solicitud. Por favor inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Success Confirmation Screen */}
        {submittedLead ? (
          <div className="text-center py-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase">Solicitud Confirmada</span>
              <h2 className="text-xl font-bold text-slate-950">
                Referencia: {submittedLead.lead_id}
              </h2>
              <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Hemos registrado tus parámetros técnicos. Un máximo de 2 instaladores autorizados revisarán la viabilidad en <strong>{submittedLead.province}</strong>.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cerrar y volver
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Modal Header & Progress Indicator */}
            <div className="space-y-2 border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
                  Paso {step} de 3
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {step === 1 && 'Especificaciones Técnicas'}
                  {step === 2 && 'Revisión y Baremos'}
                  {step === 3 && 'Contacto y Consentimiento'}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-950">
                {step === 1 && '1. Datos de la Instalación'}
                {step === 2 && '2. Resumen de la Solicitud'}
                {step === 3 && '3. Datos de Contacto'}
              </h2>
              {/* Micro Progress Bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-1.5 transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* STEP 1: SPECIFICATIONS & LOCATION */}
            {step === 1 && (
              <form onSubmit={handleNextToStep2} className="space-y-4 text-xs">
                {/* Surface & Postcode */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Superficie (m²):</label>
                    <input
                      type="number"
                      required
                      min="10"
                      max="100000"
                      value={formData.approx_square_meters}
                      onChange={(e) => setFormData({ ...formData, approx_square_meters: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Código Postal:</label>
                    <input
                      type="text"
                      maxLength={5}
                      placeholder="ej. 28001"
                      value={formData.postcode}
                      onChange={(e) => handlePostcodeChange(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* Alphabetical Province Selector */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Provincia (Ordenadas alfabéticamente):</label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 bg-white font-medium cursor-pointer"
                  >
                    {SPANISH_PROVINCES_ALPHABETICAL.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Fields for Ignifugación */}
                {formData.service === 'ignifugacion' && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Estructura Portante:</label>
                        <select
                          value={formData.structure_type}
                          onChange={(e) => setFormData({ ...formData, structure_type: e.target.value as 'acero' | 'hormigon' | 'madera' | 'no_se' })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer"
                        >
                          <option value="acero">Estructura metálica (Acero)</option>
                          <option value="hormigon">Hormigón</option>
                          <option value="mixta">Estructura mixta</option>
                          <option value="no_se">No lo sé / Desconocida</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Exigencia R (Fuego):</label>
                        <select
                          value={formData.required_fire_resistance}
                          onChange={(e) => setFormData({ ...formData, required_fire_resistance: e.target.value as any })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer font-mono"
                        >
                          <option value="R30">R30 (30 min)</option>
                          <option value="R60">R60 (60 min)</option>
                          <option value="R90">R90 (90 min)</option>
                          <option value="R120">R120 (120 min)</option>
                          <option value="no_se">No lo sé / Según proyecto</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Preferencia de Sistema:</label>
                      <select
                        value={formData.system_preference}
                        onChange={(e) => setFormData({ ...formData, system_preference: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white cursor-pointer"
                      >
                        <option value="mortero">Mortero proyectado (Económico / industrial)</option>
                        <option value="pintura">Pintura intumescente (Estético / liso)</option>
                        <option value="indiferente">Indiferente / Recomendar según coste</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Next Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Siguiente: Revisar resumen</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: SUMMARY & REVIEW */}
            {step === 2 && (
              <div className="space-y-5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="font-bold text-slate-900 block uppercase font-mono text-[10px]">
                    Resumen de Parámetros Seleccionados:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Provincia:</span>
                      <span className="font-semibold text-slate-900">{formData.province}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Superficie:</span>
                      <span className="font-mono font-semibold text-slate-900">{formData.approx_square_meters} m²</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Estructura:</span>
                      <span className="font-semibold text-slate-900 capitalize">{formData.structure_type}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Exigencia R:</span>
                      <span className="font-mono font-semibold text-slate-900">{formData.required_fire_resistance}</span>
                    </div>
                  </div>

                  {calculationResult && (
                    <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-slate-500 text-[11px]">Horquilla orientativa estimada:</span>
                      <span className="font-mono font-extrabold text-blue-600 text-sm">
                        {calculationResult.minEstimate.toLocaleString()} € – {calculationResult.maxEstimate.toLocaleString()} €
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Modificar</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleNextToStep3}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Paso final: Datos de contacto</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: PERSONAL CONTACT & CONSENT */}
            {step === 3 && (
              <form onSubmit={handleSubmitFinal} className="space-y-4 text-xs">
                {/* Honeypot field for bot protection */}
                <input
                  type="text"
                  name="website_hp"
                  value={formData.website_hp}
                  onChange={(e) => setFormData({ ...formData, website_hp: e.target.value })}
                  tabIndex={-1}
                  autoComplete="off"
                  className="hidden"
                />

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Nombre Completo *:</label>
                    <input
                      type="text"
                      required
                      placeholder="ej. Carlos García"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Empresa / Razón Social:</label>
                    <input
                      type="text"
                      placeholder="ej. Logística S.L. (Opcional)"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Teléfono Directo *:</label>
                    <input
                      type="tel"
                      required
                      placeholder="ej. 600123456"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">Correo Electrónico *:</label>
                    <input
                      type="email"
                      required
                      placeholder="ej. carlos@empresa.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Observaciones adicionales (Opcional):</label>
                  <textarea
                    rows={2}
                    placeholder="ej. Necesitamos certificado visado para superar inspección municipal..."
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                </div>

                {/* Strict RGPD Consent Checkbox */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-600 leading-snug">
                    <input
                      type="checkbox"
                      checked={formData.consent_accepted}
                      onChange={(e) => setFormData({ ...formData, consent_accepted: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 accent-blue-600 shrink-0"
                    />
                    <span>
                      Acepto la <a href="/privacidad/" target="_blank" className="text-blue-600 underline">política de privacidad</a> y la transmisión de los datos técnicos a un <strong>máximo de 2 empresas instaladoras autorizadas</strong> en mi provincia.
                    </span>
                  </label>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Atrás</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <span>Registrando solicitud...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Confirmar y solicitar presupuestos</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
