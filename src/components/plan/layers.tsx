import { Fragment, type ReactNode, type SVGProps } from 'react';
import type { Opening, Window } from '../../data/openings';
import type { Rect, Room, RoomKey } from '../../data/rooms';
import { OX, OY, S, X, Y, fitFontSize, fmtNum, outlines, roomArea, roomDims, wallFace, type Face } from '../../lib/geometry';
import type { HouseModel } from '../../lib/model';
import { useHouse } from '../../store';

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
  const { pond, deck, trees } = useHouse(s => s.model.courtyardDecor);
  const box = ([x, y, bw, bh]: Rect) => ({ x: X(x), y: Y(y), width: bw * S, height: bh * S });
  return (
    <g pointerEvents="none">
      <rect x={X(x0)} y={Y(y0)} width={w * S} height={h * S} fill="url(#grass-pattern)" opacity={0.6} />
      {deck && <rect {...box(deck)} fill="url(#deck-pattern)" opacity={0.8} />}
      {pond && <rect {...box(pond)} rx={6} fill="#0ea5e9" fillOpacity={0.25} stroke="#38bdf8" strokeOpacity={0.5} />}
      {trees.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} className="animate-foliage" cx={X(x)} cy={Y(y)} r={r * S} fill="#059669" fillOpacity={0.45} stroke="#10b981" strokeOpacity={0.6} />
      ))}
    </g>
  );
}

export function Walls({ rooms, mini }: { rooms: Rooms; mini: boolean }) {
  const model = useHouse(s => s.model);
  return (
    <g stroke="#e2e8f0" fill="none" strokeLinecap="square" pointerEvents="none">
      {Object.values(rooms).filter(r => r.walls !== false).flatMap(r => r.rects).map(([x, y, w, h], i) => (
        <rect key={i} x={X(x)} y={Y(y)} width={w * S} height={h * S} strokeWidth={mini ? 2 : 3} />
      ))}
      {outlines(model).map(([x, y, w, h], i) => (
        <rect key={`b${i}`} x={X(x)} y={Y(y)} width={w * S} height={h * S} strokeWidth={mini ? 5 : 8} />
      ))}
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

/** Roof eave over the garden and the pillars that carry the roof. */
export function VerandaEdge() {
  const { eave, pillars } = useHouse(s => s.model);
  const p = 0.3;
  return (
    <g pointerEvents="none">
      {eave && (
        <rect x={X(eave[0])} y={Y(eave[1])} width={eave[2] * S} height={eave[3] * S} fill="none" stroke="#94a3b8" strokeWidth={1} strokeDasharray="8 5" opacity={0.7} />
      )}
      {pillars.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={X(x - p / 2)} y={Y(y - p / 2)} width={p * S} height={p * S} fill="#e2e8f0" />
      ))}
    </g>
  );
}

/** Lot boundary, setbacks, walkways and the parking spaces, for projects drawn on a specific terrain. */
export function LotLayer() {
  const lot = useHouse(s => s.model.lot);
  if (!lot) return null;
  const [lx, ly, lw, lh] = lot.rect;
  return (
    <g pointerEvents="none">
      <rect x={X(lx)} y={Y(ly)} width={lw * S} height={lh * S} fill="#14532d" fillOpacity={0.12} stroke="#a3e635" strokeOpacity={0.6} strokeWidth={1.5} strokeDasharray="10 4 2 4" />
      {lot.paths.map(([x, y, w, h]) => (
        <rect key={`p${x}-${y}`} x={X(x)} y={Y(y)} width={w * S} height={h * S} fill="#a8a29e" fillOpacity={0.18} stroke="#a8a29e" strokeOpacity={0.4} strokeWidth={1} />
      ))}
      {lot.cars.map(([cx, cy, cw, ch]) => (
        <g key={`c${cx}-${cy}`}>
          <rect x={X(cx)} y={Y(cy)} width={cw * S} height={ch * S} rx={10} fill="#475569" fillOpacity={0.35} stroke="#94a3b8" strokeWidth={1} />
          <rect x={X(cx + 0.2)} y={Y(cy + 0.9)} width={(cw - 0.4) * S} height={0.6 * S} rx={3} fill="#1f2937" fillOpacity={0.6} />
          <rect x={X(cx + 0.2)} y={Y(cy + ch - 1.4)} width={(cw - 0.4) * S} height={0.5 * S} rx={3} fill="#1f2937" fillOpacity={0.6} />
        </g>
      ))}
      {lot.notes.map(({ at: [x, y], text, vertical }) => (
        <text
          key={text} x={X(x)} y={Y(y)} fill="#bef264" fillOpacity={0.75} fontFamily="JetBrains Mono" fontSize={9} fontWeight={600}
          textAnchor="middle" dominantBaseline="middle" transform={vertical ? `rotate(-90 ${X(x)} ${Y(y)})` : undefined}
        >
          {text}
        </text>
      ))}
    </g>
  );
}

