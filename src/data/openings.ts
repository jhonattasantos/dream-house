import type { RoomKey } from './rooms';

export type Point = [number, number];
export type WallDir = 'h' | 'v';

export interface Opening {
  x: number;
  y: number;
  dir: WallDir;
  len: number;
  type: 'door' | 'opening';
  /** Side of the wall the door leaf swings to. */
  swing?: 1 | -1;
}

export interface Window {
  x: number;
  y: number;
  dir: WallDir;
  len: number;
  room: RoomKey;
}

// Doors and openings. A door's leaf hinges at (x, y) and swings to the +/- side of the wall.
export const OPENINGS: Opening[] = [
    { x: 9.9, y: 0, dir: 'h', len: 1.2, type: 'door', swing: 1 },        // entrada principal
    { x: 7.5, y: 3, dir: 'h', len: 6, type: 'opening' },                 // hall → varanda
    { x: 5, y: 1.1, dir: 'v', len: 0.9, type: 'door', swing: 1 },        // home office
    { x: 16, y: 1.1, dir: 'v', len: 0.9, type: 'door', swing: 1 },       // suíte hóspedes
    { x: 5, y: 6.4, dir: 'v', len: 0.9, type: 'door', swing: -1 },       // quarto 3
    { x: 3.6, y: 7.5, dir: 'h', len: 0.8, type: 'door', swing: 1 },      // banheiro quarto 3
    { x: 5, y: 10.1, dir: 'v', len: 0.9, type: 'door', swing: -1 },      // serviço
    { x: 0, y: 12.3, dir: 'v', len: 0.9, type: 'door', swing: 1 },       // saída lateral
    { x: 8.6, y: 14, dir: 'h', len: 0.9, type: 'door', swing: 1 },       // suíte master
    { x: 4.5, y: 16.6, dir: 'v', len: 0.8, type: 'door', swing: -1 },    // bwc & closet master
    { x: 10.3, y: 14, dir: 'h', len: 0.8, type: 'door', swing: 1 },      // banheiro social
    { x: 13.2, y: 14, dir: 'h', len: 0.9, type: 'door', swing: 1 },      // cozinha
    { x: 16, y: 6, dir: 'v', len: 5, type: 'opening' },                  // varanda → sala
    { x: 16.6, y: 14, dir: 'h', len: 3.8, type: 'opening' }              // sala ↔ cozinha
];

export const WINDOWS: Window[] = [
    { x: 1.2, y: 0, dir: 'h', len: 2.6, room: 'office' },
    { x: 17.2, y: 0, dir: 'h', len: 2.6, room: 'bedroom_2' },
    { x: 0, y: 4.5, dir: 'v', len: 2, room: 'bedroom_3' },
    { x: 0, y: 8, dir: 'v', len: 1, room: 'bath_3' },
    { x: 0, y: 10, dir: 'v', len: 1, room: 'service' },
    { x: 0, y: 15.5, dir: 'v', len: 1, room: 'master_bath' },
    { x: 21, y: 1, dir: 'v', len: 2.5, room: 'bedroom_2' },
    { x: 21, y: 6, dir: 'v', len: 3, room: 'living' },
    { x: 21, y: 10.5, dir: 'v', len: 3, room: 'living' },
    { x: 21, y: 15, dir: 'v', len: 2, room: 'kitchen' },
    { x: 1.6, y: 18, dir: 'h', len: 1.2, room: 'master_bath' },
    { x: 5.8, y: 18, dir: 'h', len: 3, room: 'master_suite' },
    { x: 11, y: 18, dir: 'h', len: 1, room: 'bwc_social' },
    { x: 15, y: 18, dir: 'h', len: 4, room: 'kitchen' }
];

// Hammocks hung diagonally across the veranda corners: [wall anchor, pillar anchor] in meters.
export const HAMMOCKS: [Point, Point][] = [
    [[5, 3], [7.5, 5.5]],
    [[16, 3], [13.5, 5.5]],
    [[5, 14], [7.5, 11.5]],
    [[16, 14], [13.5, 11.5]]
];
