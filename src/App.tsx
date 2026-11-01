import BudgetView from './components/BudgetView';
import { ClimateModal, Header, Inspector, Sidebar, useKeyboardShortcuts } from './components/Chrome';
import PlanView from './components/plan/PlanView';
import TourView from './components/TourView';
import { useHouse } from './store';

export default function App() {
  const navMode = useHouse(s => s.navMode);
  useKeyboardShortcuts();
  const isPlan = navMode === 'plan';

  return (
    <>
      <Header />
      <div className="flex-1 flex overflow-hidden relative">
        {isPlan && <Sidebar />}
        <main className="flex-1 relative flex flex-col bg-slate-950 bg-grid-pattern overflow-hidden">
          {navMode === 'plan' && <PlanView />}
          {navMode === 'tour' && <TourView />}
          {navMode === 'budget' && <BudgetView />}
        </main>
        {isPlan && <Inspector />}
      </div>
      <ClimateModal />
    </>
  );
}
