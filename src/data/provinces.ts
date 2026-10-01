// Single Source of Truth for Spanish Territories (50 Provinces + 2 Autonomous Cities: Ceuta & Melilla)
export interface TerritoryInfo {
  code: string;
  name: string;
  isAutonomousCity?: boolean;
}

export const POSTCODE_TERRITORY_MAP: Record<string, string> = {
  '01': 'Álava',
  '02': 'Albacete',
  '03': 'Alicante',
  '04': 'Almería',
  '05': 'Ávila',
  '06': 'Badajoz',
  '07': 'Baleares (Illes Balears)',
  '08': 'Barcelona',
  '09': 'Burgos',
  '10': 'Cáceres',
  '11': 'Cádiz',
  '12': 'Castellón',
  '13': 'Ciudad Real',
  '14': 'Córdoba',
  '15': 'A Coruña',
  '16': 'Cuenca',
  '17': 'Girona',
  '18': 'Granada',
  '19': 'Guadalajara',
  '20': 'Gipuzkoa',
  '21': 'Huelva',
  '22': 'Huesca',
  '23': 'Jaén',
  '24': 'León',
  '25': 'Lleida',
  '26': 'La Rioja',
  '27': 'Lugo',
  '28': 'Madrid',
  '29': 'Málaga',
  '30': 'Murcia',
  '31': 'Navarra',
  '32': 'Ourense',
  '33': 'Asturias',
  '34': 'Palencia',
  '35': 'Las Palmas',
  '36': 'Pontevedra',
  '37': 'Salamanca',
  '38': 'Santa Cruz de Tenerife',
  '39': 'Cantabria',
  '40': 'Segovia',
  '41': 'Sevilla',
  '42': 'Soria',
  '43': 'Tarragona',
  '44': 'Teruel',
  '45': 'Toledo',
  '46': 'Valencia',
  '47': 'Valladolid',
  '48': 'Bizkaia',
  '49': 'Zamora',
  '50': 'Zaragoza',
  '51': 'Ceuta (Ciudad Autónoma)',
  '52': 'Melilla (Ciudad Autónoma)'
};

// Sorted alphabetically by Spanish locale across all 52 choices
export const SPANISH_TERRITORIES_ALPHABETICAL: string[] = Object.values(POSTCODE_TERRITORY_MAP).sort((a, b) =>
  a.localeCompare(b, 'es', { sensitivity: 'base' })
);

export const SPANISH_PROVINCES_ALPHABETICAL = SPANISH_TERRITORIES_ALPHABETICAL;

export function getProvinceFromPostcode(postcode: string): string | null {
  if (!postcode || postcode.length < 2) return null;
  const prefix = postcode.trim().slice(0, 2);
  return POSTCODE_TERRITORY_MAP[prefix] || null;
}
