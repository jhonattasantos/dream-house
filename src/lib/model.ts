import { FURNITURE, type FurniturePiece } from '../data/furniture';
import { HAMMOCKS, OPENINGS, WINDOWS, type Opening, type Point, type Window } from '../data/openings';
import { ROOMS_DEFAULT, withSizeTexts, type Rect, type Room, type RoomKey } from '../data/rooms';
import { X, Y, clamp } from './geometry';
import { EAVE, ROOF_INNER_H, ROOF_OUTER_H } from './walls3d';

// The Casa de Pátio data in src/data is drawn at 21 × 18 m; the smaller options shrink that drawing proportionally.
export const BASE_W = 21;
export const BASE_H = 18;
export const SIZES = [16.5, 18, 19.5, 21] as const;
export type HouseSize = (typeof SIZES)[number];
export const DEFAULT_SIZE: HouseSize = SIZES[0];

export type Span = [number, number];
/** A roof plane as four [x, y, height] corners in plan meters. */
export type RoofQuad = [number, number, number][];

/** Rainwater, sewage and services drawn by the Instalações layer, in plan meters. */
export interface UtilitiesPlan {
  wetRooms: RoomKey[];
  hydraulicWalls: Point[][];
  /** Roof fall arrows. */
  slopes: Point[][];
  gutters: Point[][];
  /** Downpipes and the short link from each one to its gutter. */
  downpipes: { at: Point; gutter: Point }[];
  drains: Rect[];
  /** Sand traps (CA). */
  traps: Point[];
  rainPipes: Point[][];
  cistern: Rect;
  cisternVolume: string;
  overflow: Point[];
  emergency: Point[] | null;
  sewerStubs: Point[][];
  sewerMain: Point[];
  greaseTrap: Rect;
  inspections: Point[];
  septic: Rect;
  septicLink: Point[];
  soakaway: { at: Point; r: number };
  waterTank: Rect;
  solar: Rect;
  board: Rect;
  /** Legend texts, keyed by the swatch drawn next to them. */
  legend: Partial<Record<'slope' | 'gutter' | 'drain' | 'emergency' | 'sewer' | 'hydraulic' | 'tank' | 'board', string>>;
  /** true when the whole roof empties into the courtyard (implúvio). */
  drainsToPatio: boolean;
}

export interface WindPlan {
  /** Cubic curves [start, control, control, end]. */
  breezes: Point[][];
  hot: Point[] | null;
  labels: { at: Point; text: string; hot?: boolean; anchor?: 'start' | 'middle' | 'end' }[];
}

/** The lot around the house, for projects designed for a specific terrain. */
export interface LotPlan {
  rect: Rect;
  car: Rect;
  notes: { at: Point; text: string; vertical?: boolean }[];
}

export interface HouseModel {
  W: number;
  H: number;
  /** Rooms before the user's text edits. */
  rooms: Record<RoomKey, Room>;
  openings: Opening[];
  windows: Window[];
  hammocks: [Point, Point][];
  furniture: FurniturePiece[];
  /** Rooms whose windows sit high (bathrooms). */
  highSillRooms: RoomKey[];
  /** Partial dimension chains along each side; the overall width and depth are always drawn. */
  dims: { top: Span[]; left: Span[]; right: Span[]; bottom: Span[] };
  caption: string;
  courtyardDecor: { pond: Rect | null; deck: Rect | null; trees: [number, number, number][] };
  /** Roof edge drawn dashed over the courtyard. */
  eave: Rect | null;
  pillars: Point[];
  pillarH: number;
  roof: RoofQuad[];
  utilities: UtilitiesPlan;
  wind: WindPlan;
  lot: LotPlan | null;
  /** SVG frame that fits the house (and lot) with its dimension lines. */
  view: { x: number; y: number; w: number; h: number };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Grid lines land on 5 cm so the dimensions read cleanly. */
const snap = (n: number) => r2(Math.round(n * 20) / 20);
const fmtLen = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });

