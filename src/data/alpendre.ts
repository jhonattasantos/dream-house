// Casa do Alpendre: a single-storey house for a 10 × 30 m lot in Mamanguape (PB).
// House coordinates in meters from the top-left corner of the drawing, which sits on a side boundary.
// The street (top of the drawing) faces east, so the sun rises in front and the breeze blows from the
// front to the back. The left wall is on the north boundary (no windows there); the 1.5 m setback on the
// right faces south, gets almost no direct sun, catches the SE breeze and takes the rainwater.
import { planView, type HouseModel } from '../lib/model';
import type { BudgetItem } from './budget';
import { DARK, STONE, WOOD, furnitureKit } from './furniture';
import type { Opening, Point, Window } from './openings';
import type { Rect, Room, RoomKey } from './rooms';

const W = 8.5;
const H = 21;
// Roof: one water, embedded behind the parapet, falling from the north boundary to the south setback.
const ROOF_WEST = 3.65;
const ROOF_EAST = 3.1;
const roofAt = (x: number) => ROOF_WEST + ((ROOF_EAST - ROOF_WEST) * x) / W;

const ROOMS: Record<RoomKey, Room> = {
  porch: {
    name: 'Alpendre das Redes',
    subtitle: 'Entrada & Descanso',
    height: '2.60 m',
    floor: 'Cerâmica Rústica Antiderrapante',
    light: 'Leste (rua), Sombreada',
    icon: 'fa-person-walking-arrow-right',
    benefits: [
      'Duas redes armadas na diagonal dos cantos (3,4 m entre armadores).',
      'Recebe o sol da manhã e a brisa leste de frente, e sombreia as janelas da sala.',
    ],
    patioRel: 'É a varanda de frente da casa; o pátio fica no miolo, visto da sala.',
    rects: [[0, 0, 8.5, 2]],
    fill: '#334155', fillOpacity: 0.3, text: '#cbd5e1',
  },
  living: {
    name: 'Sala de Estar & Jantar',
    subtitle: 'Zona Social',
    height: '3.20 m',
    floor: 'Porcelanato Acetinado',
    light: 'Leste (alpendre) + Sul + Pátio',
    icon: 'fa-couch',
    benefits: [
      'Recebe a brisa leste pelo alpendre e a sudeste pelo recuo sul, e a solta no pátio (ventilação cruzada).',
      'Integrada à cozinha por um balcão, sem portas no caminho.',
      'A TV fica na parede da divisa, que não tem janelas.',
    ],
    patioRel: 'Porta de correr inteira para o pátio, que vira extensão da sala.',
    rects: [[0, 2, 8.5, 5]],
    fill: '#1e1b4b', fillOpacity: 0.4, text: '#c7d2fe',
  },
  hallway: {
    name: 'Galeria do Pátio',
    subtitle: 'Circulação',
    height: '3.40 m',
    floor: 'Cerâmica Atérmica',
    light: 'Pátio (Norte)',
    icon: 'fa-shoe-prints',
    benefits: [
      'Liga a sala aos quartos e ao quintal pela beira do pátio, sempre iluminada.',
      'Aberta para o pátio: o ar que entra pelos quartos e pela cozinha sai por aqui.',
    ],
    patioRel: 'Corre ao longo do pátio, separada dele só por um pilar.',
    rects: [[3, 7, 1.2, 14]],
    dimsLabel: 'Largura 1,20 m',
    walls: false,
    fill: '#0f172a', fillOpacity: 0.8, text: '#94a3b8',
  },
  courtyard: {
    name: 'Pátio Interno',
    subtitle: 'Jardim & Ventilação',
    height: 'Descoberto (Céu Aberto)',
    floor: 'Grama & Deck',
    light: 'Zenital',
    icon: 'fa-tree',
    benefits: [
      'Efeito chaminé: o ar quente da casa sobe pelo pátio e puxa a brisa pela frente e pelo recuo sul.',
      'Dá luz e ventilação à sala, ao quarto 2 e à galeria, que estão longe das fachadas.',
      'Fica junto à divisa norte: o muro alto sombreia o pátio no inverno, quando o sol passa ao norte, e dá privacidade.',
    ],
    patioRel: 'É o coração da casa, cercado pela sala, pela galeria e pelo quarto 2.',
    rects: [[0, 7, 3, 6]],
    uncovered: true,
    walls: false,
    fill: '#064e3b', fillOpacity: 0.35, text: '#6ee7b7',
  },
  kitchen: {
    name: 'Cozinha',
    subtitle: 'Integrada à Sala',
    height: '3.00 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Sul',
    icon: 'fa-utensils',
    benefits: [
      'Bancada em L com a pia sob a janela do recuo sul, que quase não recebe sol direto.',
      'Aberta para a sala: quem cozinha participa da conversa.',
    ],
    patioRel: 'Vê o pátio através da sala e da galeria.',
    rects: [[4.2, 7, 4.3, 4]],
    fill: '#4c0519', fillOpacity: 0.3, text: '#fecdd3',
  },
  service: {
    name: 'Área de Serviço',
    subtitle: 'Lavanderia',
    height: '3.00 m',
    floor: 'Cerâmica Antiderrapante',
    light: 'Sul',
    icon: 'fa-jug-detergent',
    benefits: [
      'Porta direta para o recuo sul, onde fica o varal, no corredor da brisa sudeste.',
      'Na mesma parede hidráulica da cozinha.',
    ],
    patioRel: 'Fica atrás da cozinha, fora da vista da sala.',
    rects: [[4.2, 11, 4.3, 2]],
    fill: '#1e293b', fillOpacity: 0.4, text: '#cbd5e1',
  },
  bedroom_2: {
    name: 'Quarto 2',
    subtitle: 'Solteiro / Hóspedes',
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Pátio (Leste)',
    icon: 'fa-bed',
    benefits: [
      'Janela para o pátio: luz filtrada pela árvore e privacidade total.',
      'Não pega sol da tarde: a janela olha para o pátio, a leste, e a parede norte é a da divisa.',
    ],
    patioRel: 'A janela do quarto se abre direto para o jardim.',
    rects: [[0, 13, 3, 3.5]],
    fill: '#065f46', fillOpacity: 0.3, text: '#a7f3d0',
  },
  bedroom_3: {
    name: 'Quarto 3',
    subtitle: 'Casal',
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Oeste (Quintal)',
    icon: 'fa-bed',
    benefits: [
      'Janela para o quintal, longe da rua; veneziana e uma árvore no quintal seguram o sol da tarde.',
      'Cama de casal com guarda-roupa de 2 m.',
    ],
    patioRel: 'Fica no fundo, perto do quintal e longe da rua.',
    rects: [[0, 16.5, 3, 4.5]],
    fill: '#3b0764', fillOpacity: 0.3, text: '#e9d5ff',
  },
  suite: {
    name: 'Suíte',
    subtitle: 'Dormitório Principal',
    height: '3.00 m',
    floor: 'Vinílico Amadeirado',
    light: 'Sul',
    icon: 'fa-bed',
    benefits: [
      'Janela para o recuo sul: quase sem sol direto e com a brisa sudeste entrando de frente.',
      'Banheiro próprio e guarda-roupa de 2,5 m.',
    ],
    patioRel: 'A porta abre para a galeria, a poucos passos do pátio.',
    rects: [[4.2, 13, 4.3, 4.5]],
    fill: '#172554', fillOpacity: 0.45, text: '#bfdbfe',
  },
  suite_bath: {
    name: 'Banheiro da Suíte',
    subtitle: 'Banheiro Privativo',
    height: '2.80 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Oeste + Sul',
    icon: 'fa-shower',
    benefits: [
      'Janelas altas para o quintal e o recuo: ventila sem perder privacidade.',
      'Parede hidráulica compartilhada com o banheiro social.',
    ],
    patioRel: 'Fica no fundo, junto ao quintal.',
    rects: [[6, 17.5, 2.5, 3.5]],
    fill: '#164e63', fillOpacity: 0.3, text: '#a5f3fc',
  },
  bath_social: {
    name: 'Banheiro Social',
    subtitle: 'Banheiro dos Quartos',
    height: '2.80 m',
    floor: 'Porcelanato Antiderrapante',
    light: 'Oeste',
    icon: 'fa-restroom',
    benefits: [
      'Atende o quarto 2, o quarto 3 e as visitas, com porta para a galeria.',
      'Janela alta para o quintal.',
    ],
    patioRel: 'Fica no fim da galeria, perto da porta do quintal.',
    rects: [[4.2, 17.5, 1.8, 3.5]],
    fill: '#164e63', fillOpacity: 0.3, text: '#a5f3fc',
  },
};

