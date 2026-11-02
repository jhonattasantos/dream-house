import { BUDGET_DEFAULT, type BudgetItem } from '../data/budget';
import { ALPENDRE_BUDGET, ALPENDRE_MODEL } from '../data/alpendre';
import { SIZES, patioModel, type HouseModel, type HouseSize } from './model';

export type ProjectId = 'patio' | 'alpendre';

export interface Project {
  id: ProjectId;
  /** Public id used in the URL: /project/<number>. */
  number: number;
  name: string;
  tagline: string;
  /** Sidebar text about the bioclimatic idea of the project. */
  blurb: string;
  /** Short facts shown on the project list. */
  highlights: string[];
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
    number: 1,
    name: 'Casa de Pátio',
    tagline: 'Tour Virtual & Simulação Bioclimática',
    blurb: 'Projeto otimizado para o clima tropical quente e úmido/semiárido. O pátio central gera um efeito chaminé, puxando a brisa constante do mar/sertão.',
    highlights: ['3 suítes', 'Home office', 'Pátio central ajardinado', 'Varanda das redes'],
    sizes: SIZES,
    model: patioModel,
    budget: BUDGET_DEFAULT,
    storage: { rooms: 'dream-house:rooms:v1', budget: 'dream-house:budget:v1' },
  },
  {
    id: 'alpendre',
    number: 2,
    name: 'Casa do Alpendre',
    tagline: 'Térrea para terreno de 10 × 30 m',
    blurb: 'Casa térrea para um terreno estreito: encostada na divisa oeste, que protege do sol da tarde, e aberta para o recuo leste, de onde vem a brisa. O pátio interno faz o efeito chaminé e ilumina o miolo da casa.',
    highlights: ['Térrea', '3 quartos, 1 suíte', 'Pátio interno estreito', '1 vaga no recuo da frente'],
    sizes: null,
    model: () => ALPENDRE_MODEL,
    budget: ALPENDRE_BUDGET,
    storage: { rooms: 'dream-house:alpendre:rooms:v1', budget: 'dream-house:alpendre:budget:v1' },
  },
];

export const DEFAULT_PROJECT: ProjectId = 'patio';
export const getProject = (id: ProjectId) => PROJECTS.find(p => p.id === id)!;
