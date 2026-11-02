import { BUDGET_DEFAULT, type BudgetItem } from '../data/budget';
import { ALPENDRE_BUDGET, ALPENDRE_MODEL } from '../data/alpendre';
import { DUAS_BUDGET, DUAS_MODEL } from '../data/duas';
import { SIZES, patioModel, type HouseModel, type HouseSize } from './model';

export type ProjectId = 'patio' | 'alpendre' | 'duas';

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
  /** Replaces "W × H m" on the project list, for lots with more than one building. */
  footprint?: string;
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
    blurb: 'Casa térrea para um terreno estreito com a frente para o leste: o alpendre recebe o sol da manhã e a brisa, a casa encosta na divisa norte e se abre para o recuo sul, que quase não recebe sol direto. O pátio interno faz o efeito chaminé e ilumina o miolo da casa.',
    highlights: ['Térrea', '3 quartos, 1 suíte', 'Pátio interno estreito', '1 vaga no recuo da frente'],
    sizes: null,
    model: () => ALPENDRE_MODEL,
    budget: ALPENDRE_BUDGET,
    storage: { rooms: 'dream-house:alpendre:rooms:v1', budget: 'dream-house:alpendre:budget:v1' },
  },
  {
    id: 'duas',
    number: 3,
    name: 'Duas Casas',
    tagline: 'Casa da frente e casa dos fundos no terreno de 10 × 30 m',
    blurb: "Duas casas térreas no mesmo terreno, com um só portão: a da frente com 3 quartos e garagem para 2 carros, a dos fundos com 2 quartos, ligadas por um corredor lateral. Entre elas, o quintal do meio guarda a torre da caixa d'água, colada nas cozinhas e banheiros das duas.",
    highlights: ['Frente: 3 quartos, 1 suíte', 'Fundos: 2 quartos', 'Garagem para 2 carros', "Caixa d'água central"],
    footprint: '8,5 × 14 m + 8,5 × 6,5 m',
    sizes: null,
    model: () => DUAS_MODEL,
    budget: DUAS_BUDGET,
    storage: { rooms: 'dream-house:duas:rooms:v1', budget: 'dream-house:duas:budget:v1' },
  },
];

export const DEFAULT_PROJECT: ProjectId = 'patio';
export const getProject = (id: ProjectId) => PROJECTS.find(p => p.id === id)!;
