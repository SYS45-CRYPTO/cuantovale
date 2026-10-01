import React, { useState, useEffect } from 'react';
import {
  CalculatorIgnifugacionInputs,
  CalculationResult
} from '../types';
import { SPANISH_PROVINCES } from '../data/pricing/pciPricingData';
import { calculateIgnifugacionCost } from '../utils/calculatorEngine';
import { trackEvent } from '../utils/analytics';
import { ChevronRight, ChevronLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react';

interface CalculatorIgnifugacionProps {
  onQuoteRequested?: (calculation: CalculationResult, inputs: CalculatorIgnifugacionInputs) => void;
  initialProvince?: string;
}

export const CalculatorIgnifugacion: React.FC<CalculatorIgnifugacionProps> = ({
  onQuoteRequested,
  initialProvince = 'Madrid'
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [inputs, setInputs] = useState<CalculatorIgnifugacionInputs>({
    province: initialProvince,
    approxNaveSurface: 600,
    structuralSurface: undefined,
    structureType: 'acero',
    fireResistance: 'R60',
    systemPreference: 'no_se',
    heightAccess: 'normal',
    state: 'nueva'
  });

  const [hasStarted, setHasStarted] = useState(false);
  const [calculation, setCalculation] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const res = calculateIgnifugacionCost(inputs);
    setCalculation(res);
  }, [inputs]);

  useEffect(() => {
    trackEvent('calculator_view', { service: 'ignifugacion', province: inputs.province });
  }, []);

  const handleStepChange = (newStep: 1 | 2 | 3) => {
    if (!hasStarted) {
      setHasStarted(true);
      trackEvent('calculator_start', { service: 'ignifugacion', province: inputs.province });
    }
    setStep(newStep);
    trackEvent('calculator_step', {
      service: 'ignifugacion',
      step: newStep,
      province: inputs.province
    });
  };

  const handleCompleteToQuote = () => {
    if (calculation) {
      trackEvent('calculator_complete', {
        service: 'ignifugacion',
        confidence: calculation.confidence,
        province: inputs.province
      });
      trackEvent('quote_request', {
        service: 'ignifugacion',
        confidence: calculation.confidence,
        province: inputs.province
      });
      if (onQuoteRequested) {
        onQuoteRequested(calculation, inputs);
      }
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/90 shadow-[0_8px_30px_-6px_rgba(15,23,42,0.05)] overflow-hidden">
      {/* Top Header / Progress: iOS-like refined navigation */}
      <div className="border-b border-slate-100/90 px-6 sm:px-8 py-5 flex items-center justify-between bg-slate-50/40">
        <div>
          <h3 className="text-base font-bold text-slate-950 tracking-tight">
            Calculadora de Ignifugación
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Estimación técnica en 3 pasos basada en datos de edificación 2026
          </p>
        </div>

        {/* Step indicator: iOS style segmented dots */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium mr-1 hidden sm:inline">Paso {step} de 3</span>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`h-2 rounded-full transition-all duration-200 ${
                  step === s
                    ? 'w-6 bg-blue-600'
                    : step > s
                    ? 'w-2 bg-slate-900'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        {/* Left Column: Form Inputs (7 cols) */}
        <div className="lg:col-span-7 p-6 sm:p-8 space-y-7">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Paso 1 de 3
                </span>
                <h4 className="text-lg font-bold text-slate-950 mt-0.5">
                  Dimensiones y ubicación de la nave
                </h4>
              </div>

              {/* Provincia */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Provincia de la instalación
                </label>
                <div className="relative">
                  <select
                    value={inputs.province}
                    onChange={(e) => setInputs({ ...inputs, province: e.target.value })}
                    className="w-full min-h-[44px] rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer"
                  >
                    {SPANISH_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Superficie Planta Nave con Slider Táctil */}
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-baseline">
                  <label className="block text-xs font-semibold text-slate-700">
                    Superficie de planta de la nave
                  </label>
                  <span className="font-mono text-base font-bold text-slate-950">
                    {inputs.approxNaveSurface.toLocaleString('es-ES')} m²
                  </span>
                </div>

                <input
                  type="range"
                  min={100}
                  max={5000}
                  step={50}
                  value={inputs.approxNaveSurface}
                  onChange={(e) =>
                    setInputs({ ...inputs, approxNaveSurface: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />

                {/* Tactile Presets */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {[300, 600, 1000, 2500].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setInputs({ ...inputs, approxNaveSurface: s })}
                      className={`min-h-[36px] px-3 py-1.5 text-xs rounded-xl border transition-all cursor-pointer ${
                        inputs.approxNaveSurface === s
                          ? 'border-blue-600 bg-blue-50/60 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-white'
                      }`}
                    >
                      {s.toLocaleString('es-ES')} m²
                    </button>
                  ))}
                </div>
              </div>

              {/* Superficie Estructura Opcional */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">
                  Superficie real de acero a tratar (opcional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Ej. 320"
                    value={inputs.structuralSurface || ''}
                    onChange={(e) =>
                      setInputs({
                        ...inputs,
                        structuralSurface: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    className="w-36 min-h-[44px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <span className="text-xs text-slate-500">m² de acero desarrollado</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Si no la conoces, se calculará automáticamente con el ratio medio industrial (~0,42 m² de acero por m² de suelo).
                </p>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleStepChange(2)}
                  className="glass-button-primary min-h-[44px] px-5 py-2.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continuar a Estructura</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Paso 2 de 3
                </span>
                <h4 className="text-lg font-bold text-slate-950 mt-0.5">
                  Estructura y exigencia contra el fuego
                </h4>
              </div>

              {/* Tipo estructura: iOS 26 Segmented Control */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Tipo de estructura
                </label>
                <div className="segmented-track grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {[
                    { id: 'acero', label: 'Acero' },
                    { id: 'hormigon', label: 'Hormigón' },
                    { id: 'madera', label: 'Madera' },
                    { id: 'no_se', label: 'No lo sé' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          structureType: item.id as CalculatorIgnifugacionInputs['structureType']
                        })
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs text-center cursor-pointer segmented-item ${
                        inputs.structureType === item.id
                          ? 'segmented-item-active'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resistencia al fuego: Segmented */}
              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="block text-xs font-semibold text-slate-700">
                    Resistencia requerida (R)
                  </label>
                  <span className="text-[11px] text-slate-400">Minutos según RSCIEI</span>
                </div>
                <div className="segmented-track grid grid-cols-3 sm:grid-cols-5 gap-1">
                  {[
                    { id: 'R30', label: 'R-30' },
                    { id: 'R60', label: 'R-60' },
                    { id: 'R90', label: 'R-90' },
                    { id: 'R120', label: 'R-120' },
                    { id: 'no_se', label: 'Pendiente' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          fireResistance: r.id as CalculatorIgnifugacionInputs['fireResistance']
                        })
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs text-center cursor-pointer segmented-item ${
                        inputs.fireResistance === r.id
                          ? 'segmented-item-active'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sistema Preferido */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Preferencia de sistema de protección
                </label>
                <div className="segmented-track grid grid-cols-1 sm:grid-cols-3 gap-1">
                  {[
                    { id: 'mortero', label: 'Mortero proyectado' },
                    { id: 'pintura_intumescente', label: 'Pintura vista' },
                    { id: 'no_se', label: 'Comparar ambos' }
                  ].map((sys) => (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          systemPreference: sys.id as CalculatorIgnifugacionInputs['systemPreference']
                        })
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs text-center cursor-pointer segmented-item ${
                        inputs.systemPreference === sys.id
                          ? 'segmented-item-active'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {sys.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleStepChange(1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStepChange(3)}
                  className="glass-button-primary min-h-[44px] px-5 py-2 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continuar a Altura</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Paso 3 de 3
                </span>
                <h4 className="text-lg font-bold text-slate-950 mt-0.5">
                  Altura de trabajo y estado de la nave
                </h4>
              </div>

              {/* Altura: Segmented */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Altura libre de pilares / cerchas
                </label>
                <div className="segmented-track grid grid-cols-1 sm:grid-cols-3 gap-1">
                  {[
                    { id: 'normal', label: 'Estándar (< 5m)' },
                    { id: 'altura_importante', label: 'Gran altura (> 5m PEMP)' },
                    { id: 'no_se', label: 'No lo sé exacto' }
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          heightAccess: h.id as CalculatorIgnifugacionInputs['heightAccess']
                        })
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs text-center cursor-pointer segmented-item ${
                        inputs.heightAccess === h.id
                          ? 'segmented-item-active'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {h.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estado nave: Segmented */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Estado actual de la estructura
                </label>
                <div className="segmented-track grid grid-cols-1 sm:grid-cols-3 gap-1">
                  {[
                    { id: 'nueva', label: 'Obra nueva / limpia' },
                    { id: 'ya_protegida', label: 'Ya protegida / revisión' },
                    { id: 'rehabilitacion', label: 'Reforma / adecuación' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() =>
                        setInputs({
                          ...inputs,
                          state: st.id as CalculatorIgnifugacionInputs['state']
                        })
                      }
                      className={`min-h-[40px] px-3 py-2 text-xs text-center cursor-pointer segmented-item ${
                        inputs.state === st.id
                          ? 'segmented-item-active'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => handleStepChange(2)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Atrás</span>
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  Estimación calibrada
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: High-Trust Financial Result Screen (5 cols) */}
        <div className="lg:col-span-5 bg-slate-50/70 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {calculation && (
            <div className="space-y-6">
              {/* Estimation Header: Prominent Number (WOW Moment) */}
              <div>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                  Estimación orientativa
                </span>
                <div className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 font-mono tabular-nums">
                  {calculation.minEstimate.toLocaleString('es-ES')} € — {calculation.maxEstimate.toLocaleString('es-ES')} €
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    Coste estimado total sin IVA para {inputs.province}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-xs font-bold text-slate-800">
                    Confianza {calculation.confidence.toLowerCase()}
                  </span>
                </div>
              </div>

              {/* Clean Specification Table (Apple Style Key-Value Ledger) */}
              <div className="border-t border-b border-slate-200/80 py-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Superficie nave</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">{inputs.approxNaveSurface.toLocaleString('es-ES')} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Acero calculado</span>
                  <span className="font-semibold text-slate-900 font-mono tabular-nums">~{calculation.estimatedStructuralM2} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Resistencia</span>
                  <span className="font-semibold text-slate-900">{inputs.fireResistance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ubicación</span>
                  <span className="font-semibold text-slate-900">{inputs.province}</span>
                </div>
              </div>

              {/* Top Cost Drivers */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <span className="font-semibold text-slate-900 text-[11px] uppercase tracking-wider block">
                  Factores determinantes:
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {calculation.confidenceReason}
                </p>
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="pt-4 border-t border-slate-200/80 space-y-3">
            <button
              type="button"
              onClick={handleCompleteToQuote}
              className="glass-button-primary w-full min-h-[46px] rounded-xl py-3 px-4 text-xs font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Recibir hasta 2 presupuestos reales</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <p className="text-[11px] text-slate-400 text-center">
              Máximo 2 empresas homologadas · Sin llamadas masivas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
