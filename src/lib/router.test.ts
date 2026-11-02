import { describe, expect, it } from 'vitest';
import { PROJECTS } from './projects';
import { homePath, parseRoute, projectPath } from './router';

// '/dream-house/' in the build, '/' under vitest.
const BASE = import.meta.env.BASE_URL;

describe('routes', () => {
  it('gives every project its own number', () => {
    expect(new Set(PROJECTS.map(p => p.number)).size).toBe(PROJECTS.length);
  });

  it('opens each project from its path', () => {
    PROJECTS.forEach(p => {
      expect(projectPath(p)).toBe(`${BASE}project/${p.number}`);
      expect(parseRoute(projectPath(p))).toEqual({ page: 'project', project: p });
      expect(parseRoute(`${projectPath(p)}/`)).toEqual({ page: 'project', project: p });
    });
  });

  it('shows the list on the home page and on unknown paths', () => {
    expect(homePath()).toBe(BASE);
    [BASE, `${BASE}project/99`, `${BASE}project/abc`, `${BASE}projeto/1`].forEach(path =>
      expect(parseRoute(path)).toEqual({ page: 'home' }));
  });
});
