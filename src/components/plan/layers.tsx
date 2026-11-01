import { Fragment, type ReactNode, type SVGProps } from 'react';
import { FURNITURE } from '../../data/furniture';
import { HAMMOCKS, OPENINGS, WINDOWS, type Opening, type Window } from '../../data/openings';
import type { Rect, Room, RoomKey } from '../../data/rooms';
import { HOUSE_H, HOUSE_W, OX, OY, S, X, Y, clamp, fitFontSize, fmtNum, roomArea, roomDims, wallFace, type Face } from '../../lib/geometry';

type Rooms = Record<RoomKey, Room>;
type Pt = [number, number];

const pts = (list: Pt[]) => 'M ' + list.map(([x, y]) => `${X(x)} ${Y(y)}`).join(' L ');

export function PlanDefs() {
  return (
    <defs>
      <pattern id="grass-pattern" width="10" height="10" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#10b981" opacity="0.3" />
        <circle cx="7" cy="7" r="1" fill="#059669" opacity="0.4" />
      </pattern>
      <pattern id="deck-pattern" width="20" height="6" patternUnits="userSpaceOnUse">
        <line x1="0" y1="5" x2="20" y2="5" stroke="#b45309" strokeWidth="0.8" opacity="0.6" />
      </pattern>
      {[['arrow-wind', '#38bdf8', 6], ['arrow-hot', '#fb923c', 6], ['arrow-rain', '#7dd3fc', 5], ['arrow-pipe', '#3b82f6', 5]].map(([id, fill, size]) => (
        <marker key={id} id={String(id)} viewBox="0 0 10 10" refX="8" refY="5" markerWidth={size} markerHeight={size} orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill={String(fill)} />
        </marker>
      ))}
    </defs>
  );
}

export function CourtyardDecor({ rect: [x0, y0, w, h] }: { rect: Rect }) {
  return (
    <g pointerEvents="none">
      <rect x={X(x0)} y={Y(y0)} width={w * S} height={h * S} fill="url(#grass-pattern)" opacity={0.6} />
      <rect x={X(x0)} y={Y(y0 + h - 1.2)} width={w * S} height={1.2 * S} fill="url(#deck-pattern)" opacity={0.8} />
      <rect x={X(x0 + 0.6)} y={Y(y0 + 0.6)} width={3.4 * S} height={1.5 * S} rx={6} fill="#0ea5e9" fillOpacity={0.25} stroke="#38bdf8" strokeOpacity={0.5} />
      {[[5, 1.3, 0.75], [1.1, 4.1, 0.5], [5.1, 4.1, 0.55]].map(([x, y, r]) => (
        <circle key={`${x}-${y}`} className="animate-foliage" cx={X(x0 + x)} cy={Y(y0 + y)} r={r * S} fill="#059669" fillOpacity={0.45} stroke="#10b981" strokeOpacity={0.6} />
      ))}
    </g>
  );
}

export function Walls({ rooms, mini }: { rooms: Rooms; mini: boolean }) {
  return (
    <g stroke="#e2e8f0" fill="none" strokeLinecap="square" pointerEvents="none">
      {Object.values(rooms).filter(r => r.walls !== false).flatMap(r => r.rects).map(([x, y, w, h], i) => (
        <rect key={i} x={X(x)} y={Y(y)} width={w * S} height={h * S} strokeWidth={mini ? 2 : 3} />
      ))}
      <rect x={X(0)} y={Y(0)} width={HOUSE_W * S} height={HOUSE_H * S} strokeWidth={mini ? 5 : 8} />
    </g>
  );
}

/** Courtyard edge: step down to the garden with a linear drain. */
export function CourtyardEdge({ rect: [cx, cy, cw, ch], mini }: { rect: Rect; mini: boolean }) {
  return (
    <rect
      x={X(cx)} y={Y(cy)} width={cw * S} height={ch * S} fill="none" stroke="#38bdf8"
      strokeWidth={mini ? 1.5 : 2} strokeDasharray={mini ? undefined : '2 3'} opacity={0.9} pointerEvents="none"
    />
  );
}

