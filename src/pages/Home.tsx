import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { CalculatorIgnifugacion } from '../components/CalculatorIgnifugacion';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';
import { ProductCalculatorPreview, CuantoValeIndexPreview } from '../components/ProductCalculatorPreview';
import { SystemsComparisonTable } from '../components/SystemsComparisonTable';
import { StructureVsMassivityDiagram, QuotationProcessFlowDiagram } from '../components/TechnicalDiagrams';
import { GUIDES_DATA } from './GuidesIndexPage';
import { ASSETS } from '../assets';
import { CalculationResult, CalculatorIgnifugacionInputs, Lead } from '../types';
import { Search, ChevronDown, ArrowRight, ShieldCheck, Check, BookOpen, Layers, Sparkles, Building2, Flame, Wrench, FileSpreadsheet } from 'lucide-react';

interface HomeProps {
  navigate: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ navigate }) => {
  const [selectedService, setSelectedService] = useState('ignifugacion');
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [calculationContext, setCalculationContext] = useState<CalculationResult | null>(null);
  const [calculatorInputsContext, setCalculatorInputsContext] = useState<CalculatorIgnifugacionInputs | null>(null);

  const handleCalculatorQuoteRequest = (calc: CalculationResult, inputs: CalculatorIgnifugacionInputs) => {
    setCalculationContext(calc);
    setCalculatorInputsContext(inputs);
    setIsLeadModalOpen(true);
  };

  const scrollToCalculator = () => {
    const el = document.getElementById('calculadora');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExecuteService = () => {
    if (selectedService === 'ignifugacion') {
      scrollToCalculator();
    } else {
      navigate(selectedService);
    }
  };

  return (
    <div className="min-h-screen text-slate-900 bg-white">
      <SEOMetaHead
        title="¿Cuánto debería costar? Calcula antes de contratar | CuántoVale"
        description="Calcula precios orientativos y costes reales antes de contratar en España. Compara presupuestos de hasta 2 profesionales homologados con independencia técnica."
        path="/"
        breadcrumbs={[]}
      />

      {/* 1. HERO SECTION: Clean Apple-like typography & Command Field */}
      <section className="pt-20 sm:pt-28 pb-14 sm:pb-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-7">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-slate-700 text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
            <span>Inteligencia de Precios Técnicos 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-[-0.035em] text-slate-950 leading-[1.12]">
            ¿Cuánto debería costar?
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Calcula un precio orientativo antes de hablar con un instalador. Transparencia técnica sin compromiso.
          </p>

          {/* Premium Command Field / Search Selector */}
          <div className="pt-3 max-w-xl mx-auto">
            <div className="rounded-xl border border-slate-200/90 bg-white/90 backdrop-blur-md p-1.5 sm:p-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-xs transition-all">
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2">
                <Search className="h-4 w-4 text-slate-400 shrink-0" />
                <div className="relative flex-1">
                  <select
                    value={selectedService}
                    onChange={(e) => setSelectedService(e.target.value)}
                    aria-label="Seleccionar servicio a calcular"
                    className="w-full appearance-none bg-transparent text-slate-900 font-medium text-xs sm:text-sm pr-7 focus:outline-none cursor-pointer"
                  >
                    <option value="ignifugacion">Ignifugación de nave industrial</option>
                    <option value="/proteccion-incendios/mantenimiento-pci-precio/">Mantenimiento contra incendios</option>
                    <option value="/proteccion-incendios/instalacion-pci-precio/">Instalación de sistemas PCI</option>
                    <option value="/proteccion-incendios/proyecto-contra-incendios-precio/">Proyecto e ingeniería contra incendios</option>
                    <option value="/proteccion-incendios/precio-ignifugacion-m2/">Precios por metro cuadrado (m²)</option>
                  </select>
                  <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <button
                onClick={handleExecuteService}
                className="glass-button-primary rounded-lg px-6 py-2.5 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
              >
                <span>Calcular precio</span>
                <ArrowRight className="h-3.5 w-3.5 opacity-80" />
              </button>
            </div>
          </div>

          {/* Reassurance text */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
            <span>Baremos BEDEC & CYPE</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Sin compromiso</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Máximo 2 empresas homologadas</span>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT SIMULATOR VISUAL PREVIEW: "Así calcula CuántoVale" */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <ProductCalculatorPreview onOpenFullCalculator={scrollToCalculator} />
      </section>

      {/* 3. CALCULADORA: Full 3-Step Production Tool */}
      <section id="calculadora" className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50/60 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center sm:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Herramienta Técnica
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-2">
              Calculadora de Ignifugación para Naves Industriales
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Introduce las características de tu instalación para obtener la horquilla de coste y el nivel de confianza técnico.
            </p>
          </div>

          <CalculatorIgnifugacion onQuoteRequested={handleCalculatorQuoteRequest} />
        </div>
      </section>

      {/* 4. SYSTEMS COMPARISON MATRIX (Mortero vs Pintura vs Placas) */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <SystemsComparisonTable navigate={navigate} />
        </div>
      </section>

      {/* 5. ENGINEERING DIAGRAM (Structure vs Massivity Factor) */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50/40 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <StructureVsMassivityDiagram />
        </div>
      </section>

      {/* 6. OBSERVATORIO DE PRECIOS PROVINCIALES (ÍNDICE CUANTOVALE) */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <CuantoValeIndexPreview />
        </div>
      </section>

      {/* 7. CÓMO FUNCIONA / PROTOCOLO INDEPENDIENTE */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-50/50 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <QuotationProcessFlowDiagram />
        </div>
      </section>

      {/* 8. EDITORIAL GUIDES SECTION */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
                Biblioteca Editorial
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mt-2">
                Guías Técnicas y Normativa PCI
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Conocimiento riguroso para entender ensayos, espesores y requisitos reglamentarios.
              </p>
            </div>
            <button
              onClick={() => navigate('/guias/')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>Ver todas las guías</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GUIDES_DATA.slice(0, 3).map((guide) => (
              <article
                key={guide.slug}
                className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group"
              >
                <div>
                  <div className="relative h-40 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={guide.image}
                      alt={guide.title}
                      loading="lazy"
                      width="350"
                      height="200"
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5 space-y-2.5">
                    <span className="text-[10px] font-mono uppercase text-blue-600 font-bold">
                      {guide.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {guide.description}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    onClick={() => navigate(guide.path)}
                    className="w-full py-2 px-3 rounded-lg bg-slate-50 hover:bg-blue-50 text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Leer guía</span>
                    <ArrowRight className="h-3 w-3 opacity-60" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 9. PARA EMPRESAS INSTALADORAS */}
      <section className="py-16 sm:py-24 border-t border-slate-200/80 bg-slate-950 text-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">
              Red Homologada CuántoVale
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              ¿Eres instalador o empresa de ingeniería PCI?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Recibe oportunidades con superficie, tipo de estructura y resistencia R ya filtrados. 
              Sin subastas masivas ni comisiones sobre el importe de la obra.
            </p>
          </div>
          <button
            onClick={() => navigate('/profesionales/')}
            className="py-3 px-6 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
          >
            <span>Información para empresas</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* Lead Modal */}
      {isLeadModalOpen && (
        <LeadModalOrForm
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          service="ignifugacion"
          calculatorInputs={calculatorInputsContext || undefined}
          calculationResult={calculationContext || undefined}
          onSuccess={(lead: Lead) => {
            console.log('[CuántoVale] Lead created from Home:', lead.lead_id);
          }}
        />
      )}
    </div>
  );
};
