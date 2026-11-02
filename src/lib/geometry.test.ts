import { describe, expect, it } from 'vitest';
import { OPENINGS } from '../data/openings';
import { along, builtArea, onLine, openArea, wallLines } from './geometry';
import { SIZES, patioModel, pieceExtent, type HouseModel } from './model';
import { getProject } from './projects';
import { sunDirection } from './sun';
import { wallBlocks } from './walls3d';

const MODELS: [string, HouseModel][] = [
  ...SIZES.map(size => [`Casa de Pátio ${size} m`, patioModel(size)] as [string, HouseModel]),
  ['Casa do Alpendre', getProject('alpendre').model(SIZES[0])],
  ['Duas Casas', getProject('duas').model(SIZES[0])],
];

describe('the original 21 × 18 m Casa de Pátio', () => {
  const { rooms } = patioModel(21);

  it('adds up to the documented areas', () => {
    expect(builtArea(rooms)).toBe(342);
    expect(openArea(rooms)).toBe(36);
  });
});

describe.each(SIZES)('Casa de Pátio %s m wide', size => {
  const model = patioModel(size);

  it('keeps the proportions of the original', () => {
    expect(model.W).toBe(size);
    expect(model.H / model.W).toBeCloseTo(18 / 21, 2);
  });

  it('keeps doors at their real width', () => {
    model.openings.forEach((o, i) => { if (o.type === 'door') expect(o.len).toBe(OPENINGS[i].len); });
  });
});

describe.each(MODELS)('%s', (_, model) => {
  const { rooms, W, H } = model;

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

  it('keeps every piece of furniture inside one room', () => {
    const rects = Object.values(rooms).filter(r => !r.uncovered).flatMap(r => r.rects);
    model.furniture.forEach(p => {
      const [x0, y0, x1, y1] = pieceExtent(p);
      const inside = rects.some(([x, y, w, h]) => x0 >= x - 1e-6 && y0 >= y - 1e-6 && x1 <= x + w + 1e-6 && y1 <= y + h + 1e-6);
      expect(inside, JSON.stringify(p)).toBe(true);
    });
  });

  it('merges shared edges into continuous exterior walls', () => {
    const north = wallLines(rooms).find(l => l.dir === 'h' && l.at === 0)!;
    expect(north.exterior).toBe(true);
    expect(north.spans).toEqual([[0, W]]);
  });

  it.runIf(!!rooms.hallway)('leaves the courtyard open to the veranda or gallery', () => {
    const [cx, cy, cw, ch] = rooms.courtyard.rects[0];
    const hall = rooms.hallway.rects;
    // Courtyard edges that face the veranda/gallery must not have a wall at their midpoint.
    const edges = [
      { dir: 'h', at: cy, mid: cx + cw / 2, out: [cx + cw / 2, cy - 0.1] },
      { dir: 'h', at: cy + ch, mid: cx + cw / 2, out: [cx + cw / 2, cy + ch + 0.1] },
      { dir: 'v', at: cx, mid: cy + ch / 2, out: [cx - 0.1, cy + ch / 2] },
      { dir: 'v', at: cx + cw, mid: cy + ch / 2, out: [cx + cw + 0.1, cy + ch / 2] },
    ].filter(e => hall.some(([x, y, w, h]) => e.out[0] > x && e.out[0] < x + w && e.out[1] > y && e.out[1] < y + h));
    expect(edges.length).toBeGreaterThan(0);
    const lines = wallLines(rooms);
    edges.forEach(e => {
      const line = lines.find(l => l.dir === e.dir && Math.abs(l.at - e.at) < 0.01);
      expect(line?.spans.some(([s, t]) => e.mid > s && e.mid < t) ?? false, JSON.stringify(e)).toBe(false);
    });
  });

  it('cuts a glass pane for every window', () => {
    expect(wallBlocks(rooms, model).filter(b => b.kind === 'glass')).toHaveLength(model.windows.length);
  });

  it('leaves the entrance open up to the lintel', () => {
    const door = model.openings[0];
    const atDoor = wallBlocks(rooms, model).filter(b => b.kind === 'wall' && b.y0 < 0.01 && b.y1 > -0.01 && b.x0 < door.x + door.len / 2 && b.x1 > door.x + door.len / 2);
    expect(atDoor).toHaveLength(1);
    expect(atDoor[0].z0).toBeCloseTo(door.type === 'door' ? 2.1 : 2.6);
  });

  it('keeps the roof under the parapet', () => {
    model.roof.flat().forEach(([, , z]) => expect(z).toBeLessThan(3.8));
  });
});

