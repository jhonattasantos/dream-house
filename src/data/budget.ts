export interface BudgetItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  value: number;
  desc: string;
}

export const BUDGET_DEFAULT: BudgetItem[] = [
    { id: 'estrutura', name: 'Fundação & Estrutura', icon: 'fa-helmet-safety', color: '#f59e0b', value: 190000, desc: 'Sapatas corridas, pilares em concreto armado e laje impermeabilizada.' },
    { id: 'alvenaria', name: 'Alvenaria & Cobertura', icon: 'fa-cubes', color: '#6366f1', value: 168000, desc: 'Blocos cerâmicos térmicos (maior conforto térmico) e estrutura de telhado em madeira tratada.' },
    { id: 'esquadrias', name: 'Esquadrias & Vidros', icon: 'fa-window-maximize', color: '#06b6d4', value: 153000, desc: 'Caixilhos de alumínio minimalistas e portas de correr em vidro temperado para a varanda.' },
    { id: 'instalacoes', name: 'Instalações Elétricas & Hidráulicas', icon: 'fa-plug', color: '#f43f5e', value: 110000, desc: 'Quadro de distribuição, iluminação LED, água fria/quente e reaproveitamento de água da chuva.' },
    { id: 'acabamentos', name: 'Acabamentos & Revestimentos', icon: 'fa-paint-roller', color: '#8b5cf6', value: 124000, desc: 'Porcelanatos, pintura, louças, metais e marcenaria básica.' },
    { id: 'paisagismo', name: 'Paisagismo & Pátio', icon: 'fa-tree', color: '#10b981', value: 66000, desc: "Espelho d'água, sistema de irrigação automatizada e espécies nativas do Nordeste." },
    { id: 'projetos', name: 'Projetos & Licenças', icon: 'fa-file-signature', color: '#94a3b8', value: 37000, desc: 'Projeto arquitetônico, complementares, ART/RRT, alvará e habite-se.' }
];
