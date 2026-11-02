// Duas Casas: a front house (3 bedrooms) and a smaller back house (2 bedrooms) on the same 10 × 30 m lot
// in Mamanguape (PB). Coordinates in meters from the top-left corner of the front house, which sits on a
// side boundary. The street (top of the drawing) faces east: the sun rises in front and the breeze blows
// from the front to the back. Both houses lean on the north boundary (left, no windows there) and open to
// the 1.5 m south strip (right), which gets almost no direct sun and is also the shared walkway from the
// street gate to the back house. Between them, a 3 m yard holds the water
// tower: one tank per house on a slab over the two laundries, next to the kitchens and bathrooms of both.
import { planView, type HouseModel } from '../lib/model';
import type { BudgetItem } from './budget';
import { STONE, WOOD, furnitureKit } from './furniture';
import type { Opening, Point, Window } from './openings';
import type { Rect, Room, RoomKey } from './rooms';

const W = 8.5;
const H = 23.5;
const FRONT: Rect = [0, 0, W, 14];
const TOWER: Rect = [0, 14, 1.6, 3];
const BACK: Rect = [0, 17, W, 6.5];
// Roofs: one water each, embedded behind the parapet, falling from the north boundary to the south strip.
const ROOF_WEST = 3.65;
const ROOF_EAST = 3.1;
const roofAt = (x: number) => ROOF_WEST + ((ROOF_EAST - ROOF_WEST) * x) / W;
const TOWER_SLAB = 3.6;

const FRONT_HOUSE = 'Casa da Frente';
const BACK_HOUSE = 'Casa dos Fundos';

