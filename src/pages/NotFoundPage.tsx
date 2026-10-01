import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { ArrowLeft, Home, ShieldCheck } from 'lucide-react';

interface NotFoundPageProps {
  navigate: (path: string) => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <SEOMetaHead
        title="Página no encontrada (404) | CuántoVale"
        description="La página que buscas no existe o ha sido movida en CuántoVale.es."
        path="/404"
        noindex={true}
      />

      <div className="max-w-md w-full text-center space-y-5 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <span className="font-mono text-4xl font-extrabold text-blue-600 block">404</span>
        <h1 className="text-xl font-bold text-slate-900">Página no encontrada</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          La dirección introducida no coincide con ninguna calculadora o guía de precios publicada en el directorio oficial.
        </p>

        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700"
          >
            <Home className="h-4 w-4" />
            <span>Volver a la página principal</span>
          </button>
          <button
            onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ShieldCheck className="h-4 w-4 text-blue-600" />
            <span>Calculadora de ignifugación de nave</span>
          </button>
        </div>
      </div>
    </div>
  );
};
