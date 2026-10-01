import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface SobreCuantoValePageProps {
  navigate: (path: string) => void;
}

export const SobreCuantoValePage: React.FC<SobreCuantoValePageProps> = ({ navigate }) => {
  const breadcrumbs = [
    { name: 'Sobre CuántoVale', url: '/sobre-cuantovale/' }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <SEOMetaHead
        title="Sobre CuántoVale: Misión e Independencia Técnica | CuántoVale"
        description="Conoce la misión de CuántoVale: aportar transparencia a servicios complejos antes de contratar. Ni empresa instaladora, ni directorio masivo de spam."
        path="/sobre-cuantovale/"
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="pt-8 pb-12 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Nuestra Misión
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
            Hacer los precios de servicios complejos comprensibles antes de contratar
          </h1>
          <p className="text-base text-slate-600 leading-relaxed max-w-2xl">
            CuántoVale nació para responder una pregunta que todo propietario o responsable de operaciones se hace antes de pedir presupuestos: <em>"¿Cuánto debería costar esto realmente?"</em>
          </p>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 border-b border-slate-200">
        <div className="mx-auto max-w-3xl space-y-10 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              ¿Por qué no somos una empresa instaladora?
            </h2>
            <p>
              Una empresa instaladora tiene como incentivo defender su propio sistema y su propio margen. En CuántoVale <strong>no ejecutamos obras, no vendemos materiales ni comisionamos sobre la factura final</strong>. Nuestro único compromiso es la precisión objetiva de las referencias de mercado.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              ¿Por qué no somos un marketplace masivo?
            </h2>
            <p>
              Los directorios de reformas tradicionales venden el contacto del usuario a 5, 8 o 10 profesionales a la vez. El resultado es saturación telefónica y ofertas disparatadas sin base técnica.
            </p>
            <p>
              En CuántoVale limitamos el enrutamiento a un <strong>máximo de 2 empresas homologadas</strong> por solicitud, con las variables de ingeniería ya calculadas para que la comparación sea directa y fundamentada.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950">
              Estrategia inicial: Protección contra Incendios
            </h2>
            <p>
              Hemos comenzado por la <strong>protección contra incendios e ignifugación de naves</strong> porque es uno de los sectores con mayor opacidad y mayor exigencia normativa en España. A medida que calibremos el motor de precios, ampliaremos ordenadamente a nuevos verticales industriales y de edificación.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 px-4 sm:px-6 bg-slate-50 text-center">
        <div className="mx-auto max-w-xl space-y-4">
          <h2 className="text-xl font-bold text-slate-950">Calcula el precio de tu nave industrial</h2>
          <p className="text-xs text-slate-600">
            Prueba la calculadora en 3 pasos y conoce el coste estimado antes de contratar.
          </p>
          <button
            onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
            className="rounded-md bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-semibold text-white transition-colors"
          >
            Ir a la Calculadora PCI
          </button>
        </div>
      </section>
    </div>
  );
};
