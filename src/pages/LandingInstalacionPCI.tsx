import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingInstalacionPCIProps {
  navigate: (path: string) => void;
}

export const LandingInstalacionPCI: React.FC<LandingInstalacionPCIProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Instalación PCI precio', url: '/proteccion-incendios/instalacion-pci-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Instalación PCI Precio (2026): Sistemas contra Incendios | CuántoVale"
        description="Presupuestos de instalación PCI para naves y locales: detección automática de humos, bocas de incendio equipadas (BIEs), rociadores automáticos y grupos de presión."
        path="/proteccion-incendios/instalacion-pci-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nuevas Instalaciones y Adecuaciones · Baremos 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Instalación PCI precio: sistemas activos contra incendios
          </h1>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              El coste de una instalación activa contra incendios varía según el nivel de riesgo: desde{' '}
              <strong className="font-bold text-slate-950">3.500 € a 8.500 €</strong> para detección y red de BIEs, hasta{' '}
              <strong className="font-bold text-slate-950">25.000 € — 65.000 €</strong> para instalaciones completas con rociadores automáticos (sprinklers), bombeo y aljibe.
            </p>
          </div>
        </div>
      </section>

      {/* SYSTEMS BREAKDOWN */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Coste orientativo por subsistema
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Partidas principales para naves industriales de tamaño estándar:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Detección óptica y alarma</span>
              <p className="font-mono text-slate-900 font-bold">2.200 € — 5.500 €</p>
              <p className="text-slate-600 leading-relaxed">
                Central analógica, barreras infrarrojas para techos altos, pulsadores manuales y sirenas según UNE 23007.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Red de BIEs de 25 o 45 mm</span>
              <p className="font-mono text-slate-900 font-bold">3.800 € — 8.500 €</p>
              <p className="text-slate-600 leading-relaxed">
                Tubería de acero ranurado, valvulería, armarios de BIE reglamentarios con 20m de manguera y manómetro.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Grupo de presión contra incendios</span>
              <p className="font-mono text-slate-900 font-bold">6.500 € — 18.000 €</p>
              <p className="text-slate-600 leading-relaxed">
                Bomba principal (diésel o eléctrica), bomba jockey de presurización y cuadro de control según UNE 23500.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Red de rociadores (Sprinklers)</span>
              <p className="font-mono text-slate-900 font-bold">25 € — 42 € / m² nave</p>
              <p className="text-slate-600 leading-relaxed">
                Puestos de control, tubería aérea colgada mediante soportes homologados y cabezas calibradas según carga térmica.
              </p>
            </div>
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
          <h2 className="text-xl font-bold text-slate-950">Solicita presupuesto para tu instalación PCI</h2>
          <p className="text-xs text-slate-600">
            Recibe hasta 2 propuestas de empresas autorizadas con proyectos llave en mano.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Pedir 2 presupuestos
            </button>
          </div>
        </div>
      </section>

      <LeadModalOrForm
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        service="instalacion"
      />
    </div>
  );
};
