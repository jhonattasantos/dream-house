import { create } from 'zustand';
import { BUDGET_DEFAULT } from './data/budget';
import { EDITABLE_FIELDS, ROOMS_DEFAULT, type EditableField, type Room, type RoomKey } from './data/rooms';

// Same keys as the original single-file page, so saved edits carry over.
const STORAGE_ROOMS = 'dream-house:rooms:v1';
const STORAGE_BUDGET = 'dream-house:budget:v1';

function loadJSON<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null; } catch { return null; }
}
function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

type RoomFields = Pick<Room, EditableField>;
type Overrides = Partial<Record<RoomKey, Partial<RoomFields>>>;

function applyOverrides(overrides: Overrides): Record<RoomKey, Room> {
  const rooms = structuredClone(ROOMS_DEFAULT);
  (Object.entries(overrides) as [RoomKey, Partial<RoomFields>][]).forEach(([key, fields]) => {
    if (!rooms[key] || !fields) return;
    EDITABLE_FIELDS.forEach(f => {
      if (fields[f] !== undefined) (rooms[key] as unknown as Record<string, unknown>)[f] = fields[f];
    });
  });
  return rooms;
}

function loadBudget(): Record<string, number> {
  const saved = loadJSON<Record<string, number>>(STORAGE_BUDGET) ?? {};
  return Object.fromEntries(BUDGET_DEFAULT.map(b => [b.id, Number.isFinite(saved[b.id]) ? saved[b.id] : b.value]));
}

export type LayerKey = 'labels' | 'dims' | 'sun' | 'wind' | 'furniture' | 'utils' | 'roof';
export type NavMode = 'plan' | 'tour' | 'budget';
export type PlanMode = '2d' | '3d';
export type Season = 'dez' | 'jun';

export const TOUR_ROOMS = Object.keys(ROOMS_DEFAULT) as RoomKey[];

interface HouseState {
  rooms: Record<RoomKey, Room>;
  overrides: Overrides;
  selected: RoomKey;
  editing: boolean;
  inspectorOpen: boolean;
  layers: Record<LayerKey, boolean>;
  sun: { hour: number; season: Season };
  navMode: NavMode;
  planMode: PlanMode;
  tourIndex: number;
  budget: Record<string, number>;
  climateOpen: boolean;

  selectRoom: (key: RoomKey, opts?: { openDrawer?: boolean }) => void;
  setEditing: (editing: boolean) => void;
  setInspectorOpen: (open: boolean) => void;
  saveRoom: (key: RoomKey, fields: RoomFields) => void;
  resetRoom: (key: RoomKey) => void;
  toggleLayer: (layer: LayerKey) => void;
  setSun: (sun: Partial<HouseState['sun']>) => void;
  setNavMode: (mode: NavMode) => void;
  setPlanMode: (mode: PlanMode) => void;
  setTourIndex: (index: number) => void;
  stepTour: (delta: number) => void;
  openTourAtSelected: () => void;
  setBudgetValue: (id: string, value: number) => void;
  resetBudget: () => void;
  setClimateOpen: (open: boolean) => void;
}

const isSmallScreen = () => window.matchMedia('(max-width: 1023px)').matches;

export const useHouse = create<HouseState>((set, get) => {
  const overrides = loadJSON<Overrides>(STORAGE_ROOMS) ?? {};
  return {
    rooms: applyOverrides(overrides),
    overrides,
    selected: 'courtyard',
    editing: false,
    inspectorOpen: false,
    layers: { labels: true, dims: true, sun: false, wind: false, furniture: false, utils: false, roof: false },
    sun: { hour: 9, season: 'dez' },
    navMode: 'plan',
    planMode: '2d',
    tourIndex: 0,
    budget: loadBudget(),
    climateOpen: false,

    selectRoom: (key, { openDrawer = true } = {}) =>
      set({ selected: key, editing: false, inspectorOpen: openDrawer && isSmallScreen() ? true : get().inspectorOpen }),
    setEditing: editing => set({ editing }),
    setInspectorOpen: inspectorOpen => set({ inspectorOpen }),
    saveRoom: (key, fields) => {
      const overrides = { ...get().overrides, [key]: fields };
      saveJSON(STORAGE_ROOMS, overrides);
      set({ overrides, rooms: applyOverrides(overrides), editing: false });
    },
    resetRoom: key => {
      const overrides = { ...get().overrides };
      delete overrides[key];
      saveJSON(STORAGE_ROOMS, overrides);
      set({ overrides, rooms: applyOverrides(overrides), editing: false });
    },
    toggleLayer: layer => {
      const layers = { ...get().layers, [layer]: !get().layers[layer] };
      // The sun and utilities panels share the same corner, so only one is shown at a time.
      if (layers[layer] && layer === 'sun') layers.utils = false;
      if (layers[layer] && layer === 'utils') layers.sun = false;
      set({ layers });
    },
    setSun: sun => set({ sun: { ...get().sun, ...sun } }),
    setNavMode: navMode => set({ navMode }),
    setPlanMode: planMode => set({ planMode }),
    setTourIndex: tourIndex => set({ tourIndex }),
    stepTour: delta => set({ tourIndex: (get().tourIndex + delta + TOUR_ROOMS.length) % TOUR_ROOMS.length }),
    openTourAtSelected: () => set({ tourIndex: Math.max(0, TOUR_ROOMS.indexOf(get().selected)), navMode: 'tour' }),
    setBudgetValue: (id, value) => {
      const budget = { ...get().budget, [id]: value };
      saveJSON(STORAGE_BUDGET, budget);
      set({ budget });
    },
    resetBudget: () => {
      saveJSON(STORAGE_BUDGET, {});
      set({ budget: Object.fromEntries(BUDGET_DEFAULT.map(b => [b.id, b.value])) });
    },
    setClimateOpen: climateOpen => set({ climateOpen }),
  };
});
