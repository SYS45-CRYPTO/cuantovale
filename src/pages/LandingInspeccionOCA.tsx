import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingInspeccionOCAProps {
  navigate: (path: string) => void;
}

export const LandingInspeccionOCA: React.FC<LandingInspeccionOCAProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Inspección OCA PCI precio', url: '/proteccion-incendios/inspeccion-oca-pci-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Inspección OCA PCI Precio (2026): Tarifas y Periodicidad | CuántoVale"
        description="¿Cuánto cuesta una inspección periódica por OCA contra incendios? Tarifas oficiales de 650 € a 1.850 € según superficie de nave y riesgo RSCIEI."
        path="/proteccion-incendios/inspeccion-oca-pci-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Control Reglamentario Obligatorio · Tarifas 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Inspección OCA PCI precio: costes y periodicidad reglamentaria
          </h1>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              La inspección periódica por un Organismo de Control Autorizado (OCA) cuesta en España entre{' '}
              <strong className="font-bold text-slate-950">650 € y 1.850 €</strong> (+ IVA) según la superficie construida y el nivel de riesgo intrínseco.
            </p>
          </div>
        </div>
      </section>

      {/* PERIODICIDAD TABLA */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950">
            Periodicidad obligatoria según RSCIEI
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Nivel de Riesgo (RSCIEI)</th>
                  <th className="py-3 px-4">Periodicidad Obligatoria</th>
                  <th className="py-3 px-4">Tarifa Media Orientativa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Riesgo Alto (Nivel 6, 7 y 8)</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">Cada 2 años</td>
                  <td className="py-3 px-4 font-mono font-medium">1.100 € — 1.850 €</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Riesgo Medio (Nivel 3, 4 y 5)</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">Cada 3 años</td>
                  <td className="py-3 px-4 font-mono font-medium">850 € — 1.400 €</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Riesgo Bajo (Nivel 1 y 2)</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">Cada 5 años</td>
                  <td className="py-3 px-4 font-mono font-medium">650 € — 950 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* METHODOLOGY */}
      <section className="py-10 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl">
          <MethodologyBadge />
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 sm:px-6 bg-white text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-950">¿Tienes requerimiento de inspección OCA?</h2>
          <p className="text-xs text-slate-600">
            Revisamos tu caso para subsanar deficiencias técnicas antes de la visita del inspector.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Pedir asesoramiento técnico
            </button>
          </div>
        </div>
      </section>

      <LeadModalOrForm
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        service="inspeccion_oca"
      />
    </div>
  );
};