export const PILLAR_OFFSETS = (cw: number, ch: number): Pt[] =>
  [0, cw / 2, cw].flatMap(dx => [0, ch / 2, ch].map(dy => [dx, dy] as Pt)).filter(([dx, dy]) => !(dx === cw / 2 && dy === ch / 2));

/** Roof eave 0.5 m over the garden and the pillars that carry it. */
export function VerandaEdge({ rect: [cx, cy, cw, ch] }: { rect: Rect }) {
  const eave = 0.5, p = 0.3;
  return (
    <g pointerEvents="none">
      <rect x={X(cx + eave)} y={Y(cy + eave)} width={(cw - 2 * eave) * S} height={(ch - 2 * eave) * S} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="8 5" opacity={0.7} />
      {PILLAR_OFFSETS(cw, ch).map(([dx, dy]) => (
        <rect key={`${dx}-${dy}`} x={X(cx + dx - p / 2)} y={Y(cy + dy - p / 2)} width={p * S} height={p * S} fill="#e2e8f0" />
      ))}
    </g>
  );
}

const isExterior = (o: Opening | Window) => wallFace(o) !== null;

function OpeningMark({ o }: { o: Opening }) {
  const p1 = { x: X(o.x), y: Y(o.y) };
  const p2 = o.dir === 'h' ? { x: X(o.x + o.len), y: Y(o.y) } : { x: X(o.x), y: Y(o.y + o.len) };
  const gap = <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#0b1220" strokeWidth={isExterior(o) ? 10 : 6} />;
  if (o.type !== 'door') return gap;

  const r = o.len * S, swing = o.swing ?? 1;
  const hinge = p1, closed = p2;
  const open = o.dir === 'h' ? { x: hinge.x, y: hinge.y + swing * r } : { x: hinge.x + swing * r, y: hinge.y };
  const cross = (closed.x - hinge.x) * (open.y - hinge.y) - (closed.y - hinge.y) * (open.x - hinge.x);
  return (
    <>
      {gap}
      <line x1={hinge.x} y1={hinge.y} x2={open.x} y2={open.y} stroke="#cbd5e1" strokeWidth={2} />
      <path d={`M ${closed.x} ${closed.y} A ${r} ${r} 0 0 ${cross > 0 ? 1 : 0} ${open.x} ${open.y}`} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="3 3" />
    </>
  );
}

function WindowMark({ w }: { w: Window }) {
  const t = 8;
  const box = w.dir === 'h'
    ? { x: X(w.x), y: Y(w.y) - t / 2, width: w.len * S, height: t }
    : { x: X(w.x) - t / 2, y: Y(w.y), width: t, height: w.len * S };
  const mid = w.dir === 'h'
    ? { x1: X(w.x), y1: Y(w.y), x2: X(w.x + w.len), y2: Y(w.y) }
    : { x1: X(w.x), y1: Y(w.y), x2: X(w.x), y2: Y(w.y + w.len) };
  return (
    <>
      <rect {...box} fill="#0b1220" stroke="#7dd3fc" strokeWidth={1.5} />
      <line {...mid} stroke="#7dd3fc" strokeWidth={1} />
    </>
  );
}

export function OpeningsAndWindows() {
  return (
    <g pointerEvents="none">
      {OPENINGS.map((o, i) => <OpeningMark key={`o${i}`} o={o} />)}
      {WINDOWS.map((w, i) => <WindowMark key={`w${i}`} w={w} />)}
    </g>
  );
}

export function Hammocks() {
  return (
    <g pointerEvents="none">
      {HAMMOCKS.map(([wall, pillar], i) => {
        const a = { x: X(wall[0]), y: Y(wall[1]) }, b = { x: X(pillar[0]), y: Y(pillar[1]) };
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len;
        const inset = 0.2 * S, bulge = 0.4 * S;
        const p1 = { x: a.x + ux * inset, y: a.y + uy * inset }, p2 = { x: b.x - ux * inset, y: b.y - uy * inset };
        const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
        return (
          <Fragment key={i}>
            <path
              d={`M ${p1.x} ${p1.y} Q ${mx - uy * bulge} ${my + ux * bulge} ${p2.x} ${p2.y} Q ${mx + uy * bulge} ${my - ux * bulge} ${p1.x} ${p1.y} Z`}
              fill="#f472b6" fillOpacity={0.22} stroke="#f9a8d4" strokeWidth={1.5}
            />
            {[p1, p2].map((pt, j) => <circle key={j} cx={pt.x} cy={pt.y} r={2.5} fill="#f9a8d4" />)}
          </Fragment>
        );
      })}
    </g>
  );
}