const ROOMS: Record<RoomKey, Room> = {
  porch: {
    name: 'Alpendre',
    subtitle: `${FRONT_HOUSE} • Entrada`,
    height: '2.60 m',
    floor: 'Cerâmica Rústica Antiderrapante',
    light: 'Leste (rua), Sombreada',
    icon: 'fa-person-walking-arrow-right',
    benefits: [
      'Duas redes armadas na diagonal dos cantos.',
      'Recebe o sol da manhã e a brisa leste de frente, e sombreia as janelas da sala e do quarto 1.',
    ],
    patioRel: 'É a varanda da casa da frente, de frente para a garagem.',
    rects: [[0, 0, 8.5, 2]],
    fill: '#334155', fillOpacity: 0.3, text: '#cbd5e1',
  },
  living: {
    name: 'Sala',
    subtitle: `${FRONT_HOUSE} • Estar`,
    height: '3.20 m',
    floor: 'Porcelanato Acetinado',
    light: 'Leste (alpendre)',
    icon: 'fa-couch',
    benefits: [
      'A TV fica na parede da divisa, que não tem janelas.',
      'Ligada ao corredor sem porta: a brisa que entra pelos quartos atravessa até o alpendre.',
    ],
    patioRel: 'Fica na frente; o quintal do meio é alcançado pelo corredor.',
    rects: [[0, 2, 4.7, 5]],
    fill: '#1e1b4b', fillOpacity: 0.4, text: '#c7d2fe',
  },
  bedroom_1: {
    name: 'Quarto 1',
    subtitle: `${FRONT_HOUSE} • Casal`,
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Leste (alpendre) + Sul',
    icon: 'fa-bed',
    benefits: [
      'Janela para o alpendre e outra para o sul: ventilação cruzada com a brisa da frente.',
      'O alpendre sombreia a janela da rua do sol da manhã.',
    ],
    patioRel: 'Fica na frente da casa, ao lado da sala.',
    rects: [[4.7, 2, 3.8, 3.2]],
    fill: '#3b0764', fillOpacity: 0.3, text: '#e9d5ff',
  },
  bedroom_2: {
    name: 'Quarto 2',
    subtitle: `${FRONT_HOUSE} • Solteiro / Escritório`,
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Sul',
    icon: 'fa-bed',
    benefits: [
      'Janela para o sul: quase sem sol direto e com a brisa sudeste.',
      'Cabe cama de solteiro e uma mesa de estudo.',
    ],
    patioRel: 'A porta abre para o corredor.',
    rects: [[4.7, 5.2, 3.8, 3.2]],
    fill: '#065f46', fillOpacity: 0.3, text: '#a7f3d0',
  },
  bath: {
    name: 'Banheiro Social',
    subtitle: `${FRONT_HOUSE} • Banheiro`,
    height: '2.80 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Zenital (domus)',
    icon: 'fa-restroom',
    benefits: [
      'Fica junto à divisa, então ventila por um domus no teto com exaustor.',
      'Atende o quarto 1, o quarto 2 e as visitas.',
    ],
    patioRel: 'Fica no miolo da casa, entre a sala e a cozinha.',
    rects: [[0, 7, 3.6, 2.2]],
    fill: '#164e63', fillOpacity: 0.3, text: '#a5f3fc',
  },
  hall: {
    name: 'Corredor',
    subtitle: `${FRONT_HOUSE} • Circulação`,
    height: '3.00 m',
    floor: 'Porcelanato Acetinado',
    light: 'Porta do quintal (Oeste)',
    icon: 'fa-shoe-prints',
    benefits: [
      'Liga a sala aos quartos, à cozinha e ao quintal do meio.',
      'Com a porta do quintal aberta, o ar atravessa a casa de ponta a ponta.',
    ],
    patioRel: 'Termina na porta para o quintal do meio.',
    rects: [[3.6, 7, 1.1, 7]],
    fill: '#0f172a', fillOpacity: 0.8, text: '#94a3b8',
  },
  kitchen: {
    name: 'Cozinha & Jantar',
    subtitle: `${FRONT_HOUSE} • Copa`,
    height: '3.00 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Oeste (quintal)',
    icon: 'fa-utensils',
    benefits: [
      "Bancada na parede da divisa, a mesma que leva a água da caixa d'água: canos curtos.",
      'Janela para o quintal do meio, sombreada à tarde pela casa dos fundos.',
      'Mesa para 4 pessoas.',
    ],
    patioRel: 'Fica de frente para o quintal e ao lado da torre da caixa d’água.',
    rects: [[0, 9.2, 3.6, 4.8]],
    fill: '#4c0519', fillOpacity: 0.3, text: '#fecdd3',
  },
  suite: {
    name: 'Suíte',
    subtitle: `${FRONT_HOUSE} • Dormitório Principal`,
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Sul',
    icon: 'fa-bed',
    benefits: [
      'Janela para o sul: quase sem sol direto e com a brisa sudeste entrando de frente.',
      'Banheiro próprio e guarda-roupa de 2,4 m.',
    ],
    patioRel: 'Fica nos fundos da casa, perto do quintal do meio.',
    rects: [[4.7, 8.4, 3.8, 3.6]],
    fill: '#172554', fillOpacity: 0.45, text: '#bfdbfe',
  },
  suite_bath: {
    name: 'Banheiro da Suíte',
    subtitle: `${FRONT_HOUSE} • Banheiro Privativo`,
    height: '2.80 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Oeste + Sul',
    icon: 'fa-shower',
    benefits: [
      'Janelas altas para o quintal e para o sul: ventila sem perder privacidade.',
      'Aquecedor solar logo acima, no telhado.',
    ],
    patioRel: 'Dá para o quintal do meio.',
    rects: [[4.7, 12, 3.8, 2]],
    fill: '#164e63', fillOpacity: 0.3, text: '#a5f3fc',
  },
  laundry_front: {
    name: 'Lavanderia da Frente',
    subtitle: `${FRONT_HOUSE} • Torre da Caixa d'Água`,
    height: '3.60 m',
    floor: 'Cerâmica Antiderrapante',
    light: 'Sul (quintal)',
    icon: 'fa-jug-detergent',
    benefits: [
      "Embaixo da caixa d'água da casa da frente: tanque e máquina com água por gravidade.",
      'Aberta para o quintal, onde fica o varal.',
    ],
    patioRel: 'Fica no quintal do meio, a dois passos da porta da cozinha.',
    rects: [[0, 14, 1.6, 1.5]],
    fill: '#1e293b', fillOpacity: 0.5, text: '#cbd5e1',
  },
  laundry_back: {
    name: 'Lavanderia dos Fundos',
    subtitle: `${BACK_HOUSE} • Torre da Caixa d'Água`,
    height: '3.60 m',
    floor: 'Cerâmica Antiderrapante',
    light: 'Sul (quintal)',
    icon: 'fa-jug-detergent',
    benefits: [
      "Embaixo da caixa d'água da casa dos fundos, separada da outra lavanderia por uma parede.",
      'Cada casa tem a sua: ninguém divide tanque nem máquina.',
    ],
    patioRel: 'Fica no quintal do meio, ao lado da porta da casa dos fundos.',
    rects: [[0, 15.5, 1.6, 1.5]],
    fill: '#1e293b', fillOpacity: 0.5, text: '#cbd5e1',
  },
  courtyard: {
    name: 'Quintal do Meio',
    subtitle: 'Área Comum • Descoberto',
    height: 'Descoberto (Céu Aberto)',
    floor: 'Grama & Piso Drenante',
    light: 'Zenital',
    icon: 'fa-tree',
    benefits: [
      "Afasta as duas casas 3 m: cada uma tem janelas, luz e ventilação para o quintal.",
      "Abriga a torre da caixa d'água, no ponto mais perto das cozinhas e banheiros das duas casas.",
      'Varal das duas lavanderias, no caminho da brisa sudeste que entra pelo corredor.',
    ],
    patioRel: 'Liga as duas casas e se abre para o corredor lateral, que leva à rua.',
    rects: [[1.6, 14, 6.9, 3]],
    uncovered: true,
    walls: false,
    fill: '#064e3b', fillOpacity: 0.35, text: '#6ee7b7',
  },
  back_living: {
    name: 'Sala & Cozinha (Fundos)',
    subtitle: `${BACK_HOUSE} • Estar e Cozinha`,
    height: '3.00 m',
    floor: 'Porcelanato Acetinado',
    light: 'Leste (quintal) + Sul',
    icon: 'fa-couch',
    benefits: [
      "Bancada da cozinha na parede da divisa, colada na torre da caixa d'água.",
      'Janelas para o quintal e para o sul: ventilação cruzada com a brisa que vem da frente.',
    ],
    patioRel: 'A porta de entrada abre para o quintal do meio.',
    rects: [[0, 17, 8.5, 3]],
    fill: '#1e1b4b', fillOpacity: 0.4, text: '#c7d2fe',
  },
  back_bedroom_1: {
    name: 'Quarto 1 (Fundos)',
    subtitle: `${BACK_HOUSE} • Casal`,
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Oeste',
    icon: 'fa-bed',
    benefits: [
      'Janela para o quintal dos fundos, longe da rua; veneziana e beiral seguram o sol da tarde.',
      'Cama de casal e guarda-roupa de 1,9 m.',
    ],
    patioRel: 'Fica no fundo do terreno, longe da rua.',
    rects: [[0, 20, 3.3, 3.5]],
    fill: '#3b0764', fillOpacity: 0.3, text: '#e9d5ff',
  },
  back_bath: {
    name: 'Banheiro (Fundos)',
    subtitle: `${BACK_HOUSE} • Banheiro`,
    height: '2.80 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Oeste',
    icon: 'fa-shower',
    benefits: [
      'Entre os dois quartos, com janela alta para o quintal dos fundos.',
    ],
    patioRel: 'Fica no fundo da casa.',
    rects: [[3.3, 20, 1.8, 3.5]],
    fill: '#164e63', fillOpacity: 0.3, text: '#a5f3fc',
  },
  back_bedroom_2: {
    name: 'Quarto 2 (Fundos)',
    subtitle: `${BACK_HOUSE} • Casal / Solteiro`,
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Oeste + Sul',
    icon: 'fa-bed',
    benefits: [
      'Janelas para o sul e para o oeste: ventilação cruzada; a do oeste com veneziana para o sol da tarde.',
    ],
    patioRel: 'Fica no fundo do terreno, junto ao corredor lateral.',
    rects: [[5.1, 20, 3.4, 3.5]],
    fill: '#065f46', fillOpacity: 0.3, text: '#a7f3d0',
  },
};

