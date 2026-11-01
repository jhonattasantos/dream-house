import { useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent, type Ref } from 'react';
import type { RoomKey } from '../../data/rooms';
import { BASE_VIEW, S, X, Y, clamp } from '../../lib/geometry';
import { sunInfo } from '../../lib/sun';
import { useHouse } from '../../store';
import {
  CourtyardDecor, CourtyardEdge, Dimensions, FurnitureLayer, Hammocks, Labels, OpeningsAndWindows,
  PlanDefs, SunIcon, SunOverlay, Utilities, VerandaEdge, Walls, Wind,
} from './layers';

export interface PlanHandle {
  zoomBy: (factor: number) => void;
  reset: () => void;
}

type View = typeof BASE_VIEW;
type Gesture =
  | { type: 'pan'; start: { x: number; y: number }; view: View; scale: number; moved: boolean }
  | { type: 'pinch'; dist: number; view: View; mid: DOMPoint; moved: boolean };

interface Props {
  /** Mini version for the tour: rooms and walls only. */
  mini?: boolean;
  highlight: RoomKey;
  onRoomClick: (key: RoomKey) => void;
  className?: string;
  viewBox?: string;
  ref?: Ref<PlanHandle>;
}

export default function Plan2D({ mini = false, highlight, onRoomClick, className, viewBox, ref }: Props) {
  const rooms = useHouse(s => s.rooms);
  const layers = useHouse(s => s.layers);
  const sun = useHouse(s => s.sun);
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>(BASE_VIEW);
  const viewRef = useRef(view);
  viewRef.current = view;

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<Gesture | null>(null);
  const suppressClick = useRef(false);

  const zoomAt = (factor: number, px: number, py: number, from = viewRef.current) => {
    const w = clamp(from.w * factor, 200, 2000);
    const f = w / from.w;
    setView({ x: px - (px - from.x) * f, y: py - (py - from.y) * f, w, h: from.h * f });
  };

  useImperativeHandle(ref, () => ({
    zoomBy: factor => { const v = viewRef.current; zoomAt(factor, v.x + v.w / 2, v.y + v.h / 2); },
    reset: () => setView(BASE_VIEW),
  }));

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current!;
    const pt = svg.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM()!.inverse());
  };

  // React registers wheel listeners as passive, so preventDefault needs a native listener.
  useEffect(() => {
    const svg = svgRef.current;
    if (mini || !svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const p = clientToSvg(e.clientX, e.clientY);
      zoomAt(Math.exp(e.deltaY * 0.0015), p.x, p.y);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [mini]);

  const startGesture = (): Gesture | null => {
    const list = [...pointers.current.values()];
    const scale = svgRef.current!.getScreenCTM()!.a;
    if (list.length === 1) return { type: 'pan', start: list[0], view: { ...viewRef.current }, scale, moved: false };
    if (list.length === 2) {
      const mid = clientToSvg((list[0].x + list[1].x) / 2, (list[0].y + list[1].y) / 2);
      return { type: 'pinch', dist: Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y), view: { ...viewRef.current }, mid, moved: true };
    }
    return null;
  };

  const onPointerDown = (e: PointerEvent<SVGSVGElement>) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gesture.current = startGesture();
  };

  const onPointerMove = (e: PointerEvent<SVGSVGElement>) => {
    const g = gesture.current;
    if (!pointers.current.has(e.pointerId) || !g) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (g.type === 'pan') {
      const dx = e.clientX - g.start.x, dy = e.clientY - g.start.y;
      if (!g.moved) {
        if (Math.hypot(dx, dy) < 5) return;
        g.moved = true;
        svgRef.current!.setPointerCapture(e.pointerId);
        svgRef.current!.classList.add('is-panning');
      }
      setView({ ...g.view, x: g.view.x - dx / g.scale, y: g.view.y - dy / g.scale });
    } else {
      const list = [...pointers.current.values()];
      const dist = Math.hypot(list[0].x - list[1].x, list[0].y - list[1].y);
      if (dist > 0) zoomAt(g.dist / dist, g.mid.x, g.mid.y, g.view);
    }
  };

  const endPointer = (e: PointerEvent<SVGSVGElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    if (gesture.current?.moved) {
      suppressClick.current = true;
      setTimeout(() => { suppressClick.current = false; }, 0);
    }
    pointers.current.delete(e.pointerId);
    gesture.current = pointers.current.size ? startGesture() : null;
    if (gesture.current) gesture.current.moved = true;
    svgRef.current!.classList.remove('is-panning');
  };

  const roomKeyFrom = (target: EventTarget) =>
    ((target as Element).closest('.room-group') as HTMLElement | null)?.dataset.room as RoomKey | undefined;

  const onClick = (e: MouseEvent<SVGSVGElement>) => {
    if (suppressClick.current) return;
    const key = roomKeyFrom(e.target);
    if (key) onRoomClick(key);
  };

  const onKeyDown = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const key = roomKeyFrom(e.target);
    if (!key) return;
    e.preventDefault();
    onRoomClick(key);
  };

  const courtyard = rooms.courtyard.rects[0];
  const sunData = !mini && layers.sun ? sunInfo(sun.hour, sun.season, rooms) : null;

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox ?? `${view.x} ${view.y} ${view.w} ${view.h}`}
      className={`${mini ? '' : 'floorplan'} ${!mini && layers.furniture ? 'show-furniture' : ''} ${className ?? ''}`}
      aria-label={mini ? 'Mini-mapa da casa' : 'Planta baixa da casa'}
      onClick={onClick}
      {...(mini ? {} : { onPointerDown, onPointerMove, onPointerUp: endPointer, onPointerCancel: endPointer, onKeyDown })}
    >
      {!mini && <PlanDefs />}

      <g>
        {Object.entries(rooms).map(([key, room]) => (
          <g
            key={key}
            className="room-group"
            data-room={key}
            {...(mini ? {} : { tabIndex: 0, role: 'button', 'aria-label': room.name })}
          >
            {room.rects.map(([x, y, w, h], i) => (
              <rect
                key={i}
                className={`room-shape ${key === highlight ? 'active' : ''}`}
                x={X(x)} y={Y(y)} width={w * S} height={h * S}
                fill={room.fill} fillOpacity={room.fillOpacity}
              />
            ))}
            {key === 'courtyard' && !mini && <CourtyardDecor rect={courtyard} />}
          </g>
        ))}
      </g>

      <Walls rooms={rooms} mini={mini} />
      <CourtyardEdge rect={courtyard} mini={mini} />

      {!mini && (
        <>
          <VerandaEdge rect={courtyard} />
          <OpeningsAndWindows />
          <Hammocks />
          {layers.furniture && <FurnitureLayer />}
          {sunData && <SunOverlay sx={sunData.sx} sy={sunData.sy} faces={sunData.faces} />}
          {layers.labels && <Labels rooms={rooms} />}
          {layers.dims && <Dimensions />}
          {layers.wind && <Wind />}
          {layers.utils && <Utilities rooms={rooms} courtyard={courtyard} />}
          {sunData && <SunIcon sx={sunData.sx} sy={sunData.sy} />}
        </>
      )}
    </svg>
  );
}
