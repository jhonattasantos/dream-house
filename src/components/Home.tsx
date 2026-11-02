import type { MouseEvent, ReactNode } from 'react';
import { builtArea, fmtBRL, fmtLen, fmtNum, openArea } from '../lib/geometry';
import type { HouseModel } from '../lib/model';
import { PROJECTS, type Project } from '../lib/projects';
import { navigate, projectPath } from '../lib/router';
import { loadBudget, useHouse } from '../store';

/** A real link (open in a new tab works) that navigates inside the app on a plain click. */
export function Link({ href, className, title, children }: { href: string; className?: string; title?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    navigate(href);
  };
  return <a href={href} onClick={onClick} className={className} title={title}>{children}</a>;
}

/** Small drawing of the rooms (and the lot, when there is one), north up. */
function Thumbnail({ model }: { model: HouseModel }) {
  const [lx, ly, lw, lh] = model.lot?.rect ?? [0, 0, model.W, model.H];
  const pad = 0.6;
  return (
    <svg viewBox={`${lx - pad} ${ly - pad} ${lw + 2 * pad} ${lh + 2 * pad}`} className="w-full h-full" aria-hidden>
      {model.lot && <rect x={lx} y={ly} width={lw} height={lh} fill="#14532d" fillOpacity={0.25} stroke="#4ade80" strokeOpacity={0.5} strokeWidth={0.08} strokeDasharray="0.3 0.2" />}
      {model.lot && <rect x={model.lot.car[0]} y={model.lot.car[1]} width={model.lot.car[2]} height={model.lot.car[3]} rx={0.3} fill="#475569" />}
      {Object.values(model.rooms).flatMap(room => room.rects.map(([x, y, w, h], i) => (
        <rect key={`${room.name}${i}`} x={x} y={y} width={w} height={h} fill={room.uncovered ? '#10b981' : room.fill} fillOpacity={room.uncovered ? 0.45 : Math.max(room.fillOpacity, 0.35)} stroke="#e2e8f0" strokeWidth={0.06} />
      )))}
      <rect x={0} y={0} width={model.W} height={model.H} fill="none" stroke="#f8fafc" strokeWidth={0.18} />
    </svg>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-950/50 rounded-lg px-3 py-2 border border-slate-800">
      <dt className="text-[10px] font-mono uppercase tracking-wider text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-100 mt-0.5">{value}</dd>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const size = useHouse(s => s.size);
  const model = project.model(size);
  const total = Object.values(loadBudget(project)).reduce((sum, v) => sum + v, 0);
  const [, , lotW, lotH] = model.lot?.rect ?? [];
  const href = projectPath(project);
  return (
    <li>
      <Link href={href} className="group flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-slate-800 bg-slate-900/70 hover:border-sky-500/60 hover:bg-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500">
        <div className="sm:w-44 h-44 shrink-0 rounded-xl bg-slate-950/70 border border-slate-800 p-3 flex items-center justify-center">
          <Thumbnail model={model} />
        </div>
        <div className="flex-1 min-w-0 space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 border border-sky-500/30">#{project.number}</span>
              <h2 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">{project.name}</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{project.tagline}</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{project.blurb}</p>
          <ul className="flex flex-wrap gap-1.5">
            {project.highlights.map(h => <li key={h} className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{h}</li>)}
          </ul>
          <dl className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            <Fact label="Casa" value={`${fmtLen(model.W)} × ${fmtLen(model.H)} m`} />
            <Fact label="Construída" value={`${fmtNum(builtArea(model.rooms), 0)} m²`} />
            <Fact label={model.lot ? 'Terreno' : 'Área aberta'} value={model.lot ? `${fmtLen(lotW!)} × ${fmtLen(lotH!)} m` : `${fmtNum(openArea(model.rooms), 0)} m²`} />
            <Fact label="Orçamento" value={fmtBRL(total)} />
          </dl>
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500">
              {project.sizes ? `${project.sizes.length} tamanhos: ${project.sizes.map(fmtLen).join(' • ')} m de largura` : 'Desenhada para um terreno específico'}
            </span>
            <span className="font-mono text-sky-400 group-hover:text-sky-300 whitespace-nowrap">
              {href.replace(/^.*(\/project\/)/, '$1')} <i className="fa-solid fa-arrow-right ml-1" />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 bg-grid-pattern">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
            <i className="fa-solid fa-house-chimney-window text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Projetos de casa</h1>
            <p className="text-sm text-slate-400">Plantas interativas para o clima do Nordeste: planta baixa, 3D, tour e orçamento.</p>
          </div>
        </header>
        <ul className="space-y-4">
          {PROJECTS.map(p => <ProjectCard key={p.id} project={p} />)}
        </ul>
      </div>
    </div>
  );
}
