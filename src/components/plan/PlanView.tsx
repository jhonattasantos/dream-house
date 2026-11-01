import { useRef, useState } from 'react';
import { builtArea, fmtNum, openArea } from '../../lib/geometry';
import { sunInfo } from '../../lib/sun';
import { useHouse, type LayerKey, type PlanMode } from '../../store';
import Plan2D, { type PlanHandle } from './Plan2D';

const LAYER_BUTTONS: { key: LayerKey; icon: string; label: string; title: string; only?: PlanMode }[] = [
  { key: 'labels', icon: 'fa-font', label: 'Nomes', title: 'Mostrar nomes dos ambientes', only: '2d' },
  { key: 'dims', icon: 'fa-ruler-combined', label: 'Cotas', title: 'Mostrar cotas', only: '2d' },
  { key: 'sun', icon: 'fa-sun', label: 'Sol', title: 'Simular insolação' },
  { key: 'wind', icon: 'fa-wind', label: 'Vento', title: 'Mostrar ventilação', only: '2d' },
  { key: 'furniture', icon: 'fa-couch', label: 'Móveis', title: 'Mostrar móveis' },
  { key: 'utils', icon: 'fa-faucet-drip', label: 'Instalações', title: 'Mostrar instalações hidráulicas e elétricas', only: '2d' },
  { key: 'roof', icon: 'fa-house-chimney', label: 'Telhado', title: 'Mostrar telhado', only: '3d' },
];

// Design rainfall for the Paraíba coast (order of magnitude from NBR 10844; confirm in the hydraulic design).
const RAIN_MM_H = 160;
const PATIO_STEP_M = 0.15;

const UTILS_LEGEND: [string, string][] = [
  ['<path d="M2 5 H22" stroke="#7dd3fc" stroke-width="2"/><path d="M20 1 L26 5 L20 9 z" fill="#7dd3fc"/>', 'Telhado com caimento para o pátio (implúvio)'],
  ['<path d="M2 5 H26" stroke="#22d3ee" stroke-width="3"/><circle cx="14" cy="5" r="3.5" fill="#0284c7" stroke="#e0f2fe"/>', 'Calha no beiral → 8 condutores Ø100 dentro dos pilares'],
  ['<path d="M2 5 H26" stroke="#3b82f6" stroke-width="3"/>', 'Ralo linear + caixa de areia (CA) → saída principal Ø200 → cisterna → extravasor para a rua'],
  ['<path d="M2 5 H26" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="4 3"/>', 'Saída de emergência Ø150, independente → recuo oeste'],
  ['<path d="M2 5 H26" stroke="#d97706" stroke-width="2" stroke-dasharray="6 3"/>', 'Esgoto → caixa de gordura (CG) → fossa séptica (F) + sumidouro (S)'],
  ['<path d="M2 5 H26" stroke="#38bdf8" stroke-width="5" opacity="0.8"/>', 'Parede hidráulica: áreas molhadas agrupadas'],
  ['<rect x="2" y="1" width="12" height="8" fill="#0ea5e9" fill-opacity="0.3" stroke="#38bdf8"/><rect x="15" y="1" width="11" height="8" fill="#f59e0b" fill-opacity="0.3" stroke="#fbbf24"/>', "Caixa d'água + aquecedor solar sobre o BWC master"],
  ['<rect x="8" y="1" width="12" height="8" rx="1.5" fill="#facc15" fill-opacity="0.25" stroke="#facc15"/>', 'Quadro de distribuição (QD) + inversor solar junto à entrada'],
];

