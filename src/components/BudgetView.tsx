import { builtArea, fmtBRL, fmtNum } from '../lib/geometry';
import { useHouse, useProject } from '../store';

export default function BudgetView() {
  const rooms = useHouse(s => s.rooms);
  const values = useHouse(s => s.budget);
  const setBudgetValue = useHouse(s => s.setBudgetValue);
  const resetBudget = useHouse(s => s.resetBudget);
  const items = useProject().budget;
  const total = items.reduce((sum, b) => sum + values[b.id], 0);
  const area = builtArea(rooms);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Orçamento Estimado (Nordeste)</span>
            <h2 className="text-2xl font-bold text-white mt-1">
              Estimativa de Custos por Etapa <span className="text-slate-400 font-mono text-lg">({fmtNum(area, 0)} m²)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">Valores de referência — edite cada etapa conforme as cotações reais.</p>
          </div>
          <button onClick={resetBudget} className="self-start md:self-auto px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-1.5">
            <i className="fa-solid fa-rotate-left" /> Restaurar valores
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            ['VALOR TOTAL ESTIMADO', fmtBRL(total), 'text-emerald-400'],
            ['CUSTO POR m² CONSTRUÍDO', fmtBRL(total / area), 'text-sky-400'],
            ['ÁREA CONSTRUÍDA', `${fmtNum(area, 0)} m²`, 'text-slate-200'],
          ].map(([label, value, color]) => (
            <div key={label} className="bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl">
              <span className="text-[10px] text-slate-400 font-mono block">{label}</span>
              <span className={`text-xl font-bold font-mono ${color}`}>{value}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const value = values[item.id];
            const pct = total ? (value / total) * 100 : 0;
            return (
              <div key={item.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon}`} style={{ color: item.color }} /> {item.name}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">{fmtNum(pct, 1)}%</span>
                </div>
                <label className="flex items-center gap-2 bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 focus-within:border-sky-500 select-text">
                  <span className="font-mono text-xs text-slate-500">R$</span>
                  <input
                    type="number" min={0} step={1000} value={value} aria-label={`Valor de ${item.name}`}
                    onChange={e => setBudgetValue(item.id, Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-transparent font-mono text-sm text-sky-300 outline-none"
                  />
                </label>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="h-full transition-all duration-300" style={{ background: item.color, width: `${pct}%` }} />
                </div>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
