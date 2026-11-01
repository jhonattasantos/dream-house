// Rooms in tour order. rects = [x, y, width, height] in meters, origin at the north-west corner.
export type Rect = [number, number, number, number];

export type RoomKey =
  | 'entrance' | 'bedroom_2' | 'hallway' | 'courtyard' | 'living' | 'kitchen' | 'bwc_social'
  | 'master_suite' | 'master_bath' | 'service' | 'bath_3' | 'bedroom_3' | 'office';

export interface Room {
  name: string;
  subtitle: string;
  height: string;
  floor: string;
  light: string;
  icon: string;
  benefits: string[];
  patioRel: string;
  rects: Rect[];
  /** Rect used to place the label when the room has several rects. */
  labelRect?: Rect;
  /** Replaces the computed "w × h m" text. */
  dimsLabel?: string;
  /** false for open areas that have no walls of their own. */
  walls?: boolean;
  uncovered?: boolean;
  fill: string;
  fillOpacity: number;
  text: string;
}

export const EDITABLE_FIELDS = ['name', 'subtitle', 'height', 'floor', 'light', 'benefits', 'patioRel'] as const;
export type EditableField = (typeof EDITABLE_FIELDS)[number];

export const ROOMS_DEFAULT: Record<RoomKey, Room> = {
    entrance: {
        name: "Hall de Entrada & Garagem",
        subtitle: "Acesso Principal",
        height: "3.00 m",
        floor: "Concreto Estampado",
        light: "Direta",
        icon: "fa-car",
        benefits: ["Impacto visual espetacular ao entrar na residência."],
        patioRel: "Transição imediata para o oásis verde.",
        rects: [[5, 0, 11, 3]],
        fill: "#334155", fillOpacity: 0.3, text: "#cbd5e1"
    },
    bedroom_2: {
        name: "Suíte Hóspedes",
        subtitle: "Dormitório de Visitas",
        height: "3.00 m",
        floor: "Vinílico Amadeirado",
        light: "Matutina (Leste) + Norte",
        icon: "fa-user-large",
        benefits: [
            "Ao lado do hall: a visita chega ao quarto sem cruzar a ala íntima.",
            "Canto nordeste recebe o sol da manhã e a brisa leste."
        ],
        patioRel: "Vista para a varanda e o jardim a partir do hall.",
        rects: [[16, 0, 5, 5]],
        fill: "#065f46", fillOpacity: 0.3, text: "#a7f3d0"
    },
    hallway: {
        name: "Varanda das Redes",
        subtitle: "Circulação & Descanso ao Redor do Pátio",
        height: "2.80 m (Beiral)",
        floor: "Cerâmica Atérmica Antiderrapante",
        light: "Sombreada & Ventilada",
        icon: "fa-person-walking",
        benefits: [
            "2,50 m de largura: redes armadas na diagonal nos quatro cantos (3,5 m entre armadores), com passagem livre.",
            "Cobertura de 2,50 m + beiral de 0,50 m: chuva com vento até ~45° não alcança as portas dos cômodos.",
            "Piso 15 cm acima do jardim, com ralo linear na borda do pátio."
        ],
        patioRel: "Abraça o pátio pelos quatro lados — é a sala ao ar livre da casa.",
        rects: [[5, 3, 11, 2.5], [0, 11.5, 16, 2.5], [5, 5.5, 2.5, 6], [13.5, 5.5, 2.5, 6]],
        labelRect: [5, 3, 11, 2.5],
        dimsLabel: "Largura 2,50 m",
        walls: false,
        fill: "#0f172a", fillOpacity: 0.8, text: "#94a3b8"
    },
    courtyard: {
        name: "Pátio Central Interno (Jardim)",
        subtitle: "Núcleo Bioclimático & Resfriador",
        height: "Descoberto (Céu Aberto)",
        floor: "Grama Tropical & Deck Ipê",
        light: "Abundante (360°)",
        icon: "fa-tree",
        benefits: [
            "Efeito chaminé natural para exaustão de ar quente.",
            "Vegetação e espelho d'água reduzem a temperatura local.",
            "Isolamento acústico entre as alas da casa.",
            "Implúvio: o telhado cai para o pátio; calha no beiral, condutores nos pilares e duas saídas de drenagem independentes."
        ],
        patioRel: "É o coração do projeto. Todos os cômodos circundam este oásis verde.",
        rects: [[7.5, 5.5, 6, 6]],
        uncovered: true,
        walls: false,
        fill: "#064e3b", fillOpacity: 0.35, text: "#6ee7b7"
    },
    living: {
        name: "Sala de Estar & Jantar Integrada",
        subtitle: "Zona Social Principal",
        height: "3.40 m (Pé-Direito Elevado)",
        floor: "Porcelanato Premium",
        light: "Leste + Varanda",
        icon: "fa-couch",
        benefits: [
            "Recebe a brisa leste diretamente e a conduz até o pátio (ventilação cruzada).",
            "5 × 9 m: estar e jantar bem proporcionados, colados à cozinha."
        ],
        patioRel: "Abre-se por inteiro para a varanda e o pátio, integrando convívio e natureza.",
        rects: [[16, 5, 5, 9]],
        fill: "#1e1b4b", fillOpacity: 0.4, text: "#c7d2fe"
    },
    kitchen: {
        name: "Cozinha Gourmet & Ilha",
        subtitle: "Área Culinária",
        height: "3.00 m",
        floor: "Porcelanato Antiderrapante",
        light: "Matutina (Leste) + Sul",
        icon: "fa-utensils",
        benefits: [
            "Próxima à área de refeições e ao pátio para cultivo de temperos.",
            "Espaço para despensa embutida e exaustão rápida de aromas."
        ],
        patioRel: "Permite vista direta para o jardim durante o preparo das refeições.",
        rects: [[13, 14, 8, 4]],
        fill: "#831843", fillOpacity: 0.35, text: "#fecdd3"
    },
    bwc_social: {
        name: "Lavabo & Banheiro Social",
        subtitle: "Apoio Social",
        height: "2.80 m",
        floor: "Porcelanato Antiderrapante",
        light: "Janela Alta (Sul)",
        icon: "fa-toilet",
        benefits: [
            "Atende quem está na sala, na cozinha ou na varanda.",
            "Janela alta ao sul garante ventilação com privacidade."
        ],
        patioRel: "Acesso direto pela varanda, ao lado da cozinha.",
        rects: [[10, 14, 3, 4]],
        fill: "#164e63", fillOpacity: 0.35, text: "#a5f3fc"
    },
    master_suite: {
        name: "Suíte Master",
        subtitle: "Dormitório Principal",
        height: "3.00 m",
        floor: "Madeira Tratada / Vinílico",
        light: "Sul — Fresca, sem Sol da Tarde",
        icon: "fa-bed",
        benefits: [
            "Nos fundos: o ponto mais silencioso e privado da casa, longe da rua e da garagem.",
            "Face sul quase sem sol direto — ideal para o calor de Mamanguape.",
            "Banheiro e closet a oeste funcionam como colchão térmico contra o sol da tarde."
        ],
        patioRel: "Sai direto na varanda das redes, de frente para o jardim.",
        rects: [[4.5, 14, 5.5, 4]],
        fill: "#1e3a8a", fillOpacity: 0.35, text: "#bfdbfe"
    },
    master_bath: {
        name: "BWC & Closet Master",
        subtitle: "Sanitário Privativo",
        height: "2.80 m",
        floor: "Mármore Branco",
        light: "Janelas Altas (Sul + Oeste)",
        icon: "fa-bath",
        benefits: [
            "Privacidade absoluta e ventilação natural.",
            "Protege o quarto do sol da tarde na fachada oeste."
        ],
        patioRel: "Acesso exclusivo pela Suíte Master, longe da circulação social.",
        rects: [[0, 14, 4.5, 4]],
        fill: "#172554", fillOpacity: 0.35, text: "#bfdbfe"
    },
    service: {
        name: "Área de Serviço",
        subtitle: "Lavanderia",
        height: "2.80 m",
        floor: "Cerâmica",
        light: "Janela (Oeste)",
        icon: "fa-soap",
        benefits: [
            "Lavanderia fora da vista social, ao lado da saída lateral.",
            "Janela a oeste aproveita o sol da tarde para secar roupas."
        ],
        patioRel: "Ligada à varanda, isolada da estética do pátio.",
        rects: [[0, 9.5, 5, 2]],
        fill: "#475569", fillOpacity: 0.3, text: "#e2e8f0"
    },
    bath_3: {
        name: "Banheiro Quarto 3",
        subtitle: "Sanitário Privativo",
        height: "2.80 m",
        floor: "Porcelanato Antiderrapante",
        light: "Janela Alta (Oeste)",
        icon: "fa-shower",
        benefits: ["Transforma o Quarto 3 em suíte."],
        patioRel: "Acesso pelo Quarto 3.",
        rects: [[0, 7.5, 5, 2]],
        fill: "#134e4a", fillOpacity: 0.35, text: "#99f6e4"
    },
    bedroom_3: {
        name: "Quarto 3",
        subtitle: "Dormitório (Filhos / Visitas)",
        height: "3.00 m",
        floor: "Vinílico Amadeirado",
        light: "Tarde (Oeste) — pede Brise",
        icon: "fa-bed",
        benefits: [
            "Suíte com banheiro próprio.",
            "Janela oeste deve ter brise ou vegetação contra o sol da tarde."
        ],
        patioRel: "Porta direto para a varanda das redes.",
        rects: [[0, 3.5, 5, 4]],
        fill: "#4c1d95", fillOpacity: 0.3, text: "#ddd6fe"
    },
    office: {
        name: "Home Office / Studio",
        subtitle: "Trabalho & Reuniões",
        height: "3.00 m",
        floor: "Vinílico Acústico",
        light: "Norte — Difusa com Brise",
        icon: "fa-laptop-code",
        benefits: [
            "Ao lado do hall: recebe clientes sem passar pela casa.",
            "Na frente, longe dos quartos — o barulho de trabalho não incomoda."
        ],
        patioRel: "Pausas visuais para a varanda e o pátio pelo hall.",
        rects: [[0, 0, 5, 3.5]],
        fill: "#78350f", fillOpacity: 0.3, text: "#fde68a"
    }
};
