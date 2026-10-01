import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';
import { StructureVsMassivityDiagram, FireRatingScaleDiagram } from '../components/TechnicalDiagrams';
import { ASSETS } from '../assets';

interface LandingMorteroIgnifugoProps {
  navigate: (path: string) => void;
}

export const LandingMorteroIgnifugo: React.FC<LandingMorteroIgnifugoProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Mortero ignífugo precio m²', url: '/proteccion-incendios/mortero-ignifugo-precio-m2/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Mortero Ignífugo Precio m² (2026): Lana de Roca Proyectada | CuántoVale"
        description="Precios de mortero ignífugo de lana de roca y perlita por m² en España (14 € – 23 €/m²). La solución más eficiente para naves industriales según RSCIEI."
        path="/proteccion-incendios/mortero-ignifugo-precio-m2/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            La solución más económica · Datos 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Mortero ignífugo precio m²: lana de roca y perlita proyectada
          </h1>

          {/* Featured Industrial Detail Image */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 w-full bg-slate-100 border border-slate-200">
            <img
              src={ASSETS.mortarFireproofing}
              alt="Mortero ignífugo de lana de roca proyectado sobre cerchas metálicas de nave"
              width="800"
              height="400"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
              <span className="font-semibold block text-sm">Proyección continua neumática</span>
              <span className="text-slate-200 text-[11px]">Excelente adherencia sobre chapa grecada y vigas metálicas industriales</span>
            </div>
          </div>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              El precio medio de proyección de mortero ignífugo en España se sitúa entre{' '}
              <strong className="font-bold text-slate-950">14 € y 23 €/m²</strong> de estructura de acero (sin IVA).
            </p>
            <p className="text-xs text-slate-600">
              Es la solución más rentable y rápida para naves de almacenamiento, centros logísticos y fábricas donde la estética lisa no es prioritaria.
            </p>
          </div>
        </div>
      </section>

      {/* DETALLES TÉCNICOS */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Mortero de lana de roca vs Mortero de perlita-vermiculita
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Ambos sistemas cumplen con los ensayos oficiales pero difieren en peso y dureza superficial:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-2 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Mortero de lana de roca + cemento</span>
              <p className="font-mono text-slate-900 font-bold">14 — 19 €/m²</p>
              <p className="text-slate-600 leading-relaxed">
                Densidad ligera (aprox. 300 kg/m³). No sobrecarga peso en las cerchas. Alto aislamiento térmico y absorción acústica.
              </p>
            </div>

            <div className="space-y-2 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Mortero de perlita y vermiculita (yeso/cemento)</span>
              <p className="font-mono text-slate-900 font-bold">17 — 23 €/m²</p>
              <p className="text-slate-600 leading-relaxed">
                Mayor dureza superficial (densidad 650–850 kg/m³). Más resistente a golpes leves o corrientes de aire intensas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* STRUCTURE VS MASSIVITY DIAGRAM */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/40">
        <div className="mx-auto max-w-4xl">
          <StructureVsMassivityDiagram />
        </div>
      </section>

      {/* METHODOLOGY BADGE */}
      <section className="py-10 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl">
          <MethodologyBadge />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 bg-white text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">
            Calcula el coste de proyectar mortero en tu nave
          </h2>
          <p className="text-xs text-slate-600">
            Recibe 2 presupuestos con metros cuadrados y espesor de mortero ya dimensionados.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Recibir 2 presupuestos de mortero proyectado
            </button>
          </div>
        </div>
      </section>

      <LeadModalOrForm
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        service="ignifugacion"
      />
    </div>
  );
};
