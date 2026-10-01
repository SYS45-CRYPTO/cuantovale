import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';

interface HeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentPath, navigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-3 sm:top-4 z-40 w-full px-3 sm:px-6 pointer-events-none">
      <div
        className={`mx-auto max-w-5xl rounded-2xl pointer-events-auto transition-all duration-200 ${
          isScrolled
            ? 'bg-white/92 backdrop-blur-xl border border-slate-200/80 shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)]'
            : 'bg-white/82 backdrop-blur-md border border-slate-200/60 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]'
        }`}
      >
        <div className="flex h-14 sm:h-15 items-center justify-between px-4 sm:px-6">
          {/* Brand Wordmark (Crisp, modern fintech touch) */}
          <button
            onClick={() => handleNav('/')}
            className="group flex items-center gap-2.5 text-left focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 text-white font-mono font-bold text-xs tracking-tight shadow-xs group-hover:bg-blue-600 transition-colors">
              CV
            </div>
            <div className="flex items-baseline tracking-tight">
              <span className="font-extrabold text-base sm:text-lg text-slate-950">Cuánto</span>
              <span className="font-bold text-base sm:text-lg text-blue-600">Vale</span>
              <span className="text-[11px] font-semibold text-slate-400 ml-0.5">.es</span>
            </div>
          </button>

          {/* Clean Desktop Navigation (Text with subtle micro-hover) */}
          <nav className="hidden md:flex items-center gap-6 text-[13px]">
            <button
              onClick={() => handleNav('/proteccion-incendios/')}
              className={`transition-colors py-1 ${
                currentPath.startsWith('/proteccion-incendios')
                  ? 'font-semibold text-slate-950'
                  : 'font-medium text-slate-600 hover:text-slate-950'
              }`}
            >
              Precios PCI
            </button>

            <button
              onClick={() => handleNav('/metodologia/')}
              className={`transition-colors py-1 ${
                currentPath === '/metodologia/'
                  ? 'font-semibold text-slate-950'
                  : 'font-medium text-slate-600 hover:text-slate-950'
              }`}
            >
              Metodología
            </button>

            <button
              onClick={() => handleNav('/guias/')}
              className={`transition-colors py-1 ${
                currentPath.startsWith('/guias')
                  ? 'font-semibold text-slate-950'
                  : 'font-medium text-slate-600 hover:text-slate-950'
              }`}
            >
              Guías
            </button>

            <button
              onClick={() => handleNav('/sobre-cuantovale/')}
              className={`transition-colors py-1 ${
                currentPath === '/sobre-cuantovale/'
                  ? 'font-semibold text-slate-950'
                  : 'font-medium text-slate-600 hover:text-slate-950'
              }`}
            >
              Independencia
            </button>

            <button
              onClick={() => handleNav('/profesionales/')}
              className={`transition-colors py-1 ${
                currentPath === '/profesionales/'
                  ? 'font-semibold text-slate-950'
                  : 'font-medium text-slate-600 hover:text-slate-950'
              }`}
            >
              Empresas
            </button>
          </nav>

          {/* Primary Action Button (Tactile Liquid Glass feel) */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={() => handleNav('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
              className="glass-button-primary rounded-xl px-4 py-2 text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <span>Calcular precio</span>
              <ArrowUpRight className="h-3.5 w-3.5 opacity-80" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              onClick={() => handleNav('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
              className="glass-button-primary rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white"
            >
              Calcular
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-slate-700 hover:text-slate-950 focus:outline-none"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer (Smooth glass sheet drop) */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200/70 bg-white/95 backdrop-blur-xl px-5 py-4 space-y-2.5 text-xs rounded-b-2xl">
            <button
              onClick={() => handleNav('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
              className="block w-full text-left py-2 font-semibold text-blue-600"
            >
              Calculadora: Ignifugar nave industrial
            </button>
            <button
              onClick={() => handleNav('/proteccion-incendios/')}
              className="block w-full text-left py-2 font-medium text-slate-800 hover:text-slate-950"
            >
              Precios Protección Incendios
            </button>
            <button
              onClick={() => handleNav('/metodologia/')}
              className="block w-full text-left py-2 font-medium text-slate-800 hover:text-slate-950"
            >
              Metodología de cálculo
            </button>
            <button
              onClick={() => handleNav('/guias/')}
              className="block w-full text-left py-2 font-medium text-slate-800 hover:text-slate-950"
            >
              Guías Técnicas
            </button>
            <button
              onClick={() => handleNav('/sobre-cuantovale/')}
              className="block w-full text-left py-2 font-medium text-slate-800 hover:text-slate-950"
            >
              Sobre CuántoVale (Independencia)
            </button>
            <button
              onClick={() => handleNav('/profesionales/')}
              className="block w-full text-left py-2 font-medium text-slate-800 hover:text-slate-950"
            >
              Para empresas instaladoras
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
