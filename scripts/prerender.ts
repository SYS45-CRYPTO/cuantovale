import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface PageMetadata {
  title: string;
  description: string;
  canonical: string;
  h1: string;
  intro: string;
}

const SEO_PAGES: Record<string, PageMetadata> = {
  '/': {
    title: '¿Cuánto debería costar? Calcula antes de contratar | CuántoVale',
    description: 'Calcula precios orientativos y costes reales antes de contratar en España. Compara presupuestos de hasta 2 profesionales homologados con independencia técnica.',
    canonical: 'https://cuantovale.es/',
    h1: '¿Cuánto debería costar?',
    intro: 'Calcula un precio orientativo antes de hablar con un proveedor. Compara presupuestos de hasta 2 profesionales homologados.'
  },
  '/proteccion-incendios/': {
    title: 'Precios de Protección Contra Incendios 2026 | CuántoVale',
    description: 'Directorio de precios de protección contra incendios en España: ignifugación de naves, mantenimiento periódico, proyectos de ingeniería e inspecciones reglamentarias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/',
    h1: 'Precios de protección contra incendios',
    intro: 'Referencias de mercado y calculadoras técnicas para las 6 áreas de protección pasiva, activa y legalización en España.'
  },
  '/proteccion-incendios/ignifugar-nave-industrial-precio/': {
    title: '¿Cuánto cuesta ignifugar una nave industrial? Precios 2026 | CuántoVale',
    description: 'Ignifugar una nave industrial en España cuesta habitualmente entre 8.000 € y 24.000 €. Conoce el precio por m² según mortero proyectado o pintura intumescente.',
    canonical: 'https://cuantovale.es/proteccion-incendios/ignifugar-nave-industrial-precio/',
    h1: '¿Cuánto cuesta ignifugar una nave industrial?',
    intro: 'Ignifugar una nave industrial estándar en España (400 a 1.200 m²) tiene un coste medio total que oscila entre los 8.000 € y 24.000 € sin IVA.'
  },
  '/proteccion-incendios/precio-ignifugacion-m2/': {
    title: 'Precio Ignifugación por m² (2026): Mortero, Pintura y Placas | CuántoVale',
    description: 'Tabla comparativa de precios de ignifugación por metro cuadrado en España: mortero proyectado (14-23 €/m²), pintura intumescente (24-48 €/m²) y placas rígidas.',
    canonical: 'https://cuantovale.es/proteccion-incendios/precio-ignifugacion-m2/',
    h1: 'Precio de ignifugación por m²: comparativa de sistemas',
    intro: 'El precio unitario de ignifugar una estructura en España varía sustancialmente según el material seleccionado y la exigencia de resistencia al fuego R.'
  },
  '/proteccion-incendios/pintura-intumescente-precio-m2/': {
    title: 'Pintura Intumescente Precio m² (2026): R30, R60, R90 | CuántoVale',
    description: 'Precios actualizados de pintura intumescente para estructuras metálicas (24 € – 48 €/m²). Factores de coste, espesor de micrómetros y certificado visado.',
    canonical: 'https://cuantovale.es/proteccion-incendios/pintura-intumescente-precio-m2/',
    h1: 'Pintura intumescente precio m²: guía de costes y aplicación',
    intro: 'Aplicar pintura intumescente para protección pasiva de estructuras metálicas vistas cuesta entre 24 € y 48 €/m² sin IVA.'
  },
  '/proteccion-incendios/mortero-ignifugo-precio-m2/': {
    title: 'Mortero Ignífugo Precio m² (2026): Lana de Roca Proyectada | CuántoVale',
    description: 'Precios de mortero ignífugo de lana de roca y perlita por m² en España (14 € – 23 €/m²). La solución más eficiente para naves industriales según RSCIEI.',
    canonical: 'https://cuantovale.es/proteccion-incendios/mortero-ignifugo-precio-m2/',
    h1: 'Mortero ignífugo precio m²: lana de roca y perlita proyectada',
    intro: 'El precio medio de proyección de mortero ignífugo en España se sitúa entre 14 € y 23 €/m² de estructura de acero (sin IVA).'
  },
  '/proteccion-incendios/mantenimiento-pci-precio/': {
    title: 'Mantenimiento PCI Precio (2026): Tarifas Reglamentarias RIPCI | CuántoVale',
    description: 'Coste anual de contratos de mantenimiento contra incendios para naves y locales (420 € – 1.450 €/año). Revisiones trimestrales y anuales obligatorias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/mantenimiento-pci-precio/',
    h1: 'Mantenimiento contra incendios: precio anual y revisiones RIPCI',
    intro: 'El contrato de mantenimiento reglamentario contra incendios en una nave industrial media cuesta habitualmente entre 420 € y 1.450 € al año (sin IVA).'
  },
  '/proteccion-incendios/instalacion-pci-precio/': {
    title: 'Instalación PCI Precio (2026): Rociadores, BIEs y Detección | CuántoVale',
    description: 'Costes de instalación de sistemas de protección contra incendios en España: redes de BIEs, rociadores automáticos, grupos de presión y aljibes.',
    canonical: 'https://cuantovale.es/proteccion-incendios/instalacion-pci-precio/',
    h1: 'Instalación de sistemas contra incendios: precios y costes',
    intro: 'Instalar un sistema completo de protección activa contra incendios en una nave industrial oscila habitualmente entre los 3.500 € y más de 35.000 €.'
  },
  '/proteccion-incendios/proyecto-contra-incendios-precio/': {
    title: 'Proyecto Contra Incendios Precio (2026): Memoria y Visado | CuántoVale',
    description: 'Coste de redacción de proyectos y memorias técnicas contra incendios por ingeniero colegiado (1.200 € – 3.800 €). Cálculo de carga de fuego y licencias.',
    canonical: 'https://cuantovale.es/proteccion-incendios/proyecto-contra-incendios-precio/',
    h1: 'Proyecto contra incendios precio: memorias técnicas y visado',
    intro: 'La redacción de un proyecto técnico de protección contra incendios por un ingeniero industrial colegiado cuesta entre 1.200 € y 3.800 €.'
  },
  '/proteccion-incendios/legalizacion-pci-precio/': {
    title: 'Legalización PCI Precio (2026): Certificados y Tramitación | CuántoVale',
    description: 'Coste del proceso de legalización de instalaciones contra incendios ante Industria y Ayuntamientos (800 € – 2.400 €). Requisitos y plazos.',
    canonical: 'https://cuantovale.es/proteccion-incendios/legalizacion-pci-precio/',
    h1: 'Legalización de instalaciones contra incendios: costes y trámites',
    intro: 'El expediente de legalización y registro administrativo de instalaciones contra incendios ante la delegación territorial de Industria cuesta habitualmente entre 800 € y 2.400 €.'
  },
  '/proteccion-incendios/inspeccion-oca-pci-precio/': {
    title: 'Inspección Periódica OCA PCI Precio (2026): Tarifas Oficiales | CuántoVale',
    description: 'Costes de la inspección reglamentaria periódica por Organismo de Control Autorizado (OCA) para establecimientos industriales (650 € – 1.800 €).',
    canonical: 'https://cuantovale.es/proteccion-incendios/inspeccion-oca-pci-precio/',
    h1: 'Inspección periódica OCA contra incendios: precios y periodicidad',
    intro: 'La inspección reglamentaria periódica realizada por un Organismo de Control Autorizado (OCA) para instalaciones contra incendios cuesta entre 650 € y 1.800 €.'
  },
  '/metodologia/': {
    title: 'Metodología de Cálculo y Fuentes de Datos | CuántoVale',
    description: 'Cómo calcula CuántoVale los rangos orientativos: bases de edificación oficiales (BEDEC, CYPE), factores provinciales y calificación de confianza.',
    canonical: 'https://cuantovale.es/metodologia/',
    h1: 'Metodología de cálculo y transparencia técnica',
    intro: 'En CuántoVale generamos estimaciones de coste transparentes basadas en bases de precios oficiales y factores correctores de mercado.'
  },
  '/sobre-cuantovale/': {
    title: 'Sobre CuántoVale: Independencia y Misión | CuántoVale',
    description: 'Conoce por qué CuántoVale es un comparador independiente. No vendemos seguros, no ejecutamos obras ni cobramos porcentaje sobre la factura.',
    canonical: 'https://cuantovale.es/sobre-cuantovale/',
    h1: 'Sobre CuántoVale: Independencia técnica',
    intro: 'CuántoVale nació para resolver una asimetría de información histórica en el sector de la edificación e instalaciones industriales.'
  },
  '/profesionales/': {
    title: 'Para Empresas Instaladoras PCI: Leads Cualificados | CuántoVale',
    description: 'Únete a la red de aplicadores e ingenierías PCI de CuántoVale. Recibe oportunidades con variables técnicas calculadas y compartidas con un máximo de 2 empresas.',
    canonical: 'https://cuantovale.es/profesionales/',
    h1: 'Recibe oportunidades PCI mejor cualificadas',
    intro: 'Sin subastas masivas. Solicitudes con metros cuadrados, tipo de estructura y resistencia R ya filtrados antes del contacto comercial.'
  },
  '/aviso-legal/': {
    title: 'Aviso Legal | CuántoVale',
    description: 'Información legal, titularidad del dominio y condiciones generales de uso de CuántoVale.es.',
    canonical: 'https://cuantovale.es/aviso-legal/',
    h1: 'Aviso Legal',
    intro: 'En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE).'
  },
  '/privacidad/': {
    title: 'Política de Privacidad | CuántoVale',
    description: 'Información sobre el tratamiento de datos personales, derechos ARCO y cesión a un máximo de 2 instaladores autorizados.',
    canonical: 'https://cuantovale.es/privacidad/',
    h1: 'Política de Privacidad',
    intro: 'En CuántoVale tratamos los datos que nos facilitas con la finalidad de ofrecerte el servicio de cálculo orientativo y gestión de presupuestos.'
  },
  '/cookies/': {
    title: 'Política de Cookies | CuántoVale',
    description: 'Información sobre el uso de cookies técnicas y analíticas anónimas en CuántoVale.es.',
    canonical: 'https://cuantovale.es/cookies/',
    h1: 'Política de Cookies',
    intro: 'CuántoVale utiliza cookies técnicas necesarias para el funcionamiento del portal y analíticas anónimas para evaluar el rendimiento.'
  },
  '/terminos/': {
    title: 'Términos y Condiciones | CuántoVale',
    description: 'Condiciones de uso de las herramientas de estimación y del servicio de conexión con instaladores homologados.',
    canonical: 'https://cuantovale.es/terminos/',
    h1: 'Términos y Condiciones del Servicio',
    intro: 'Las siguientes condiciones regulan el uso de la plataforma web CuántoVale.es y sus herramientas de cálculo orientativo.'
  },
  '/guias/': {
    title: 'Guías Técnicas de Protección Contra Incendios | CuántoVale',
    description: 'Biblioteca técnica sobre normativa RSCIEI, ignifugación de naves, morteros y pinturas intumescentes.',
    canonical: 'https://cuantovale.es/guias/',
    h1: 'Guías Técnicas de Protección Contra Incendios',
    intro: 'Conocimiento riguroso para entender ensayos, espesores y requisitos reglamentarios en España.'
  },
  '/guias/ignifugacion-naves-industriales/': {
    title: 'Guía Completa de Ignifugación de Naves Industriales (2026) | CuántoVale',
    description: 'Todo lo que necesitas saber antes de ignifugar una nave: normativa RSCIEI, cálculo de masividad, elección entre mortero y pintura, ensayos y certificado de visado.',
    canonical: 'https://cuantovale.es/guias/ignifugacion-naves-industriales/',
    h1: 'Guía de Ignifugación de Naves Industriales',
    intro: 'Análisis exhaustivo sobre estabilidad al fuego R, masividad y requerimientos reglamentarios.'
  },
  '/guias/pintura-intumescente/': {
    title: 'Guía Técnica: Pintura Intumescente para Acero | CuántoVale',
    description: 'Funcionamiento térmico, cálculo de espesores micrométricos (DFT), imprimación epoxi y esmaltado.',
    canonical: 'https://cuantovale.es/guias/pintura-intumescente/',
    h1: 'Guía Técnica de Pintura Intumescente',
    intro: 'Mecanismo de expansión celular y cálculo de micras según exigencia R30 a R90.'
  },
  '/guias/mortero-ignifugo/': {
    title: 'Guía de Aplicación de Mortero Ignífugo | CuántoVale',
    description: 'Ventajas del mortero proyectado en naves industriales: lana de roca, perlita y espesores en milímetros.',
    canonical: 'https://cuantovale.es/guias/mortero-ignifugo/',
    h1: 'Guía de Mortero Ignífugo Proyectado',
    intro: 'Solución eficiente y de alto rendimiento térmico para estructuras portantes industriales.'
  },
  '/guias/rsciei-2025/': {
    title: 'Reglamento RSCIEI: Exigencias para Industrias | CuántoVale',
    description: 'Guía práctica sobre el Reglamento de Seguridad contra Incendios en los Establecimientos Industriales.',
    canonical: 'https://cuantovale.es/guias/rsciei-2025/',
    h1: 'Reglamento RSCIEI: Establecimientos Industriales',
    intro: 'Clasificación de tipos de nave (A, B, C), carga de fuego y sectorizaciones obligatorias.'
  },
  '/guias/mantenimiento-pci/': {
    title: 'Guía RIPCI: Plan de Mantenimiento Preventivo | CuántoVale',
    description: 'Periodicidades obligatorias (trimestral, semestral, anual y quinquenal) según RIPCI RD 513/2017.',
    canonical: 'https://cuantovale.es/guias/mantenimiento-pci/',
    h1: 'Guía de Mantenimiento e Inspección RIPCI',
    intro: 'Obligaciones del titular, libro de revisiones y retimbrados quinquenales.'
  }
};

