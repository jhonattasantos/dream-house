import { useEffect } from 'react';
import BudgetView from './components/BudgetView';
import { ClimateModal, Header, Inspector, Sidebar, useKeyboardShortcuts } from './components/Chrome';
import Home from './components/Home';
import PlanView from './components/plan/PlanView';
import TourView from './components/TourView';
import { homePath, parseRoute, usePathname, navigate } from './lib/router';
import type { Project } from './lib/projects';
import { useHouse } from './store';

export default function App() {
  const pathname = usePathname();
  const route = parseRoute(pathname);
  const project = route.page === 'project' ? route.project : null;

  useEffect(() => {
    // Unknown paths (e.g. /project/99) fall back to the list.
    if (!project && pathname !== homePath()) navigate(homePath(), { replace: true });
    document.title = project ? `${project.name} · Planta interativa` : 'Projetos de casa · Planta interativa';
  }, [project, pathname]);

  return project ? <ProjectApp project={project} /> : <Home />;
}

function ProjectApp({ project }: { project: Project }) {
  const navMode = useHouse(s => s.navMode);
  const setProject = useHouse(s => s.setProject);
  const current = useHouse(s => s.project);
  useEffect(() => setProject(project.id), [project, setProject]);
  useKeyboardShortcuts();
  const isPlan = navMode === 'plan';
  if (current !== project.id) return null;

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
