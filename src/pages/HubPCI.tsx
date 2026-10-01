import React, { useState } from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { CalculatorIgnifugacion } from '../components/CalculatorIgnifugacion';
import { LeadModalOrForm } from '../components/LeadModalOrForm';
import { MethodologyBadge } from '../components/MethodologyBadge';
import { CalculationResult, CalculatorIgnifugacionInputs } from '../types';

interface HubPCIProps {
  navigate: (path: string) => void;
}

export const HubPCI: React.FC<HubPCIProps> = ({ navigate }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [calculationContext, setCalculationContext] = useState<CalculationResult | null>(null);
  const [calculatorInputsContext, setCalculatorInputsContext] = useState<CalculatorIgnifugacionInputs | null>(null);

  const handleCalculatorQuoteRequest = (calc: CalculationResult, inputs: CalculatorIgnifugacionInputs) => {
    setCalculationContext(calc);
    setCalculatorInputsContext(inputs);
    setIsLeadModalOpen(true);
  };

  const breadcrumbs = [
    { name: 'Protección contra Incendios', url: '/proteccion-incendios/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Precios de Protección Contra Incendios 2026 | CuántoVale"
        description="Directorio de precios de protección contra incendios en España: ignifugación de naves, mantenimiento periódico, proyectos de ingeniería e inspecciones reglamentarias."
        path="/proteccion-incendios/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      {/* HEADER */}
      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Hub de Precios · PCI Industrial
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Precios de protección contra incendios
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
            Referencias de mercado y calculadoras técnicas para las 6 áreas de protección pasiva, activa y legalización en España.
          </p>
        </div>
      </section>

      {/* 6 PCI BRANCHES: Clean Table / Directory View instead of card spam */}
      <section className="py-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Servicios y tarifas de referencia
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en cada categoría para ver el análisis detallado y el desglose de costes:
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                <tr>
                  <th className="py-3 px-4">Área de servicio</th>
                  <th className="py-3 px-4">Coste orientativo</th>
                  <th className="py-3 px-4">Regulación aplicable</th>
                  <th className="py-3 px-4 text-right">Guía</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr
                  onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Ignifugación de naves industriales
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Mortero de lana de roca, pintura intumescente y placas
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">14 € — 48 €/m²</td>
                  <td className="py-3.5 px-4 text-slate-500">RSCIEI (RD 2267/2004)</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver calculadora →</td>
                </tr>

                <tr
                  onClick={() => navigate('/proteccion-incendios/mantenimiento-pci-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Mantenimiento periódico reglamentario
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Revisiones trimestrales y anuales de extintores, BIEs y centralitas
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">420 € — 1.450 €/año</td>
                  <td className="py-3.5 px-4 text-slate-500">RIPCI (RD 513/2017)</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver tarifas →</td>
                </tr>

                <tr
                  onClick={() => navigate('/proteccion-incendios/instalacion-pci-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Instalación de sistemas activos
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Redes de rociadores automáticos, grupos de presión y aljibes
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">Desde 3.500 €</td>
                  <td className="py-3.5 px-4 text-slate-500">UNE 23500 / RIPCI</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver costes →</td>
                </tr>

                <tr
                  onClick={() => navigate('/proteccion-incendios/proyecto-contra-incendios-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Proyecto de ingeniería y visado
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Memoria técnica de carga de fuego y planos de evacuación
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">1.200 € — 3.800 €</td>
                  <td className="py-3.5 px-4 text-slate-500">Colegio Ingenieros Industriales</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver baremos →</td>
                </tr>

                <tr
                  onClick={() => navigate('/proteccion-incendios/legalizacion-pci-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Legalización de nave existente
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Regularización ante Industria por traspaso o cambio de actividad
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">800 € — 2.500 €</td>
                  <td className="py-3.5 px-4 text-slate-500">Delegación de Industria</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver trámites →</td>
                </tr>

                <tr
                  onClick={() => navigate('/proteccion-incendios/inspeccion-oca-pci-precio/')}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-slate-950">
                    Inspección periódica OCA
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Control reglamentario cada 2, 3 o 5 años según nivel de riesgo
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900">650 € — 1.850 €</td>
                  <td className="py-3.5 px-4 text-slate-500">Organismos de Control (ENAC)</td>
                  <td className="py-3.5 px-4 text-right text-blue-600 font-semibold">Ver plazos →</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CALCULATOR EMBED */}
      <section className="py-12 px-4 sm:px-6 bg-slate-50/50 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Calculadora de ignifugación de nave
            </h2>
            <p className="text-xs text-slate-500">
              Herramienta técnica para calcular tu rango en 3 pasos:
            </p>
          </div>
          <CalculatorIgnifugacion onQuoteRequested={handleCalculatorQuoteRequest} />
        </div>
      </section>

      {/* NORMATIVA & METHODOLOGY */}
      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-950">
              Contexto normativo: RD 2267/2004 y RD 164/2025
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Las exigencias de resistencia al fuego de la estructura (R30 a R120) vienen fijadas por el tipo de configuración de la nave (Tipo A adosada, Tipo B con cubierta compartida o Tipo C exenta) y el nivel de riesgo intrínseco.
            </p>
          </div>

          <MethodologyBadge />
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
