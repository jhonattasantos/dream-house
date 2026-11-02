import { FURNITURE, type FurniturePiece } from '../data/furniture';
import { HAMMOCKS, OPENINGS, WINDOWS, type Opening, type Point, type Window } from '../data/openings';
import { ROOMS_DEFAULT, withSizeTexts, type Rect, type Room, type RoomKey } from '../data/rooms';
import { X, Y } from './geometry';

// The data in src/data is drawn at 21 × 18 m; the smaller options shrink that drawing proportionally.
export const BASE_W = 21;
export const BASE_H = 18;
export const SIZES = [16.5, 18, 19.5, 21] as const;
export type HouseSize = (typeof SIZES)[number];
export const DEFAULT_SIZE: HouseSize = SIZES[0];

export interface HouseModel {
  size: HouseSize;
  W: number;
  H: number;
  /** Rooms at this size, before the user's text edits. */
  rooms: Record<RoomKey, Room>;
  openings: Opening[];
  windows: Window[];
  hammocks: [Point, Point][];
  furniture: FurniturePiece[];
  /** Map a coordinate of the 21 × 18 m drawing to this size. */
  mx: (x: number) => number;
  my: (y: number) => number;
  /** SVG frame that fits the house with its dimension lines. */
  view: { x: number; y: number; w: number; h: number };
}

const r2 = (n: number) => Math.round(n * 100) / 100;
/** Grid lines land on 5 cm so the dimensions read cleanly. */
const snap = (n: number) => r2(Math.round(n * 20) / 20);

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

const extent = (p: FurniturePiece): [number, number, number, number] => {
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
    const [x0, y0, x1, y1] = extent(p);
    return baseRects.find(r => inside(r, (x0 + x1) / 2, (y0 + y1) / 2))!;
  };
  const maps = new Map<Rect, { gx: (v: number) => number; gy: (v: number) => number }>();
  baseRects.forEach(rect => {
    const pieces = FURNITURE.filter(p => rectOf(p) === rect).map(extent);
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

function buildModel(size: HouseSize): HouseModel {
  const scale = size / BASE_W;
  const baseRects = Object.values(ROOMS_DEFAULT).flatMap(r => r.rects);
  const mx = axisMap(baseRects.flatMap(([x, , w]) => [x, x + w]), scale);
  const my = axisMap(baseRects.flatMap(([, y, , h]) => [y, y + h]), scale);
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
  return {
    size, W, H,
    rooms: withSizeTexts(rooms),
    openings: OPENINGS.map(mapOpening),
    windows: WINDOWS.map(mapOpening),
    hammocks: HAMMOCKS.map(pair => pair.map(([x, y]) => [mx(x), my(y)]) as [Point, Point]),
    furniture: layoutFurniture(mapRect),
    mx, my,
    // Same margins around the house as the original 1000 × 800 frame.
    view: { x: 0, y: 0, w: X(W) + 168, h: Y(H) + 114 },
  };
}

const cache = new Map<HouseSize, HouseModel>();
export function houseModel(size: HouseSize): HouseModel {
  if (!cache.has(size)) cache.set(size, buildModel(size));
  return cache.get(size)!;
}

/** Garden pieces drawn for a 6 × 6 m courtyard, stretched to the courtyard's actual size. */
export function courtyardDecor([cx, cy, cw, ch]: Rect) {
  const kx = cw / 6, ky = ch / 6;
  return {
    pond: [cx + 0.6 * kx, cy + 0.6 * ky, 3.4 * kx, 1.5 * ky] as Rect,
    deck: [cx, cy + ch - 1.2 * ky, cw, 1.2 * ky] as Rect,
    trees: ([[5, 1.3, 0.75], [1.1, 4.1, 0.5], [5.1, 4.1, 0.55]] as const).map(([x, y, r]) => [cx + x * kx, cy + y * ky, r * Math.min(kx, ky)] as const),
  };
}