const OPENINGS: Opening[] = [
  { x: 0.3, y: 0, dir: 'h', len: 3.8, type: 'opening' },            // alpendre (frente aberta)
  { x: 4.4, y: 0, dir: 'h', len: 3.8, type: 'opening' },            // alpendre (frente aberta)
  { x: 3.8, y: 2, dir: 'h', len: 1.0, type: 'door', swing: 1 },     // entrada da sala
  { x: 0.4, y: 7, dir: 'h', len: 2.2, type: 'opening' },            // sala → pátio (porta de correr)
  { x: 3, y: 7, dir: 'h', len: 1.2, type: 'opening' },              // sala → galeria
  { x: 4.6, y: 7, dir: 'h', len: 3.5, type: 'opening' },            // sala ↔ cozinha
  { x: 5.0, y: 11, dir: 'h', len: 0.8, type: 'door', swing: 1 },    // cozinha → serviço
  { x: 8.5, y: 11.6, dir: 'v', len: 0.8, type: 'door', swing: -1 }, // serviço → recuo sul
  { x: 3, y: 13.4, dir: 'v', len: 0.8, type: 'door', swing: -1 },   // quarto 2
  { x: 4.2, y: 13.3, dir: 'v', len: 0.8, type: 'door', swing: 1 },  // suíte
  { x: 3, y: 16.9, dir: 'v', len: 0.8, type: 'door', swing: -1 },   // quarto 3
  { x: 6.4, y: 17.5, dir: 'h', len: 0.7, type: 'door', swing: 1 },  // banheiro da suíte
  { x: 4.2, y: 18.0, dir: 'v', len: 0.7, type: 'door', swing: 1 },  // banheiro social
  { x: 3.2, y: 21, dir: 'h', len: 0.8, type: 'door', swing: -1 },   // galeria → quintal
];