const OPENINGS: Opening[] = [
  { x: 0.3, y: 0, dir: 'h', len: 3.8, type: 'opening' },               // alpendre (frente aberta)
  { x: 4.4, y: 0, dir: 'h', len: 3.8, type: 'opening' },               // alpendre (frente aberta)
  { x: 3.5, y: 2, dir: 'h', len: 1.0, type: 'door', swing: 1 },        // entrada da casa da frente
  { x: 4.7, y: 4.0, dir: 'v', len: 0.8, type: 'door', swing: 1 },      // quarto 1
  { x: 3.6, y: 7, dir: 'h', len: 1.1, type: 'opening' },               // sala → corredor
  { x: 4.7, y: 7.3, dir: 'v', len: 0.8, type: 'door', swing: 1 },      // quarto 2
  { x: 3.6, y: 7.4, dir: 'v', len: 0.7, type: 'door', swing: -1 },     // banheiro social
  { x: 4.7, y: 8.6, dir: 'v', len: 0.8, type: 'door', swing: 1 },      // suíte
  { x: 3.6, y: 10.2, dir: 'v', len: 2.0, type: 'opening' },            // corredor ↔ cozinha
  { x: 7.4, y: 12, dir: 'h', len: 0.7, type: 'door', swing: 1 },       // banheiro da suíte
  { x: 3.75, y: 14, dir: 'h', len: 0.8, type: 'door', swing: -1 },     // corredor → quintal
  { x: 1.6, y: 14.1, dir: 'v', len: 1.3, type: 'opening' },            // lavanderia da frente
  { x: 1.6, y: 15.6, dir: 'v', len: 1.3, type: 'opening' },            // lavanderia dos fundos
  { x: 4.6, y: 17, dir: 'h', len: 1.0, type: 'door', swing: 1 },       // entrada da casa dos fundos
  { x: 2.3, y: 20, dir: 'h', len: 0.8, type: 'door', swing: 1 },       // quarto 1 (fundos)
  { x: 3.6, y: 20, dir: 'h', len: 0.7, type: 'door', swing: 1 },       // banheiro (fundos)
  { x: 5.3, y: 20, dir: 'h', len: 0.8, type: 'door', swing: 1 },       // quarto 2 (fundos)
];

