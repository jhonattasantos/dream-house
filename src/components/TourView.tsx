import { S, X, Y, fmtNum, roomArea } from '../lib/geometry';
import { TOUR_ROOMS, useHouse } from '../store';
import Plan2D from './plan/Plan2D';

export default function TourView() {
  const rooms = useHouse(s => s.rooms);
  const tourIndex = useHouse(s => s.tourIndex);
  const setTourIndex = useHouse(s => s.setTourIndex);
  const stepTour = useHouse(s => s.stepTour);
  const { W, H } = useHouse(s => s.model);
  const key = TOUR_ROOMS[tourIndex];
  const room = rooms[key];

  return (
    <div className="flex-1 flex flex-col lg:flex-row bg-slate-950 p-4 sm:p-6 overflow-y-auto gap-6 items-center justify-center">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 gap-3">
          <div className="min-w-0">
            <span className="text-xs font-mono text-sky-400 uppercase tracking-widest">Tour Interativo 360°</span>
            <h2 className="text-2xl font-bold text-white mt-1">{room.name}</h2>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
            <i className={`fa-solid ${room.icon}`} />
          </div>
        </div>

        <div className="w-full h-56 sm:h-64 rounded-xl relative overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
          <div
            className="absolute inset-0 opacity-90 transition-all duration-500 flex items-center justify-center"
            style={{ background: `radial-gradient(circle at 50% 40%, ${room.fill}cc, #020617 75%)` }}
          >
            <div className="text-center p-6 space-y-2">
              <i className={`fa-solid ${room.icon} text-5xl animate-pulse`} style={{ color: room.text }} />
              <p className="text-xs font-mono text-slate-300">Visualização Cinematic 360° • {room.name}</p>
            </div>
          </div>
          <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-3 py-1 rounded-lg border border-slate-700/60 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> Live Cinematic Render
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-mono text-sky-300">{room.subtitle} • {fmtNum(roomArea(room), 1)} m² • Piso: {room.floor}</p>
          <div className="space-y-1.5 text-xs text-slate-300">
            {room.benefits.map(b => (
              <div key={b} className="flex items-start gap-2"><i className="fa-solid fa-check text-emerald-400 mt-0.5" /><span>{b}</span></div>
            ))}
          </div>
          <div className="p-3 rounded-lg bg-sky-950/30 border border-sky-800/40 text-xs text-sky-300 flex items-start gap-2">
            <i className="fa-solid fa-tree text-emerald-400 mt-0.5" />
            <div><strong className="text-white">Relação com o Pátio:</strong> <span>{room.patioRel}</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <button onClick={() => stepTour(-1)} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition flex items-center gap-2">
            <i className="fa-solid fa-arrow-left" /> <span>Anterior</span>
          </button>
          <span className="text-xs font-mono text-slate-400">{tourIndex + 1} / {TOUR_ROOMS.length}</span>
          <button onClick={() => stepTour(1)} className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-xs font-medium text-white transition flex items-center gap-2 shadow-lg">
            <span>Próximo<span className="hidden sm:inline"> Cômodo</span></span> <i className="fa-solid fa-arrow-right" />
          </button>
        </div>
      </div>

      <div className="w-full max-w-xl lg:max-w-sm bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-location-dot text-sky-400" /> Você está aqui
        </span>
        <Plan2D mini viewBox={`${X(0) - 20} ${Y(0) - 20} ${W * S + 40} ${H * S + 40}`} highlight={key} onRoomClick={k => setTourIndex(TOUR_ROOMS.indexOf(k))} className="w-full h-auto" />
        <p className="text-[10px] text-slate-500 font-mono">Toque em um ambiente para ir até ele • use ← → no teclado</p>
      </div>
    </div>
  );
}