const WINDOWS: Window[] = [
  { x: 0.8, y: 2, dir: 'h', len: 1.8, room: 'living' },
  { x: 5.9, y: 2, dir: 'h', len: 1.8, room: 'living' },
  { x: 8.5, y: 3.2, dir: 'v', len: 2.5, room: 'living' },
  { x: 8.5, y: 7.8, dir: 'v', len: 2, room: 'kitchen' },
  { x: 0.6, y: 13, dir: 'h', len: 1.8, room: 'bedroom_2' },
  { x: 8.5, y: 14, dir: 'v', len: 2, room: 'suite' },
  { x: 0.6, y: 21, dir: 'h', len: 1.8, room: 'bedroom_3' },
  { x: 4.7, y: 21, dir: 'h', len: 0.8, room: 'bath_social' },
  { x: 6.8, y: 21, dir: 'h', len: 1, room: 'suite_bath' },
  { x: 8.5, y: 18.5, dir: 'v', len: 1, room: 'suite_bath' },
];

// Hammocks across the porch corners: [boundary/side wall anchor, front wall of the living room].
const HAMMOCKS: [Point, Point][] = [
  [[0, 0.4], [3.0, 2]],
  [[8.5, 0.4], [5.5, 2]],
];

function buildFurniture() {
  const { out, rect, circle, bed, toilet, shower, sink, chair, sofa } = furnitureKit();

  // Sala: TV on the boundary wall, sofa facing it; table for 6 by the kitchen
  rect(0.1, 3.2, 0.45, 1.8, 0.5, WOOD);
  sofa(2.0, 3.0, 0.9, 2.2, 'E');
  rect(1.0, 3.6, 0.6, 1.0, 0.4, WOOD);
  rect(5.6, 3.4, 1.8, 1.0, 0.75, WOOD);
  [6.0, 6.5, 7.0].forEach(x => { chair(x, 3.1); chair(x, 4.7); });
  chair(5.3, 3.9); chair(7.7, 3.9);

  // Cozinha: L counter with the sink under the east window, fridge by the service door
  rect(7.85, 7.5, 0.6, 3.4, 0.9, STONE, 0);
  rect(6.0, 10.35, 1.85, 0.6, 0.9, STONE, 0);
  sink(7.9, 8.2, 0.5, 1.0);
  [9.75, 10.2].forEach(y => [8.0, 8.3].forEach(x => circle(x, y, 0.1, 0.92, DARK)));
  rect(4.3, 10.15, 0.7, 0.75, 1.85, '#e5e7eb', 0);

  // Área de serviço: washer, tanque and shelf on the suite wall
  circle(4.65, 12.6, 0.27, 0.87, '#64748b'); rect(4.35, 12.3, 0.6, 0.6, 0.85, '#f8fafc', 0);
  sink(5.1, 12.35, 0.65, 0.55);
  rect(5.9, 12.45, 1.2, 0.5, 0.9, STONE, 0);

  // Quarto 2: single bed, wardrobe
  bed(0.1, 14.3, 1.9, 0.9, 'W');
  rect(0.3, 15.85, 2.0, 0.6, 2.2, WOOD, 0);

  // Quarto 3: double bed, nightstands, wardrobe
  bed(0.1, 17.8, 1.9, 1.4, 'W');
  rect(0.1, 17.33, 0.42, 0.42, 0.55, WOOD); rect(0.1, 19.25, 0.42, 0.42, 0.55, WOOD);
  rect(0.1, 16.6, 2.0, 0.6, 2.2, WOOD, 0);

  // Suíte: queen bed against the service wall, nightstands, wardrobe
  bed(5.6, 13.05, 1.6, 2.0, 'N');
  rect(5.1, 13.05, 0.45, 0.42, 0.55, WOOD); rect(7.25, 13.05, 0.45, 0.42, 0.55, WOOD);
  rect(4.25, 14.9, 0.6, 2.5, 2.2, WOOD, 0);

  // Banheiro social
  sink(5.45, 17.6, 0.5, 0.8);
  toilet(5.3, 18.9, 'E');
  shower(4.3, 19.8, 1.6, 1.1);

  // Banheiro da suíte (fixtures on the shared hydraulic wall and the east wall)
  sink(7.9, 17.6, 0.5, 1.0);
  toilet(6.05, 18.6, 'W');
  shower(6.1, 19.7, 2.3, 1.2);

  return out;
}

