import { create } from 'zustand';
import { EDITABLE_FIELDS, type EditableField, type Room, type RoomKey } from './data/rooms';
import { DEFAULT_SIZE, SIZES, type HouseModel, type HouseSize } from './lib/model';
import { DEFAULT_PROJECT, getProject, type Project, type ProjectId } from './lib/projects';
import { parseRoute } from './lib/router';

const STORAGE_SIZE = 'dream-house:size:v1';

function loadJSON<T>(key: string): T | null {
  try { return JSON.parse(localStorage.getItem(key) ?? 'null') as T | null; } catch { return null; }
}
function saveJSON(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
}

type RoomFields = Pick<Room, EditableField>;
type Overrides = Partial<Record<RoomKey, Partial<RoomFields>>>;

function applyOverrides(overrides: Overrides, model: HouseModel): Record<RoomKey, Room> {
  const rooms = structuredClone(model.rooms);
  (Object.entries(overrides) as [RoomKey, Partial<RoomFields>][]).forEach(([key, fields]) => {
    if (!rooms[key] || !fields) return;
    EDITABLE_FIELDS.forEach(f => {
      if (fields[f] !== undefined) (rooms[key] as unknown as Record<string, unknown>)[f] = fields[f];
    });
  });
  return rooms;
}

export function loadBudget(project: Project): Record<string, number> {
  const saved = loadJSON<Record<string, number>>(project.storage.budget) ?? {};
  return Object.fromEntries(project.budget.map(b => [b.id, Number.isFinite(saved[b.id]) ? saved[b.id] : b.value]));
}

/** Everything that belongs to one project: its drawing at the chosen size and the user's edits. */
function projectState(project: Project, size: HouseSize) {
  const model = project.model(size);
  const overrides = loadJSON<Overrides>(project.storage.rooms) ?? {};
  return { project: project.id, model, overrides, rooms: applyOverrides(overrides, model), budget: loadBudget(project) };
}

export type LayerKey = 'labels' | 'dims' | 'sun' | 'wind' | 'furniture' | 'utils' | 'roof';
export type NavMode = 'plan' | 'tour' | 'budget';
export type PlanMode = '2d' | '3d';
export type Season = 'dez' | 'jun';

interface HouseState {
  project: ProjectId;
  size: HouseSize;
  model: HouseModel;
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

  setProject: (id: ProjectId) => void;
  setSize: (size: HouseSize) => void;
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

/** Rooms in tour order. */
export const tourRooms = (rooms: Record<RoomKey, Room>) => Object.keys(rooms);

export const useHouse = create<HouseState>((set, get) => {
  const savedSize = loadJSON<number>(STORAGE_SIZE);
  const size = SIZES.find(s => s === savedSize) ?? DEFAULT_SIZE;
  const route = parseRoute(location.pathname);
  const project = route.page === 'project' ? route.project : getProject(DEFAULT_PROJECT);
  const current = () => getProject(get().project);
  const tourLength = () => tourRooms(get().rooms).length;
  return {
    ...projectState(project, size),
    size,
    selected: 'courtyard',
    editing: false,
    inspectorOpen: false,
    layers: { labels: true, dims: true, sun: false, wind: false, furniture: false, utils: false, roof: false },
    sun: { hour: 9, season: 'dez' },
    navMode: 'plan',
    planMode: '2d',
    tourIndex: 0,
    climateOpen: false,

    setProject: id => {
      if (id === get().project) return;
      set({ ...projectState(getProject(id), get().size), selected: 'courtyard', editing: false, tourIndex: 0 });
    },
    setSize: size => {
      saveJSON(STORAGE_SIZE, size);
      set({ ...projectState(current(), size), size });
    },
    selectRoom: (key, { openDrawer = true } = {}) =>
      set({ selected: key, editing: false, inspectorOpen: openDrawer && isSmallScreen() ? true : get().inspectorOpen }),
    setEditing: editing => set({ editing }),
    setInspectorOpen: inspectorOpen => set({ inspectorOpen }),
    saveRoom: (key, fields) => {
      const overrides = { ...get().overrides, [key]: fields };
      saveJSON(current().storage.rooms, overrides);
      set({ overrides, rooms: applyOverrides(overrides, get().model), editing: false });
    },
    resetRoom: key => {
      const overrides = { ...get().overrides };
      delete overrides[key];
      saveJSON(current().storage.rooms, overrides);
      set({ overrides, rooms: applyOverrides(overrides, get().model), editing: false });
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
    stepTour: delta => set({ tourIndex: (get().tourIndex + delta + tourLength()) % tourLength() }),
    openTourAtSelected: () => set({ tourIndex: Math.max(0, tourRooms(get().rooms).indexOf(get().selected)), navMode: 'tour' }),
    setBudgetValue: (id, value) => {
      const budget = { ...get().budget, [id]: value };
      saveJSON(current().storage.budget, budget);
      set({ budget });
    },
    resetBudget: () => {
      saveJSON(current().storage.budget, {});
      set({ budget: Object.fromEntries(current().budget.map(b => [b.id, b.value])) });
    },
    setClimateOpen: climateOpen => set({ climateOpen }),
  };
});

export const useProject = () => getProject(useHouse(s => s.project));
