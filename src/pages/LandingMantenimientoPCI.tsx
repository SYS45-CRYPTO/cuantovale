import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingMantenimientoPCIProps {
  navigate: (path: string) => void;
}

export const LandingMantenimientoPCI: React.FC<LandingMantenimientoPCIProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Mantenimiento PCI precio', url: '/proteccion-incendios/mantenimiento-pci-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Mantenimiento PCI Precio (2026): Contratos y Tarifas RIPCI | CuántoVale"
        description="¿Cuánto cuesta el mantenimiento contra incendios de una nave o negocio en España? Tarifas para extintores, BIEs, detección y grupos de presión según RD 513/2017."
        path="/proteccion-incendios/mantenimiento-pci-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Obligación Reglamentaria RIPCI · Tarifas 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Mantenimiento PCI precio: contratos anuales y revisiones oficiales
          </h1>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              El mantenimiento reglamentario contra incendios para una nave industrial o local en España oscila habitualmente entre{' '}
              <strong className="font-bold text-slate-950">420 € y 1.450 € al año</strong> (+ IVA) para instalaciones estándar.
            </p>
            <p className="text-xs text-slate-600">
              Incluye revisiones trimestrales y anuales según RIPCI (RD 513/2017), expedición del certificado anual para la compañía de seguros y libro de actas oficial.
            </p>
          </div>
        </div>
      </section>

      {/* TABLE TARIFFS */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950">
            Precios orientativos por equipo
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Equipo PCI</th>
                  <th className="py-3 px-4">Revisión Anual</th>
                  <th className="py-3 px-4">Retimbrado Quinquenal</th>
                  <th className="py-3 px-4">Norma</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Extintor polvo ABC 6 kg</td>
                  <td className="py-3 px-4 font-mono font-medium">6 — 12 € / ud</td>
                  <td className="py-3 px-4 font-mono font-medium">18 — 28 € / ud</td>
                  <td className="py-3 px-4 text-slate-500">RIPCI Tablas I y II</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Extintor CO2 5 kg</td>
                  <td className="py-3 px-4 font-mono font-medium">8 — 15 € / ud</td>
                  <td className="py-3 px-4 font-mono font-medium">22 — 35 € / ud</td>
                  <td className="py-3 px-4 text-slate-500">Prueba hidráulica cada 5 años</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">BIE 25 mm / 45 mm</td>
                  <td className="py-3 px-4 font-mono font-medium">25 — 45 € / ud</td>
                  <td className="py-3 px-4 font-mono font-medium">55 — 85 € / ud</td>
                  <td className="py-3 px-4 text-slate-500">Presión estática y dinámica</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Central de detección y alarma</td>
                  <td className="py-3 px-4 font-mono font-medium">180 — 400 € / año</td>
                  <td className="py-3 px-4 text-slate-400">N/A</td>
                  <td className="py-3 px-4 text-slate-500">Lazos, sirenas y baterías</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">Grupo de presión contra incendios</td>
                  <td className="py-3 px-4 font-mono font-medium">250 — 600 € / año</td>
                  <td className="py-3 px-4 text-slate-400">N/A</td>
                  <td className="py-3 px-4 text-slate-500">Arranque automático bomba diésel/eléctrica</td>
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
          <h2 className="text-xl font-bold text-slate-950">Compara ofertas para tu mantenimiento PCI</h2>
          <p className="text-xs text-slate-600">
            Mantenedores autorizados con libro de registro para tu póliza de seguro.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Recibir 2 presupuestos de mantenimiento
            </button>
          </div>
        </div>
      </section>

      <LeadModalOrForm
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        service="mantenimiento"
      />
    </div>
  );
};
