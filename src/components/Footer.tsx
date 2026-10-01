import React from 'react';

interface FooterProps {
  navigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ navigate }) => {
  const handleNav = (path: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 text-xs">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-100">
          {/* Brand & Mission */}
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-baseline tracking-tight">
              <span className="font-extrabold text-base text-slate-950">Cuánto</span>
              <span className="font-bold text-base text-blue-600">Vale</span>
              <span className="text-xs text-slate-400 ml-0.5">.es</span>
            </div>
            <p className="text-slate-500 leading-relaxed text-xs">
              Estimación de precios orientativos y comparación de presupuestos antes de contratar.
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Vertical activo: Protección contra Incendios (PCI Industrial).
            </p>
          </div>

          {/* Core Links: Precios PCI */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Precios PCI
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Ignifugar nave industrial
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/precio-ignifugacion-m2/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Precio ignifugación por m²
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/pintura-intumescente-precio-m2/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Pintura intumescente
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/mortero-ignifugo-precio-m2/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Mortero ignífugo
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/mantenimiento-pci-precio/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Mantenimiento PCI
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/proteccion-incendios/')}
                  className="hover:text-slate-950 transition-colors text-left font-medium text-blue-600"
                >
                  Ver todas las categorías PCI
                </button>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Plataforma
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => handleNav('/metodologia/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Metodología de cálculo
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/guias/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Guías técnicas PCI
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/sobre-cuantovale/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Independencia
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/profesionales/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Para empresas instaladoras
                </button>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-2">
            <p className="font-semibold text-slate-900 text-xs uppercase tracking-wider">
              Legal
            </p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>
                <button
                  onClick={() => handleNav('/aviso-legal/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Aviso Legal
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/privacidad/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Privacidad y RGPD
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/cookies/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Cookies
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('/terminos/')}
                  className="hover:text-slate-950 transition-colors text-left"
                >
                  Términos del Servicio
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© {new Date().getFullYear()} CuántoVale.es · Cálculos orientativos sin compromiso contractual.</p>
          <p>Independiente: Máximo 2 empresas por solicitud. Sin comisiones sobre el presupuesto final.</p>
        </div>
      </div>
    </footer>
  );
};
