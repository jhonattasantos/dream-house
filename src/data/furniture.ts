// Indicative furniture layout in meters, shared by the 2D plan and the 3D view.
// Each piece is a footprint plus the height it rises to (z, in meters) and a 3D color.

export type FurniturePiece =
  | { kind: 'rect'; x: number; y: number; w: number; h: number; z: number; color: string; round?: number }
  | { kind: 'circle'; x: number; y: number; r: number; z: number; color: string }
  | { kind: 'ellipse'; x: number; y: number; rx: number; ry: number; z: number; color: string }
  /** Lines are drawing details in 2D; with a height they become thin partitions in 3D. */
  | { kind: 'line'; x1: number; y1: number; x2: number; y2: number; z?: number; color: string; strong?: boolean };

const WOOD = '#a47551';
const FABRIC = '#94a3b8';
const WHITE = '#f8fafc';
const STONE = '#d6d3d1';
const DARK = '#1f2937';

type Side = 'N' | 'S' | 'E' | 'W';

function buildFurniture(): FurniturePiece[] {
  const out: FurniturePiece[] = [];
  const rect = (x: number, y: number, w: number, h: number, z = 0.45, color = STONE, round = 2) =>
    out.push({ kind: 'rect', x, y, w, h, z, color, round });
  const circle = (x: number, y: number, r: number, z = 0.45, color = FABRIC) => out.push({ kind: 'circle', x, y, r, z, color });
  const ellipse = (x: number, y: number, rx: number, ry: number, z: number, color = WHITE) =>
    out.push({ kind: 'ellipse', x, y, rx, ry, z, color });
  const line = (x1: number, y1: number, x2: number, y2: number, z?: number, strong = false) =>
    out.push({ kind: 'line', x1, y1, x2, y2, z, color: WHITE, strong });

  // Bed with pillows on the headboard side.
  const bed = (x: number, y: number, w: number, h: number, head: Side) => {
    rect(x, y, w, h, 0.5, WHITE);
    const vertical = head === 'N' || head === 'S';
    const n = (vertical ? w : h) > 1.2 ? 2 : 1;
    const span = (vertical ? w : h) - 0.2, pw = span / n - 0.05;
    for (let i = 0; i < n; i++) {
      const o = 0.1 + i * (span / n) + 0.025;
      if (head === 'N') rect(x + o, y + 0.1, pw, 0.35, 0.62, '#e2e8f0');
      if (head === 'S') rect(x + o, y + h - 0.45, pw, 0.35, 0.62, '#e2e8f0');
      if (head === 'W') rect(x + 0.1, y + o, 0.35, pw, 0.62, '#e2e8f0');
      if (head === 'E') rect(x + w - 0.45, y + o, 0.35, pw, 0.62, '#e2e8f0');
    }
    if (head === 'N') line(x, y + 0.65, x + w, y + 0.65);
    if (head === 'S') line(x, y + h - 0.65, x + w, y + h - 0.65);
    if (head === 'W') line(x + 0.65, y, x + 0.65, y + h);
    if (head === 'E') line(x + w - 0.65, y, x + w - 0.65, y + h);
  };
  // Toilet with its tank against the wall on the given side.
  const toilet = (x: number, y: number, back: Side) => {
    const horizontal = back === 'E' || back === 'W';
    const [tw, th] = horizontal ? [0.2, 0.42] : [0.42, 0.2];
    const tx = back === 'E' ? x + 0.5 : x, ty = back === 'S' ? y + 0.5 : y;
    rect(tx, ty, tw, th, 0.8, WHITE);
    const bx = horizontal ? (back === 'E' ? x + 0.25 : x + 0.45) : x + 0.21;
    const by = horizontal ? y + 0.21 : back === 'S' ? y + 0.25 : y + 0.45;
    ellipse(bx, by, horizontal ? 0.25 : 0.18, horizontal ? 0.18 : 0.25, 0.42);
  };
  const shower = (x: number, y: number, w: number, h: number) => {
    rect(x, y, w, h, 0.04, '#cbd5e1', 0);
    line(x, y, x + w, y + h);
    line(x + w, y, x, y + h);
  };
  const sink = (x: number, y: number, w: number, h: number) => {
    rect(x, y, w, h, 0.85, STONE);
    ellipse(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, Math.min(w, h) * 0.25, 0.87);
  };
  const chair = (x: number, y: number) => circle(x, y, 0.22, 0.45, WOOD);
  const sofa = (x: number, y: number, w: number, h: number, back: Side) => {
    rect(x, y, w, h, 0.42, FABRIC);
    if (back === 'N') rect(x, y, w, 0.25, 0.8, FABRIC);
    if (back === 'S') rect(x, y + h - 0.25, w, 0.25, 0.8, FABRIC);
    if (back === 'E') rect(x + w - 0.25, y, 0.25, h, 0.8, FABRIC);
    if (back === 'W') rect(x, y, 0.25, h, 0.8, FABRIC);
  };

  // Hall & garagem: one car and a sideboard by the door
  rect(11.4, 0.55, 4.4, 1.85, 1.3, '#475569', 10);
  rect(12.3, 0.75, 0.6, 1.45, 1.36, DARK, 3);
  rect(14.5, 0.75, 0.5, 1.45, 1.36, DARK, 3);
  rect(5.6, 2.35, 1.6, 0.4, 0.8, WOOD);

  // Home office: desk under the window, bookcase, meeting table
  rect(1.1, 0.15, 2.0, 0.7, 0.75, WOOD);
  chair(2.1, 1.15);
  rect(0.1, 0.9, 0.4, 2.4, 2.0, WOOD, 0);
  circle(3.7, 2.75, 0.45, 0.75, WOOD);
  chair(3.05, 2.85); chair(4.35, 2.85);

  // Quarto 3: double bed, nightstands, wardrobe
  bed(1.8, 3.6, 1.4, 1.9, 'N');
  rect(1.3, 3.6, 0.45, 0.4, 0.55, WOOD); rect(3.25, 3.6, 0.45, 0.4, 0.55, WOOD);
  rect(0.3, 6.85, 3.0, 0.6, 2.2, WOOD, 0);

  // Banheiro quarto 3 (fixtures on the hydraulic wall)
  shower(0.1, 8.3, 1.2, 1.1);
  toilet(1.75, 8.75, 'S');
  sink(2.6, 8.95, 1.3, 0.45);

  // Área de serviço
  circle(0.5, 9.95, 0.27, 0.87, '#64748b'); rect(0.2, 9.65, 0.6, 0.6, 0.85, WHITE, 0);
  circle(1.2, 9.95, 0.27, 0.87, '#64748b'); rect(0.9, 9.65, 0.6, 0.6, 0.85, WHITE, 0);
  sink(1.65, 9.65, 0.65, 0.55);
  rect(2.45, 9.65, 1.5, 0.5, 0.9, STONE, 0);

  // BWC & closet master: bath to the west, walk-in closet to the east
  line(1.9, 14, 1.9, 16.2, 2.2, true);
  sink(0.1, 14.1, 1.7, 0.5);
  toilet(0.1, 15.0, 'W');
  shower(0.1, 16.6, 1.5, 1.3);
  rect(2.0, 14.1, 2.4, 0.55, 2.2, WOOD, 0);
  rect(3.85, 14.65, 0.55, 1.6, 2.2, WOOD, 0);
  rect(2.5, 15.5, 0.9, 0.6, 0.9, WOOD);

  // Suíte master: king bed against the east wall
  bed(8.0, 15.0, 1.95, 1.95, 'E');
  rect(9.5, 14.5, 0.45, 0.42, 0.55, WOOD); rect(9.5, 17.0, 0.45, 0.42, 0.55, WOOD);
  rect(4.6, 14.3, 0.5, 1.5, 0.9, WOOD);
  circle(5.3, 17.3, 0.35);

  // Lavabo & banheiro social (fixtures on the kitchen wall)
  toilet(12.25, 14.9, 'E');
  sink(12.45, 15.7, 0.5, 0.8);
  shower(11.6, 16.6, 1.35, 1.3);

  // Cozinha: L counter, fridge, island
  rect(14.3, 17.35, 6.6, 0.6, 0.9, STONE, 0);
  rect(20.35, 14.6, 0.6, 2.75, 0.9, STONE, 0);
  sink(16.2, 17.4, 1.0, 0.5);
  [18.3, 18.75].forEach(x => [17.5, 17.8].forEach(y => circle(x, y, 0.1, 0.92, DARK)));
  rect(13.1, 16.9, 0.75, 1.0, 1.85, '#e5e7eb', 0);
  rect(14.6, 15.3, 2.4, 0.9, 0.9, STONE);
  [15.1, 15.8, 16.5].forEach(x => chair(x, 14.95));

  // Sala de estar: sofa, coffee table, TV rack, armchair
  rect(17.3, 5.1, 2.2, 0.4, 0.5, WOOD);
  sofa(16.9, 7.6, 2.8, 0.9, 'S');
  rect(17.6, 6.4, 1.4, 0.6, 0.4, WOOD);
  circle(20.3, 6.6, 0.4);
  // Jantar: table for 8
  rect(17.9, 10.8, 1.1, 2.2, 0.75, WOOD);
  [11.2, 11.9, 12.6].forEach(y => { chair(17.55, y); chair(19.35, y); });
  chair(18.45, 10.45); chair(18.45, 13.35);

  // Suíte hóspedes: queen bed, nightstands, wardrobe
  bed(17.8, 3.0, 1.6, 1.95, 'S');
  rect(17.3, 4.5, 0.45, 0.42, 0.55, WOOD); rect(19.45, 4.5, 0.45, 0.42, 0.55, WOOD);
  rect(16.1, 2.3, 0.6, 2.6, 2.2, WOOD, 0);

  // Varanda: two armchairs and a side table facing the garden
  chair(9.8, 13.2); chair(11.2, 13.2); circle(10.5, 13.3, 0.18, 0.5, WOOD);

  return out;
}

export const FURNITURE: FurniturePiece[] = buildFurniture();