function SunPanel() {
  const rooms = useHouse(s => s.rooms);
  const sun = useHouse(s => s.sun);
  const setSun = useHouse(s => s.setSun);
  const info = sunInfo(sun.hour, sun.season, rooms);
  return (
    <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 glass-panel rounded-xl p-3 z-10 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono uppercase text-amber-300 flex items-center gap-1.5"><i className="fa-solid fa-sun" /> Insolação</span>
        <span className="text-sm font-mono font-bold text-white">{info.time}</span>
      </div>
      <input
        type="range" min={6} max={18} step={0.5} value={sun.hour} aria-label="Hora do dia"
        onChange={e => setSun({ hour: Number(e.target.value) })} className="w-full accent-amber-400"
      />
      <div className="flex text-[11px] bg-slate-900/80 rounded-lg p-0.5 border border-slate-800">
        {([['dez', 'Dezembro (verão)'], ['jun', 'Junho (inverno)']] as const).map(([season, label]) => (
          <button
            key={season}
            onClick={() => setSun({ season })}
            className={`flex-1 py-1 rounded-md transition ${sun.season === season ? 'bg-amber-500/20 text-amber-200' : 'text-slate-400 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{info.message}</p>
      <p className="text-[11px] text-amber-200/90 leading-relaxed">{info.facesText}</p>
    </div>
  );
}

function UtilsPanel() {
  const rooms = useHouse(s => s.rooms);
  const [open, setOpen] = useState(true);
  const catchment = builtArea(rooms) + openArea(rooms);
  const flow = (RAIN_MM_H * catchment) / 3600;
  const bufferMin = (openArea(rooms) * PATIO_STEP_M * 1000) / (flow * 60);
  return (
    <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-96 max-h-[55%] overflow-y-auto glass-panel rounded-xl p-3 z-10 space-y-2.5">
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="w-full text-xs font-mono uppercase text-sky-300 flex items-center gap-1.5">
        <i className="fa-solid fa-faucet-drip" /> Instalações
        <i className={`fa-solid fa-chevron-down ml-auto text-slate-400 transition-transform ${open ? '' : '-rotate-90'}`} />
      </button>
      {open && (
        <div className="space-y-2.5">
          <ul className="space-y-1.5 text-[11px] text-slate-300 leading-snug">
            {UTILS_LEGEND.map(([swatch, text]) => (
              <li key={text} className="flex items-start gap-2">
                <svg width="28" height="10" className="shrink-0" aria-hidden="true" dangerouslySetInnerHTML={{ __html: swatch }} />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-sky-200/90 leading-relaxed border-t border-slate-700/60 pt-2">
            Área que escoa para o pátio: <b>{fmtNum(catchment, 0)} m²</b> • chuva de projeto {RAIN_MM_H} mm/h → <b>{fmtNum(flow, 1)} L/s</b>.{' '}
            Se os dois ralos entupirem, o desnível de {fmtNum(PATIO_STEP_M * 100, 0)} cm segura cerca de <b>{fmtNum(bufferMin, 0)} min</b> de chuva forte antes de chegar à varanda.
          </p>
        </div>
      )}
    </div>
  );
}

export default function PlanView() {
  const rooms = useHouse(s => s.rooms);
  const layers = useHouse(s => s.layers);
  const planMode = useHouse(s => s.planMode);
  const toggleLayer = useHouse(s => s.toggleLayer);
  const selected = useHouse(s => s.selected);
  const selectRoom = useHouse(s => s.selectRoom);
  const viewRef = useRef<PlanHandle>(null);
  const is3d = planMode === '3d';

  return (
    <div className="flex-1 relative flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      {/* Compass */}
      <div className="absolute top-3 left-3 pointer-events-none z-10 flex flex-col gap-1">
        <div className="flex items-center gap-2 text-slate-500 font-mono text-xs">
          <div className="w-8 h-8 rounded-full border border-slate-700/60 flex items-center justify-center relative bg-slate-900/60">
            <span className="absolute top-0.5 text-[9px] font-bold text-sky-400">N</span>
            <span className="absolute bottom-0.5 text-[9px]">S</span>
            <span className="absolute left-1 text-[9px]">O</span>
            <span className="absolute right-1 text-[9px]">L</span>
            <div className="w-full h-0.5 bg-slate-700/40 transform rotate-45" />
          </div>
          <div className="hidden sm:block">
            <div className="text-slate-300 font-semibold">VENTILAÇÃO SUDESTE/LESTE</div>
            <div className="text-[10px] text-slate-500">{is3d ? 'Vista 3D' : 'Escala gráfica'} • {fmtNum(builtArea(rooms), 0)} m² construídos</div>
          </div>
        </div>
      </div>

      {/* Toolbar: 2D/3D, layers & zoom */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <div className="glass-panel rounded-lg flex text-xs overflow-hidden">
            {LAYER_BUTTONS.filter(b => b.only !== (is3d ? '2d' : '3d')).map((b, i) => (
              <button
                key={b.key}
                onClick={() => toggleLayer(b.key)}
                aria-pressed={layers[b.key]}
                title={b.title}
                className={`layer-btn px-2.5 py-1.5 text-slate-400 hover:text-white flex items-center gap-1.5 transition ${i ? 'border-l border-slate-700/60' : ''}`}
              >
                <i className={`fa-solid ${b.icon}`} /><span className="hidden 2xl:inline">{b.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="glass-panel rounded-lg flex flex-col text-xs overflow-hidden">
          <button onClick={() => viewRef.current?.zoomBy(1 / 1.25)} className="w-8 h-8 text-slate-300 hover:text-white hover:bg-slate-800/60" title="Aproximar"><i className="fa-solid fa-plus" /></button>
          <button onClick={() => viewRef.current?.zoomBy(1.25)} className="w-8 h-8 text-slate-300 hover:text-white hover:bg-slate-800/60 border-t border-slate-700/60" title="Afastar"><i className="fa-solid fa-minus" /></button>
          <button onClick={() => viewRef.current?.reset()} className="w-8 h-8 text-slate-300 hover:text-white hover:bg-slate-800/60 border-t border-slate-700/60" title="Enquadrar"><i className="fa-solid fa-expand" /></button>
        </div>
      </div>

      {layers.sun && <SunPanel />}
      {layers.utils && !is3d && <UtilsPanel />}

      <div className="absolute bottom-3 right-3 z-10 text-[10px] font-mono text-slate-500 pointer-events-none hidden lg:block">
        {is3d ? 'Arraste para girar • botão direito para mover • role para zoom' : 'Role para zoom • arraste para mover'}
      </div>

      <Plan2D ref={viewRef} highlight={selected} onRoomClick={key => selectRoom(key)} className="w-full h-full drop-shadow-2xl" />
    </div>
  );
}
