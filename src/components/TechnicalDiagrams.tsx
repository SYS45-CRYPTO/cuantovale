import React from 'react';
import { Shield, Flame, Clock, Layers, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';

// 1. Diagram: Superficie de nave en planta vs Superficie desarrollada de acero (Masividad)
export const StructureVsMassivityDiagram: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
            Ingeniería de Coste PCI
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
            Superficie en Planta vs. Superficie Real Desarrollada (Factor de Masividad)
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            El precio de ignifugación no se calcula multiplicando los m² de suelo por una tarifa estándar. 
            El coste real depende de los metros lineales y el perímetro expuesto de las vigas y pilares (factor de masividad de perfiles IPE, HEB o tubulares). 
            <em className="block text-[11px] text-slate-400 mt-0.5">Nota: La proporción entre m² de planta y m² de acero desarrollada es una relación ilustrativa según tipología y altura de nave, no una constante matemática universal.</em>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 items-center">
        {/* SVG Visualization */}
        <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/60 flex flex-col items-center justify-center">
          <svg viewBox="0 0 420 220" className="w-full max-w-md h-auto drop-shadow-xs" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Warehouse Outline */}
            <rect x="20" y="40" width="180" height="140" rx="8" fill="#F1F5F9" stroke="#94A3B8" strokeWidth="2" strokeDasharray="4 4" />
            <text x="110" y="115" fill="#64748B" fontSize="12" fontWeight="600" textAnchor="middle">Nave en Planta (1.000 m²)</text>
            <text x="110" y="135" fill="#94A3B8" fontSize="10" textAnchor="middle">Superficie catastral / útil</text>

            {/* Arrow */}
            <path d="M215 110 H245" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrow)" />
            
            {/* I-Beam Profile (Flange / Massivity) */}
            <g transform="translate(260, 40)">
              {/* I-Beam Cross section */}
              {/* Top Flange */}
              <rect x="20" y="15" width="100" height="16" rx="2" fill="#1E293B" />
              {/* Web */}
              <rect x="62" y="31" width="16" height="78" rx="1" fill="#1E293B" />
              {/* Bottom Flange */}
              <rect x="20" y="109" width="100" height="16" rx="2" fill="#1E293B" />

              {/* Fireproofing Coating Layer (Orange/Blue dashed offset) */}
              <path d="M14 9 H126 V37 H84 V103 H126 V131 H14 V103 H56 V37 H14 Z" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeDasharray="3 3" />
              
              {/* Labels for Flange and Web */}
              <text x="70" y="160" fill="#0F172A" fontSize="11" fontWeight="700" textAnchor="middle">Perfil IPE / HEB</text>
              <text x="70" y="176" fill="#2563EB" fontSize="10" fontWeight="600" textAnchor="middle">Superficie Expuesta (Sm/V)</text>
            </g>
          </svg>
          <p className="text-[11px] text-slate-500 font-mono text-center mt-3">
            Factor de Forma <span className="font-semibold text-slate-800">Sm/V (m⁻¹)</span>: A mayor masividad del perfil, mayor espesor de material requerido.
          </p>
        </div>

        {/* Technical Explanation breakdown */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <Layers className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950">Ratio medio nave industrial estándar:</p>
              <p className="text-blue-900/80 mt-1 leading-relaxed">
                Por cada <strong>1.000 m²</strong> de nave en planta, la estructura metálica portante suele tener entre <strong>650 m² y 1.250 m²</strong> de superficie de acero desarrollada (alas y almas de vigas y pilares).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Perfil Ligero (ej. IPE 160)</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">Alta masividad</span>
              <p className="text-[11px] text-slate-500 mt-1">Se calienta rápidamente. Requiere mayor espesor de pintura o mortero.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-slate-200 bg-white">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Perfil Pesado (ej. HEB 300)</span>
              <span className="text-sm font-bold text-slate-900 mt-1 block">Baja masividad</span>
              <p className="text-[11px] text-slate-500 mt-1">Mayor inercia térmica. Requiere menor consumo de material por metro cuadrado.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Diagram: Resistencia al fuego R (R30, R60, R90, R120) y temperatura crítica
export const FireRatingScaleDiagram: React.FC = () => {
  const ratings = [
    { code: 'R30', minutes: 30, use: 'Cubiertas ligeras / naves aisladas tipo C', thicknessMortar: '10–14 mm', thicknessPaint: '250–450 µm', color: 'border-emerald-500 text-emerald-700 bg-emerald-50' },
    { code: 'R60', minutes: 60, use: 'Estructura principal estándar (RSCIEI Tipo B/C)', thicknessMortar: '15–22 mm', thicknessPaint: '500–900 µm', color: 'border-blue-500 text-blue-700 bg-blue-50' },
    { code: 'R90', minutes: 90, use: 'Riesgo medio / Naves adosadas Tipo A', thicknessMortar: '23–32 mm', thicknessPaint: '1.000–1.600 µm', color: 'border-amber-500 text-amber-700 bg-amber-50' },
    { code: 'R120', minutes: 120, use: 'Riesgo alto / medianerías de sectorización', thicknessMortar: '30–42 mm', thicknessPaint: 'Placas o mortero denso', color: 'border-rose-500 text-rose-700 bg-rose-50' },
  ];

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
      <div className="pb-6 border-b border-slate-100">
        <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
          Normativa RSCIEI & CTE DB-SI
        </span>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
          Escalado de Exigencia R: Tiempo de Estabilidad Estructural ante el Fuego
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
          En modelos de cálculo tensional estándar, se toma como hipótesis ilustrativa una temperatura crítica aproximada de <strong>500 °C</strong> para el acero estructural no protegido. 
          La clasificación R indica los minutos que el sistema retrasa dicho calentamiento.
          <em className="block text-[11px] text-slate-400 mt-0.5">
            * Importante: Los espesores indicados en mm o micras son intervalos orientativos frecuentes. No constituyen una equivalencia fija universal: el espesor exacto (DFT) debe determinarse para cada perfil según su masividad ($S_m/V$) y los ensayos certificados del fabricante.
          </em>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
        {ratings.map((r, i) => (
          <div key={r.code} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-md border ${r.color}`}>
                  {r.code}
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {r.minutes} min
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-800 leading-snug">{r.use}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Mortero:</span>
                <span className="font-mono font-semibold text-slate-900">{r.thicknessMortar}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="text-slate-400">Pintura:</span>
                <span className="font-mono font-semibold text-slate-900">{r.thicknessPaint}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. Diagram: Flujo de CuántoVale vs Portales de Subastas Masivas
export const QuotationProcessFlowDiagram: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/50 p-6 sm:p-8 shadow-xs">
      <div className="text-center max-w-2xl mx-auto pb-8">
        <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
          Modelo Operativo Independiente
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
          Cómo gestionamos tu solicitud frente a portales tradicionales de reformas
        </h3>
        <p className="text-xs text-slate-500 mt-1.5">
          Protegemos tu tiempo y tus datos. Ni subastas masivas ni llamadas comerciales interminables.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Traditional Auction Model */}
        <div className="p-5 rounded-xl border border-rose-200/70 bg-rose-50/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase font-mono mb-3">
              <AlertTriangle className="h-4 w-4 text-rose-500" />
              Portales genéricos de reformas
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Venta de tus datos de contacto a <strong>5, 8 o 10 empresas</strong> sin filtro.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Empresas no especializadas en PCI industrial ni habilitadas ante Industria.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">✕</span>
                <span>Comisión oculta sobre el importe final del proyecto (hasta un 15%).</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-rose-200/50 text-[11px] font-mono text-rose-600 text-center font-medium">
            Resultado: Bombardeo telefónico y ofertas sin base técnica.
          </div>
        </div>

        {/* CuántoVale Independent Model */}
        <div className="p-5 rounded-xl border border-blue-200/80 bg-blue-50/30 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-blue-700 font-bold text-xs uppercase font-mono mb-3">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              Protocolo CuántoVale.es
            </div>
            <ul className="space-y-2.5 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span><strong>Máximo 2 empresas instaladoras</strong> previamente verificadas y habilitadas ante Industria.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Parámetros técnicos (m², estructura, R exigida) ya filtrados antes de contactarte.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">✓</span>
                <span>Cero comisiones de éxito. Trato directo con el instalador técnico.</span>
              </li>
            </ul>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-200/60 text-[11px] font-mono text-blue-700 text-center font-semibold">
            Resultado: Comparativa técnica limpia entre dos opciones reales.
          </div>
        </div>
      </div>
    </div>
  );
};