const WINDOWS: Window[] = [
  { x: 0.5, y: 2, dir: 'h', len: 1.6, room: 'living' },
  { x: 6.0, y: 2, dir: 'h', len: 1.6, room: 'bedroom_1' },
  { x: 8.5, y: 3.0, dir: 'v', len: 1.4, room: 'bedroom_1' },
  { x: 8.5, y: 5.9, dir: 'v', len: 1.6, room: 'bedroom_2' },
  { x: 8.5, y: 9.2, dir: 'v', len: 2.0, room: 'suite' },
  { x: 8.5, y: 12.5, dir: 'v', len: 0.8, room: 'suite_bath' },
  { x: 5.2, y: 14, dir: 'h', len: 1.0, room: 'suite_bath' },
  { x: 1.9, y: 14, dir: 'h', len: 1.4, room: 'kitchen' },
  { x: 2.0, y: 17, dir: 'h', len: 1.8, room: 'back_living' },
  { x: 6.4, y: 17, dir: 'h', len: 1.6, room: 'back_living' },
  { x: 8.5, y: 17.6, dir: 'v', len: 1.6, room: 'back_living' },
  { x: 0.8, y: 23.5, dir: 'h', len: 1.6, room: 'back_bedroom_1' },
  { x: 3.8, y: 23.5, dir: 'h', len: 0.8, room: 'back_bath' },
  { x: 6.6, y: 23.5, dir: 'h', len: 1.4, room: 'back_bedroom_2' },
  { x: 8.5, y: 20.8, dir: 'v', len: 1.4, room: 'back_bedroom_2' },
];

// Hammocks across the porch corners: [side wall anchor, front wall of the house].
const HAMMOCKS: [Point, Point][] = [
  [[0, 0.4], [3.0, 2]],
  [[8.5, 0.4], [5.5, 2]],
];

