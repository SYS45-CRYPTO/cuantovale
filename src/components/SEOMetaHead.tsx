import React, { useEffect } from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface SEOMetaHeadProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  schemaData?: object;
}

// Pre-launch Indexation Lock (Requirement: PUBLIC_INDEXING_ENABLED, default false)
const PUBLIC_INDEXING_ENABLED = import.meta.env.VITE_PUBLIC_INDEXING_ENABLED === 'true';

export const SEOMetaHead: React.FC<SEOMetaHeadProps> = ({
  title,
  description,
  path,
  noindex = false,
  breadcrumbs,
  schemaData
}) => {
  useEffect(() => {
    // 1. Title
    document.title = title;

    // 2. Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // 3. Robots (Pre-launch Lock: noindex when PUBLIC_INDEXING_ENABLED is false or on staging)
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.setAttribute('name', 'robots');
      document.head.appendChild(metaRobots);
    }
    const isStaging = typeof window !== 'undefined' && window.location.hostname.includes('run.app');
    const shouldNoIndex = noindex || !PUBLIC_INDEXING_ENABLED || isStaging;

    metaRobots.setAttribute(
      'content',
      shouldNoIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'
    );

    // 4. Canonical (Strictly https://cuantovale.es - Requirement 13)
    const productionOrigin = 'https://cuantovale.es';
    const fullUrl = `${productionOrigin}${path}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', fullUrl);

    // 5. OpenGraph
    const setMetaProp = (prop: string, content: string) => {
      let el = document.querySelector(`meta[property="${prop}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', prop);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaProp('og:title', title);
    setMetaProp('og:description', description);
    setMetaProp('og:url', fullUrl);
    setMetaProp('og:site_name', 'CuántoVale.es');
    setMetaProp('og:type', path === '/' ? 'website' : 'article');
    setMetaProp('og:locale', 'es_ES');

    // 6. Twitter
    const setMetaName = (name: string, content: string) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaName('twitter:card', 'summary_large_image');
    setMetaName('twitter:title', title);
    setMetaName('twitter:description', description);

    // 7. Schema.org JSON-LD (Semantically accurate - Requirement 10 & 11)
    const schemas: object[] = [];

    // Global Organization & WebSite on Home
    if (path === '/') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'CuántoVale',
        url: productionOrigin,
        description: 'Plataforma española de price intelligence y calculadoras de costes de edificación e instalaciones industriales.',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${productionOrigin}/proteccion-incendios/?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      });
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'CuántoVale',
        url: productionOrigin,
        logo: `${productionOrigin}/favicon.ico`,
        description: 'Plataforma independiente de cálculo orientativo de costes técnicos en España.',
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'ES'
        }
      });
    }

    // WebApplication schema for interactive calculators
    if (path === '/proteccion-incendios/ignifugar-nave-industrial-precio/') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Calculadora de Precio para Ignifugar Nave Industrial',
        url: `${productionOrigin}${path}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript. Requires HTML5.',
        description: 'Herramienta de cálculo orientativo para ignifugación de naves industriales según superficie, tipo de acero, resistencia R y provincia.'
      });
    }

    // Service schema for specialized PCI service cost pages
    if (
      path.startsWith('/proteccion-incendios/') &&
      path !== '/proteccion-incendios/' &&
      path !== '/proteccion-incendios/ignifugar-nave-industrial-precio/'
    ) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: title.replace(' | CuántoVale', ''),
        url: `${productionOrigin}${path}`,
        serviceType: 'Protección Contra Incendios (PCI)',
        provider: {
          '@type': 'Organization',
          name: 'CuántoVale'
        },
        areaServed: {
          '@type': 'Country',
          name: 'España'
        },
        description: description
      });
    }

    // Article schema for methodology and editorial guides
    if (path === '/metodologia/' || path === '/sobre-cuantovale/') {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title.replace(' | CuántoVale', ''),
        url: `${productionOrigin}${path}`,
        description: description,
        author: {
          '@type': 'Organization',
          name: 'CuántoVale'
        },
        publisher: {
          '@type': 'Organization',
          name: 'CuántoVale'
        },
        datePublished: '2026-01-15',
        dateModified: '2026-02-15'
      });
    }

    // Breadcrumbs Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((b, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: b.name,
          item: b.url.startsWith('http') ? b.url : `${productionOrigin}${b.url}`
        }))
      });
    }

    // Custom Schema Data (e.g. Service or WebApplication)
    if (schemaData) {
      schemas.push(schemaData);
    }

    // Remove existing dynamic schemas
    const existingScripts = document.querySelectorAll('script[data-dynamic-schema="true"]');
    existingScripts.forEach(s => s.remove());

    // Inject current schemas
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-dynamic-schema', 'true');
      script.textContent = JSON.stringify(schema);
      document.head.appendChild(script);
    });
  }, [title, description, path, noindex, breadcrumbs, schemaData]);

  return null;
};