describe('Casa do Alpendre on the 10 × 30 m lot', () => {
  const model = getProject('alpendre').model(SIZES[0]);
  const [lx, ly, lw, lh] = model.lot!.rect;

  it('fits the lot with the setbacks', () => {
    expect([lw, lh]).toEqual([10, 30]);
    expect(lx).toBe(0); // built on the west boundary
    expect(lx + lw - model.W).toBeGreaterThanOrEqual(1.5); // east setback
    expect(-ly).toBeGreaterThanOrEqual(5); // front setback with the parking space
    expect(ly + lh - model.H).toBeGreaterThanOrEqual(4); // back yard
  });

  it('has no window on the boundary wall', () => {
    expect(model.windows.filter(w => w.dir === 'v' && w.x === 0)).toEqual([]);
  });

  it('parks the car inside the front setback', () => {
    const [[cx, cy, cw, ch]] = model.lot!.cars;
    expect(cx >= lx && cx + cw <= lx + lw && cy >= ly && cy + ch <= 0).toBe(true);
  });
});

describe('Duas Casas on the 10 × 30 m lot', () => {
  const model = getProject('duas').model(SIZES[0]);
  const { rooms, lot, buildings, waterTower } = model;
  const [lx, ly, lw, lh] = lot!.rect;
  const [front, tower, back] = buildings!;
  const area = (prefix: (k: string) => boolean) =>
    Object.entries(rooms).filter(([k]) => prefix(k)).reduce((sum, [, r]) => sum + r.rects.reduce((s, [, , w, h]) => s + w * h, 0), 0);
  const inside = ([x, y, w, h]: number[], [ox, oy, ow, oh]: number[]) => x >= ox - 1e-6 && y >= oy - 1e-6 && x + w <= ox + ow + 1e-6 && y + h <= oy + oh + 1e-6;
  const bedrooms = (b: number[]) => Object.values(rooms).filter(r => r.icon === 'fa-bed' && inside(r.rects[0], b)).length;

  it('fits the lot with the setbacks', () => {
    expect([lw, lh]).toEqual([10, 30]);
    expect(lx + lw - model.W).toBeGreaterThanOrEqual(1.5); // east walkway
    expect(-ly).toBeGreaterThanOrEqual(5); // front setback with the garage
    expect(ly + lh - model.H).toBeGreaterThanOrEqual(1.5); // back yard
  });

  it('has 3 bedrooms in the front house and 2 in the smaller back house', () => {
    expect(bedrooms(front)).toBe(3);
    expect(bedrooms(back)).toBe(2);
    expect(back[2] * back[3]).toBeLessThan(front[2] * front[3]);
  });

  it('parks two cars side by side in the front setback', () => {
    const cars = lot!.cars;
    expect(cars).toHaveLength(2);
    cars.forEach(c => expect(inside(c, [lx, ly, lw, -ly])).toBe(true));
    const [[ax, , aw], [bx]] = cars;
    expect(ax + aw).toBeLessThanOrEqual(bx);
  });

  it('reaches the back house through the walkway from the street', () => {
    const walk = lot!.paths.find(([x, y, , h]) => x >= model.W && y === ly && y + h >= back[1])!;
    expect(walk).toBeDefined();
    expect(walk[2]).toBeGreaterThanOrEqual(1.2);
    // The back house door opens onto the yard, which opens onto the walkway.
    expect(model.openings.some(o => o.type === 'door' && o.dir === 'h' && o.y === back[1])).toBe(true);
    expect(rooms.courtyard.rects[0][0] + rooms.courtyard.rects[0][2]).toBe(model.W);
  });

  it('puts the water tower between the two houses, one tank each', () => {
    expect(tower[1]).toBe(front[1] + front[3]);
    expect(tower[1] + tower[3]).toBe(back[1]);
    expect(waterTower!.tanks).toHaveLength(2);
    waterTower!.tanks.forEach(([x, y]) => expect(inside([x, y, 0, 0], tower)).toBe(true));
    // Tanks stand above every shower head of both single-storey houses.
    expect(waterTower!.z).toBeGreaterThan(2.2 + 1);
  });

  it('has no window on the boundary wall', () => {
    expect(model.windows.filter(w => w.dir === 'v' && w.x === 0)).toEqual([]);
  });

  it('keeps more built area in front than in the back', () => {
    expect(area(k => !k.startsWith('back_') && !k.startsWith('laundry') && k !== 'courtyard')).toBeGreaterThan(area(k => k.startsWith('back_')));
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
