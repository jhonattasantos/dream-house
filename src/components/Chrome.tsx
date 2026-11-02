import { useEffect, type FormEvent } from 'react';
import type { RoomKey } from '../data/rooms';
import { builtArea, fmtNum, openArea, roomArea, roomDims } from '../lib/geometry';
import { PROJECTS, type ProjectId } from '../lib/projects';
import { tourRooms, useHouse, useProject, type NavMode } from '../store';

const NAV: { mode: NavMode; icon: string; label: string }[] = [
  { mode: 'plan', icon: 'fa-map', label: 'Planta Baixa' },
  { mode: 'tour', icon: 'fa-vr-cardboard', label: 'Tour Guiado' },
  { mode: 'budget', icon: 'fa-calculator', label: 'Orçamento' },
];

export function Header() {
  const rooms = useHouse(s => s.rooms);
  const navMode = useHouse(s => s.navMode);
  const setNavMode = useHouse(s => s.setNavMode);
  const setClimateOpen = useHouse(s => s.setClimateOpen);
  const project = useProject();
  const setProject = useHouse(s => s.setProject);
  return (
    <header className="h-16 border-b border-slate-800 glass-panel px-3 md:px-6 flex items-center justify-between z-20 shrink-0 gap-2">
      <div className="flex items-center space-x-3 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 hidden sm:flex items-center justify-center text-sky-400 shrink-0">
          <i className="fa-solid fa-house-chimney-window text-lg" />
        </div>
        <div className="min-w-0">
          <h1 className="font-bold text-base md:text-lg tracking-tight text-white flex items-center gap-2">
            {/* The title is the project switcher. */}
            <span className="relative min-w-0 flex items-center">
              <select
                value={project.id}
                onChange={e => setProject(e.target.value as ProjectId)}
                aria-label="Projeto"
                title="Trocar de projeto"
                className="appearance-none bg-transparent font-bold text-white truncate pr-5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded max-w-full"
              >
                {PROJECTS.map(p => <option key={p.id} value={p.id} className="bg-slate-900 text-sm font-normal">{p.name}</option>)}
              </select>
              <i className="fa-solid fa-chevron-down text-[10px] text-sky-400 absolute right-0 pointer-events-none" />
            </span>
            <span className="hidden sm:inline text-xs px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono border border-sky-500/30 whitespace-nowrap">
              Nordeste {fmtNum(builtArea(rooms), 0)} m²
            </span>
          </h1>
          <p className="text-xs text-slate-400 hidden sm:block">{project.tagline}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-3 shrink-0">
        <div className="bg-slate-900/90 p-1 rounded-lg border border-slate-800 flex text-xs">
          {NAV.map(n => (
            <button
              key={n.mode}
              onClick={() => setNavMode(n.mode)}
              title={n.label}
              className={`px-2.5 sm:px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${navMode === n.mode ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <i className={`fa-solid ${n.icon}`} />
              <span className="hidden md:inline">{n.label}</span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setClimateOpen(true)}
          title="Clima Nordeste"
          className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium flex items-center gap-1.5 transition-all"
        >
          <i className="fa-solid fa-wind" />
          <span className="hidden sm:inline">Clima Nordeste</span>
        </button>
      </div>
    </header>
  );
}

export function Sidebar() {
  const rooms = useHouse(s => s.rooms);
  const selected = useHouse(s => s.selected);
  const selectRoom = useHouse(s => s.selectRoom);
  const { blurb } = useProject();
  return (
    <aside className="w-80 border-r border-slate-800 glass-panel flex-col z-10 hidden xl:flex">
      <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
        <h2 className="text-xs uppercase font-mono tracking-wider text-sky-400 font-semibold mb-2 flex items-center gap-2">
          <i className="fa-solid fa-sun text-amber-400" /> Adaptação Nordestina
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed">{blurb}</p>
      </div>

      <div className="p-3 border-b border-slate-800 font-mono text-xs text-slate-400 flex justify-between items-center">
        <span>AMBIENTES DA CASA</span>
        <span className="text-sky-400">{Object.keys(rooms).length} Espaços</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {(Object.entries(rooms) as [RoomKey, (typeof rooms)[RoomKey]][]).map(([key, room]) => (
          <button
            key={key}
            onClick={() => selectRoom(key)}
            className={`w-full text-left p-2.5 rounded-lg border hover:border-sky-500/40 hover:bg-slate-800/60 transition-all flex items-center justify-between group ${key === selected ? 'border-sky-500 bg-sky-950/30' : 'border-slate-800/80 bg-slate-900/40'}`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-slate-800 text-slate-400 group-hover:text-sky-400 flex items-center justify-center text-xs">
                <i className={`fa-solid ${room.icon}`} />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white">{room.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">{fmtNum(roomArea(room), 1)} m²{room.uncovered ? ' • descoberto' : ''}</div>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right text-[10px] text-slate-600 group-hover:text-sky-400" />
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-slate-800 grid grid-cols-2 gap-2 font-mono text-[10px]">
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
          <span className="text-slate-500 block">ÁREA CONSTRUÍDA</span>
          <span className="text-emerald-400 text-sm font-bold">{fmtNum(builtArea(rooms), 0)} m²</span>
        </div>
        <div className="bg-slate-900/60 rounded-lg p-2 border border-slate-800">
          <span className="text-slate-500 block">PÁTIO DESCOBERTO</span>
          <span className="text-sky-400 text-sm font-bold">{fmtNum(openArea(rooms), 0)} m²</span>
        </div>
      </div>
    </aside>
  );
}

const inputClass = 'w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-500 outline-none';

function RoomEditor({ roomKey }: { roomKey: RoomKey }) {
  const room = useHouse(s => s.rooms[roomKey]);
  const saveRoom = useHouse(s => s.saveRoom);
  const resetRoom = useHouse(s => s.resetRoom);
  const setEditing = useHouse(s => s.setEditing);
  const defaultName = useHouse(s => s.model.rooms[roomKey].name);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = (name: string) => String(data.get(name) ?? '').trim();
    saveRoom(roomKey, {
      name: text('name') || defaultName,
      subtitle: text('subtitle'),
      height: text('height'),
      floor: text('floor'),
      light: text('light'),
      patioRel: text('patioRel'),
      benefits: text('benefits').split('\n').map(s => s.trim()).filter(Boolean),
    });
  };

  const field = (name: string, label: string, value: string) => (
    <label className="block space-y-1">
      <span className="text-[10px] font-mono text-slate-400">{label}</span>
      <input name={name} defaultValue={value} required={name === 'name'} autoFocus={name === 'name'} className={inputClass} />
    </label>
  );

  return (
    <form key={roomKey} className="space-y-3 select-text" onSubmit={onSubmit}>
      <h3 className="text-sm font-semibold text-white flex items-center gap-2"><i className="fa-solid fa-pen text-sky-400" /> Editar ambiente</h3>
      <p className="text-[11px] text-slate-500">A área é calculada pelo desenho e não pode ser editada aqui.</p>
      {field('name', 'NOME', room.name)}
      {field('subtitle', 'ZONA / SUBTÍTULO', room.subtitle)}
      <div className="grid grid-cols-2 gap-2">
        {field('height', 'PÉ-DIREITO', room.height)}
        {field('light', 'VENTILAÇÃO', room.light)}
      </div>
      {field('floor', 'MATERIAL DE PISO', room.floor)}
      <label className="block space-y-1">
        <span className="text-[10px] font-mono text-slate-400">BENEFÍCIOS (UM POR LINHA)</span>
        <textarea name="benefits" rows={3} defaultValue={room.benefits.join('\n')} className={inputClass} />
      </label>
      <label className="block space-y-1">
        <span className="text-[10px] font-mono text-slate-400">RELAÇÃO COM O PÁTIO</span>
        <textarea name="patioRel" rows={2} defaultValue={room.patioRel} className={inputClass} />
      </label>
      <div className="flex gap-2 pt-1">
        <button type="submit" className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition">Salvar</button>
        <button type="button" onClick={() => setEditing(false)} className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition">Cancelar</button>
      </div>
      <button type="button" onClick={() => resetRoom(roomKey)} className="w-full py-2 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-500/40 text-xs transition flex items-center justify-center gap-1.5">
        <i className="fa-solid fa-rotate-left" /> Restaurar texto original
      </button>
    </form>
  );
}

export function Inspector() {
  const selected = useHouse(s => s.selected);
  const room = useHouse(s => s.rooms[s.selected]);
  const editing = useHouse(s => s.editing);
  const setEditing = useHouse(s => s.setEditing);
  const open = useHouse(s => s.inspectorOpen);
  const setOpen = useHouse(s => s.setInspectorOpen);
  const openTourAtSelected = useHouse(s => s.openTourAtSelected);
  const tour = tourRooms(useHouse(s => s.rooms));

  return (
    <aside
      className={`fixed inset-x-0 bottom-0 z-30 max-h-[65vh] rounded-t-2xl transition-transform duration-300 border-t border-slate-700 shadow-2xl
        lg:static lg:z-10 lg:max-h-none lg:rounded-none lg:translate-y-0 lg:w-96 lg:border-t-0 lg:border-l lg:border-slate-800 lg:shadow-none
        glass-panel flex flex-col ${open ? 'translate-y-0' : 'translate-y-full'}`}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sky-400 font-mono text-xs uppercase font-semibold">
          <i className="fa-solid fa-microscope text-sm" /> Especificações Técnicas
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
            {tour.indexOf(selected) + 1} / {tour.length}
          </span>
          <button onClick={() => setOpen(false)} className="lg:hidden w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800" title="Fechar">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {editing ? (
          <RoomEditor roomKey={selected} />
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">{room.name}</h2>
                <p className="text-xs text-sky-400 font-mono mt-0.5">{room.subtitle}</p>
              </div>
              <button onClick={() => setEditing(true)} className="shrink-0 px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-sky-500/60 transition flex items-center gap-1.5" title="Editar ambiente">
                <i className="fa-solid fa-pen" /> Editar
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 [&>div]:min-w-0">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">ÁREA</span>
                <span className="text-base font-bold font-mono text-emerald-400">{fmtNum(roomArea(room), 1)} m²</span>
                <span className="text-[10px] font-mono text-slate-500 block">{roomDims(room)}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">PÉ-DIREITO</span>
                <span className="text-sm font-bold font-mono text-sky-400 break-words">{room.height}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">MATERIAL DE PISO</span>
                <span className="text-xs font-semibold text-slate-300 mt-1 block">{room.floor}</span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 font-mono block">VENTILAÇÃO</span>
                <span className="text-xs font-semibold text-amber-300 mt-1 block">{room.light}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-slate-400 tracking-wider">Benefícios Bioclimáticos</h4>
              <div className="space-y-2 text-xs text-slate-300">
                {room.benefits.map(b => (
                  <div key={b} className="flex items-start gap-2 bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <i className="fa-solid fa-check text-emerald-400 text-xs mt-0.5" /> <span>{b}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 space-y-1.5">
              <span className="text-xs font-semibold text-sky-300 flex items-center gap-1.5">
                <i className="fa-solid fa-tree text-emerald-400" /> Relação com o Pátio
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{room.patioRel}</p>
            </div>

            <button onClick={openTourAtSelected} className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs transition flex items-center justify-center gap-2">
              <i className="fa-solid fa-vr-cardboard" /> Ver este ambiente no Tour
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

export function ClimateModal() {
  const open = useHouse(s => s.climateOpen);
  const setOpen = useHouse(s => s.setClimateOpen);
  if (!open) return null;
  const cards = [
    ['text-emerald-400', 'fa-temperature-arrow-down', 'Efeito Chaminé Natural', 'O pátio central descoberto atua como uma chaminé térmica. O ar quente interno sobe e sai pelo vão, enquanto as brisas da região são puxadas para dentro através das esquadrias.'],
    ['text-sky-400', 'fa-droplet', "Umidificação por Espelho d'Água", "A lâmina d'água e a vegetação tropical nativa (como palmeiras e marantas) aumentam a umidade relativa do ar no entorno imediato, combatendo o calor seco."],
    ['text-amber-400', 'fa-shield', 'Inércia Térmica', 'Paredes externas claras e blocos cerâmicos de vedação térmica impedem que o calor do sol da tarde penetre nos dormitórios e na sala de estar.'],
  ];
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl p-6 space-y-5 shadow-2xl relative max-h-full overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="climate-title">
        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white" title="Fechar">
          <i className="fa-solid fa-xmark text-lg" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <i className="fa-solid fa-wind text-lg" />
          </div>
          <div>
            <h3 id="climate-title" className="font-bold text-white text-base">Estratégias Bioclimáticas no Nordeste</h3>
            <p className="text-xs text-slate-400">Como esta casa lida com o calor o ano todo</p>
          </div>
        </div>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          {cards.map(([color, icon, title, text]) => (
            <div key={title} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <strong className={`${color} flex items-center gap-2`}><i className={`fa-solid ${icon}`} /> {title}</strong>
              <p>{text}</p>
            </div>
          ))}
        </div>
        <button onClick={() => setOpen(false)} className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition">
          Entendido, voltar ao projeto
        </button>
      </div>
    </div>
  );
}

/** Escape closes the modal and the mobile drawer; arrows step through the tour. */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof Element && e.target.matches('input, textarea')) return;
      const s = useHouse.getState();
      if (e.key === 'Escape') {
        s.setClimateOpen(false);
        s.setInspectorOpen(false);
      }
      if (s.navMode === 'tour') {
        if (e.key === 'ArrowRight') s.stepTour(1);
        if (e.key === 'ArrowLeft') s.stepTour(-1);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
}
