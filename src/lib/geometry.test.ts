import { describe, expect, it } from 'vitest';
import { FURNITURE } from '../data/furniture';
import { OPENINGS, WINDOWS } from '../data/openings';
import { ROOMS_DEFAULT } from '../data/rooms';
import { HOUSE_H, HOUSE_W, along, builtArea, onLine, openArea, wallLines } from './geometry';
import { sunDirection } from './sun';
import { wallBlocks } from './walls3d';

describe('house data', () => {
  it('adds up to the documented areas', () => {
    expect(builtArea(ROOMS_DEFAULT)).toBe(342);
    expect(openArea(ROOMS_DEFAULT)).toBe(36);
  });

  it('tiles the 21 × 18 m footprint without gaps or overlaps', () => {
    const total = builtArea(ROOMS_DEFAULT) + openArea(ROOMS_DEFAULT);
    expect(total).toBe(HOUSE_W * HOUSE_H);
  });

  it('places every door, opening and window on an existing wall', () => {
    const lines = wallLines(ROOMS_DEFAULT);
    [...OPENINGS, ...WINDOWS].forEach(o => {
      const line = lines.find(l => onLine(o, l));
      expect(line, JSON.stringify(o)).toBeDefined();
      const a = along(o), b = a + o.len;
      expect(line!.spans.some(([s, e]) => a >= s - 1e-6 && b <= e + 1e-6), JSON.stringify(o)).toBe(true);
    });
  });

  it('keeps the furniture inside the house', () => {
    FURNITURE.forEach(p => {
      const [x0, y0, x1, y1] =
        p.kind === 'rect' ? [p.x, p.y, p.x + p.w, p.y + p.h]
        : p.kind === 'circle' ? [p.x - p.r, p.y - p.r, p.x + p.r, p.y + p.r]
        : p.kind === 'ellipse' ? [p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry]
        : [Math.min(p.x1, p.x2), Math.min(p.y1, p.y2), Math.max(p.x1, p.x2), Math.max(p.y1, p.y2)];
      expect(x0 >= 0 && y0 >= 0 && x1 <= HOUSE_W && y1 <= HOUSE_H, JSON.stringify(p)).toBe(true);
    });
  });
});

describe('wallLines', () => {
  it('merges shared edges into continuous exterior walls', () => {
    const north = wallLines(ROOMS_DEFAULT).find(l => l.dir === 'h' && l.at === 0)!;
    expect(north.exterior).toBe(true);
    expect(north.spans).toEqual([[0, HOUSE_W]]);
  });

  it('leaves the courtyard edge without walls', () => {
    const courtyardEdge = wallLines(ROOMS_DEFAULT).find(l => l.dir === 'h' && l.at === 5.5);
    expect(courtyardEdge).toBeUndefined();
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

describe('wallBlocks', () => {
  const blocks = wallBlocks(ROOMS_DEFAULT);

  it('cuts a glass pane for every window', () => {
    expect(blocks.filter(b => b.kind === 'glass')).toHaveLength(WINDOWS.length);
  });

  it('leaves the front door open up to the lintel', () => {
    const door = OPENINGS[0];
    const atDoor = blocks.filter(b => b.kind === 'wall' && b.y0 < 0.01 && b.y1 > -0.01 && b.x0 < door.x + door.len / 2 && b.x1 > door.x + door.len / 2);
    expect(atDoor).toHaveLength(1);
    expect(atDoor[0].z0).toBeCloseTo(2.1);
  });
});
