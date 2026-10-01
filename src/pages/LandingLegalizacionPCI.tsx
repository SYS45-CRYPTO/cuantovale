import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingLegalizacionPCIProps {
  navigate: (path: string) => void;
}

export const LandingLegalizacionPCI: React.FC<LandingLegalizacionPCIProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Legalización PCI precio', url: '/proteccion-incendios/legalizacion-pci-precio/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Legalización PCI Precio (2026): Naves e Instalaciones | CuántoVale"
        description="¿Cuánto cuesta legalizar la protección contra incendios de una nave en Industria? Trámites, certificado de instalador y costes de regularización (800 € – 2.500 €)."
        path="/proteccion-incendios/legalizacion-pci-precio/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Regularización ante Industria · Tarifas 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Legalización PCI precio: registro y puesta en marcha reglamentaria
          </h1>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              La legalización documental y tramitación administrativa de una instalación PCI existente suele costar entre{' '}
              <strong className="font-bold text-slate-950">800 € y 2.500 €</strong> sin IVA.
            </p>
            <p className="text-xs text-slate-600">
              No incluye adecuaciones físicas si la instalación presenta deficiencias en resistencia estructural o falta de BIEs.
            </p>
          </div>
        </div>
      </section>

      {/* TRAMITACIÓN */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950">
            Casos habituales de legalización
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Cambio de titular o actividad</span>
              <p className="text-slate-600 leading-relaxed">
                El ayuntamiento exige el certificado de puesta en marcha expedido por la Delegación de Industria a nombre del nuevo arrendatario o propietario.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">Requerimiento de la aseguradora</span>
              <p className="text-slate-600 leading-relaxed">
                Las compañías de seguros industriales exigen el número de registro oficial en el RIPCI para cubrir los riesgos en la póliza.
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
          <h2 className="text-xl font-bold text-slate-950">Regulariza tu instalación contra incendios</h2>
          <p className="text-xs text-slate-600">
            Recibe hasta 2 valoraciones de técnicos autorizados para tramitar tu expediente en Industria.
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
        service="legalizacion"
      />
    </div>
  );
};
