import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface LandingPrecioM2Props {
  navigate: (path: string) => void;
}

export const LandingPrecioM2: React.FC<LandingPrecioM2Props> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' },
    { name: 'Precio ignifugación por m²', url: '/proteccion-incendios/precio-ignifugacion-m2/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Precio de Ignifugación por m² (2026): Estructura vs Suelo | CuántoVale"
        description="Descubre cuánto cuesta el m² de ignifugación en España: mortero desde 14 €/m² y pintura intumescente desde 24 €/m². Aprende a calcular el ratio real de estructura."
        path="/proteccion-incendios/precio-ignifugacion-m2/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Tarifas Unitarias 2026 · Desglose Técnico
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Precio de ignifugación por m²: costes y cálculo de superficie
          </h1>

          {/* ANSWER FIRST */}
          <div className="border-l-4 border-slate-900 pl-4 py-2 space-y-2">
            <p className="text-base sm:text-lg text-slate-900 font-medium leading-relaxed">
              El precio medio de ignifugación por <strong className="font-bold text-slate-950">metro cuadrado de estructura metálica</strong> oscila entre los{' '}
              <strong>14 € y 48 €/m²</strong> en función del sistema elegido y la resistencia R requerida.
            </p>
            <p className="text-xs text-slate-600">
              Mortero proyectado: 14 € — 23 €/m² · Pintura intumescente: 24 € — 48 €/m² · Placas de silicato: 45 € — 78 €/m².
            </p>
          </div>
        </div>
      </section>

      {/* RATIO DE ESTRUCTURA VS SUELO */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-950">
              ¿m² de suelo o m² de estructura de acero?
            </h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              El error más frecuente al presupuestar es confundir los metros cuadrados de planta construida de la nave con los metros cuadrados de perfil metálico desarrollado a tratar.
            </p>
          </div>

          <div className="text-xs text-slate-700 space-y-3 leading-relaxed">
            <p>
              En naves estándar con estructura porticada a dos aguas (pilares IPE/HEA y dinteles de celosía o vigas alveolares), por cada <strong>1 m² de planta</strong> existen aproximadamente entre <strong>0,38 y 0,55 m² de superficie de acero</strong>.
            </p>

            <div className="border border-slate-200 bg-slate-50 p-4 rounded-md font-mono text-xs text-slate-800 space-y-1">
              <p className="font-bold text-slate-900">Ejemplo de cálculo para nave de 800 m²:</p>
              <p>• Superficie de suelo: 800 m²</p>
              <p>• Coeficiente medio de estructura: 0,45 m²/m² suelo</p>
              <p>• Superficie a ignifugar: 800 × 0,45 = <strong>360 m² de acero desarrollado</strong></p>
              <p>• Coste orientativo mortero R60 (18,5 €/m²): 360 × 18,5 € = <strong>6.660 €</strong> (+ medios auxiliares y certificado)</p>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED TABLE */}
      <section className="py-14 px-4 sm:px-6 border-b border-slate-200 bg-slate-50/30">
        <div className="mx-auto max-w-4xl space-y-6">
          <h2 className="text-lg font-bold text-slate-950">
            Tarifas medias por metro cuadrado según resistencia (R)
          </h2>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Resistencia R</th>
                  <th className="py-3 px-4">Mortero Lana de Roca</th>
                  <th className="py-3 px-4">Pintura Intumescente</th>
                  <th className="py-3 px-4">Espesor Típico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">R-30</td>
                  <td className="py-3 px-4 font-mono font-medium">14 — 17 €/m²</td>
                  <td className="py-3 px-4 font-mono font-medium">24 — 32 €/m²</td>
                  <td className="py-3 px-4 text-slate-500">12 mm mortero / 250 µm pintura</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">R-60</td>
                  <td className="py-3 px-4 font-mono font-medium">16 — 20 €/m²</td>
                  <td className="py-3 px-4 font-mono font-medium">30 — 42 €/m²</td>
                  <td className="py-3 px-4 text-slate-500">18 mm mortero / 600 µm pintura</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">R-90</td>
                  <td className="py-3 px-4 font-mono font-medium">19 — 23 €/m²</td>
                  <td className="py-3 px-4 font-mono font-medium">40 — 52 €/m²</td>
                  <td className="py-3 px-4 text-slate-500">25 mm mortero / 1.200 µm pintura</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-slate-950">R-120</td>
                  <td className="py-3 px-4 font-mono font-medium">22 — 27 €/m²</td>
                  <td className="py-3 px-4 text-slate-400">Poco viable en pintura</td>
                  <td className="py-3 px-4 text-slate-500">32 mm mortero proyectado</td>
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
          <h2 className="text-xl font-bold text-slate-950">¿Quieres calcular el importe exacto para tu caso?</h2>
          <p className="text-xs text-slate-600">
            Utiliza la calculadora completa o solicita hasta 2 ofertas de instaladores homologados.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
              className="glass-button-primary rounded-xl px-6 py-3 text-xs font-semibold text-white cursor-pointer"
            >
              Ir a la Calculadora
            </button>
            <button
              onClick={() => setIsLeadModalOpen(true)}
              className="glass-control rounded-xl px-6 py-3 text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Pedir Presupuestos
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