/** Furniture is drawn under the labels so room names stay readable. */
export function FurnitureLayer() {
  return (
    <g pointerEvents="none" fill="#e2e8f0" fillOpacity={0.06} stroke="#cbd5e1" strokeOpacity={0.6} strokeWidth={1}>
      {FURNITURE.map((p, i) => {
        switch (p.kind) {
          case 'rect': return <rect key={i} x={X(p.x)} y={Y(p.y)} width={p.w * S} height={p.h * S} rx={p.round ?? 2} />;
          case 'circle': return <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={p.r * S} />;
          case 'ellipse': return <ellipse key={i} cx={X(p.x)} cy={Y(p.y)} rx={p.rx * S} ry={p.ry * S} />;
          case 'line': return <line key={i} x1={X(p.x1)} y1={Y(p.y1)} x2={X(p.x2)} y2={Y(p.y2)} strokeWidth={p.strong ? 2 : 1} />;
        }
      })}
    </g>
  );
}

export function Labels({ rooms }: { rooms: Rooms }) {
  return (
    <g pointerEvents="none" fontFamily="JetBrains Mono" textAnchor="middle">
      {Object.entries(rooms).map(([key, room]) => {
        const [x, y, w, h] = room.labelRect || room.rects[0];
        const cx = X(x + w / 2), cy = Y(y + h / 2);
        const maxWidth = w * S * 0.9;
        const area = `${fmtNum(roomArea(room), 1)} m²`;
        const title = room.name.toUpperCase();

        if (h < 2) {
          const text = `${title} • ${area}`;
          return <text key={key} x={cx} y={cy + 3.5} fill={room.text} fontSize={fitFontSize(text, maxWidth, 10)} fontWeight={600}>{text}</text>;
        }
        // Narrow rooms: break the name at " & " or " / " instead of shrinking it too much.
        let lines = [title];
        const sep = title.match(/ (&|\/) /);
        if (fitFontSize(title, maxWidth) < 10 && sep && sep.index !== undefined) {
          lines = [title.slice(0, sep.index + 2), title.slice(sep.index + 3)];
        }
        const titleSize = Math.min(...lines.map(l => fitFontSize(l, maxWidth)));
        const dims = roomDims(room);
        const subLines = room.rects.length === 1 && fitFontSize(`${dims} • ${area}`, maxWidth, 10) < 8.5 ? [dims, area] : [`${dims} • ${area}`];
        return (
          <Fragment key={key}>
            {lines.map((line, i) => (
              <text key={`t${i}`} x={cx} y={cy - 2 - (lines.length - 1 - i) * (titleSize + 2)} fill={room.text} fontSize={titleSize} fontWeight={700}>{line}</text>
            ))}
            {subLines.map((line, i) => (
              <text key={`s${i}`} x={cx} y={cy + 13 + i * 11} fill={room.text} opacity={0.7} fontSize={fitFontSize(line, maxWidth, 10)}>{line}</text>
            ))}
          </Fragment>
        );
      })}
    </g>
  );
}

