import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { Breadcrumbs } from '../components/Breadcrumbs';

interface LegalPageProps {
  type: 'aviso-legal' | 'privacidad' | 'cookies' | 'terminos';
  navigate: (path: string) => void;
}

export const LegalPages: React.FC<LegalPageProps> = ({ type, navigate }) => {
  const titles = {
    'aviso-legal': 'Aviso Legal',
    'privacidad': 'Política de Privacidad y Protección de Datos',
    'cookies': 'Política de Cookies',
    'terminos': 'Términos y Condiciones del Servicio'
  };

  const path = `/${type}/`;
  const breadcrumbs = [
    { name: titles[type], url: path }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SEOMetaHead
        title={`${titles[type]} | CuántoVale.es`}
        description={`Información legal, condiciones de servicio y tratamiento de datos para la plataforma CuántoVale.es.`}
        path={path}
        breadcrumbs={breadcrumbs}
      />

      <Breadcrumbs items={breadcrumbs} navigate={navigate} />

      <section className="bg-white border-b border-slate-200/80 pt-8 pb-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Marco Legal y Cumplimiento
          </span>
          <h1 className="text-3xl font-extrabold text-slate-950">
            {titles[type]}
          </h1>
          <p className="text-xs text-slate-500">Última actualización: 1 de febrero de 2026</p>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-xs sm:text-sm text-slate-700 space-y-6 leading-relaxed">
          {type === 'aviso-legal' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Datos Identificativos</h2>
              <p>
                En cumplimiento con el artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se informa de que CuántoVale.es es un proyecto digital dedicado a la provisión de información de costes, herramientas de cálculo orientativo e intermediación cualificada de solicitudes de presupuesto.
              </p>
              <h2 className="text-base font-bold text-slate-900">2. Naturaleza de las Estimaciones</h2>
              <p>
                Los cálculos proporcionados por las calculadoras del sitio web tienen carácter estrictamente orientativo y prediagnóstico. No constituyen oferta contractual vinculante ni sustituyen el proyecto o memoria técnica visada por técnico legalmente competente ni la inspección presencial de la instalación.
              </p>
            </>
          )}

          {type === 'privacidad' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Responsable del Tratamiento</h2>
              <p>
                CuántoVale trata los datos recabados con la finalidad exclusiva de calcular las estimaciones solicitadas y, previo consentimiento explícito, tramitar su petición de presupuesto.
              </p>
              <h2 className="text-base font-bold text-slate-900">2. Cesión Estricta a un Máximo de Dos Proveedores</h2>
              <p>
                Al marcar la casilla de consentimiento en el formulario de solicitud de presupuesto, el usuario consiente de forma informada e inequívoca que sus datos de contacto (nombre, teléfono, email, provincia y características de la nave) sean comunicados a un <strong>máximo de dos (2) empresas instaladoras o ingenierías homologadas</strong> en su demarcación geográfica para la formulación de una propuesta económica adaptada.
              </p>
              <p>
                CuántoVale no vende, no comercializa ni cede bases de datos a empresas de telemarketing masivo ni a redes de publicidad de terceros.
              </p>
              <h2 className="text-base font-bold text-slate-900">3. Derechos RGPD</h2>
              <p>
                El usuario puede ejercer en cualquier momento sus derechos de acceso, rectificación, supresión, limitación y oposición dirigiendo una comunicación a través de los canales de soporte indicados en la plataforma.
              </p>
            </>
          )}

          {type === 'cookies' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Uso de Cookies</h2>
              <p>
                CuántoVale.es utiliza cookies técnicas estrictamente necesarias para el funcionamiento de las calculadoras, el mantenimiento de estado en el navegador y la prevención de spam en formularios.
              </p>
              <p>
                No recopilamos información personal sensible ni compartimos huellas digitales con redes publicitarias externas.
              </p>
            </>
          )}

          {type === 'terminos' && (
            <>
              <h2 className="text-base font-bold text-slate-900">1. Condiciones de Uso de la Plataforma</h2>
              <p>
                El acceso y utilización de las calculadoras y guías de precios de CuántoVale es gratuito para los usuarios finales. El usuario se compromete a facilitar información veraz y ajustada a la realidad de sus instalaciones.
              </p>
              <h2 className="text-base font-bold text-slate-900">2. Exención de Responsabilidad en la Ejecución</h2>
              <p>
                CuántoVale actúa como plataforma independiente de inteligencia de precios y canalizador de solicitudes. La relación contractual posterior para la ejecución de obras, certificaciones o suministros se establece de forma directa y exclusiva entre el usuario y la empresa instaladora seleccionada.
              </p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};