function buildFurniture() {
  const { out, rect, circle, bed, toilet, shower, sink, chair, sofa } = furnitureKit();
  const washer = (x: number, y: number) => { rect(x, y, 0.6, 0.6, 0.85, '#f8fafc', 0); circle(x + 0.3, y + 0.3, 0.25, 0.87, '#64748b'); };

  // Casa da frente — sala: TV on the boundary wall, sofa facing it
  rect(0.1, 3.4, 0.45, 1.8, 0.5, WOOD);
  sofa(2.2, 3.2, 0.9, 2.2, 'E');
  rect(1.1, 3.8, 0.6, 1.0, 0.4, WOOD);

  // Quarto 1: double bed against the east wall, wardrobe on the south wall
  bed(6.5, 2.7, 1.9, 1.4, 'E');
  rect(5.7, 4.6, 2.0, 0.55, 2.2, WOOD, 0);

  // Quarto 2: single bed, desk, wardrobe
  bed(6.5, 5.5, 1.9, 0.9, 'E');
  rect(4.8, 5.3, 1.0, 0.5, 0.75, WOOD);
  rect(6.0, 7.8, 2.0, 0.55, 2.2, WOOD, 0);

  // Banheiro social
  sink(0.1, 7.1, 0.8, 0.5);
  toilet(1.3, 7.05, 'N');
  shower(2.3, 7.1, 1.2, 1.0);

  // Cozinha & jantar: counter on the boundary wall (the hydraulic wall), table for 4
  rect(0.05, 9.3, 0.6, 3.1, 0.9, STONE, 0);
  sink(0.1, 10.0, 0.5, 1.0);
  [11.4, 11.85].forEach(y => [0.2, 0.5].forEach(x => circle(x, y, 0.1, 0.92, '#1f2937')));
  rect(0.05, 12.6, 0.7, 0.7, 1.85, '#e5e7eb', 0);
  rect(1.7, 10.6, 1.0, 1.4, 0.75, WOOD);
  [11.0, 11.6].forEach(y => { chair(1.45, y); chair(2.95, y); });

  // Suíte: queen bed, nightstands, wardrobe
  bed(6.4, 9.3, 2.0, 1.6, 'E');
  rect(7.95, 8.85, 0.42, 0.42, 0.55, WOOD); rect(7.95, 10.95, 0.42, 0.42, 0.55, WOOD);
  rect(4.8, 11.4, 2.4, 0.55, 2.2, WOOD, 0);

  // Banheiro da suíte
  sink(4.8, 12.1, 1.0, 0.5);
  toilet(6.2, 13.25, 'S');
  shower(7.3, 12.8, 1.1, 1.1);

  // Lavanderias under the water tower
  washer(0.1, 14.1); sink(0.85, 14.1, 0.6, 0.55);
  washer(0.1, 16.3); sink(0.85, 16.35, 0.6, 0.55);

  // Casa dos fundos — sala & cozinha: counter on the boundary wall, table, sofa
  rect(0.05, 17.1, 0.6, 2.8, 0.9, STONE, 0);
  sink(0.1, 17.6, 0.5, 0.9);
  [18.9, 19.35].forEach(y => [0.2, 0.5].forEach(x => circle(x, y, 0.1, 0.92, '#1f2937')));
  rect(0.75, 17.1, 0.7, 0.7, 1.85, '#e5e7eb', 0);
  rect(1.9, 18.2, 1.2, 0.8, 0.75, WOOD);
  [2.15, 2.85].forEach(x => { chair(x, 17.95); chair(x, 19.25); });
  sofa(5.6, 19.0, 2.4, 0.85, 'S');
  rect(6.3, 18.2, 1.0, 0.5, 0.4, WOOD);

  // Quarto 1 (fundos): double bed, wardrobe
  bed(0.1, 21.0, 1.9, 1.4, 'W');
  rect(0.1, 20.1, 1.9, 0.55, 2.2, WOOD, 0);

  // Banheiro (fundos)
  sink(4.55, 20.9, 0.5, 0.8);
  toilet(3.35, 21.8, 'W');
  shower(3.4, 22.4, 1.6, 1.0);

  // Quarto 2 (fundos): double bed, wardrobe on the bathroom wall
  bed(6.5, 21.2, 1.9, 1.4, 'E');
  rect(5.2, 21.0, 0.55, 2.0, 2.2, WOOD, 0);

  return out;
}