export function Dimensions() {
  const items: ReactNode[] = [];
  const label = (x: number, y: number, text: string, rotate = false) =>
    items.push(<text key={items.length} x={x} y={y} fill="#94a3b8" stroke="none" textAnchor="middle" transform={rotate ? `rotate(-90 ${x} ${y})` : undefined}>{text}</text>);
  const line = (x1: number, y1: number, x2: number, y2: number) => items.push(<line key={items.length} x1={x1} y1={y1} x2={x2} y2={y2} />);
  const tick = (x: number, y: number) => line(x - 4, y + 4, x + 4, y - 4);
  const dimH = (a: number, b: number, y: number) => {
    line(X(a) - 6, y, X(b) + 6, y);
    tick(X(a), y); tick(X(b), y);
    label((X(a) + X(b)) / 2, y - 5, fmtNum(b - a, 2));
  };
  const dimV = (a: number, b: number, x: number, side: number) => {
    line(x, Y(a) - 6, x, Y(b) + 6);
    tick(x, Y(a)); tick(x, Y(b));
    label(x + side * 6, (Y(a) + Y(b)) / 2, fmtNum(b - a, 2), true);
  };

  [[0, 5], [5, 16], [16, 21]].forEach(([a, b]) => dimH(a, b, OY - 22));
  dimH(0, HOUSE_W, OY - 50);
  [[0, 3.5], [3.5, 7.5], [7.5, 9.5], [9.5, 11.5], [11.5, 14], [14, 18]].forEach(([a, b]) => dimV(a, b, OX - 22, -1));
  dimV(0, HOUSE_H, OX - 50, -1);
  [[0, 5], [5, 14], [14, 18]].forEach(([a, b]) => dimV(a, b, X(HOUSE_W) + 22, -1));
  [[0, 4.5], [4.5, 10], [10, 13], [13, 21]].forEach(([a, b]) => dimH(a, b, Y(HOUSE_H) + 22));

  return (
    <g pointerEvents="none" stroke="#64748b" strokeWidth={1} fontFamily="JetBrains Mono" fontSize={10}>
      {items}
      {/* Graphic scale bar (0–5 m) */}
      <g stroke="#cbd5e1">
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={X(i)} y={742} width={S} height={6} fill={i % 2 ? 'none' : '#cbd5e1'} />)}
      </g>
      <text x={X(0)} y={762} fill="#94a3b8" stroke="none" textAnchor="middle">0</text>
      <text x={X(5)} y={762} fill="#94a3b8" stroke="none" textAnchor="middle">5 m</text>
      <text x={X(0)} y={736} fill="#64748b" stroke="none">ESCALA GRÁFICA</text>
      <text x={X(HOUSE_W)} y={756} fill="#475569" stroke="none" textAnchor="end" fontSize={11}>
        {`CONSTRUÇÃO ${HOUSE_W} × ${HOUSE_H} m • LOTE MÍN. 24 m DE FRENTE`}
      </text>
    </g>
  );
}

export function Wind() {
  const breeze = [
    'M 985 200 C 900 200, 720 260, 600 310',
    'M 985 400 C 900 400, 720 390, 600 385',
    'M 985 760 C 900 700, 720 560, 595 470',
  ];
  const label = (x: number, y: number, text: string, fill: string, anchor: 'start' | 'middle' | 'end' = 'middle') => (
    <text key={text} x={x} y={y} fill={fill} fontFamily="JetBrains Mono" fontSize={10} fontWeight={700} textAnchor={anchor}>{text}</text>
  );
  return (
    <g pointerEvents="none" fill="none">
      {breeze.map(d => <path key={d} d={d} className="wind-path" stroke="#38bdf8" strokeWidth={2.5} markerEnd="url(#arrow-wind)" opacity={0.85} />)}
      <path d="M 400 330 C 300 320, 200 310, 20 300" className="wind-path" stroke="#fb923c" strokeWidth={2} markerEnd="url(#arrow-hot)" opacity={0.7} />
      {label(985, 185, 'BRISA LESTE', '#7dd3fc', 'end')}
      {label(985, 790, 'BRISA SUDESTE', '#7dd3fc', 'end')}
      {label(20, 290, 'AR QUENTE SAI A OESTE', '#fdba74', 'start')}
      {label(X(10.5), Y(11.05), '↑ EFEITO CHAMINÉ', '#fdba74')}
    </g>
  );
}

const WET_ROOMS: RoomKey[] = ['bath_3', 'service', 'master_bath', 'bwc_social', 'kitchen'];

/**
 * Roof drains inward (implúvio): eave gutter → downpipes in the pillars → linear drain → two independent outlets.
 * Wet areas send sewage along the west setback to a septic tank in the front setback.
 */
