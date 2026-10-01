import imgWarehouse from './images/nave_industrial_estructura_1790810524649.jpg';
import imgIntumescent from './images/pintura_intumescente_acero_1790810536879.jpg';
import imgMortar from './images/mortero_ignifugo_proyectado_1790810549275.jpg';
import imgSprinklers from './images/sistemas_pci_rociadores_bie_1790810561868.jpg';

/**
 * ASSET ORIGIN DOCUMENTATION (Requirement 11)
 *
 * All visual assets in this application are GENERATED conceptual technical illustrations
 * created specifically for CuántoVale to explain engineering concepts visually without
 * creating a false impression of a proprietary portfolio of real works.
 *
 * 1. ASSETS.warehouse -> GENERATED CONCEPTUAL ASSET
 * 2. ASSETS.intumescentPaint -> GENERATED CONCEPTUAL ASSET
 * 3. ASSETS.mortarFireproofing -> GENERATED CONCEPTUAL ASSET
 * 4. ASSETS.pciSystems -> GENERATED CONCEPTUAL ASSET
 */

export const ASSETS = {
  warehouse: imgWarehouse,
  intumescentPaint: imgIntumescent,
  mortarFireproofing: imgMortar,
  pciSystems: imgSprinklers
};

export const ASSETS_ORIGIN_AUDIT = [
  { name: 'warehouse', type: 'GENERATED', description: 'Ilustración conceptual de estructura metálica de nave industrial' },
  { name: 'intumescentPaint', type: 'GENERATED', description: 'Ilustración conceptual de acabado con pintura intumescente' },
  { name: 'mortarFireproofing', type: 'GENERATED', description: 'Ilustración conceptual de aplicación de mortero proyectado' },
  { name: 'pciSystems', type: 'GENERATED', description: 'Ilustración conceptual de rociadores y tubería PCI' }
];
