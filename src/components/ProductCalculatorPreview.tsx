import React, { useState } from 'react';
import { ArrowRight, Sliders, ShieldCheck, Sparkles, Check } from 'lucide-react';

interface ProductCalculatorPreviewProps {
  onOpenFullCalculator?: () => void;
}

export const ProductCalculatorPreview: React.FC<ProductCalculatorPreviewProps> = ({ onOpenFullCalculator }) => {
  const [meters, setMeters] = useState<number>(1200);
  const [structure, setStructure] = useState<'acero' | 'hormigon' | 'mixta'>('acero');
  const [fireRating, setFireRating] = useState<'R30' | 'R60' | 'R90' | 'R120'>('R90');
  const [system, setSystem] = useState<'mortero' | 'pintura'>('pintura');

  // Interactive micro-calculation logic mirroring engine
  const calculatePreview = () => {
    let baseM2 = system === 'mortero' ? 17.5 : 34;
    if (fireRating === 'R60') baseM2 *= 1.15;
    if (fireRating === 'R90') baseM2 *= 1.35;
    if (fireRating === 'R120') baseM2 *= 1.65;

    // Structural ratio based on warehouse floor area
    const structuralM2 = meters * 0.85;
    const totalEst = structuralM2 * baseM2;
    const minEst = Math.round(totalEst * 0.88);
    const maxEst = Math.round(totalEst * 1.14);

    return {
      minEst,
      maxEst,
      confidence: meters > 500 && fireRating !== 'R120' ? 'Media-Alta (BEDEC 2026)' : 'Media',
      unitMin: (minEst / structuralM2).toFixed(1),
      unitMax: (maxEst / structuralM2).toFixed(1)
    };
  };

  const result = calculatePreview();

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-2.5 py-1 rounded-md">
            Transparencia Metodológica
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-2">
            Así calcula CuántoVale.es
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Los parámetros técnicos ajustan en tiempo real el consumo de material, el factor de forma y la horquilla de coste.
          </p>
        </div>
      </div>

      {/* Interactive Simulator Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-center">
        {/* Left: Interactive Input Controls */}
        <div className="lg:col-span-6 space-y-4">
          {/* Surface */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-800 mb-1.5">
              <span>Superficie de nave:</span>
              <span className="font-mono text-blue-600 font-bold">{meters.toLocaleString()} m²</span>
            </div>
            <input
              type="range"
              min="200"
              max="5000"
              step="100"
              value={meters}
              onChange={(e) => setMeters(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>200 m² (pequeña)</span>
              <span>2.500 m²</span>
              <span>5.000 m² (logística)</span>
            </div>
          </div>

          {/* System selection */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => setSystem('mortero')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                system === 'mortero'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-bold">Mortero proyectado</div>
              <div className="text-[10px] text-slate-500">Económico / funcional</div>
            </button>
            <button
              onClick={() => setSystem('pintura')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                system === 'pintura'
                  ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-semibold'
                  : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:bg-white'
              }`}
            >
              <div className="text-[11px] font-bold">Pintura intumescente</div>
              <div className="text-[10px] text-slate-500">Estética / perfiles vistos</div>
            </button>
          </div>

          {/* Fire rating selection */}
          <div>
            <span className="text-xs text-slate-600 font-medium block mb-1.5">Resistencia al fuego requerida (R):</span>
            <div className="grid grid-cols-4 gap-1.5">
              {(['R30', 'R60', 'R90', 'R120'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setFireRating(r)}
                  className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all ${
                    fireRating === r
                      ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Real-time dynamic calculation preview card */}
        <div className="lg:col-span-6 bg-slate-900 text-white rounded-xl p-6 shadow-md relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Resultado Orientativo Estimado
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                {result.confidence}
              </span>
            </div>

            <div className="py-4">
              <span className="text-[11px] text-slate-400 block mb-1">Rango estimado de mercado (sin IVA):</span>
              <div className="font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {result.minEst.toLocaleString()} € – {result.maxEst.toLocaleString()} €
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Equivalente a <strong className="text-slate-200">{result.unitMin} – {result.unitMax} €/m²</strong> de acero desarrollado.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">Sin compromiso comercial</span>
            {onOpenFullCalculator && (
              <button
                onClick={onOpenFullCalculator}
                className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Calculadora completa</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Preview del Índice CuántoVale Provincial
export const CuantoValeIndexPreview: React.FC = () => {
  const provinces = [
    { name: 'Madrid', status: 'En recopilación de muestra', nQuotes: 0, median: 'N/A', range: '14 – 42 €/m²' },
    { name: 'Barcelona', status: 'En recopilación de muestra', nQuotes: 0, median: 'N/A', range: '15 – 45 €/m²' },
    { name: 'Valencia', status: 'En recopilación de muestra', nQuotes: 0, median: 'N/A', range: '13 – 39 €/m²' },
    { name: 'Sevilla', status: 'En recopilación de muestra', nQuotes: 0, median: 'N/A', range: '13 – 38 €/m²' },
    { name: 'Baleares', status: 'En recopilación de muestra (Factor insular)', nQuotes: 0, median: 'N/A', range: '18 – 52 €/m²' }
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-slate-700 uppercase bg-slate-200 px-2.5 py-1 rounded-md">
              Índice CuántoVale · Datos Provinciales
            </span>
            <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Fase 2026: Muestra en curso
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2">
            Observatorio de Precios Reales de Protección Pasiva en España
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            CuántoVale no publica estadísticas cerradas inventadas. El índice mostrará medianas empíricas 
            conforme los instaladores verificados completen obras y reporten precios contratados reales.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-6">
        {provinces.map((p) => (
          <div key={p.name} className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-slate-900">{p.name}</span>
                <span className="text-[10px] font-mono text-slate-400">N=0</span>
              </div>
              <span className="text-[10px] text-amber-700 font-medium block mt-1 leading-snug">{p.status}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1">
              <div className="flex justify-between text-slate-500">
                <span>Rango baremo:</span>
                <span className="font-mono text-slate-800 font-semibold">{p.range}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Mediana cerrada:</span>
                <span className="font-mono text-slate-400">N/A</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