export function Utilities({ rooms, courtyard: [cx, cy, cw, ch] }: { rooms: Rooms; courtyard: Rect }) {
  const box = ([x, y, w, h]: Rect, props: SVGProps<SVGRectElement>) => <rect x={X(x)} y={Y(y)} width={w * S} height={h * S} {...props} />;
  const tag = (x: number, y: number, text: string, fill: string, size = 8) => (
    <text x={X(x)} y={Y(y)} fill={fill} fontFamily="JetBrains Mono" fontSize={size} fontWeight={700} textAnchor="middle" dominantBaseline="middle">{text}</text>
  );
  const eave = 0.5, gx0 = cx + eave, gy0 = cy + eave, gx1 = cx + cw - eave, gy1 = cy + ch - eave;
  const slopes: Pt[][] = [
    [[8.1, 3.25], [8.1, gy0]], [[12.9, 3.25], [12.9, gy0]],
    [[8.1, 13.75], [8.1, gy1]], [[12.9, 13.75], [12.9, gy1]],
    [[5.25, 7.4], [gx0, 7.4]], [[5.25, 9.6], [gx0, 9.6]],
    [[15.75, 7.4], [gx1, 7.4]], [[15.75, 9.6], [gx1, 9.6]],
  ];
  const trapMain: Pt = [cx + cw - 0.65, cy + 0.3], trapEmergency: Pt = [cx + 0.35, cy + ch - 0.35];
  const cistern: Rect = [14.2, 0.4, 1.6, 2.4];
  const sewer = { stroke: '#d97706', strokeWidth: 2, strokeDasharray: '6 3' };

  return (
    <g pointerEvents="none" fill="none">
      {/* Wet areas and the walls they share */}
      {WET_ROOMS.flatMap(k => rooms[k].rects).map((r, i) => <Fragment key={`wet${i}`}>{box(r, { fill: '#0ea5e9', fillOpacity: 0.12 })}</Fragment>)}
      {[[[0, 9.5], [5, 9.5]], [[13, 14], [13, 18]]].map((p, i) => <path key={`hw${i}`} d={pts(p as Pt[])} stroke="#38bdf8" strokeWidth={6} opacity={0.8} />)}

      {/* Roof slope towards the courtyard, ending at the eave gutter */}
      {slopes.map((p, i) => <path key={`sl${i}`} d={pts(p)} stroke="#7dd3fc" strokeWidth={1.5} strokeDasharray="5 3" markerEnd="url(#arrow-rain)" />)}

      {/* Eave gutter and the eight downpipes inside the pillars */}
      {box([gx0, gy0, gx1 - gx0, gy1 - gy0], { stroke: '#22d3ee', strokeWidth: 3 })}
      {PILLAR_OFFSETS(cw, ch).map(([dx, dy]) => {
        const px = cx + dx, py = cy + dy;
        return (
          <Fragment key={`dp${dx}-${dy}`}>
            <path d={pts([[px, py], [clamp(px, gx0, gx1), clamp(py, gy0, gy1)]])} stroke="#22d3ee" strokeWidth={2} />
            <circle cx={X(px)} cy={Y(py)} r={4} fill="#0284c7" stroke="#e0f2fe" strokeWidth={1} />
          </Fragment>
        );
      })}

      {/* Linear drain collector along the courtyard edge, with sand traps */}
      {box([cx + 0.15, cy + 0.15, cw - 0.3, ch - 0.3], { stroke: '#3b82f6', strokeWidth: 2.5 })}
      {[trapMain, trapEmergency].map(([x, y]) => (
        <Fragment key={`ca${x}`}>
          {box([x - 0.25, y - 0.25, 0.5, 0.5], { fill: '#1e3a8a', stroke: '#93c5fd', strokeWidth: 1 })}
          {tag(x, y, 'CA', '#bfdbfe', 7)}
        </Fragment>
      ))}

      {/* Main outlet → cistern under the garage → overflow to the street */}
      <path d={pts([trapMain, [14.75, trapMain[1]], [14.75, cistern[1] + cistern[3]]])} stroke="#3b82f6" strokeWidth={3} />
      {box(cistern, { fill: '#1e3a8a', fillOpacity: 0.5, stroke: '#60a5fa', strokeWidth: 1.5 })}
      {tag(15, 1.35, 'CISTERNA', '#bfdbfe', 7)}
      {tag(15, 1.8, '~15 m³', '#93c5fd', 7)}
      <path d={pts([[15.4, cistern[1]], [15.4, -0.5]])} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrow-pipe)" />

      {/* Independent emergency outlet → west setback */}
      <path d={pts([trapEmergency, [trapEmergency[0], 11.9], [-1, 11.9]])} stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#arrow-pipe)" />

      {/* Sewage → grease trap → septic tank + soakaway in the front setback */}
      {[8.5, 10.5, 16].map(y => <path key={`sw${y}`} d={pts([[0, y], [-0.4, y]])} {...sewer} />)}
      <path d={pts([[13, 18], [13, 18.35], [-0.4, 18.35], [-0.4, -0.4], [-2, -0.4]])} {...sewer} />
      {box([13.35, 18.17, 0.6, 0.36], { fill: '#78350f', stroke: '#fbbf24', strokeWidth: 1 })}
      {tag(13.65, 18.36, 'CG', '#fde68a', 6)}
      {[[-0.4, 18.35], [-0.4, -0.4]].map(([x, y]) => <Fragment key={`ci${y}`}>{box([x - 0.15, y - 0.15, 0.3, 0.3], { fill: '#78350f', stroke: '#fbbf24', strokeWidth: 1 })}</Fragment>)}
      {box([-4.4, -1.6, 2.4, 1.5], { fill: '#78350f', fillOpacity: 0.5, stroke: '#fbbf24', strokeWidth: 1.5 })}
      {tag(-3.2, -0.85, 'F', '#fde68a', 10)}
      <path d={pts([[-3.2, -0.1], [-3.2, 0.4]])} {...sewer} />
      <circle cx={X(-3.2)} cy={Y(1.2)} r={0.8 * S} fill="#78350f" fillOpacity={0.35} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 2" />
      {tag(-3.2, 1.2, 'S', '#fde68a', 10)}

      {/* Water tank + solar heater over the master bathroom */}
      {box([0.3, 14.3, 1.7, 0.8], { fill: '#0ea5e9', fillOpacity: 0.3, stroke: '#38bdf8', strokeWidth: 1 })}
      {tag(1.15, 14.7, "CX D'ÁGUA", '#bae6fd', 6)}
      {box([2.2, 14.3, 2.0, 0.8], { fill: '#f59e0b', fillOpacity: 0.3, stroke: '#fbbf24', strokeWidth: 1 })}
      {tag(3.2, 14.7, 'SOLAR', '#fde68a', 6)}

      {/* Distribution board + solar inverter by the entrance */}
      {box([5.6, 0.25, 1.6, 0.5], { fill: '#facc15', fillOpacity: 0.25, stroke: '#facc15', strokeWidth: 1, rx: 3 })}
      {tag(6.4, 0.5, 'QD + INV', '#fef08a', 6)}
    </g>
  );
}

