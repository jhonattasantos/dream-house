import { useSyncExternalStore } from 'react';
import { PROJECTS, type Project } from './projects';

// Routes, relative to the base the site is served from (/dream-house/ on GitHub Pages):
//   /            → list of projects
//   /project/:n  → one project, by its number
export type Route = { page: 'home' } | { page: 'project'; project: Project };

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export const projectPath = (project: Project) => `${BASE}/project/${project.number}`;
export const homePath = () => `${BASE}/`;

export function parseRoute(pathname: string): Route {
  const path = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const match = path.match(/^\/project\/(\d+)\/?$/);
  const project = match && PROJECTS.find(p => p.number === Number(match[1]));
  return project ? { page: 'project', project } : { page: 'home' };
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach(l => l());
if (typeof window !== 'undefined') window.addEventListener('popstate', notify);

export function navigate(path: string, { replace = false } = {}) {
  if (path === location.pathname) return;
  history[replace ? 'replaceState' : 'pushState'](null, '', path);
  window.scrollTo(0, 0);
  notify();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const usePathname = () => useSyncExternalStore(subscribe, () => location.pathname);
