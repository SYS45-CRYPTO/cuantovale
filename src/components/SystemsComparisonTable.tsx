import React from 'react';
import { ASSETS } from '../assets';
import { Check, X, ArrowRight } from 'lucide-react';

interface SystemsComparisonTableProps {
  onSelectSystem?: (system: string) => void;
  navigate?: (path: string) => void;
}

export const SystemsComparisonTable: React.FC<SystemsComparisonTableProps> = ({ navigate }) => {
  const systems = [
    {
      id: 'mortero',
      name: 'Mortero Ignífugo Proyectado',
      subtitle: 'Lana de roca o base yeso/cemento',
      image: ASSETS.mortarFireproofing,
      priceRange: '14 € – 23 €/m²',
      priceBarWidth: '45%',
      fireRating: 'R30 a R240',
      finish: 'Rugoso / texturizado (industrial)',
      speed: 'Muy rápida (proyección neumática)',
      bestFor: 'Naves industriales, falsos techos, vigas no vistas',
      pros: ['Coste unitario más económico', 'Excelente aislamiento térmico', 'Alcanza R120/R180 con facilidad'],
      cons: ['Estética rugosa no apta para zonas vistas', 'Genera polvo durante la proyección'],
      path: '/proteccion-incendios/mortero-ignifugo-precio-m2/'
    },
    {
      id: 'pintura',
      name: 'Pintura Intumescente',
      subtitle: 'Base solvente o base agua',
      image: ASSETS.intumescentPaint,
      priceRange: '24 € – 48 €/m²',
      priceBarWidth: '75%',
      fireRating: 'R30 a R90 (raro R120)',
      finish: 'Liso, estético, continuo (se puede esmaltar)',
      speed: 'Media (múltiples manos con airless)',
      bestFor: 'Estructuras de acero vistas, locales comerciales, oficinas',
      pros: ['Respeta la geometría del perfil de acero', 'Acabado decorativo de alta calidad', 'No sobrecarga peso en la estructura'],
      cons: ['Coste 2x a 3x superior al mortero', 'Difícil y muy caro para exigencias superiores a R90'],
      path: '/proteccion-incendios/pintura-intumescente-precio-m2/'
    },
    {
      id: 'placas',
      name: 'Placas de Silicato / Yeso Fuego',
      subtitle: 'Revestimiento rígido perimetral (cajón)',
      image: ASSETS.warehouse,
      priceRange: '35 € – 65 €/m²',
      priceBarWidth: '95%',
      fireRating: 'R60 a R240',
      finish: 'Liso, plano, ocultación total del perfil',
      speed: 'Lenta (montaje en seco perfilería + tornillos)',
      bestFor: 'Pilares en zonas de paso, oficinas, sectorizaciones',
      pros: ['Gran resistencia a impactos mecánicos', 'Oculta cables e instalaciones', 'Gran estabilidad en R120/R180'],
      cons: ['Mayor coste de mano de obra', 'Instalación más lenta que la proyección'],
      path: '/proteccion-incendios/precio-ignifugacion-m2/'
    }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
            Comparador Técnico de Sistemas
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Mortero vs. Pintura Intumescente vs. Placas Rígidas
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Análisis comparativo de prestaciones técnicas, acabados estéticos y coste por metro cuadrado.
          </p>
        </div>
      </div>

      {/* Grid of 3 Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
        {systems.map((s) => (
          <div key={s.id} className="rounded-xl border border-slate-200/90 bg-slate-50/30 overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors">
            {/* Header Image */}
            <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
              <img
                src={s.image}
                alt={s.name}
                loading="lazy"
                width="400"
                height="225"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <span className="text-[10px] font-mono font-semibold uppercase text-blue-300 tracking-wider">
                  {s.subtitle}
                </span>
                <h4 className="text-sm font-bold text-white leading-tight mt-0.5">
                  {s.name}
                </h4>
              </div>
            </div>

            {/* Specs & Pricing */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Price Bar */}
                <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <div className="flex justify-between items-baseline mb-1.5">
                    <span className="text-[11px] text-slate-500 font-medium">Coste medio orientativo:</span>
                    <span className="text-xs font-mono font-bold text-slate-900">{s.priceRange}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: s.priceBarWidth }} />
                  </div>
                </div>

                {/* Key Technical Rows */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Resistencia R:</span>
                    <span className="font-semibold text-slate-800">{s.fireRating}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Acabado visual:</span>
                    <span className="font-medium text-slate-800 text-right">{s.finish}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Uso idóneo:</span>
                    <span className="font-medium text-slate-800 text-right">{s.bestFor}</span>
                  </div>
                </div>

                {/* Pros list */}
                <div className="pt-2">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">Ventajas clave:</span>
                  <ul className="space-y-1 text-xs text-slate-600">
                    {s.pros.map((p, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Navigation Action */}
              {navigate && (
                <div className="pt-4 border-t border-slate-200">
                  <button
                    onClick={() => navigate(s.path)}
                    className="w-full py-2 px-3 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Ver desglose de precios {s.id}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