const FACE_LINES: Record<Face, [number, number, number, number]> = {
  N: [0, 0, HOUSE_W, 0], S: [0, HOUSE_H, HOUSE_W, HOUSE_H], O: [0, 0, 0, HOUSE_H], L: [HOUSE_W, 0, HOUSE_W, HOUSE_H],
};

export function SunOverlay({ sx, sy, faces }: { sx: number; sy: number; faces: Set<Face> }) {
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id="sun-grad" gradientUnits="userSpaceOnUse" x1={sx} y1={sy} x2={X(HOUSE_W / 2)} y2={Y(HOUSE_H / 2)}>
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={X(0)} y={Y(0)} width={HOUSE_W * S} height={HOUSE_H * S} fill="url(#sun-grad)" />
      {[...faces].map(f => {
        const [x1, y1, x2, y2] = FACE_LINES[f];
        return <line key={f} x1={X(x1)} y1={Y(y1)} x2={X(x2)} y2={Y(y2)} stroke="#fbbf24" strokeWidth={12} opacity={0.45} strokeLinecap="round" />;
      })}
    </g>
  );
}

export function SunIcon({ sx, sy }: { sx: number; sy: number }) {
  return (
    <g pointerEvents="none">
      <circle cx={sx} cy={sy} r={28} fill="#fbbf24" opacity={0.2} />
      <circle cx={sx} cy={sy} r={16} fill="#fbbf24" stroke="#fde68a" strokeWidth={2} />
    </g>
  );
}
