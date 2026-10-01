import React from 'react';

interface MethodologyBadgeProps {
  lastUpdated?: string;
  sourceText?: string;
  hasOwnData?: boolean;
  sampleCount?: number;
  className?: string;
}

export const MethodologyBadge: React.FC<MethodologyBadgeProps> = ({
  lastUpdated = 'Febrero 2026',
  sourceText = 'Bases públicas oficiales de construcción (BEDEC / ITeC 2026, Generador de Precios CYPE) contrastadas con tarifas de aplicadores homologados en España.',
  hasOwnData = false,
  sampleCount = 0,
  className = ''
}) => {
  return (
    <div className={`border-l-2 border-slate-300 pl-4 py-2 text-xs text-slate-600 space-y-1.5 ${className}`}>
      <div className="flex items-center gap-2 text-slate-900 font-semibold text-xs">
        <span>Metodología de precios CuántoVale</span>
        <span className="text-slate-400 font-normal">·</span>
        <span className="text-slate-500 font-normal">Actualizado: {lastUpdated}</span>
      </div>

      <p className="leading-relaxed text-[11px] text-slate-500">
        {sourceText} Los cálculos son orientativos y no aplican decimales ficticios.
        {hasOwnData && sampleCount > 20
          ? ` Calibrado con ${sampleCount} presupuestos reales recibidos en la plataforma.`
          : ' Datos propios todavía en fase de muestreo inicial; estimación basada en variables geométricas y referencias públicas.'}
      </p>
    </div>
  );
};
