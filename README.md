# Dream House — Casa de Pátio

Planta baixa interativa da casa dos sonhos: uma casa de pátio (atrium house) pensada para o clima do Nordeste — 21 × 18 m, 342 m² construídos em torno de um pátio descoberto de 6 × 6 m, envolvido por uma varanda de 2,50 m para armar redes (pede lote com pelo menos 24 m de frente). Projetada para Mamanguape (PB).

São 3 suítes + home office: a Suíte Master fica nos fundos (face sul, a mais fresca e silenciosa), a Suíte Hóspedes ao lado do hall de entrada, e o Quarto 3 (com banheiro) e o Home Office na ala oeste. A sala de estar e jantar (5 × 9 m) se abre inteira para a varanda.

**Acesse:** https://jhonattasantos.github.io/dream-house/

## Modos

- **Planta Baixa** — desenho em escala com paredes, portas, janelas e cotas. Clique nos ambientes para ver área, dimensões, pé-direito, piso, ventilação e benefícios bioclimáticos.
  - Zoom com a roda do mouse / pinça, arraste para mover.
  - Camadas: **Nomes**, **Cotas**, **Sol** (simulação de insolação por hora e estação), **Vento** (brisas leste/sudeste e efeito chaminé), **Móveis** (layout indicativo em escala) e **Instalações** (telhado com caimento para o pátio, drenagem com duas saídas, cisterna, esgoto até a fossa, caixa d'água/solar e quadro de luz).
  - **Editar** um ambiente altera nome, materiais e textos (salvo no navegador).
- **Tour Guiado** — percorra os ambientes com mini-mapa; use ← → no teclado.
- **Orçamento** — valores por etapa editáveis, com total, percentuais e custo por m² calculados automaticamente.

## Desenvolvimento

Requer Node 24.

```bash
npm install
npm run dev       # servidor local em http://localhost:5173/dream-house/
npm test          # testes de geometria e dados da casa
npm run build     # build de produção em dist/
```

Cada push na `main` roda os testes e publica no GitHub Pages (`.github/workflows/deploy.yml`).

Stack: Vite, React 19, TypeScript, Tailwind CSS 4 e Zustand.

## Editando a planta

A geometria fica em `src/data/` e é a única fonte para todos os modos:

- `rooms.ts` — ambientes (retângulos em metros, origem no canto noroeste) e textos.
- `openings.ts` — portas e vãos (`OPENINGS`), janelas (`WINDOWS`) e redes (`HAMMOCKS`).
- `furniture.ts` — móveis com a altura de cada peça.
- `budget.ts` — etapas do orçamento.

Áreas, cotas, paredes e totais são calculados a partir desses dados (`src/lib/geometry.ts`). Os testes em `src/lib/geometry.test.ts` verificam que as áreas fecham, que toda porta e janela está numa parede e que os móveis cabem na casa.