function runPrerender() {
  const distDir = path.resolve(__dirname, '../dist');
  const baseTemplatePath = path.resolve(distDir, 'index.html');

  if (!fs.existsSync(baseTemplatePath)) {
    console.error('[Prerender] dist/index.html not found! Run vite build first.');
    process.exit(1);
  }

  const baseTemplate = fs.readFileSync(baseTemplatePath, 'utf-8');
  console.log('[Prerender] Starting SSG HTML Prerendering for 24 Cluster URLs...');

  let generatedCount = 0;

  for (const [routePath, meta] of Object.entries(SEO_PAGES)) {
    let html = baseTemplate
      .replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`)
      .replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/, `<meta name="description" content="${meta.description}" />`);

    const robotsMeta = '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />';
    if (html.includes('<meta name="robots"')) {
      html = html.replace(/<meta\s+name="robots"\s+content=".*?"\s*\/?>/, robotsMeta);
    } else {
      html = html.replace('</head>', `  ${robotsMeta}\n  </head>`);
    }

    if (!html.includes('rel="canonical"')) {
      html = html.replace('</head>', `  <link rel="canonical" href="${meta.canonical}" />\n  </head>`);
    } else {
      html = html.replace(/<link rel="canonical" href=".*?" \/>/, `<link rel="canonical" href="${meta.canonical}" />`);
    }

    const ssrContent = `
    <header class="py-4 px-6 border-b border-slate-100 flex justify-between items-center max-w-5xl mx-auto">
      <a href="/" class="font-extrabold text-slate-950 text-base">Cuánto<span class="text-blue-600">Vale</span>.es</a>
      <nav class="flex gap-4 text-xs font-medium text-slate-600">
        <a href="/proteccion-incendios/">Precios PCI</a>
        <a href="/metodologia/">Metodología</a>
        <a href="/sobre-cuantovale/">Independencia</a>
      </nav>
    </header>
    <main class="max-w-4xl mx-auto px-4 py-12 space-y-6">
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">${meta.h1}</h1>
      <p class="text-base text-slate-600 leading-relaxed">${meta.intro}</p>
      <div class="pt-4 border-t border-slate-200 text-xs text-slate-500">
        <p>Datos técnicos actualizados a 2026. Fuentes: BEDEC / CYPE / Baremos colegiales.</p>
        <div class="mt-4 flex flex-wrap gap-3">
          <a href="/proteccion-incendios/ignifugar-nave-industrial-precio/" class="text-blue-600 hover:underline">Calculadora de Ignifugación</a>
          <a href="/proteccion-incendios/precio-ignifugacion-m2/" class="text-blue-600 hover:underline">Tarifas m²</a>
          <a href="/profesionales/" class="text-blue-600 hover:underline">Red de instaladores</a>
        </div>
      </div>
    </main>
    `;

    html = html.replace('<div id="root"></div>', `<div id="root">${ssrContent}</div>`);

    let targetFilePath: string;
    if (routePath === '/') {
      targetFilePath = path.resolve(distDir, 'index.html');
    } else {
      const cleanDir = routePath.replace(/^\/+|\/+$/g, '');
      const fullDir = path.resolve(distDir, cleanDir);
      fs.mkdirSync(fullDir, { recursive: true });
      targetFilePath = path.resolve(fullDir, 'index.html');
    }

    fs.writeFileSync(targetFilePath, html, 'utf-8');
    generatedCount++;
  }

  console.log(`[Prerender] Successfully generated ${generatedCount} static SSG HTML files in dist/!`);
}

runPrerender();
