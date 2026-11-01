import type { Opening, Window } from '../data/openings';
import type { Room } from '../data/rooms';

// Plan coordinates are in meters; 1 m = 32 SVG units. The house is 21 m x 18 m.
export const S = 32;
export const OX = 160;
export const OY = 110;
export const HOUSE_W = 21;
export const HOUSE_H = 18;
export const BASE_VIEW = { x: 0, y: 0, w: 1000, h: 800 };

export const X = (m: number) => OX + m * S;
export const Y = (m: number) => OY + m * S;

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
export const fmtNum = (n: number, d: number) =>
  n.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
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

export function wallFace(o: Opening | Window): Face | null {
  if (o.dir === 'h' && o.y === 0) return 'N';
  if (o.dir === 'h' && o.y === HOUSE_H) return 'S';
  if (o.dir === 'v' && o.x === 0) return 'O';
  if (o.dir === 'v' && o.x === HOUSE_W) return 'L';
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
  Object.values(rooms).forEach(r => { if (r.walls !== false) r.rects.forEach(addRect); });
  addRect([0, 0, HOUSE_W, HOUSE_H]);

  lines.forEach(line => {
    line.spans.sort((p, q) => p[0] - q[0]);
    const merged: [number, number][] = [];
    line.spans.forEach(([a, b]) => {
      const last = merged[merged.length - 1];
      if (last && a <= last[1] + 1e-6) last[1] = Math.max(last[1], b);
      else merged.push([a, b]);
    });
    line.spans = merged;
    line.exterior = line.dir === 'h' ? line.at === 0 || line.at === HOUSE_H : line.at === 0 || line.at === HOUSE_W;
  });
  return [...lines.values()];
}

/** Position of an opening or window along its wall line. */
export const along = (o: Opening | Window) => (o.dir === 'h' ? o.x : o.y);
export const onLine = (o: Opening | Window, line: WallLine) =>
  o.dir === line.dir && Math.abs((o.dir === 'h' ? o.y : o.x) - line.at) < 0.01;