export const ALPENDRE_BUDGET: BudgetItem[] = [
    { id: 'estrutura', name: 'Fundação & Estrutura', icon: 'fa-helmet-safety', color: '#f59e0b', value: 92000, desc: 'Sapatas corridas, vigas baldrame, pilares e cintas em concreto armado.' },
    { id: 'alvenaria', name: 'Alvenaria & Cobertura', icon: 'fa-cubes', color: '#6366f1', value: 80000, desc: 'Blocos cerâmicos, platibanda e telhado embutido em uma água com manta térmica.' },
    { id: 'esquadrias', name: 'Esquadrias & Vidros', icon: 'fa-window-maximize', color: '#06b6d4', value: 62000, desc: 'Alumínio com venezianas nos quartos e porta de correr da sala para o pátio.' },
    { id: 'instalacoes', name: 'Instalações Elétricas & Hidráulicas', icon: 'fa-plug', color: '#f43f5e', value: 56000, desc: 'Quadro de distribuição, água fria/quente, cisterna e fossa + sumidouro.' },
    { id: 'acabamentos', name: 'Acabamentos & Revestimentos', icon: 'fa-paint-roller', color: '#8b5cf6', value: 64000, desc: 'Porcelanatos, pintura, louças, metais e bancadas.' },
    { id: 'paisagismo', name: 'Paisagismo, Pátio & Muros', icon: 'fa-tree', color: '#10b981', value: 22000, desc: 'Jardim do pátio, muros de divisa, portão e piso drenante da vaga.' },
    { id: 'projetos', name: 'Projetos & Licenças', icon: 'fa-file-signature', color: '#94a3b8', value: 20000, desc: 'Projeto arquitetônico, complementares, ART/RRT, alvará e habite-se.' }
];

const LOT: Rect = [0, -5, 10, 30];