/** Same margins around the drawing as the original 1000 × 800 frame. */
export function planView(W: number, H: number, lot: Rect | null) {
  const [lx, ly, lw, lh] = lot ?? [0, 0, W, H];
  const x0 = Math.min(0, lx), y0 = Math.min(0, ly), x1 = Math.max(W, lx + lw), y1 = Math.max(H, ly + lh);
  return { x: X(x0) - 160, y: Y(y0) - 110, w: X(x1) - X(x0) + 160 + 168, h: Y(y1) - Y(y0) + 110 + 114 };
}

/**
 * Piecewise-linear map through the room grid lines: every grid line is scaled and snapped,
 * points in between follow, and points outside the house keep their distance to it.
 */
function axisMap(breaks: number[], scale: number) {
  const src = [...new Set(breaks)].sort((a, b) => a - b);
  const dst = src.map(v => snap(v * scale));
  return (v: number) => {
    const exact = src.indexOf(v);
    if (exact >= 0) return dst[exact];
    if (v < src[0]) return dst[0] + v - src[0];
    for (let i = 1; i < src.length; i++) {
      if (v <= src[i]) return dst[i - 1] + ((v - src[i - 1]) * (dst[i] - dst[i - 1])) / (src[i] - src[i - 1]);
    }
    return dst[dst.length - 1] + v - src[src.length - 1];
  };
}

/**
 * Maps one axis of a room so furniture keeps its real size: only the free floor between pieces shrinks.
 * If the pieces no longer fit side by side, the whole row is scaled with the room instead.
 */
function compressAxis(r0: number, r1: number, n0: number, n1: number, intervals: [number, number][]) {
  const merged: [number, number][] = [];
  intervals
    .map(([a, b]) => [Math.max(a, r0), Math.min(b, r1)] as [number, number])
    .sort((p, q) => p[0] - q[0])
    .forEach(([a, b]) => {
      const last = merged[merged.length - 1];
      if (last && a <= last[1]) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    });
  const old = r1 - r0, size = n1 - n0;
  const occupied = merged.reduce((sum, [a, b]) => sum + b - a, 0);
  if (occupied >= size || old - occupied < 1e-9) return (v: number) => n0 + ((v - r0) * size) / old;
  const free = (size - occupied) / (old - occupied);
  return (v: number) => {
    let out = n0, cur = r0;
    for (const [a, b] of merged) {
      if (v <= a) return out + (v - cur) * free;
      out += (a - cur) * free;
      if (v <= b) return out + v - a;
      out += b - a;
      cur = b;
    }
    return out + (v - cur) * free;
  };
}

export const pieceExtent = (p: FurniturePiece): [number, number, number, number] => {
  switch (p.kind) {
    case 'rect': return [p.x, p.y, p.x + p.w, p.y + p.h];
    case 'circle': return [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r];
    case 'ellipse': return [p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry];
    case 'line': return [Math.min(p.x1, p.x2), Math.min(p.y1, p.y2), Math.max(p.x1, p.x2), Math.max(p.y1, p.y2)];
  }
};

const inside = ([x, y, w, h]: Rect, px: number, py: number) => px >= x && px <= x + w && py >= y && py <= y + h;