function OpeningMark({ o, model }: { o: Opening; model: HouseModel }) {
  const p1 = { x: X(o.x), y: Y(o.y) };
  const p2 = o.dir === 'h' ? { x: X(o.x + o.len), y: Y(o.y) } : { x: X(o.x), y: Y(o.y + o.len) };
  const gap = <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#0b1220" strokeWidth={wallFace(o, model) ? 10 : 6} />;
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
  const model = useHouse(s => s.model);
  return (
    <g pointerEvents="none">
      {model.openings.map((o, i) => <OpeningMark key={`o${i}`} o={o} model={model} />)}
      {model.windows.map((w, i) => <WindowMark key={`w${i}`} w={w} />)}
    </g>
  );
}

export function Hammocks() {
  const hammocks = useHouse(s => s.model.hammocks);
  return (
    <g pointerEvents="none">
      {hammocks.map(([wall, pillar], i) => {
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
  const furniture = useHouse(s => s.model.furniture);
  return (
    <g pointerEvents="none" fill="#e2e8f0" fillOpacity={0.06} stroke="#cbd5e1" strokeOpacity={0.6} strokeWidth={1}>
      {furniture.map((p, i) => {
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
        const [x, y, rw, rh] = room.labelRect || room.rects[0];
        const cx = X(x + rw / 2), cy = Y(y + rh / 2);
        // Long, narrow strips (a corridor) get their label along the strip.
        const vertical = rh > rw * 2.5 && rw < 2;
        const [w, h] = vertical ? [rh, rw] : [rw, rh];
        const maxWidth = w * S * 0.9;
        const area = `${fmtNum(roomArea(room), 1)} m²`;
        const title = room.name.toUpperCase();

        if (h < 2) {
          const text = `${title} • ${area}`;
          return <text key={key} x={cx} y={cy + 3.5} fill={room.text} fontSize={fitFontSize(text, maxWidth, 10)} fontWeight={600} transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}>{text}</text>;
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
          <g key={key} transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}>
            {lines.map((line, i) => (
              <text key={`t${i}`} x={cx} y={cy - 2 - (lines.length - 1 - i) * (titleSize + 2)} fill={room.text} fontSize={titleSize} fontWeight={700}>{line}</text>
            ))}
            {subLines.map((line, i) => (
              <text key={`s${i}`} x={cx} y={cy + 13 + i * 11} fill={room.text} opacity={0.7} fontSize={fitFontSize(line, maxWidth, 10)}>{line}</text>
            ))}
          </g>
        );
      })}
    </g>
  );
}

export function Dimensions() {
  const { W, H, dims, caption, lot } = useHouse(s => s.model);
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

  dims.top.forEach(([a, b]) => dimH(a, b, OY - 22));
  dimH(0, W, OY - 50);
  dims.left.forEach(([a, b]) => dimV(a, b, OX - 22, -1));
  dimV(0, H, OX - 50, -1);
  dims.right.forEach(([a, b]) => dimV(a, b, X(W) + 22, -1));
  dims.bottom.forEach(([a, b]) => dimH(a, b, Y(H) + 22));
  // The scale bar goes under the house, or under the lot when there is one.
  const base = Y(Math.max(H, lot ? lot.rect[1] + lot.rect[3] : H)) + 56;

  return (
    <g pointerEvents="none" stroke="#64748b" strokeWidth={1} fontFamily="JetBrains Mono" fontSize={10}>
      {items}
      {/* Graphic scale bar (0–5 m) */}
      <g stroke="#cbd5e1">
        {[0, 1, 2, 3, 4].map(i => <rect key={i} x={X(i)} y={base} width={S} height={6} fill={i % 2 ? 'none' : '#cbd5e1'} />)}
      </g>
      <text x={X(0)} y={base + 20} fill="#94a3b8" stroke="none" textAnchor="middle">0</text>
      <text x={X(5)} y={base + 20} fill="#94a3b8" stroke="none" textAnchor="middle">5 m</text>
      <text x={X(0)} y={base - 6} fill="#64748b" stroke="none">ESCALA GRÁFICA</text>
      <text x={X(Math.max(W, lot ? lot.rect[0] + lot.rect[2] : W))} y={base + 36} fill="#475569" stroke="none" textAnchor="end" fontSize={11}>{caption}</text>
    </g>
  );
}

export function Wind() {
  const { breezes, hot, labels } = useHouse(s => s.model.wind);
  const curve = ([a, b, c, d]: Pt[]) => `M ${X(a[0])} ${Y(a[1])} C ${X(b[0])} ${Y(b[1])}, ${X(c[0])} ${Y(c[1])}, ${X(d[0])} ${Y(d[1])}`;
  return (
    <g pointerEvents="none" fill="none">
      {breezes.map(b => <path key={String(b)} d={curve(b)} className="wind-path" stroke="#38bdf8" strokeWidth={2.5} markerEnd="url(#arrow-wind)" opacity={0.85} />)}
      {hot && <path d={curve(hot)} className="wind-path" stroke="#fb923c" strokeWidth={2} markerEnd="url(#arrow-hot)" opacity={0.7} />}
      {labels.map(({ at: [x, y], text, hot: warm, anchor = 'middle' }) => (
        <text key={text} x={X(x)} y={Y(y)} fill={warm ? '#fdba74' : '#7dd3fc'} fontFamily="JetBrains Mono" fontSize={10} fontWeight={700} textAnchor={anchor}>{text}</text>
      ))}
    </g>
  );
}

/**
 * Rainwater from the roof to the cistern, sewage to the septic tank, and the water tank,
 * solar heater and distribution board, as each project lays them out.
 */
export function Utilities({ rooms }: { rooms: Rooms }) {
  const u = useHouse(s => s.model.utilities);
  const box = ([x, y, w, h]: Rect, props: SVGProps<SVGRectElement>) => <rect x={X(x)} y={Y(y)} width={w * S} height={h * S} {...props} />;
  const tag = ([x, y]: Pt, text: string, fill: string, size = 8) => (
    <text x={X(x)} y={Y(y)} fill={fill} fontFamily="JetBrains Mono" fontSize={size} fontWeight={700} textAnchor="middle" dominantBaseline="middle">{text}</text>
  );
  const center = ([x, y, w, h]: Rect): Pt => [x + w / 2, y + h / 2];
  const sewer = { stroke: '#d97706', strokeWidth: 2, strokeDasharray: '6 3' };
  const [cisX, cisY] = center(u.cistern);

  return (
    <g pointerEvents="none" fill="none">
      {/* Wet areas and the walls they share */}
      {u.wetRooms.flatMap(k => rooms[k].rects).map((r, i) => <Fragment key={`wet${i}`}>{box(r, { fill: '#0ea5e9', fillOpacity: 0.12 })}</Fragment>)}
      {u.hydraulicWalls.map((p, i) => <path key={`hw${i}`} d={pts(p)} stroke="#38bdf8" strokeWidth={6} opacity={0.8} />)}

      {/* Roof fall, gutters and downpipes */}
      {u.slopes.map((p, i) => <path key={`sl${i}`} d={pts(p)} stroke="#7dd3fc" strokeWidth={1.5} strokeDasharray="5 3" markerEnd="url(#arrow-rain)" />)}
      {u.gutters.map((p, i) => <path key={`gu${i}`} d={pts(p)} stroke="#22d3ee" strokeWidth={3} />)}
      {u.downpipes.map(({ at, gutter }) => (
        <Fragment key={`dp${at}`}>
          <path d={pts([at, gutter])} stroke="#22d3ee" strokeWidth={2} />
          <circle cx={X(at[0])} cy={Y(at[1])} r={4} fill="#0284c7" stroke="#e0f2fe" strokeWidth={1} />
        </Fragment>
      ))}

      {/* Linear drains with sand traps */}
      {u.drains.map((r, i) => <Fragment key={`dr${i}`}>{box(r, { stroke: '#3b82f6', strokeWidth: 2.5 })}</Fragment>)}
      {u.traps.map(([x, y]) => (
        <Fragment key={`ca${x}-${y}`}>
          {box([x - 0.25, y - 0.25, 0.5, 0.5], { fill: '#1e3a8a', stroke: '#93c5fd', strokeWidth: 1 })}
          {tag([x, y], 'CA', '#bfdbfe', 7)}
        </Fragment>
      ))}

      {/* Rainwater → cistern → overflow to the street */}
      {u.rainPipes.map((p, i) => <path key={`rp${i}`} d={pts(p)} stroke="#3b82f6" strokeWidth={3} />)}
      {box(u.cistern, { fill: '#1e3a8a', fillOpacity: 0.5, stroke: '#60a5fa', strokeWidth: 1.5 })}
      {tag([cisX, cisY - 0.25], 'CISTERNA', '#bfdbfe', 7)}
      {tag([cisX, cisY + 0.2], u.cisternVolume, '#93c5fd', 7)}
      <path d={pts(u.overflow)} stroke="#3b82f6" strokeWidth={2} markerEnd="url(#arrow-pipe)" />
      {u.emergency && <path d={pts(u.emergency)} stroke="#3b82f6" strokeWidth={2.5} strokeDasharray="6 4" markerEnd="url(#arrow-pipe)" />}

      {/* Sewage → grease trap → septic tank + soakaway */}
      {u.sewerStubs.map((p, i) => <path key={`sw${i}`} d={pts(p)} {...sewer} />)}
      <path d={pts(u.sewerMain)} {...sewer} />
      {box(u.greaseTrap, { fill: '#78350f', stroke: '#fbbf24', strokeWidth: 1 })}
      {tag(center(u.greaseTrap), 'CG', '#fde68a', 6)}
      {u.inspections.map(([x, y]) => <Fragment key={`ci${x}-${y}`}>{box([x - 0.15, y - 0.15, 0.3, 0.3], { fill: '#78350f', stroke: '#fbbf24', strokeWidth: 1 })}</Fragment>)}
      {box(u.septic, { fill: '#78350f', fillOpacity: 0.5, stroke: '#fbbf24', strokeWidth: 1.5 })}
      {tag(center(u.septic), 'F', '#fde68a', 10)}
      <path d={pts(u.septicLink)} {...sewer} />
      <circle cx={X(u.soakaway.at[0])} cy={Y(u.soakaway.at[1])} r={u.soakaway.r * S} fill="#78350f" fillOpacity={0.35} stroke="#fbbf24" strokeWidth={1.5} strokeDasharray="3 2" />
      {tag(u.soakaway.at, 'S', '#fde68a', 10)}

      {/* Water tank + solar heater, distribution board */}
      {box(u.waterTank, { fill: '#0ea5e9', fillOpacity: 0.3, stroke: '#38bdf8', strokeWidth: 1 })}
      {tag(center(u.waterTank), "CX D'ÁGUA", '#bae6fd', 6)}
      {box(u.solar, { fill: '#f59e0b', fillOpacity: 0.3, stroke: '#fbbf24', strokeWidth: 1 })}
      {tag(center(u.solar), 'SOLAR', '#fde68a', 6)}
      {box(u.board, { fill: '#facc15', fillOpacity: 0.25, stroke: '#facc15', strokeWidth: 1, rx: 3 })}
      {tag(center(u.board), 'QD', '#fef08a', 6)}
    </g>
  );
}

export function SunOverlay({ sx, sy, faces }: { sx: number; sy: number; faces: Set<Face> }) {
  const { W, H } = useHouse(s => s.model);
  const faceLines: Record<Face, [number, number, number, number]> = {
    N: [0, 0, W, 0], S: [0, H, W, H], O: [0, 0, 0, H], L: [W, 0, W, H],
  };
  return (
    <g pointerEvents="none">
      <defs>
        <linearGradient id="sun-grad" gradientUnits="userSpaceOnUse" x1={sx} y1={sy} x2={X(W / 2)} y2={Y(H / 2)}>
          <stop offset="0" stopColor="#fbbf24" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fbbf24" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x={X(0)} y={Y(0)} width={W * S} height={H * S} fill="url(#sun-grad)" />
      {[...faces].map(f => {
        const [x1, y1, x2, y2] = faceLines[f];
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
