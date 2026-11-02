import type { Opening, Window } from '../data/openings';
import type { Room } from '../data/rooms';

// Plan coordinates are in meters from the north-west corner; 1 m = 32 SVG units.
export const S = 32;
export const OX = 160;
export const OY = 110;

export const X = (m: number) => OX + m * S;
export const Y = (m: number) => OY + m * S;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const fmtNum = (n: number, d: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
/** Lengths in meters without trailing zeros: 21, 16,5, 14,15. */
export const fmtLen = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
export const fmtBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

export const roomArea = (room: Room) => room.rects.reduce((sum, [, , w, h]) => sum + w * h, 0);
export const builtArea = (rooms: Record<string, Room>) =>
  Object.values(rooms).filter(r => !r.uncovered).reduce((sum, r) => sum + roomArea(r), 0);
export const openArea = (rooms: Record<string, Room>) =>
  Object.values(rooms).filter(r => r.uncovered).reduce((sum, r) => sum + roomArea(r), 0);
export const roomDims = (room: Room) =>
  room.dimsLabel || (room.rects.length === 1 ? `${fmtNum(room.rects[0][2], 2)} × ${fmtNum(room.rects[0][3], 2)} m` : '');
export const fitFontSize = (text: string, maxWidth: number, max = 12, min = 7) =>
  clamp(maxWidth / (text.length * 0.62), min, max);

export type Face = 'N' | 'S' | 'O' | 'L';

/** Outer size of the house: the far edges of its rooms. */
export function houseExtent(rooms: Record<string, Room>) {
  const rects = Object.values(rooms).flatMap(r => r.rects);
  return { W: Math.max(...rects.map(([x, , w]) => x + w)), H: Math.max(...rects.map(([, y, , h]) => y + h)) };
}

export function wallFace(o: Opening | Window, { W, H }: { W: number; H: number }): Face | null {
  if (o.dir === 'h' && o.y === 0) return 'N';
  if (o.dir === 'h' && o.y === H) return 'S';
  if (o.dir === 'v' && o.x === 0) return 'O';
  if (o.dir === 'v' && o.x === W) return 'L';
  return null;
}

/** A straight wall line holding the merged spans of every room edge that lies on it. */
export interface WallLine {
  dir: 'h' | 'v';
  at: number;
  spans: [number, number][];
  exterior: boolean;
}

/** Collects room outlines plus the exterior perimeter and merges overlapping edges. */
export function wallLines(rooms: Record<string, Room>): WallLine[] {
  const lines = new Map<string, WallLine>();
  const add = (dir: 'h' | 'v', at: number, a: number, b: number) => {
    const key = `${dir}:${at.toFixed(2)}`;
    if (!lines.has(key)) lines.set(key, { dir, at, spans: [], exterior: false });
    lines.get(key)!.spans.push([a, b]);
  };
  const addRect = ([x, y, w, h]: [number, number, number, number]) => {
    add('h', y, x, x + w);
    add('h', y + h, x, x + w);
    add('v', x, y, y + h);
    add('v', x + w, y, y + h);
  };
  const { W, H } = houseExtent(rooms);
  Object.values(rooms).forEach(r => { if (r.walls !== false) r.rects.forEach(addRect); });
  addRect([0, 0, W, H]);

  lines.forEach(line => {
    line.spans.sort((p, q) => p[0] - q[0]);
    const merged: [number, number][] = [];
    line.spans.forEach(([a, b]) => {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 1e-6) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    });
    line.spans = merged;
    line.exterior = line.dir === 'h' ? line.at === 0 || line.at === H : line.at === 0 || line.at === W;
  });
  return [...lines.values()];
}

/** Position of an opening or window along its wall line. */
export const along = (o: Opening | Window) => (o.dir === 'h' ? o.x : o.y);
export const onLine = (o: Opening | Window, line: WallLine) =>
  o.dir === line.dir && Math.abs((o.dir === 'h' ? o.y : o.x) - line.at) < 0.01;