function layoutFurniture(mapRect: (r: Rect) => Rect): FurniturePiece[] {
  const baseRects = Object.values(ROOMS_DEFAULT).flatMap(r => r.rects);
  const rectOf = (p: FurniturePiece) => {
    const [x0, y0, x1, y1] = pieceExtent(p);
    return baseRects.find(r => inside(r, (x0 + x1) / 2, (y0 + y1) / 2))!;
  };
  const maps = new Map<Rect, { gx: (v: number) => number; gy: (v: number) => number }>();
  baseRects.forEach(rect => {
    const pieces = FURNITURE.filter(p => rectOf(p) === rect).map(pieceExtent);
    if (!pieces.length) return;
    const [x, y, w, h] = rect, [nx, ny, nw, nh] = mapRect(rect);
    maps.set(rect, {
      gx: compressAxis(x, x + w, nx, nx + nw, pieces.map(e => [e[0], e[2]])),
      gy: compressAxis(y, y + h, ny, ny + nh, pieces.map(e => [e[1], e[3]])),
    });
  });

  return FURNITURE.map(p => {
    const { gx, gy } = maps.get(rectOf(p))!;
    switch (p.kind) {
      case 'rect': {
        const x = gx(p.x), y = gy(p.y);
        return { ...p, x, y, w: gx(p.x + p.w) - x, h: gy(p.y + p.h) - y };
      }
      case 'circle': {
        const r = Math.min(gx(p.x + p.r) - gx(p.x - p.r), gy(p.y + p.r) - gy(p.y - p.r)) / 2;
        return { ...p, x: gx(p.x), y: gy(p.y), r };
      }
      case 'ellipse':
        return { ...p, x: gx(p.x), y: gy(p.y), rx: (gx(p.x + p.rx) - gx(p.x - p.rx)) / 2, ry: (gy(p.y + p.ry) - gy(p.y - p.ry)) / 2 };
      case 'line':
        return { ...p, x1: gx(p.x1), y1: gy(p.y1), x2: gx(p.x2), y2: gy(p.y2) };
    }
  });
}

/** Offsets of the eight pillars around a courtyard of the given size. */
const pillarOffsets = (cw: number, ch: number): Point[] =>
  [0, cw / 2, cw].flatMap(dx => [0, ch / 2, ch].map(dy => [dx, dy] as Point)).filter(([dx, dy]) => !(dx === cw / 2 && dy === ch / 2));

/** Inward-sloping roof: four planes from the parapet line down to the eave over the courtyard. */
function impluvium(W: number, H: number, [cx, cy, cw, ch]: Rect): RoofQuad[] {
  const o: Point[] = [[0, 0], [W, 0], [W, H], [0, H]];
  const i: Point[] = [[cx + EAVE, cy + EAVE], [cx + cw - EAVE, cy + EAVE], [cx + cw - EAVE, cy + ch - EAVE], [cx + EAVE, cy + ch - EAVE]];
  return o.map((p, k) => {
    const n = (k + 1) % 4;
    return [[...p, ROOF_OUTER_H], [...o[n], ROOF_OUTER_H], [...i[n], ROOF_INNER_H], [...i[k], ROOF_INNER_H]];
  });
}

