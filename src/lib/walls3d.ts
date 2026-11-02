import type { Room, RoomKey } from '../data/rooms';
import { along, onLine, wallLines } from './geometry';
import type { HouseModel } from './model';

// Heights in meters.
export const WALL_H = 3.0;
/** Exterior walls rise above the roof edge as a parapet (platibanda) that hides the inward-sloping roof. */
export const PARAPET_H = 3.8;
export const ROOF_OUTER_H = 3.5;
export const ROOF_INNER_H = 2.8;
export const EAVE = 0.5;
const DOOR_H = 2.1;
const OPENING_H = 2.6;
const WINDOW_TOP = 2.2;
const WINDOW_SILL = 1.0;
const HIGH_SILL = 1.5;
const HIGH_SILL_ROOMS: RoomKey[] = ['bath_3', 'master_bath', 'bwc_social'];

/** Axis-aligned block in plan meters (x0..x1, y0..y1) between heights z0..z1. */
export interface Block {
  x0: number; y0: number; x1: number; y1: number; z0: number; z1: number;
  kind: 'wall' | 'glass';
}

/**
 * Turns the plan's wall lines into 3D blocks: full-height pieces between openings,
 * lintels over doors and passages, and sill + glass + lintel at windows.
 */
export function wallBlocks(rooms: Record<RoomKey, Room>, { openings, windows }: HouseModel): Block[] {
  const blocks: Block[] = [];
  wallLines(rooms).forEach(line => {
    const t = line.exterior ? 0.25 : 0.15;
    const top = line.exterior ? PARAPET_H : WALL_H;
    const gaps = [
      ...openings.filter(o => onLine(o, line)).map(o => ({ a: along(o), b: along(o) + o.len, kind: o.type, sill: 0 })),
      ...windows.filter(w => onLine(w, line)).map(w => ({
        a: along(w), b: along(w) + w.len, kind: 'window' as const,
        sill: HIGH_SILL_ROOMS.includes(w.room) ? HIGH_SILL : WINDOW_SILL,
      })),
    ].sort((p, q) => p.a - q.a);

    line.spans.forEach(([a, b]) => {
      // Pieces touching a span end grow by half the thickness so corners close.
      const piece = (p0: number, p1: number, z0: number, z1: number, kind: Block['kind'] = 'wall') => {
        if (p1 - p0 < 1e-3 || z1 - z0 < 1e-3) return;
        const e0 = p0 === a ? t / 2 : 0, e1 = p1 === b ? t / 2 : 0;
        const depth = kind === 'glass' ? 0.04 : t;
        blocks.push(line.dir === 'h'
          ? { x0: p0 - e0, x1: p1 + e1, y0: line.at - depth / 2, y1: line.at + depth / 2, z0, z1, kind }
          : { x0: line.at - depth / 2, x1: line.at + depth / 2, y0: p0 - e0, y1: p1 + e1, z0, z1, kind });
      };
      let cursor = a;
      gaps.filter(g => g.b > a && g.a < b).forEach(g => {
        const g0 = Math.max(g.a, a), g1 = Math.min(g.b, b);
        piece(cursor, g0, 0, top);
        if (g.kind === 'window') {
          piece(g0, g1, 0, g.sill);
          piece(g0, g1, g.sill, WINDOW_TOP, 'glass');
          piece(g0, g1, WINDOW_TOP, top);
        } else {
          piece(g0, g1, g.kind === 'door' ? DOOR_H : OPENING_H, top);
        }
        cursor = g1;
      });
      piece(cursor, b, 0, top);
    });
  });
  return blocks;
}
