import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CalculatorIgnifugacion } from '../components/CalculatorIgnifugacion';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';
import { StructureVsMassivityDiagram, FireRatingScaleDiagram } from '../components/TechnicalDiagrams';
import { SystemsComparisonTable } from '../components/SystemsComparisonTable';
import { ASSETS } from '../assets';
import { CalculationResult, CalculatorIgnifugacionInputs } from '../types';
import { ShieldCheck, ArrowRight, Check } from 'lucide-react';

interface LandingIgnifugarNaveProps {
  navigate: (path: string) => void;
}

export const LandingIgnifugarNave: React.FC<LandingIgnifugarNaveProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [calculationContext, setCalculationContext] = useState<CalculationResult | null>(null);
  const [calculatorInputsContext, setCalculatorInputsContext] = useState<CalculatorIgnifugacionInputs | null>(null);

  const handleCalculatorQuoteRequest = (calc: CalculationResult, inputs: CalculatorIgnifugacionInputs) => {
    setCalculationContext(calc);
    setCalculatorInputsContext(inputs);
    setIsLeadModalOpen(true);
  };

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Ignifugar nave industrial precio', url: '/proteccion-incendios/ignifugar-nave-industrial-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="¿Cuánto cuesta ignifugar una nave industrial? Precios 2026 | CuántoVale"
        description="Ignifugar una nave industrial en España cuesta habitualmente entre 8.000 € y 24.000 €. Conoce el precio por m² según mortero proyectado o pintura intumescente."
        path="/proteccion-incendios/ignifugar-nave-industrial-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      {/* HEADER / ANSWER FIRST: Editorial and crisp with Real Warehouse Photography */}
      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Guía de precios 2026 · RSCIEI
          </p>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-950">
            ¿Cuánto cuesta ignifugar una nave industrial?
          </h1>

          {/* Featured Industrial Photography */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 w-full bg-slate-100 border border-slate-200">
            <img
              src={ASSETS.warehouse}
              alt="Estructura metálica en nave industrial para ignifugación"
              width="800"
              height="400"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
              <span className="font-semibold block text-sm">Protección pasiva de estructuras portantes</span>
              <span className="text-slate-200 text-[11px]">Estructura de acero y cerchas de cubierta según RSCIEI (Real Decreto 164/2025, de 4 de marzo)</span>
            </div>
          </div>

          {/* ANSWER FIRST BLOCK: Plain, high-contrast, no loud colored card */}
          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              Ignifugar una nave industrial estándar en España (400 a 1.200 m²) tiene un coste medio total que oscila entre los{' '}
              <strong className="text-slate-950 font-bold">8.000 € y 24.000 €</strong> sin IVA.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              El coste unitario por metro cuadrado de acero se sitúa entre <strong>14 € y 23 €/m²</strong> para mortero proyectado de lana de roca, y entre <strong>24 € y 48 €/m²</strong> para pintura intumescente vista.
            </p>
          </div>
        </div>
      </section>

      {/* CALCULATOR EMBED */}
      <section className="py-12 bg-slate-50/50 border-b border-slate-200 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-950">
              Calculadora de coste para tu nave
            </h2>
            <p className="text-xs text-slate-500">
              Ajusta superficie y resistencia R para estimar la horquilla sin IVA:
            </p>
          </div>

          <CalculatorIgnifugacion onQuoteRequested={handleCalculatorQuoteRequest} />
        </div>
      </section>

      {/* PRICING TABLE BY WAREHOUSE SIZE */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Tabla orientativa de costes según tamaño de nave
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Medias estimadas para naves diáfanas de 6 metros de altura libre, incluyendo plataformas PEMP y certificado visado:
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Superficie Planta</th>
                  <th className="py-3 px-4">Acero Estimado</th>
                  <th className="py-3 px-4">Mortero Proyectado (R60)</th>
                  <th className="py-3 px-4">Pintura Intumescente</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">300 m²</td>
                  <td className="py-3 px-4 font-mono">~130 — 160 m²</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">4.500 € — 6.500 €</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">6.000 € — 8.800 €</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">600 m² (Típica)</td>
                  <td className="py-3 px-4 font-mono">~260 — 320 m²</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">8.000 € — 11.500 €</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">11.000 € — 16.500 €</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">1.000 m²</td>
                  <td className="py-3 px-4 font-mono">~450 — 550 m²</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">12.500 € — 17.500 €</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">18.000 € — 25.000 €</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">2.500 m² (Logística)</td>
                  <td className="py-3 px-4 font-mono">~1.100 — 1.350 m²</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">26.000 € — 38.000 €</td>
                  <td className="py-3 px-4 font-mono font-medium text-slate-900">39.000 € — 58.000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SYSTEMS COMPARISON VISUAL MATRIX */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl">
          <SystemsComparisonTable navigate={navigate} />
        </div>
      </section>

      {/* TECHNICAL MASSIVITY DIAGRAM */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-4xl">
          <StructureVsMassivityDiagram />
        </div>
      </section>

      {/* FIRE RATING SCALE DIAGRAM */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl">
          <FireRatingScaleDiagram />
        </div>
      </section>

      {/* CHECKLIST: Presupuesto profesional */}
      <section className="py-16 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Qué debe incluir un presupuesto para evitar sobrecostes
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Partidas esenciales que deben figurar desglosadas por escrito:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-2">
              <span className="font-semibold text-slate-900 block">Partidas obligatorias:</span>
              <ul className="space-y-2 text-slate-600 list-disc pl-4 leading-relaxed">
                <li>Limpieza previa y desengrasado de la perfilería de acero.</li>
                <li>Imprimación antioxidante en perfiles nuevos o sin tratar.</li>
                <li>Medios auxiliares (plataformas de tijera o articuladas) con transporte incluido.</li>
                <li>Ensayo oficial de espesores magnéticos según UNE-EN ISO 2808.</li>
                <li>Certificado de aplicación e informe de caracterización emitido por empresa instaladora habilitada / técnico competente.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <span className="font-semibold text-slate-900 block">Posibles exclusiones a vigilar:</span>
              <ul className="space-y-2 text-slate-600 list-disc pl-4 leading-relaxed">
                <li>Chorreado de arena si la pintura antigua está cuarteada o desprendida.</li>
                <li>Protección y tapado de suelos o maquinaria si la nave está en uso.</li>
                <li>Tasas de registro de documentación técnica o informe OCA si no están explicitadas.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* METHODOLOGY BADGE */}
      <section className="py-10 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl">
          <MethodologyBadge />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-white text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">
            Compara presupuestos reales para tu nave
          </h2>
          <p className="text-xs text-slate-600">
            Recibe hasta 2 ofertas de instaladores homologados en tu provincia con las variables técnicas ya calculadas.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Recibir 2 presupuestos reales
            </button>
          </div>
        </div>
      </section>

      <LeadModalOrForm
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        service="ignifugacion"
        calculationResult={calculationContext}
        calculatorInputs={calculatorInputsContext}
      />
    </div>
  );
};