function buildPatioModel(size: HouseSize): HouseModel {
  const scale = size / BASE_W;
  const baseRects = Object.values(ROOMS_DEFAULT).flatMap(r => r.rects);
  const mx = axisMap(baseRects.flatMap(([x, , w]) => [x, x + w]), scale);
  const my = axisMap(baseRects.flatMap(([, y, , h]) => [y, y + h]), scale);
  const P = (x: number, y: number): Point => [mx(x), my(y)];
  const mapRect = ([x, y, w, h]: Rect): Rect => [mx(x), my(y), r2(mx(x + w) - mx(x)), r2(my(y + h) - my(y))];

  const rooms = structuredClone(ROOMS_DEFAULT);
  Object.values(rooms).forEach(room => {
    room.rects = room.rects.map(mapRect);
    if (room.labelRect) room.labelRect = mapRect(room.labelRect);
  });

  // Doors keep their real width and stay centred where they were; wide openings and windows scale with the wall.
  const mapOpening = <T extends Opening | Window>(o: T): T => {
    const m = o.dir === 'h' ? mx : my;
    const start = o.dir === 'h' ? o.x : o.y;
    const door = 'type' in o && o.type === 'door';
    const a = door ? snap(m(start + o.len / 2) - o.len / 2) : snap(m(start));
    const b = door ? a + o.len : snap(m(start + o.len));
    return o.dir === 'h' ? { ...o, x: a, y: my(o.y), len: r2(b - a) } : { ...o, x: mx(o.x), y: a, len: r2(b - a) };
  };

  const W = mx(BASE_W), H = my(BASE_H);
  const courtyard = rooms.courtyard.rects[0];
  const [cx, cy, cw, ch] = courtyard;
  const kx = cw / 6, ky = ch / 6;

  // Roof drains inward (implúvio): eave gutter → downpipes in the pillars → linear drain → two independent outlets.
  const gx0 = cx + EAVE, gy0 = cy + EAVE, gx1 = cx + cw - EAVE, gy1 = cy + ch - EAVE;
  const pillars = pillarOffsets(cw, ch).map(([dx, dy]) => [cx + dx, cy + dy] as Point);
  const trapMain: Point = [cx + cw - 0.65, cy + 0.3], trapEmergency: Point = [cx + 0.35, cy + ch - 0.35];
  const cistern: Rect = mapRect([14.2, 0.4, 1.6, 2.4]);
  const pipeX = mx(14.75);

  const lotFront = W + 3;
  return {
    W, H,
    rooms: withSizeTexts(rooms),
    openings: OPENINGS.map(mapOpening),
    windows: WINDOWS.map(mapOpening),
    hammocks: HAMMOCKS.map(pair => pair.map(([x, y]) => P(x, y)) as [Point, Point]),
    furniture: layoutFurniture(mapRect),
    highSillRooms: ['bath_3', 'master_bath', 'bwc_social'],
    dims: {
      top: ([[0, 5], [5, 16], [16, 21]] as Span[]).map(([a, b]) => [mx(a), mx(b)]),
      left: ([[0, 3.5], [3.5, 7.5], [7.5, 9.5], [9.5, 11.5], [11.5, 14], [14, 18]] as Span[]).map(([a, b]) => [my(a), my(b)]),
      right: ([[0, 5], [5, 14], [14, 18]] as Span[]).map(([a, b]) => [my(a), my(b)]),
      bottom: ([[0, 4.5], [4.5, 10], [10, 13], [13, 21]] as Span[]).map(([a, b]) => [mx(a), mx(b)]),
    },
    caption: `CONSTRUÇÃO ${fmtLen(W)} × ${fmtLen(H)} m • LOTE MÍN. ${fmtLen(lotFront)} m DE FRENTE`,
    courtyardDecor: {
      pond: [cx + 0.6 * kx, cy + 0.6 * ky, 3.4 * kx, 1.5 * ky],
      deck: [cx, cy + ch - 1.2 * ky, cw, 1.2 * ky],
      trees: ([[5, 1.3, 0.75], [1.1, 4.1, 0.5], [5.1, 4.1, 0.55]] as const).map(([x, y, r]) => [cx + x * kx, cy + y * ky, r * Math.min(kx, ky)]),
    },
    eave: [gx0, gy0, gx1 - gx0, gy1 - gy0],
    pillars,
    pillarH: ROOF_INNER_H,
    roof: impluvium(W, H, courtyard),
    utilities: {
      wetRooms: ['bath_3', 'service', 'master_bath', 'bwc_social', 'kitchen'],
      hydraulicWalls: [[P(0, 9.5), P(5, 9.5)], [P(13, 14), P(13, 18)]],
      slopes: [
        [P(8.1, 3.25), [mx(8.1), gy0]], [P(12.9, 3.25), [mx(12.9), gy0]],
        [P(8.1, 13.75), [mx(8.1), gy1]], [P(12.9, 13.75), [mx(12.9), gy1]],
        [P(5.25, 7.4), [gx0, my(7.4)]], [P(5.25, 9.6), [gx0, my(9.6)]],
        [P(15.75, 7.4), [gx1, my(7.4)]], [P(15.75, 9.6), [gx1, my(9.6)]],
      ],
      gutters: [[[gx0, gy0], [gx1, gy0], [gx1, gy1], [gx0, gy1], [gx0, gy0]]],
      downpipes: pillars.map(([px, py]) => ({ at: [px, py] as Point, gutter: [clamp(px, gx0, gx1), clamp(py, gy0, gy1)] as Point })),
      drains: [[cx + 0.15, cy + 0.15, cw - 0.3, ch - 0.3]],
      traps: [trapMain, trapEmergency],
      rainPipes: [[trapMain, [pipeX, trapMain[1]], [pipeX, cistern[1] + cistern[3]]]],
      cistern,
      cisternVolume: '~15 m³',
      overflow: [[mx(15.4), cistern[1]], [mx(15.4), -0.5]],
      emergency: [trapEmergency, [trapEmergency[0], my(11.9)], [-1, my(11.9)]],
      sewerStubs: [8.5, 10.5, 16].map(y => [P(0, y), P(-0.4, y)]),
      sewerMain: [P(13, 18), P(13, 18.35), P(-0.4, 18.35), P(-0.4, -0.4), P(-2, -0.4)],
      greaseTrap: mapRect([13.35, 18.17, 0.6, 0.36]),
      inspections: [P(-0.4, 18.35), P(-0.4, -0.4)],
      septic: mapRect([-4.4, -1.6, 2.4, 1.5]),
      septicLink: [P(-3.2, -0.1), P(-3.2, 0.4)],
      soakaway: { at: P(-3.2, 1.2), r: 0.8 },
      waterTank: mapRect([0.3, 14.3, 1.7, 0.8]),
      solar: mapRect([2.2, 14.3, 2.0, 0.8]),
      board: mapRect([5.6, 0.25, 1.6, 0.5]),
      legend: {
        slope: 'Telhado com caimento para o pátio (implúvio)',
        gutter: 'Calha no beiral → 8 condutores Ø100 dentro dos pilares',
        drain: 'Ralo linear + caixa de areia (CA) → saída principal Ø200 → cisterna → extravasor para a rua',
        emergency: 'Saída de emergência Ø150, independente → recuo oeste',
        sewer: 'Esgoto → caixa de gordura (CG) → fossa séptica (F) + sumidouro (S)',
        hydraulic: 'Parede hidráulica: áreas molhadas agrupadas',
        tank: "Caixa d'água + aquecedor solar sobre o BWC master",
        board: 'Quadro de distribuição (QD) + inversor solar junto à entrada',
      },
      drainsToPatio: true,
    },
    // Breezes come in from beyond the east facade and reach the courtyard; the hot air leaves to the west and up.
    wind: {
      breezes: [
        [[W + 4.78, my(2.81)], [W + 2.13, my(2.81)], P(17.5, 4.69), P(13.75, 6.25)],
        [[W + 4.78, my(9.06)], [W + 2.13, my(9.06)], P(17.5, 8.75), P(13.75, 8.59)],
        [[W + 4.78, H + 2.31], [W + 2.13, H + 0.44], P(17.5, 14.06), P(13.59, 11.25)],
      ],
      hot: [P(7.5, 6.875), P(4.375, 6.56), P(1.25, 6.25), [-4.375, my(5.94)]],
      labels: [
        { at: [W + 4.78, my(2.81) - 0.47], text: 'BRISA LESTE', anchor: 'end' },
        { at: [W + 4.78, H + 3.25], text: 'BRISA SUDESTE', anchor: 'end' },
        { at: [-4.375, my(5.94) - 0.31], text: 'AR QUENTE SAI A OESTE', hot: true, anchor: 'start' },
        { at: P(10.5, 11.05), text: '↑ EFEITO CHAMINÉ', hot: true },
      ],
    },
    lot: null,
    view: planView(W, H, null),
  };
}

const cache = new Map<HouseSize, HouseModel>();
export function patioModel(size: HouseSize): HouseModel {
  if (!cache.has(size)) cache.set(size, buildPatioModel(size));
  return cache.get(size)!;
}