export const DUAS_BUDGET: BudgetItem[] = [
    { id: 'estrutura', name: 'Fundação & Estrutura', icon: 'fa-helmet-safety', color: '#f59e0b', value: 102000, desc: "Sapatas corridas, vigas baldrame, pilares e cintas das duas casas e da torre da caixa d'água." },
    { id: 'alvenaria', name: 'Alvenaria & Cobertura', icon: 'fa-cubes', color: '#6366f1', value: 88000, desc: 'Blocos cerâmicos, platibanda e telhados embutidos em uma água com manta térmica.' },
    { id: 'esquadrias', name: 'Esquadrias & Vidros', icon: 'fa-window-maximize', color: '#06b6d4', value: 60000, desc: 'Alumínio com venezianas nos quartos, portas das duas casas e portões da rua.' },
    { id: 'instalacoes', name: 'Instalações Elétricas & Hidráulicas', icon: 'fa-plug', color: '#f43f5e', value: 68000, desc: "Um medidor de água e um de luz por casa, duas caixas d'água de 1.000 L, cisterna, fossa + sumidouro." },
    { id: 'acabamentos', name: 'Acabamentos & Revestimentos', icon: 'fa-paint-roller', color: '#8b5cf6', value: 74000, desc: 'Porcelanatos, pintura, louças, metais e bancadas das duas casas.' },
    { id: 'paisagismo', name: 'Garagem, Quintal & Muros', icon: 'fa-tree', color: '#10b981', value: 26000, desc: 'Piso da garagem e do corredor, muros de divisa, quintal e jardim da frente.' },
    { id: 'projetos', name: 'Projetos & Licenças', icon: 'fa-file-signature', color: '#94a3b8', value: 22000, desc: 'Projeto arquitetônico, complementares, ART/RRT, alvará e habite-se das duas unidades.' }
];

const LOT: Rect = [0, -5, 10, 30];
const shed = ([x, y, w, h]: Rect): [number, number, number][] =>
  [[x, y, roofAt(x)], [x + w, y, roofAt(x + w)], [x + w, y + h, roofAt(x + w)], [x, y + h, roofAt(x)]];

