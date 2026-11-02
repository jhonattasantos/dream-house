import { OrbitControls } from '@react-three/drei';
import { Canvas, useThree, type ThreeElements, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type Ref, type RefObject } from 'react';
import * as THREE from 'three';
import type { FurniturePiece } from '../../data/furniture';
import type { Rect, RoomKey } from '../../data/rooms';
import { BASE_H, BASE_W } from '../../lib/model';
import { sunDirection } from '../../lib/sun';
import { wallBlocks, type Block } from '../../lib/walls3d';
import { useHouse } from '../../store';
import type { PlanHandle } from '../plan/Plan2D';

// Plan meters → scene: x stays east, plan y (southwards) becomes +z, heights go on y.
// The scene group is shifted so the house is centred on the origin.

// Seen from the south, so north (the street) is at the top of the screen as in the 2D plan.
// Framed for the 21 m house; smaller houses bring the camera in proportionally.
const DEFAULT_CAMERA = new THREE.Vector3(5, 30, 27);
const FLOOR_TOP = 0.02;
const PATIO_LEVEL = -0.15;
const FLOOR_OVERRIDES: Partial<Record<RoomKey, string>> = { hallway: '#cbbfa8', entrance: '#a8a29e', porch: '#a8a29e' };

/** Box from plan-space extents. */
function Box({ x0, y0, x1, y1, z0, z1, color, opacity = 1, ...props }: {
  x0: number; y0: number; x1: number; y1: number; z0: number; z1: number; color: string; opacity?: number;
} & Omit<ThreeElements['mesh'], 'position'>) {
  return (
    <mesh position={[(x0 + x1) / 2, (z0 + z1) / 2, (y0 + y1) / 2]} castShadow={opacity === 1} receiveShadow {...props}>
      <boxGeometry args={[x1 - x0, z1 - z0, y1 - y0]} />
      <meshStandardMaterial color={color} transparent={opacity < 1} opacity={opacity} roughness={0.85} />
    </mesh>
  );
}

const stop = (e: ThreeEvent<PointerEvent | MouseEvent>) => e.stopPropagation();

/** The parts of drei's OrbitControls the toolbar buttons need. */
interface Orbit {
  target: THREE.Vector3;
  minDistance: number;
  maxDistance: number;
  update: () => void;
}

function Walls() {
  const rooms = useHouse(s => s.rooms);
  const model = useHouse(s => s.model);
  const blocks = useMemo(() => wallBlocks(rooms, model), [rooms, model]);
  const wall = (b: Block, i: number) =>
    b.kind === 'glass'
      ? <Box key={i} {...b} color="#7dd3fc" opacity={0.35} />
      : <Box key={i} {...b} color="#f5f5f4" />;
  // Walls catch clicks so rooms behind them are not selected through the wall.
  return <group onClick={stop} onPointerMove={stop}>{blocks.map(wall)}</group>;
}

function Floors({ selected, onRoomClick, onHover }: {
  selected: RoomKey; onRoomClick: (k: RoomKey) => void; onHover: (h: { name: string; x: number; y: number } | null) => void;
}) {
  const rooms = useHouse(s => s.rooms);
  const white = useMemo(() => new THREE.Color('#ffffff'), []);
  return (
    <group>
      {(Object.entries(rooms) as [RoomKey, (typeof rooms)[RoomKey]][]).map(([key, room]) => {
        const uncovered = key === 'courtyard';
        const color = FLOOR_OVERRIDES[key] ?? (uncovered ? '#4d7c0f' : `#${new THREE.Color(room.fill).lerp(white, 0.55).getHexString()}`);
        const [z0, z1] = uncovered ? [-0.3, PATIO_LEVEL] : [FLOOR_TOP - 0.04, FLOOR_TOP];
        return room.rects.map(([x, y, w, h], i) => (
          <mesh
            key={`${key}-${i}`}
            position={[x + w / 2, (z0 + z1) / 2, y + h / 2]}
            receiveShadow
            onClick={e => { if (e.delta > 5) return; e.stopPropagation(); onRoomClick(key); }}
            onPointerMove={e => { e.stopPropagation(); onHover({ name: room.name, x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY }); }}
            onPointerOut={() => onHover(null)}
          >
            <boxGeometry args={[w, z1 - z0, h]} />
            <meshStandardMaterial
              color={color}
              emissive={key === selected ? '#0ea5e9' : '#000000'}
              emissiveIntensity={key === selected ? 0.3 : 0}
              roughness={0.9}
            />
          </mesh>
        ));
      })}
    </group>
  );
}

