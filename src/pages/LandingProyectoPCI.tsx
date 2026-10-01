import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingProyectoPCIProps {
  navigate: (path: string) => void;
}

export const LandingProyectoPCI: React.FC<LandingProyectoPCIProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Proyecto contra incendios precio', url: '/proteccion-incendios/proyecto-contra-incendios-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Proyecto Contra Incendios Precio (2026): Memoria y Visado | CuántoVale"
        description="Honorarios de ingeniería para proyectos contra incendios y memorias técnicas visadas según RSCIEI y CTE en España. Baremos orientativos de 1.200 € a 3.800 €."
        path="/proteccion-incendios/proyecto-contra-incendios-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Ingeniería Industrial · Baremos Colegiales 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Proyecto contra incendios precio: memoria técnica y visado colegial
          </h1>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              La redacción y visado colegial de un proyecto específico de protección contra incendios para una nave o local en España oscila habitualmente entre los{' '}
              <strong className="font-bold text-slate-950">1.200 € y 3.800 €</strong> (+ IVA) según la superficie y la densidad de carga de fuego.
            </p>
          </div>
        </div>
      </section>

      {/* CONTENT DETAILS */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950">
            Contenido incluido en la memoria técnica
          </h2>

          <ul className="space-y-3 text-xs text-slate-700 leading-relaxed list-disc pl-4">
            <li>
              <strong>Cálculo de carga de fuego ponderada (Qs):</strong> Determinación matemática del nivel de riesgo intrínseco (Bajo, Medio o Alto) según los materiales y productos almacenados.
            </li>
            <li>
              <strong>Plano de sectorización y evacuación:</strong> Definición de recorridos de evacuación, salidas de emergencia, alumbrado y muros cortafuegos (EI 120/180).
            </li>
            <li>
              <strong>Memoria justificativa del RSCIEI (RD 2267/2004 / RD 164/2025):</strong> Definición precisa de los sistemas de extinción, detección y resistencia estructural exigibles.
            </li>
            <li>
              <strong>Visado colegial oficial:</strong> Registro en el Colegio Oficial de Ingenieros Industriales con dirección de obra técnica.
            </li>
          </ul>
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
          <h2 className="text-xl font-bold text-slate-950">Pide presupuesto de ingeniería PCI</h2>
          <p className="text-xs text-slate-600">
            Compara hasta 2 propuestas de ingenieros industriales colegiados para tu licencia de actividad.
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
        service="proyecto"
      />
    </div>
  );
};
