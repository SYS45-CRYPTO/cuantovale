import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

// Pages
import { Home } from './pages/Home';
import { HubPCI } from './pages/HubPCI';
import { LandingIgnifugarNave } from './pages/LandingIgnifugarNave';
import { LandingPrecioM2 } from './pages/LandingPrecioM2';
import { LandingPinturaIntumescente } from './pages/LandingPinturaIntumescente';
import { LandingMorteroIgnifugo } from './pages/LandingMorteroIgnifugo';
import { LandingMantenimientoPCI } from './pages/LandingMantenimientoPCI';
import { LandingInstalacionPCI } from './pages/LandingInstalacionPCI';
import { LandingProyectoPCI } from './pages/LandingProyectoPCI';
import { LandingLegalizacionPCI } from './pages/LandingLegalizacionPCI';
import { LandingInspeccionOCA } from './pages/LandingInspeccionOCA';
import { MetodologiaPage } from './pages/MetodologiaPage';
import { SobreCuantoValePage } from './pages/SobreCuantoValePage';
import { ProfesionalesPage } from './pages/ProfesionalesPage';
import { LegalPages } from './pages/LegalPages';
import { GuidesIndexPage } from './pages/GuidesIndexPage';
import { GuideArticlePage } from './pages/GuideArticlePage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (toPath: string) => {
    // Normalize path with trailing slash if applicable
    let normalized = toPath;
    if (normalized !== '/' && !normalized.includes('.') && !normalized.endsWith('/')) {
      // allow /admin without trailing slash or normalize
      if (normalized !== '/admin' && !normalized.startsWith('/api')) {
        normalized = `${normalized}/`;
      }
    }

    if (normalized !== window.location.pathname) {
      window.history.pushState({}, '', normalized);
      setCurrentPath(normalized);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Route matching
  const renderCurrentRoute = () => {
    // Trim trailing slash for consistent matching
    const cleanPath = currentPath.endsWith('/') && currentPath.length > 1
      ? currentPath.slice(0, -1)
      : currentPath;

    switch (cleanPath) {
      case '':
      case '/':
        return <Home navigate={navigate} />;

      // HUB PCI
      case '/proteccion-incendios':
        return <HubPCI navigate={navigate} />;

      // 9 LANDINGS CLUSTER
      case '/proteccion-incendios/ignifugar-nave-industrial-precio':
        return <LandingIgnifugarNave navigate={navigate} />;
      case '/proteccion-incendios/precio-ignifugacion-m2':
        return <LandingPrecioM2 navigate={navigate} />;
      case '/proteccion-incendios/pintura-intumescente-precio-m2':
        return <LandingPinturaIntumescente navigate={navigate} />;
      case '/proteccion-incendios/mortero-ignifugo-precio-m2':
        return <LandingMorteroIgnifugo navigate={navigate} />;
      case '/proteccion-incendios/mantenimiento-pci-precio':
        return <LandingMantenimientoPCI navigate={navigate} />;
      case '/proteccion-incendios/instalacion-pci-precio':
        return <LandingInstalacionPCI navigate={navigate} />;
      case '/proteccion-incendios/proyecto-contra-incendios-precio':
        return <LandingProyectoPCI navigate={navigate} />;
      case '/proteccion-incendios/legalizacion-pci-precio':
        return <LandingLegalizacionPCI navigate={navigate} />;
      case '/proteccion-incendios/inspeccion-oca-pci-precio':
        return <LandingInspeccionOCA navigate={navigate} />;

      // PLATFORM PAGES
      case '/metodologia':
        return <MetodologiaPage navigate={navigate} />;
      case '/sobre-cuantovale':
        return <SobreCuantoValePage navigate={navigate} />;
      case '/profesionales':
        return <ProfesionalesPage navigate={navigate} />;

      // LEGAL
      case '/aviso-legal':
        return <LegalPages type="aviso-legal" navigate={navigate} />;
      case '/privacidad':
        return <LegalPages type="privacidad" navigate={navigate} />;
      case '/cookies':
        return <LegalPages type="cookies" navigate={navigate} />;
      case '/terminos':
        return <LegalPages type="terminos" navigate={navigate} />;

      // GUIAS EDITORIAL
      case '/guias':
        return <GuidesIndexPage navigate={navigate} />;
      case '/guias/ignifugacion-naves-industriales':
        return <GuideArticlePage slug="ignifugacion-naves-industriales" navigate={navigate} />;
      case '/guias/pintura-intumescente':
        return <GuideArticlePage slug="pintura-intumescente" navigate={navigate} />;
      case '/guias/mortero-ignifugo':
        return <GuideArticlePage slug="mortero-ignifugo" navigate={navigate} />;
      case '/guias/rsciei-2025':
        return <GuideArticlePage slug="rsciei-2025" navigate={navigate} />;
      case '/guias/mantenimiento-pci':
        return <GuideArticlePage slug="mantenimiento-pci" navigate={navigate} />;

      // ADMIN
      case '/admin':
        return <AdminPage navigate={navigate} />;

      default:
        return <NotFoundPage navigate={navigate} />;
    }
  };

  const isAdminView = currentPath === '/admin' || currentPath === '/admin/';

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {!isAdminView && <Header currentPath={currentPath} navigate={navigate} />}
      <main className="flex-1">{renderCurrentRoute()}</main>
      {!isAdminView && <Footer navigate={navigate} />}
    </div>
  );
}

export default App;
