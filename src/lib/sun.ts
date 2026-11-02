import type { Room, RoomKey } from '../data/rooms';
import { X, Y, clamp, wallFace, type Face } from './geometry';
import type { HouseModel } from './model';

export type Season = 'dez' | 'jun';

const FACE_NAMES: Record<Face, string> = { N: 'Norte', S: 'Sul', L: 'Leste', O: 'Oeste' };

/** Schematic sun for the 2D plan: position on the drawing, lit facades and the advice text. */
export function sunInfo(hour: number, season: Season, rooms: Record<RoomKey, Room>, model: HouseModel) {
  const { W, H, view, windows } = model;
  const t = (hour - 6) / 12;
  const phi = Math.PI * t;
  const elevation = Math.sin(phi);
  const northSouth = season === 'jun' ? -1 : 1; // jun: sol mais ao norte; dez: mais ao sul
  const reach = 0.47 * view.w * (1 - 0.7 * elevation);
  const sx = clamp(X(W / 2) + Math.cos(phi) * reach, 20, view.w - 20);
  const sy = clamp(Y(H / 2) + northSouth * elevation * reach, 20, view.h - 20);

  const faces = new Set<Face>();
  if (hour < 11.5) faces.add('L');
  else if (hour > 12.5) faces.add('O');
  if (elevation > 0.3) faces.add(northSouth < 0 ? 'N' : 'S');

  let message: string;
  if (hour < 9) message = 'Sol da manhã, ameno: bom momento para abrir as esquadrias a leste.';
  else if (hour < 11.5) message = 'Sol forte a leste — persianas a meia altura na sala e na cozinha.';
  else if (hour <= 12.5) message = 'Sol a pino: o pátio recebe luz direta e os beirais sombreiam as fachadas.';
  else if (hour < 15) message = 'Pico de calor — a fachada oeste começa a aquecer; o pátio puxa o ar quente para cima.';
  else message = 'Sol poente a oeste, o mais quente do dia: brises e vegetação protegem as janelas.';
  if (faces.has('N')) message += ' No inverno o sol passa ao norte, aquecendo a fachada da rua.';
  if (faces.has('S')) message += ' No verão o sol passa ao sul, alcançando a fachada dos fundos.';

  const litRooms = [...new Set(windows.filter(w => faces.has(wallFace(w, model)!)).map(w => rooms[w.room].name))];
  const facesText = faces.size
    ? `Fachadas ao sol: ${[...faces].map(f => FACE_NAMES[f]).join(', ')}. Janelas recebendo sol: ${litRooms.join(', ') || 'nenhuma'}.`
    : '';

  const hh = String(Math.floor(hour)).padStart(2, '0');
  const time = `${hh}:${hour % 1 ? '30' : '00'}`;

  return { sx, sy, faces, message, facesText, time };
}

// Mamanguape (PB) latitude.
const LATITUDE = -6.84;

/**
 * Real sun direction for the 3D view as [east, up, north] unit components,
 * using solar time and the solstice declination for each season.
 */
export function sunDirection(hour: number, season: Season) {
  const rad = Math.PI / 180;
  const lat = LATITUDE * rad;
  const dec = (season === 'jun' ? 23.44 : -23.44) * rad;
  const h = (hour - 12) * 15 * rad;
  const east = -Math.cos(dec) * Math.sin(h);
  const north = Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(h);
  const up = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(h);
  return { east, up, north };
}
