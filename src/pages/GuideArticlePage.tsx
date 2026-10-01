import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { GUIDES_DATA } from './GuidesIndexPage';
import { ASSETS } from '../assets';
import { StructureVsMassivityDiagram, FireRatingScaleDiagram } from '../components/TechnicalDiagrams';
import { ArrowLeft, ArrowRight, BookOpen, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Calculator } from 'lucide-react';

interface GuideArticlePageProps {
  slug: string;
  navigate: (path: string) => void;
}

export const GuideArticlePage: React.FC<GuideArticlePageProps> = ({ slug, navigate }) => {
  const guide = GUIDES_DATA.find((g) => g.slug === slug) || GUIDES_DATA[0];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      <SEOMetaHead
        title={`${guide.title} | CuántoVale`}
        description={guide.description}
        path={guide.path}
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Guías', url: '/guias/' },
          { name: guide.title, url: guide.path }
        ]}
      />

      {/* Top Breadcrumb & Return */}
      <div className="pt-6 px-4 sm:px-6 max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/guias/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Volver a todas las guías</span>
        </button>
      </div>

      {/* Article Header */}
      <header className="pt-6 pb-8 px-4 sm:px-6 max-w-4xl mx-auto space-y-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
            {guide.category}
          </span>
          <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {guide.readTime} de lectura
          </span>
          <span className="text-[11px] font-mono text-slate-400">· Actualizado 2026</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-tight">
          {guide.title}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          {guide.description}
        </p>

        {/* Featured Image */}
        <div className="relative rounded-2xl overflow-hidden h-64 sm:h-80 w-full bg-slate-100 mt-6 border border-slate-200">
          <img
            src={guide.image}
            alt={guide.title}
            width="800"
            height="400"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent" />
        </div>
      </header>

      {/* Main Content Sections */}
      <main className="px-4 sm:px-6 max-w-4xl mx-auto space-y-10 text-sm leading-relaxed text-slate-700">
        {/* Guide Specific Body */}
        {slug === 'ignifugacion-naves-industriales' && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">1. ¿Qué es la ignifugación y por qué es obligatoria?</h2>
              <p>
                La ignifugación es el conjunto de técnicas de protección pasiva orientadas a mejorar la reacción y resistencia al fuego de los elementos estructurales y divisorios de un edificio. En el ámbito industrial español, su obligatoriedad viene recogida en el <strong>Reglamento de Seguridad contra Incendios en los Establecimientos Industriales (RSCIEI vigente: Real Decreto 164/2025, de 4 de marzo; en sustitución del antiguo RD 2267/2004 derogada)</strong> y el <strong>Código Técnico de la Edificación (CTE DB-SI)</strong>.
              </p>
              <p>
                El objetivo primario no es extinguir las llamas, sino garantizar que la estructura portante mantenga su capacidad de carga el tiempo suficiente para permitir la evacuación segura del personal y la intervención de los servicios de bomberos sin riesgo de colapso repentino.
              </p>
            </section>

            <StructureVsMassivityDiagram />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">2. Criterios de Selección: Mortero Proyectado vs. Pintura Intumescente</h2>
              <p>
                La elección del material depende fundamentalmente de tres factores: la exigencia de resistencia al fuego (R), el uso del espacio (zonas vistas o no vistas) y el presupuesto disponible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Mortero Proyectado (Lana de Roca / Perlita)</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Opción más económica y rápida. Recomendado para naves de almacenamiento, falsos techos y zonas donde el acabado rugoso industrial no perjudique la operativa.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Pintura Intumescente</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Acabado liso de alta calidad. Mantiene la silueta de los perfiles metálicos vistos. Ideal para locales comerciales, oficinas técnicas y estructuras arquitectónicas vistas hasta R90.
                  </p>
                </div>
              </div>
            </section>

            <FireRatingScaleDiagram />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">3. Documentación Obligatoria tras la Aplicación</h2>
              <p>
                Al finalizar los trabajos, la empresa instaladora debe entregar un expediente técnico indispensable para superar la inspección de la Entidad de Control Ambiental (OCA) y obtener la licencia de actividad municipal:
              </p>
              <ul className="space-y-2 list-disc list-inside text-xs text-slate-600">
                <li><strong>Certificado de Instalación:</strong> Firmado por instalador autorizado debidamente registrado en el Registro de Empresas de Protección Pasiva del Ministerio de Industria.</li>
                <li><strong>Dossier de Ensayos y Marcado CE / DITE:</strong> Justificación de los ensayos del producto según normativa UNE-EN 13381.</li>
                <li><strong>Medición de Espesores (DFT):</strong> Informe de lecturas de micrómetro magnético tomadas en obra según protocolo estándar.</li>
              </ul>
            </section>
          </>
        )}

        {slug === 'pintura-intumescente' && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">1. Principio de Funcionamiento de la Pintura Intumescente</h2>
              <p>
                Las pinturas intumescentes son recubrimientos especiales de base disolvente o base acuosa que reaccionan químicamente cuando la temperatura del ambiente supera aproximadamente los <strong>200 °C</strong>. Ante el calor extremo, la película de pintura se expande y genera una espuma carbonosa microporosa (aislante térmico) cuyo volumen es de 50 a 100 veces superior al espesor original del recubrimiento.
              </p>
            </section>

            <FireRatingScaleDiagram />

            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">2. Determinación del Espesor de Película Seca (DFT)</h2>
              <p>
                El espesor no es uniforme: se calcula para cada perfil metálico individual de la obra en función de su factor de masividad (Sm/V). Cuanto más ligero y fino sea el perfil de acero, mayor cantidad de micras de pintura se deberán aplicar para alcanzar la misma resistencia al fuego (R30, R60 o R90).
              </p>
              <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 text-xs text-blue-950 space-y-1">
                <span className="font-bold">Intervalos ilustrativos de ejemplo:</span>
                <p>• R30: 250 a 450 micras aproximadamente</p>
                <p>• R60: 550 a 950 micras aproximadamente</p>
                <p>• R90: 1.100 a 1.600 micras aproximadamente</p>
                <em className="block text-[11px] text-blue-800 pt-1">
                  * El consumo real debe obtenerse de la tabla de ensayo del fabricante específico para cada masividad de perfil.
                </em>
              </div>
            </section>
          </>
        )}

        {slug === 'mortero-ignifugo' && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">1. Tipos de Mortero Ignífugo: Composición y Usos</h2>
              <p>
                Existen principalmente dos formulaciones de morteros proyectados para protección estructural pasiva:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Morteros de Lana de Roca</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Compuestos por fibras minerales de lana de roca aglutinadas con ligantes hidráulicos inorgánicos. Destacan por su ligereza y gran coeficiente de absorción acústica y aislamiento térmico.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-white">
                  <h3 className="font-bold text-slate-900 text-sm mb-1">Morteros de Perlita y Vermiculita</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Base yeso o cemento con áridos ligeros de perlita expandida. Ofrecen mayor dureza superficial y resistencia mecánica que las fibras puras.
                  </p>
                </div>
              </div>
            </section>

            <StructureVsMassivityDiagram />
          </>
        )}

        {slug === 'rsciei-2025' && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">1. Tipología de Establecimientos Industriales</h2>
              <p>
                El RSCIEI clasifica las industrias según su relación espacial con los edificios colindantes:
              </p>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><strong>Tipo A:</strong> Ocupa parcialmente un edificio que tiene otros usos o colinda con otros establecimientos en horizontal o vertical. Máxima exigencia de sectorización.</li>
                <li><strong>Tipo B:</strong> Ocupa totalmente un edificio adosado a otros o a una distancia menor a 3 metros. Estabilidad R estructural moderada-alta.</li>
                <li><strong>Tipo C:</strong> Edificio totalmente exento y aislado a una distancia superior a 3 metros de cualquier otra edificación.</li>
              </ul>
            </section>

            <FireRatingScaleDiagram />
          </>
        )}

        {slug === 'mantenimiento-pci' && (
          <>
            <section className="space-y-4">
              <h2 className="text-xl font-bold text-slate-950">1. Exigencias del RIPCI (RD 513/2017)</h2>
              <p>
                El Reglamento de Instalaciones de Protección contra Incendios obliga a todos los titulares de actividades comerciales e industriales a suscribir un contrato de mantenimiento con una empresa mantenedora habilitada ante la Dirección General de Industria.
              </p>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-2">
                <span className="font-bold text-slate-900">Periodicidades de revisión obligatoria:</span>
                <p>• <strong>Trimestral:</strong> Comprobación visual, accesibilidad y presión de extintores y BIEs.</p>
                <p>• <strong>Semestral:</strong> Verificación de fuentes de alimentación de centrales de detección.</p>
                <p>• <strong>Anual:</strong> Ensayos completos de bombas, grupos de presión y pesaje de agentes extintores.</p>
                <p>• <strong>Quinquenal (5 años):</strong> Retimbrado hidrostático de extintores y mangueras BIE (máx. 20 años de vida útil).</p>
              </div>
            </section>
          </>
        )}

        {/* CTA Cross-link to Calculator */}
        <section className="pt-8 border-t border-slate-200">
          <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md">
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-blue-400 font-bold uppercase tracking-wider">Herramienta Gratuita</span>
              <h3 className="text-lg font-bold text-white">¿Necesitas calcular el coste para tu nave industrial?</h3>
              <p className="text-xs text-slate-300 max-w-xl">
                Nuestra calculadora técnica evalúa la superficie, el tipo de perfil y la resistencia R para darte un rango orientativo antes de pedir ofertas.
              </p>
            </div>
            <button
              onClick={() => navigate('/proteccion-incendios/ignifugar-nave-industrial-precio/')}
              className="py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0 inline-flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              <Calculator className="h-4 w-4" />
              <span>Calcular precio ahora</span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};
