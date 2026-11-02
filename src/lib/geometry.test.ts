import { describe, expect, it } from 'vitest';
import type { FurniturePiece } from '../data/furniture';
import { OPENINGS, WINDOWS } from '../data/openings';
import { along, builtArea, onLine, openArea, wallLines } from './geometry';
import { SIZES, houseModel } from './model';
import { sunDirection } from './sun';
import { wallBlocks } from './walls3d';

const extent = (p: FurniturePiece) =>
  p.kind === 'rect' ? [p.x, p.y, p.x + p.w, p.y + p.h]
  : p.kind === 'circle' ? [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r]
  : p.kind === 'ellipse' ? [p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry]
  : [Math.min(p.x1, p.x2), Math.min(p.y1, p.y2), Math.max(p.x1, p.x2), Math.max(p.y1, p.y2)];

describe('the original 21 × 18 m house', () => {
  const { rooms } = houseModel(21);

  it('adds up to the documented areas', () => {
    expect(builtArea(rooms)).toBe(342);
    expect(openArea(rooms)).toBe(36);
  });
});

describe.each(SIZES)('house %s m wide', size => {
  const model = houseModel(size);
  const { rooms, W, H } = model;

  it('keeps the proportions of the original', () => {
    expect(W).toBe(size);
    expect(H / W).toBeCloseTo(18 / 21, 2);
  });

  it('tiles the footprint without gaps or overlaps', () => {
    expect(builtArea(rooms) + openArea(rooms)).toBeCloseTo(W * H, 6);
  });

  it('places every door, opening and window on an existing wall', () => {
    const lines = wallLines(rooms);
    [...model.openings, ...model.windows].forEach(o => {
      const line = lines.find(l => onLine(o, l));
      expect(line, JSON.stringify(o)).toBeDefined();
      const a = along(o), b = a + o.len;
      expect(line!.spans.some(([s, e]) => a >= s - 1e-6 && b <= e + 1e-6), JSON.stringify(o)).toBe(true);
    });
  });

  it('keeps doors at their real width', () => {
    model.openings.forEach((o, i) => { if (o.type === 'door') expect(o.len).toBe(OPENINGS[i].len); });
  });

  it('keeps the furniture inside the house', () => {
    model.furniture.forEach(p => {
      const [x0, y0, x1, y1] = extent(p);
      expect(x0 >= -1e-6 && y0 >= -1e-6 && x1 <= W + 1e-6 && y1 <= H + 1e-6, JSON.stringify(p)).toBe(true);
    });
  });

  it('merges shared edges into continuous exterior walls', () => {
    const north = wallLines(rooms).find(l => l.dir === 'h' && l.at === 0)!;
    expect(north.exterior).toBe(true);
    expect(north.spans).toEqual([[0, W]]);
  });

  it('leaves the courtyard edge without walls', () => {
    const [, cy] = rooms.courtyard.rects[0];
    expect(wallLines(rooms).find(l => l.dir === 'h' && l.at === cy)).toBeUndefined();
  });

  it('cuts a glass pane for every window', () => {
    expect(wallBlocks(rooms, model).filter(b => b.kind === 'glass')).toHaveLength(WINDOWS.length);
  });

  it('leaves the front door open up to the lintel', () => {
    const door = model.openings[0];
    const atDoor = wallBlocks(rooms, model).filter(b => b.kind === 'wall' && b.y0 < 0.01 && b.y1 > -0.01 && b.x0 < door.x + door.len / 2 && b.x1 > door.x + door.len / 2);
    expect(atDoor).toHaveLength(1);
    expect(atDoor[0].z0).toBeCloseTo(2.1);
  });
});

describe('sunDirection (Mamanguape, 6.8° S)', () => {
  it('rises in the east and sets in the west', () => {
    expect(sunDirection(7, 'dez').east).toBeGreaterThan(0.8);
    expect(sunDirection(17, 'dez').east).toBeLessThan(-0.8);
  });

  it('passes south of the zenith in December and north in June', () => {
    const dez = sunDirection(12, 'dez'), jun = sunDirection(12, 'jun');
    expect(dez.north).toBeLessThan(0);
    expect(jun.north).toBeGreaterThan(0);
    expect(dez.up).toBeGreaterThan(0.9);
  });
});