function Site({ courtyard }: { courtyard: Rect }) {
  const { W, H, courtyardDecor: { pond, deck, trees }, pillars, pillarH, lot } = useHouse(s => s.model);
  const [cx, cy, cw, ch] = courtyard;
  // Slab around the sunken courtyard, split into four pieces.
  const slab: Rect[] = [[0, 0, W, cy], [0, cy + ch, W, H - cy - ch], [0, cy, cx, ch], [cx + cw, cy, W - cx - cw, ch]];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[W / 2, -0.3, H / 2]} receiveShadow>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#1c2b1c" roughness={1} />
      </mesh>
      {slab.map(([x, y, w, h], i) => <Box key={i} x0={x} y0={y} x1={x + w} y1={y + h} z0={-0.3} z1={FLOOR_TOP - 0.04} color="#57534e" />)}
      {lot && <Lot />}
      {/* Espelho d'água and deck */}
      {pond && <Box x0={pond[0]} y0={pond[1]} x1={pond[0] + pond[2]} y1={pond[1] + pond[3]} z0={PATIO_LEVEL} z1={PATIO_LEVEL + 0.05} color="#0ea5e9" opacity={0.85} />}
      {deck && <Box x0={deck[0]} y0={deck[1]} x1={deck[0] + deck[2]} y1={deck[1] + deck[3]} z0={PATIO_LEVEL} z1={PATIO_LEVEL + 0.04} color="#92400e" />}
      {trees.map(([x, y, r]) => (
        <group key={`${x}-${y}`} position={[x, PATIO_LEVEL, y]}>
          <mesh position={[0, 1.1, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.1, 2.2, 8]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
          <mesh position={[0, 2.2 + r * 0.6, 0]} castShadow>
            <sphereGeometry args={[r * 1.2, 16, 12]} />
            <meshStandardMaterial color="#15803d" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Pillars carrying the roof over the courtyard edge */}
      {pillars.map(([x, y]) => (
        <Box key={`${x}-${y}`} x0={x - 0.15} y0={y - 0.15} x1={x + 0.15} y1={y + 0.15} z0={0} z1={pillarH} color="#e7e5e4" />
      ))}
    </group>
  );
}

/** Lawn of the lot, boundary walls on the sides and back, and the car in its parking space. */
function Lot() {
  const lot = useHouse(s => s.model.lot)!;
  const [lx, ly, lw, lh] = lot.rect;
  const [cx, cy, cw, ch] = lot.car;
  const t = 0.15, h = 1.8;
  return (
    <group>
      <Box x0={lx} y0={ly} x1={lx + lw} y1={ly + lh} z0={-0.3} z1={-0.27} color="#3f6212" />
      <Box x0={lx - t} y0={ly} x1={lx} y1={ly + lh} z0={-0.3} z1={h} color="#d6d3d1" />
      <Box x0={lx + lw} y0={ly} x1={lx + lw + t} y1={ly + lh} z0={-0.3} z1={h} color="#d6d3d1" />
      <Box x0={lx - t} y0={ly + lh} x1={lx + lw + t} y1={ly + lh + t} z0={-0.3} z1={h} color="#d6d3d1" />
      <Box x0={cx - 0.2} y0={cy - 0.2} x1={cx + cw + 0.2} y1={cy + ch + 0.2} z0={-0.27} z1={-0.24} color="#78716c" />
      <Box x0={cx} y0={cy} x1={cx + cw} y1={cy + ch} z0={-0.1} z1={0.75} color="#475569" />
      <Box x0={cx + 0.1} y0={cy + 1.0} x1={cx + cw - 0.1} y1={cy + ch - 0.9} z0={0.75} z1={1.3} color="#1f2937" />
    </group>
  );
}

function Hammocks() {
  const hammocks = useHouse(s => s.model.hammocks);
  const tubes = useMemo(() => hammocks.map(([wall, pillar]) => {
    const a = new THREE.Vector3(wall[0], 1.8, wall[1]);
    const b = new THREE.Vector3(pillar[0], 1.8, pillar[1]);
    const dir = b.clone().sub(a).normalize().multiplyScalar(0.2);
    a.add(dir); b.sub(dir);
    const mid = a.clone().lerp(b, 0.5).setY(0.6);
    return new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(a, mid, b), 24, 0.12, 8);
  }), [hammocks]);
  return (
    <group>
      {tubes.map((g, i) => (
        <mesh key={i} geometry={g} castShadow>
          <meshStandardMaterial color="#f472b6" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function FurniturePieceMesh({ p }: { p: FurniturePiece }) {
  const material = <meshStandardMaterial color={p.color} roughness={0.8} />;
  switch (p.kind) {
    case 'rect':
      return (
        <mesh position={[p.x + p.w / 2, FLOOR_TOP + p.z / 2, p.y + p.h / 2]} castShadow receiveShadow>
          <boxGeometry args={[p.w, p.z, p.h]} />{material}
        </mesh>
      );
    case 'circle':
      return (
        <mesh position={[p.x, FLOOR_TOP + p.z / 2, p.y]} castShadow receiveShadow>
          <cylinderGeometry args={[p.r, p.r, p.z, 24]} />{material}
        </mesh>
      );
    case 'ellipse':
      return (
        <mesh position={[p.x, FLOOR_TOP + p.z / 2, p.y]} scale={[p.rx, 1, p.ry]} castShadow>
          <cylinderGeometry args={[1, 1, p.z, 24]} />{material}
        </mesh>
      );
    case 'line': {
      if (!p.z) return null;
      const len = Math.hypot(p.x2 - p.x1, p.y2 - p.y1);
      return (
        <mesh
          position={[(p.x1 + p.x2) / 2, FLOOR_TOP + p.z / 2, (p.y1 + p.y2) / 2]}
          rotation={[0, -Math.atan2(p.y2 - p.y1, p.x2 - p.x1), 0]}
          castShadow
        >
          <boxGeometry args={[len, p.z, 0.06]} />{material}
        </mesh>
      );
    }
  }
}

/** Roof planes from the project, each split into two triangles. */
function Roof() {
  const quads = useHouse(s => s.model.roof);
  const geometry = useMemo(() => {
    const positions = quads.flatMap(q => [q[0], q[1], q[2], q[0], q[2], q[3]].flatMap(([x, y, z]) => [x, z, y]));
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.computeVertexNormals();
    return g;
  }, [quads]);
  return (
    // Receiving its own shadow makes the sloped planes flicker with acne, so the roof only casts.
    <mesh geometry={geometry} castShadow onClick={stop} onPointerMove={stop}>
      <meshStandardMaterial color="#78716c" side={THREE.DoubleSide} roughness={0.7} metalness={0.2} />
    </mesh>
  );
}

function Sun() {
  const sun = useHouse(s => s.sun);
  const showSun = useHouse(s => s.layers.sun);
  const { east, up, north } = sunDirection(sun.hour, sun.season);
  const dir = new THREE.Vector3(east, Math.max(up, 0.05), -north).normalize();
  const intensity = up > 0 ? 2.6 * Math.min(1, up * 4) : 0;
  return (
    <>
      <hemisphereLight args={['#e0f2fe', '#334155', 1.1]} />
      <directionalLight
        position={dir.clone().multiplyScalar(40).toArray()}
        intensity={intensity}
        color="#fff4e0"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={17}
        shadow-camera-bottom={-17}
        shadow-camera-near={1}
        shadow-camera-far={90}
      />
      {showSun && (
        <mesh position={dir.clone().multiplyScalar(26).toArray()}>
          <sphereGeometry args={[0.9, 24, 16]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
      )}
    </>
  );
}

/** Gives the toolbar's zoom/reset buttons access to the camera. */
function CameraRig({ api }: { api: RefObject<PlanHandle | null> }) {
  const camera = useThree(s => s.camera);
  const controls = useThree(s => s.controls) as unknown as Orbit | null;
  const size = useThree(s => s.size);
  const { W: houseW, H: houseH } = useHouse(s => s.model);

  // Narrow (portrait) screens need the camera further back for the whole house to fit.
  const frame = () => {
    if (!controls) return;
    const aspect = size.width / size.height;
    controls.target.set(0, 0, 0);
    const fit = aspect < 1.3 ? Math.min(2.6, 1.3 / aspect) : 1;
    camera.position.copy(DEFAULT_CAMERA).multiplyScalar(fit * Math.max(houseW / BASE_W, houseH / BASE_H));
    controls.update();
  };
  useEffect(frame, [controls, houseW, houseH]);
  useImperativeHandle(api, () => ({
    zoomBy: factor => {
      if (!controls) return;
      const offset = camera.position.clone().sub(controls.target);
      offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
      camera.position.copy(controls.target).add(offset);
      controls.update();
    },
    reset: frame,
  }), [camera, controls, size, houseW, houseH]);
  return null;
}

interface Props {
  selected: RoomKey;
  onRoomClick: (key: RoomKey) => void;
  ref?: Ref<PlanHandle>;
}

export default function House3D({ selected, onRoomClick, ref }: Props) {
  const rooms = useHouse(s => s.rooms);
  const layers = useHouse(s => s.layers);
  const { W, H, furniture } = useHouse(s => s.model);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const api = useRef<PlanHandle>(null);
  useImperativeHandle(ref, () => ({
    zoomBy: f => api.current?.zoomBy(f),
    reset: () => api.current?.reset(),
  }));
  const courtyard = rooms.courtyard.rects[0];

  return (
    <div className="absolute inset-0" style={{ cursor: hover ? 'pointer' : 'grab' }}>
      <Canvas
        shadows="percentage"
        dpr={[1, 2]}
        camera={{ position: DEFAULT_CAMERA.toArray(), fov: 40, near: 0.1, far: 200 }}
        onPointerMissed={() => setHover(null)}
      >
        <color attach="background" args={['#020617']} />
        <Sun />
        <group position={[-W / 2, 0, -H / 2]}>
          <Site courtyard={courtyard} />
          <Floors selected={selected} onRoomClick={onRoomClick} onHover={setHover} />
          <Walls />
          <Hammocks />
          {layers.furniture && furniture.map((p, i) => <FurniturePieceMesh key={i} p={p} />)}
          {layers.roof && <Roof />}
        </group>
        <OrbitControls makeDefault enableDamping target={[0, 0, 0]} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={4} maxDistance={70} />
        <CameraRig api={api} />
      </Canvas>
      {hover && (
        <div
          className="absolute pointer-events-none glass-panel rounded-md px-2 py-1 text-[11px] font-mono text-slate-200 -translate-x-1/2 -translate-y-full"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          {hover.name}
        </div>
      )}
    </div>
  );
}
