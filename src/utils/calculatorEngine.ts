import {
  CalculatorIgnifugacionInputs,
  CalculationResult,
  ConfidenceLevel
} from '../types';
import { PCI_PRICING_DATABASE, PROVINCE_MULTIPLIERS } from '../data/pricing/pciPricingData';

export function calculateIgnifugacionCost(
  inputs: CalculatorIgnifugacionInputs
): CalculationResult {
  const {
    province,
    approxNaveSurface,
    structuralSurface,
    structureType,
    fireResistance,
    systemPreference,
    heightAccess,
    state
  } = inputs;

  // 1. Determine structural surface to treat (m2)
  let finalStructuralM2 = 0;
  let isEstimatedStructuralM2 = false;

  if (structuralSurface && structuralSurface > 0) {
    finalStructuralM2 = structuralSurface;
  } else {
    isEstimatedStructuralM2 = true;
    // Structural steel/wood surface ratio relative to building floor area:
    // In typical industrial warehouses (naves tipo porticadas):
    // 1 m2 of floor area has approx 0.40 - 0.55 m2 of developed steel surface
    // (pilares, dinteles/vigas de cubierta, correas de celosía o perfiles Z/C).
    // If height is high (>5m), vertical pillars are longer -> ratio increases to ~0.50.
    const heightFactor = heightAccess === 'altura_importante' ? 0.52 : 0.42;
    finalStructuralM2 = Math.round(approxNaveSurface * heightFactor);
  }

  // 2. Select system pricing baseline
  // If user doesn't know, provide a blended range from mortero (more economical) to pintura (if aesthetic/clean)
  const morteroItem = PCI_PRICING_DATABASE.find(i => i.id === 'pci-mortero-lana-roca')!;
  const pinturaItem = PCI_PRICING_DATABASE.find(i => i.id === 'pci-pintura-intumescente')!;
  const placaItem = PCI_PRICING_DATABASE.find(i => i.id === 'pci-placas-silicato')!;
  const mediosItem = PCI_PRICING_DATABASE.find(i => i.id === 'pci-medios-auxiliares')!;
  const ensayoItem = PCI_PRICING_DATABASE.find(i => i.id === 'pci-certificado-visado')!;

  // Province multiplier
  const provFactor = PROVINCE_MULTIPLIERS[province] || 1.00;

  // Fire resistance multiplier
  // R30 requires lower thickness (~150-300 microns for paint / 10-15mm mortar)
  // R60 is standard (~400-800 microns / 15-20mm)
  // R90 is demanding (~900-1500 microns / 25-30mm)
  // R120 is very demanding (often only mortar or boxed boards, thick coats)
  let rMultiplierMin = 1.0;
  let rMultiplierMax = 1.0;

  switch (fireResistance) {
    case 'R30':
      rMultiplierMin = 0.85;
      rMultiplierMax = 0.95;
      break;
    case 'R60':
      rMultiplierMin = 1.0;
      rMultiplierMax = 1.08;
      break;
    case 'R90':
      rMultiplierMin = 1.15;
      rMultiplierMax = 1.30;
      break;
    case 'R120':
      rMultiplierMin = 1.30;
      rMultiplierMax = 1.55;
      break;
    case 'otra':
    case 'no_se':
    default:
      rMultiplierMin = 0.95;
      rMultiplierMax = 1.25;
      break;
  }

  // System base rate selection
  let systemRateMin = 0;
  let systemRateMax = 0;

  if (systemPreference === 'mortero') {
    systemRateMin = morteroItem.min;
    systemRateMax = morteroItem.max;
  } else if (systemPreference === 'pintura_intumescente') {
    systemRateMin = pinturaItem.min;
    systemRateMax = pinturaItem.max;
  } else if (systemPreference === 'placa') {
    systemRateMin = placaItem.min;
    systemRateMax = placaItem.max;
  } else {
    // "No lo sé": span from mortero min to pintura median/max
    systemRateMin = morteroItem.min;
    systemRateMax = pinturaItem.median;
  }

  // State factor (cleaning, old paint stripping, rust converter)
  let stateFactorMin = 1.0;
  let stateFactorMax = 1.0;
  if (state === 'rehabilitacion' || state === 'ya_protegida') {
    // May require high pressure wash, scrapings or compatibility primer
    stateFactorMin = 1.10;
    stateFactorMax = 1.25;
  }

  // Structure material factor
  // Concrete usually requires less (or only joint sealing/collars unless under-dimensioned)
  // Wood requires special varnish or mortar
  let materialFactor = 1.0;
  if (structureType === 'hormigon') {
    // Often only requires localized fire protection or mortar in tension zones
    materialFactor = 0.70;
  } else if (structureType === 'madera') {
    // Fire retardant varnishes or intumescent wood systems
    materialFactor = 1.15;
  }

  // Calculate material & application total
  const rateMinPerM2 = systemRateMin * provFactor * rMultiplierMin * stateFactorMin * materialFactor;
  const rateMaxPerM2 = systemRateMax * provFactor * rMultiplierMax * stateFactorMax * materialFactor;

  const materialYAplicacionMin = finalStructuralM2 * rateMinPerM2;
  const materialYAplicacionMax = finalStructuralM2 * rateMaxPerM2;

  // Auxiliary equipment (PEMP / Scaffolding)
  let mediosMin = 0;
  let mediosMax = 0;
  if (heightAccess === 'altura_importante') {
    const scaleFactor = Math.max(1, Math.min(2.5, approxNaveSurface / 800));
    mediosMin = mediosItem.min * scaleFactor;
    mediosMax = mediosItem.max * scaleFactor;
  } else if (heightAccess === 'no_se') {
    mediosMin = mediosItem.min * 0.5;
    mediosMax = mediosItem.max * 0.9;
  } else {
    // Normal height: minor scissor lift or mobile towers
    mediosMin = 400;
    mediosMax = 900;
  }

  // Official testing & engineering certificate
  const certMin = ensayoItem.min;
  const certMax = ensayoItem.max;

  // Total raw sums
  const rawTotalMin = materialYAplicacionMin + mediosMin + certMin;
  const rawTotalMax = materialYAplicacionMax + mediosMax + certMax;

  // AVOID FALSE PRECISION! Round figures sensibly according to scale:
  // < 5000 -> round to nearest 100
  // 5000 - 20000 -> round to nearest 500
  // > 20000 -> round to nearest 1000
  const roundToSensible = (val: number): number => {
    if (val < 5000) return Math.round(val / 100) * 100;
    if (val < 25000) return Math.round(val / 500) * 500;
    return Math.round(val / 1000) * 1000;
  };

  const minEstimate = roundToSensible(rawTotalMin);
  const maxEstimate = roundToSensible(rawTotalMax);
  const medianEstimate = roundToSensible((minEstimate + maxEstimate) / 2);

  // Confidence assessment
  let confidenceScore = 100;
  const missingVariables: string[] = [];

  if (isEstimatedStructuralM2) {
    confidenceScore -= 25;
    missingVariables.push('Superficie real desarrollada de estructura metálica (m²)');
  }
  if (fireResistance === 'no_se') {
    confidenceScore -= 25;
    missingVariables.push('Resistencia al fuego reglamentaria (R30, R60, R90 o R120)');
  }
  if (systemPreference === 'no_se') {
    confidenceScore -= 20;
    missingVariables.push('Preferencia de sistema (mortero proyectado vs pintura intumescente)');
  }
  if (heightAccess === 'no_se') {
    confidenceScore -= 15;
    missingVariables.push('Altura libre y necesidad de plataformas de elevación');
  }
  if (structureType === 'no_se') {
    confidenceScore -= 15;
    missingVariables.push('Tipo de estructura (acero, hormigón o mixta)');
  }

  let confidence: ConfidenceLevel = 'ALTO';
  let confidenceReason = '';

  if (confidenceScore >= 80) {
    confidence = 'ALTO';
    confidenceReason =
      'Disponemos de la superficie, resistencia y sistema previstos, lo que permite acotar la horquilla con buena fiabilidad.';
  } else if (confidenceScore >= 50) {
    confidence = 'MEDIO';
    confidenceReason =
      'El cálculo utiliza una estimación geométrica de perfiles metálicos y horquillas estándar según la superficie de nave indicada.';
  } else {
    confidence = 'BAJO';
    confidenceReason =
      'Faltan variables críticas como la resistencia R prescrita y el sistema de aplicación, por lo que el rango es puramente orientativo.';
  }

  // Key cost drivers
  const keyCostDrivers: string[] = [
    'Superficie real de acero a tratar vs superficie de suelo (factor de masividad Hp/A de los perfiles)',
    'Resistencia al fuego exigida por normativa (R30 requiere mucho menor espesor de producto que R90 o R120)',
    'Sistema seleccionado (el mortero de lana de roca es significativamente más económico que la pintura intumescente vista)',
    'Altura libre y medios auxiliares (necesidad de PEMP de tijera o brazo articulado para cerchas)'
  ];

  return {
    minEstimate,
    maxEstimate,
    medianEstimate,
    unit: '€ (coste total orientativo estimado sin IVA)',
    confidence,
    confidenceReason,
    estimatedStructuralM2: finalStructuralM2,
    isEstimatedStructuralM2,
    costBreakdown: {
      materialYAplicacionMin: roundToSensible(materialYAplicacionMin),
      materialYAplicacionMax: roundToSensible(materialYAplicacionMax),
      mediosAuxiliaresMin: roundToSensible(mediosMin),
      mediosAuxiliaresMax: roundToSensible(mediosMax),
      ensayoCertificadoMin: roundToSensible(certMin),
      ensayoCertificadoMax: roundToSensible(certMax)
    },
    keyCostDrivers,
    missingVariables,
    methodologyNote:
      'Estimación elaborada cruzando bases públicas de edificación (BEDEC 2025/2026, CYPE) con factores correctores provinciales y costes reales de aplicación en España.',
    sourceReference:
      'Bases BEDEC/ITeC 2026 + Tarifas medias aplicadores de protección pasiva + Baremos colegiales visado',
    lastUpdated: '15 de febrero de 2026'
  };
}
