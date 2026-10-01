import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';
import { FireRatingScaleDiagram } from '../components/TechnicalDiagrams';
import { ASSETS } from '../assets';

interface LandingPinturaIntumescenteProps {
  navigate: (path: string) => void;
}

export const LandingPinturaIntumescente: React.FC<LandingPinturaIntumescenteProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Pintura intumescente precio m²', url: '/proteccion-incendios/pintura-intumescente-precio-m2/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Pintura Intumescente Precio m² (2026): R30, R60, R90 | CuántoVale"
        description="Precios reales de pintura intumescente por m² en España (24 € – 48 €/m²). Conoce el coste según micras de espesor seco (DFT), imprimación epoxi y esmalte de acabado."
        path="/proteccion-incendios/pintura-intumescente-precio-m2/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Protección Pasiva Estética · Datos 2026
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Pintura intumescente precio m²: guía de costes y espesores
          </h1>

          {/* Featured Industrial Detail Image */}
          <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 w-full bg-slate-100 border border-slate-200">
            <img
              src={ASSETS.intumescentPaint}
              alt="Perfil de acero tratado con pintura intumescente blanca vista"
              width="800"
              height="400"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white text-xs">
              <span className="font-semibold block text-sm">Acabado estético liso para estructuras vistas</span>
              <span className="text-slate-200 text-[11px]">Medición de espesor de película seca (DFT en micras) con medidor magnético calibrado</span>
            </div>
          </div>

          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              El precio de aplicación de pintura intumescente sobre estructura metálica en España se sitúa entre{' '}
              <strong className="font-bold text-slate-950">24 € y 48 €/m²</strong> sin IVA.
            </p>
            <p className="text-xs text-slate-600">
              El coste depende del espesor de película seca en micras (µm) exigido por la tabla de masividades y los minutos de resistencia (R15 a R90).
            </p>
          </div>
        </div>
      </section>

      {/* COMPONENTES DEL PRECIO */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              Desglose de partidas por metro cuadrado
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Un tratamiento completo con pintura intumescente homologada incluye tres capas:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-xs text-slate-700">
            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">1. Imprimación previa</span>
              <p className="font-mono text-slate-900 font-bold">4 — 7 €/m²</p>
              <p className="text-slate-600 leading-relaxed">
                Antioxidante epoxi o alquídico para garantizar adherencia sobre el perfil metálico desengrasado.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">2. Pintura intumescente</span>
              <p className="font-mono text-slate-900 font-bold">16 — 34 €/m²</p>
              <p className="text-slate-600 leading-relaxed">
                Aplicación airless en pasadas cruzadas hasta el espesor en micras fijado por ensayo oficial.
              </p>
            </div>

            <div className="space-y-1.5 border-t border-slate-200 pt-4">
              <span className="font-semibold text-sm text-slate-950 block">3. Esmalte de sellado</span>
              <p className="font-mono text-slate-900 font-bold">4 — 7 €/m²</p>
              <p className="text-slate-600 leading-relaxed">
                Esmalte poliuretano o acrílico en el color RAL elegido. Protege la pintura de humedad y radiación UV.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FIRE RATING SCALE DIAGRAM */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/40">
        <div className="mx-auto max-w-4xl">
          <FireRatingScaleDiagram />
        </div>
      </section>

      {/* PRECIO SEGÚN RESISTENCIA R */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-xl font-bold text-slate-950">
            Tabla de precios por m² según resistencia R
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Resistencia</th>
                  <th className="py-3 px-4">Espesor Típico (DFT)</th>
                  <th className="py-3 px-4">Número de Manos</th>
                  <th className="py-3 px-4">Precio Total Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-950">R15 / R30</td>
                  <td className="py-3 px-4">250 — 450 µm</td>
                  <td className="py-3 px-4 font-sans text-slate-600">1 — 2 manos</td>
                  <td className="py-3 px-4 font-bold text-slate-900">24 € — 30 €/m²</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-950">R60</td>
                  <td className="py-3 px-4">500 — 900 µm</td>
                  <td className="py-3 px-4 font-sans text-slate-600">2 — 3 manos</td>
                  <td className="py-3 px-4 font-bold text-slate-900">30 € — 40 €/m²</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-950">R90</td>
                  <td className="py-3 px-4">1.000 — 1.600 µm</td>
                  <td className="py-3 px-4 font-sans text-slate-600">3 — 5 manos</td>
                  <td className="py-3 px-4 font-bold text-slate-900">38 € — 48 €/m²</td>
                </tr>
              </tbody>
            </table>
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
      <section className="py-14 px-4 sm:px-6 bg-white text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-2xl font-bold text-slate-950">
            ¿Necesitas presupuesto para pintura intumescente?
          </h2>
          <p className="text-xs text-slate-600">
            Calcula la superficie y recibe ofertas de instaladores autorizados con certificado visado.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-button-primary rounded-xl px-7 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Pedir 2 presupuestos con pintura intumescente
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