export const DUAS_MODEL: HouseModel = {
  W, H,
  rooms: ROOMS,
  openings: OPENINGS,
  windows: WINDOWS,
  hammocks: HAMMOCKS,
  furniture: buildFurniture(),
  highSillRooms: ['suite_bath', 'back_bath'],
  dims: {
    top: [[0, 3.6], [3.6, 4.7], [4.7, 8.5]],
    left: [[0, 2], [2, 7], [7, 9.2], [9.2, 14], [14, 17], [17, 20], [20, 23.5]],
    right: [[0, 2], [2, 5.2], [5.2, 8.4], [8.4, 12], [12, 14], [14, 17], [17, 20], [20, 23.5]],
    bottom: [[0, 3.3], [3.3, 5.1], [5.1, 8.5]],
  },
  caption: 'FRENTE 8,5 × 14 m • FUNDOS 8,5 × 6,5 m • TERRENO 10 × 30 m',
  courtyardDecor: { pond: null, deck: null, trees: [[6.9, 15.5, 0.8]] },
  eave: null,
  pillars: [],
  pillarH: 0,
  roof: [shed(FRONT), shed(BACK)],
  buildings: [FRONT, TOWER, BACK],
  waterTower: { slab: TOWER, z: TOWER_SLAB, tanks: [[0.8, 14.75], [0.8, 16.25]], r: 0.72, h: 0.86 },
  utilities: {
    wetRooms: ['kitchen', 'bath', 'suite_bath', 'laundry_front', 'laundry_back', 'back_living', 'back_bath'],
    hydraulicWalls: [[[0, 9.3], [0, 20]], [[0, 7], [0, 9.2]], [[3.3, 20], [3.3, 23.5]]],
    slopes: [1, 4, 7, 10, 13, 18.5, 21.5].map(y => [[0.4, y], [8.15, y]] as Point[]),
    gutters: [[[8.3, 0], [8.3, 14]], [[8.3, 17], [8.3, 23.5]]],
    downpipes: [3, 11, 20].map(y => ({ at: [8.75, y] as Point, gutter: [8.3, y] as Point })),
    drains: [[1.8, 16.6, 6.5, 0.25]],
    traps: [[8.75, 16.7]],
    rainPipes: [
      [[8.75, 3], [9.15, 3], [9.15, 24.6], [2.8, 24.6]],
      [[8.75, 11], [9.15, 11]],
      [[8.75, 20], [9.15, 20]],
      [[8.3, 16.7], [9.15, 16.7]],
    ],
    cistern: [0.4, 23.65, 2.4, 1.2],
    cisternVolume: '~5 m³',
    overflow: [[9.55, 24.6], [9.55, -5.6]],
    emergency: null,
    sewerStubs: [
      [[0.6, 10.5], [1.75, 13.9], [1.75, 15.5]],
      [[0.6, 17.5], [1.75, 16.9], [1.75, 15.5]],
      [[2.8, 8.0], [4.2, 8.0], [4.2, 14.6], [8.85, 14.6]],
      [[6.5, 13.9], [6.5, 14.6]],
      [[4.2, 23.5], [4.2, 23.9]],
      [[1.75, 15.5], [7.9, 15.5]],
      [[8.4, 15.5], [8.85, 15.5]],
    ],
    sewerMain: [[4.2, 23.9], [8.85, 23.9], [8.85, -3.9], [8.0, -3.9]],
    greaseTrap: [7.9, 15.28, 0.5, 0.45],
    inspections: [[8.85, 14.6], [8.85, 15.5], [8.85, 23.9]],
    septic: [5.6, -4.6, 2.4, 1.4],
    septicLink: [[6.8, -3.2], [6.8, -2.7]],
    soakaway: { at: [6.8, -2.0], r: 0.7 },
    waterTank: [0.08, 14.05, 1.44, 2.9],
    solar: [5.0, 12.25, 1.8, 1.3],
    board: [0.2, 2.15, 1.0, 0.35],
    legend: {
      slope: 'Telhados embutidos em uma água, caindo para o corredor sul: nenhuma água vai para o vizinho',
      gutter: 'Calhas atrás da platibanda sul → 3 condutores Ø100 no corredor',
      drain: 'Condutores + ralo do quintal → caixa de areia (CA) → cisterna no fundo → extravasor até a rua',
      sewer: 'Esgoto pelo corredor → caixa de gordura (CG) → fossa (F) + sumidouro (S) sob o jardim da frente, perto da rua para o caminhão limpa-fossa',
      hydraulic: "Parede hidráulica na divisa norte: cozinhas, banheiro social e lavanderias alinhados com a caixa d'água",
      tank: "Torre no quintal do meio: uma caixa de 1.000 L para cada casa, a ~3 m das duas cozinhas",
      board: 'Um quadro (QD) e um medidor de luz e de água por casa',
    },
    drainsToPatio: false,
  },
  wind: {
    // East is the street side (top), so the breezes come in from the front and down the south walkway.
    breezes: [
      [[2.0, -6.2], [2.0, -3], [2.2, 0.5], [2.0, 4.6]],
      [[6.8, -6.2], [6.8, -3], [6.8, 0.5], [6.6, 3.6]],
      [[W + 3.5, -6.0], [W + 0.9, -2], [W + 0.75, 6], [6.4, 6.8]],
      [[W + 3.5, -6.0], [W + 0.9, 4], [W + 0.75, 15.5], [3.2, 15.5]],
      [[W + 3.5, -6.0], [W + 0.9, 8], [W + 0.75, 18.4], [4.0, 18.6]],
    ],
    hot: null,
    labels: [
      { at: [0.2, -6.6], text: 'BRISA LESTE', anchor: 'start' },
      { at: [W + 4.78, -6.6], text: 'BRISA SUDESTE', anchor: 'end' },
    ],
  },
  lot: {
    rect: LOT,
    cars: [[0.35, -4.75, 1.85, 4.5], [2.95, -4.75, 1.85, 4.5]],
    paths: [[8.5, -5, 1.5, 28.5], [5.2, -1, 3.3, 1]],
    notes: [
      { at: [5, -5.7], text: 'RUA • TERRENO 10 × 30 m' },
      { at: [2.58, -2.5], text: 'GARAGEM 2 VAGAS', vertical: true },
      { at: [6.85, -4.3], text: 'JARDIM' },
      { at: [9.25, -2.5], text: 'PORTÃO SOCIAL', vertical: true },
      { at: [9.25, 7], text: 'CORREDOR PARA A CASA DOS FUNDOS', vertical: true },
      { at: [5.3, 24.25], text: 'QUINTAL 1,5 m' },
    ],
  },
  north: 270,
  view: planView(W, H, LOT),
};
