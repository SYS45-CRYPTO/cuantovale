import React from 'react';
import { SEOMetaHead } from '../components/SEOMetaHead';
import { ASSETS } from '../assets';
import { BookOpen, ArrowRight, Clock, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';

interface GuidesIndexPageProps {
  navigate: (path: string) => void;
}

export const GUIDES_DATA = [
  {
    slug: 'ignifugacion-naves-industriales',
    path: '/guias/ignifugacion-naves-industriales/',
    title: 'Guía Completa de Ignifugación de Naves Industriales (2026)',
    description: 'Todo lo que necesitas saber antes de ignifugar una nave: normativa RSCIEI, cálculo de masividad, elección entre mortero y pintura, ensayos y certificado de visado.',
    image: ASSETS.warehouse,
    readTime: '8 min',
    category: 'Ingeniería y Protección Pasiva',
    topics: ['Tipología de nave (A, B, C)', 'Estabilidad al fuego R30 a R120', 'Certificados de instalador autorizado', 'Errores habituales en inspección']
  },
  {
    slug: 'pintura-intumescente',
    path: '/guias/pintura-intumescente/',
    title: 'Guía Técnica: Pintura Intumescente para Estructuras de Acero',
    description: 'Funcionamiento térmico, cálculo de espesores micrométricos (dft), tipos de imprimación compatible y limitaciones en vigas de gran masividad.',
    image: ASSETS.intumescentPaint,
    readTime: '6 min',
    category: 'Sistemas de Protección Pasiva',
    topics: ['Mecanismo de hinchamiento celular', 'Grosor en micras según R requerida', 'Aplicación airless vs brocha', 'Ensayos de adherencia y control']
  },
  {
    slug: 'mortero-ignifugo',
    path: '/guias/mortero-ignifugo/',
    title: 'Guía de Aplicación de Mortero Ignífugo: Lana de Roca y Cemento',
    description: 'Ventajas del mortero proyectado en naves industriales: rendimientos, espesores en milímetros, adherencia a chapa grecada y costes unitarios.',
    image: ASSETS.mortarFireproofing,
    readTime: '5 min',
    category: 'Materiales y Proyección',
    topics: ['Mortero lana de roca vs perlita/vermiculita', 'Espesores mínimos según masa volumétrica', 'Sellado antipolvo superficial', 'Resistencia a humedad ambiental']
  },
  {
    slug: 'rsciei-2025',
    path: '/guias/rsciei-2025/',
    title: 'Reglamento RSCIEI: Exigencias y Claves para Establecimientos Industriales',
    description: 'Guía práctica sobre el Reglamento de Seguridad contra Incendios en los Establecimientos Industriales (RSCIEI vigente: Real Decreto 164/2025, de 4 de marzo, en vigor desde el 10/05/2025, derogando al RD 2267/2004).',
    image: ASSETS.pciSystems,
    readTime: '9 min',
    category: 'Normativa y Legalización',
    topics: ['Nivel de riesgo intrínseco (Bajo, Medio, Alto)', 'Sectorización y medianerías EI-120', 'Exigencias de rociadores automáticos', 'Inspecciones periódicas de OCA']
  },
  {
    slug: 'mantenimiento-pci',
    path: '/guias/mantenimiento-pci/',
    title: 'Guía RIPCI: Plan de Mantenimiento Preventivo y Libro de Revisiones',
    description: 'Periodicidades obligatorias (trimestral, semestral, anual y quinquenal) para extintores, BIEs, detección, rociadores y grupos de presión.',
    image: ASSETS.pciSystems,
    readTime: '7 min',
    category: 'Mantenimiento y RIPCI',
    topics: ['Operaciones del titular vs empresa mantenedora', 'Retimbrado de extintores cada 5 años', 'Pruebas de caudal en BIE y bombas', 'Sanciones por falta de mantenimiento']
  }
];

export const GuidesIndexPage: React.FC<GuidesIndexPageProps> = ({ navigate }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-20">
      <SEOMetaHead
        title="Guías Técnicas de Protección Contra Incendios | CuántoVale.es"
        description="Biblioteca técnica de protección pasiva, activa y normativa RSCIEI. Análisis rigurosos sobre sistemas de ignifugación, cálculos y requisitos legales."
        path="/guias/"
        breadcrumbs={[
          { name: 'Inicio', url: '/' },
          { name: 'Guías Técnicas', url: '/guias/' }
        ]}
      />

      {/* Hero Header */}
      <section className="pt-8 pb-10 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Biblioteca Editorial & Conocimiento Técnico</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
            Guías Técnicas de Protección Contra Incendios
          </h1>
          <p className="text-base text-slate-600 max-w-3xl leading-relaxed">
            Explicaciones claras y exhaustivas sobre normativa, diferencias entre sistemas constructivos, cálculos de ingeniería y criterios para auditar presupuestos en España.
          </p>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES_DATA.map((guide) => (
            <article
              key={guide.slug}
              className="rounded-2xl border border-slate-200/90 bg-white overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all group"
            >
              <div>
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={guide.image}
                    alt={guide.title}
                    loading="lazy"
                    width="400"
                    height="225"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-mono font-bold text-slate-800">
                    {guide.category}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{guide.readTime} de lectura</span>
                  </div>

                  <h2 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                    {guide.title}
                  </h2>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                    {guide.description}
                  </p>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1.5">Temas cubiertos:</span>
                    <ul className="space-y-1 text-[11px] text-slate-600">
                      {guide.topics.slice(0, 3).map((t, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3 w-3 text-blue-500 shrink-0" />
                          <span className="truncate">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  onClick={() => navigate(guide.path)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 text-xs font-semibold text-slate-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Leer guía técnica</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-70" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
