import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { MethodologyBadge } from '../components/MethodologyBadge';

interface MetodologiaPageProps {
  navigate: (path: string) => void;
}

export const MetodologiaPage: React.FC<MetodologiaPageProps> = ({ navigate }) => {
  const breadcrumbs = [
    { name: 'Metodología de precios', url: '/metodologia/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Metodología de Cálculo de Precios | CuántoVale"
        description="Conoce el protocolo técnico de CuántoVale: fuentes oficiales contrastadas, eliminación de falsa precisión y calibración continua con presupuestos reales."
        path="/metodologia/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Protocolo Técnico
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Metodología de precios en CuántoVale
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            Explicamos con transparencia cómo estimamos los rangos de coste, de dónde proceden las fuentes y qué significa cada nivel de confianza.
          </p>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-3xl space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              1. Fuentes de datos y bases de referencia
            </h2>
            <p>
              Las estimaciones se construyen cruzando referencias oficiales del sector de la construcción con factores de aplicación industrial en España:
            </p>
            <ul className="list-disc pl-4 space-y-2 text-slate-600">
              <li>
                <strong>Bases de datos de precios de construcción:</strong> BEDEC / Institut de Tecnologia de la Construcció de Catalunya (ITeC) y Generador de Precios CYPE.
              </li>
              <li>
                <strong>Tarifas medias de mano de obra y maquinaria:</strong> Baremos de aplicadores especializados de protección pasiva y alquiler de maquinaria de elevación PEMP.
              </li>
              <li>
                <strong>Reglamentación de referencia:</strong> Reglamento de Seguridad contra Incendios en Establecimientos Industriales (RSCIEI vigente: Real Decreto 164/2025, de 4 de marzo; que deroga al antiguo RD 2267/2004).
              </li>
              <li>
                <strong>Factores territoriales:</strong> Correcciones por costes logísticos y concentración industrial por provincia y ciudades autónomas.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              2. Política estricta contra la falsa precisión
            </h2>
            <p>
              Rechazamos mostrar cifras como <em>18.742,34 €</em> cuando las variables geométricas de partida no justifican tal nivel de detalle decimal. Los costes industriales dependen del estado del soporte, la masividad del acero y la altura de trabajo.
            </p>
            <p>
              Mostramos horquillas realistas redondeadas a centenas o millares (ej. <em>12.000 € — 18.500 €</em>) para reflejar con rigor el orden de magnitud del mercado.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              3. Niveles de confianza
            </h2>
            <div className="space-y-3 border-t border-slate-200 pt-4">
              <div>
                <span className="font-bold text-slate-900">Confianza ALTA:</span>
                <p className="text-slate-600 text-xs mt-0.5">
                  Se conoce la superficie real desarrollada de estructura, la resistencia R requerida y el sistema. Horquilla de variación acotada (&lt; 25%).
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-900">Confianza MEDIA:</span>
                <p className="text-slate-600 text-xs mt-0.5">
                  El cálculo estima los m² de acero según el ratio geométrico estándar de la nave (0,42 m² de acero por m² de suelo).
                </p>
              </div>
              <div>
                <span className="font-bold text-slate-900">Confianza BAJA:</span>
                <p className="text-slate-600 text-xs mt-0.5">
                  Faltan variables críticas como la resistencia al fuego exigida por normativa o el sistema de protección previsto.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 bg-slate-50">
        <div className="mx-auto max-w-3xl">
          <MethodologyBadge />
        </div>
      </section>
    </div>
  );
};
