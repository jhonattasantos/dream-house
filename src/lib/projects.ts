import { BUDGET_DEFAULT, type BudgetItem } from '../data/budget';
import { MAE_BUDGET, MAE_MODEL } from '../data/mae';
import { SIZES, patioModel, type HouseModel, type HouseSize } from './model';

export type ProjectId = 'patio' | 'mae';

export interface Project {
  id: ProjectId;
  name: string;
  tagline: string;
  /** Sidebar text about the bioclimatic idea of the project. */
  blurb: string;
  /** Size options (house width in meters), or null for a project drawn for a specific lot. */
  sizes: readonly HouseSize[] | null;
  model: (size: HouseSize) => HouseModel;
  budget: BudgetItem[];
  /** localStorage keys for the user's edits. The first project keeps the keys it always had. */
  storage: { rooms: string; budget: string };
}

export const PROJECTS: Project[] = [
  {
    id: 'patio',
    name: 'Casa de Pátio',
    tagline: 'Tour Virtual & Simulação Bioclimática',
    blurb: 'Projeto otimizado para o clima tropical quente e úmido/semiárido. O pátio central gera um efeito chaminé, puxando a brisa constante do mar/sertão.',
    sizes: SIZES,
    model: patioModel,
    budget: BUDGET_DEFAULT,
    storage: { rooms: 'dream-house:rooms:v1', budget: 'dream-house:budget:v1' },
  },
  {
    id: 'mae',
    name: 'Casa da Mãe',
    tagline: 'Térrea para terreno de 10 × 30 m',
    blurb: 'Casa térrea para um terreno estreito: encostada na divisa oeste, que protege do sol da tarde, e aberta para o recuo leste, de onde vem a brisa. O pátio interno faz o efeito chaminé e ilumina o miolo da casa.',
    sizes: null,
    model: () => MAE_MODEL,
    budget: MAE_BUDGET,
    storage: { rooms: 'dream-house:mae:rooms:v1', budget: 'dream-house:mae:budget:v1' },
  },
];

export const DEFAULT_PROJECT: ProjectId = 'patio';
export const getProject = (id: ProjectId) => PROJECTS.find(p => p.id === id)!;