export const ALPENDRE_MODEL: HouseModel = {
  W, H,
  rooms: ROOMS,
  openings: OPENINGS,
  windows: WINDOWS,
  hammocks: HAMMOCKS,
  furniture: buildFurniture(),
  highSillRooms: ['bath_social', 'suite_bath'],
  dims: {
    top: [[0, 3], [3, 4.2], [4.2, 8.5]],
    left: [[0, 2], [2, 7], [7, 13], [13, 16.5], [16.5, 21]],
    right: [[0, 2], [2, 7], [7, 11], [11, 13], [13, 17.5], [17.5, 21]],
    bottom: [[0, 3], [3, 4.2], [4.2, 6], [6, 8.5]],
  },
  caption: 'CONSTRUÇÃO 8,5 × 21 m • TERRENO 10 × 30 m',
  courtyardDecor: { pond: [0.4, 11.6, 1.8, 0.9], deck: [0, 7, 3, 1.2], trees: [[1.6, 9.8, 0.85]] },
  eave: null,
  pillars: [[3, 10]],
  pillarH: roofAt(3),
  roof: ([[0, 0, 8.5, 7], [3, 7, 5.5, 6], [0, 13, 8.5, 8]] as const).map(([x, y, w, h]) => [
    [x, y, roofAt(x)], [x + w, y, roofAt(x + w)], [x + w, y + h, roofAt(x + w)], [x, y + h, roofAt(x)],
  ]),
  utilities: {
    wetRooms: ['kitchen', 'service', 'bath_social', 'suite_bath'],
    hydraulicWalls: [[[6, 17.5], [6, 21]], [[8.5, 7], [8.5, 13]]],
    slopes: [1, 4.5, 9, 11.5, 15.5, 19.5].map(y => [[y > 7 && y < 13 ? 3.3 : 0.4, y], [8.15, y]] as Point[]),
    gutters: [[[8.3, 0], [8.3, 21]]],
    downpipes: [3, 10.5, 18].map(y => ({ at: [8.75, y] as Point, gutter: [8.3, y] as Point })),
    drains: [[0.15, 7.15, 2.7, 5.7]],
    traps: [[2.6, 12.6]],
    rainPipes: [
      [[8.75, 3], [9.15, 3], [9.15, 22.3]],
      [[8.75, 10.5], [9.15, 10.5]],
      [[8.75, 18], [9.15, 18]],
      [[2.6, 12.6], [2.6, 12.85], [9.15, 12.85]],
    ],
    cistern: [7.9, 22.3, 1.8, 2.2],
    cisternVolume: '~6 m³',
    overflow: [[9.55, 22.3], [9.55, -5.6]],
    emergency: null,
    sewerStubs: [[[5.1, 21], [5.1, 21.45]], [[7.2, 21], [7.2, 21.45]], [[8.5, 12.4], [8.85, 12.4]], [[8.5, 9.0], [8.6, 9.0]]],
    sewerMain: [[8.85, 9.25], [8.85, 21.45], [1.6, 21.45], [1.6, 22.2]],
    greaseTrap: [8.6, 8.8, 0.5, 0.45],
    inspections: [[8.85, 21.45], [1.6, 21.45]],
    septic: [0.4, 22.2, 2.4, 1.5],
    septicLink: [[2.8, 22.95], [3.7, 23.3]],
    soakaway: { at: [4.5, 23.3], r: 0.8 },
    waterTank: [4.35, 18.1, 1.5, 0.8],
    solar: [6.15, 18.1, 2.0, 0.8],
    board: [1.0, 2.15, 1.2, 0.4],
    legend: {
      slope: 'Telhado embutido em uma água, caindo para o recuo sul: nenhuma água vai para o vizinho',
      gutter: 'Calha atrás da platibanda sul → 3 condutores Ø100 no recuo',
      drain: 'Condutores + ralo do pátio → caixa de areia (CA) → cisterna no quintal → extravasor até a rua',
      sewer: 'Esgoto pelo recuo sul → caixa de gordura (CG) → fossa séptica (F) + sumidouro (S) no quintal',
      hydraulic: 'Parede hidráulica: banheiros lado a lado; cozinha e serviço na mesma parede',
      tank: "Caixa d'água + aquecedor solar sobre os banheiros",
      board: 'Quadro de distribuição (QD) junto à entrada',
    },
    drainsToPatio: false,
  },
  wind: {
    // East is the street side (top), so the breezes come in from the front and down the south setback.
    breezes: [
      [[1.8, -6.2], [1.8, -3], [2.0, 0.5], [1.8, 5.2]],
      [[6.2, -6.2], [6.2, -3], [6.0, 0.5], [5.4, 4.8]],
      [[W + 3.5, -6.0], [W + 0.9, -2], [W + 0.75, 6], [6.0, 9.2]],
      [[W + 3.5, -6.0], [W + 0.9, 2], [W + 0.75, 13], [5.6, 15.2]],
    ],
    hot: null,
    labels: [
      { at: [0.2, -6.6], text: 'BRISA LESTE', anchor: 'start' },
      { at: [W + 4.78, -6.6], text: 'BRISA SUDESTE', anchor: 'end' },
      { at: [1.5, 8.2], text: '↑ CHAMINÉ', hot: true },
    ],
  },
  lot: {
    rect: LOT,
    cars: [[7.65, -4.7, 1.85, 4.4]],
    paths: [],
    notes: [
      { at: [5, -5.7], text: 'RUA • TERRENO 10 × 30 m' },
      { at: [3.2, -2.5], text: 'RECUO FRONTAL 5 m • JARDIM' },
      { at: [7.2, -2.5], text: 'VAGA', vertical: true },
      { at: [9.25, 7], text: 'RECUO LATERAL 1,5 m', vertical: true },
      { at: [4.3, 24.4], text: 'QUINTAL 4 m' },
    ],
  },
  north: 270,
  view: planView(W, H, LOT),
};
