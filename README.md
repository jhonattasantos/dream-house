# Dream House

Plantas interativas (2D e 3D) de casas pensadas para o clima do Nordeste, em Mamanguape (PB). O título no topo da página troca de projeto; cada um guarda as próprias edições e o próprio orçamento.

**Acesse:** https://jhonattasantos.github.io/dream-house/

## Projetos

### Casa de Pátio

Casa de pátio (atrium house) construída em torno de um pátio descoberto envolvido por uma varanda para armar redes. São 3 suítes + home office: a Suíte Master fica nos fundos (face sul, a mais fresca e silenciosa), a Suíte Hóspedes ao lado do hall de entrada, e o Quarto 3 (com banheiro) e o Home Office na ala oeste.

Tem quatro tamanhos, escolhidos no seletor da planta (régua), todos na mesma proporção:

| Largura (frente) | Construção | Área construída | Pátio | Varanda | Lote mín. de frente |
|---|---|---|---|---|---|
| **16,5 m** (padrão) | 16,5 × 14,15 m | 211 m² | 4,70 × 4,75 m | 1,95 m | 19,5 m |
| 18 m | 18 × 15,45 m | 252 m² | 5,10 × 5,15 m | 2,15 m | 21 m |
| 19,5 m | 19,5 × 16,7 m | 294 m² | 5,60 × 5,60 m | 2,30 m | 22,5 m |
| 21 m | 21 × 18 m | 342 m² | 6 × 6 m | 2,50 m | 24 m |

Portas e móveis ficam no tamanho real: os móveis só mudam de posição dentro de cada cômodo. Os demais elementos (paredes, janelas, cotas, instalações e o 3D) acompanham o tamanho escolhido.

### Casa do Alpendre

Casa térrea de 8,5 × 21 m (161 m² construídos) para um terreno de 10 × 30 m:

- **Recuos:** 5 m na frente (jardim + vaga para 1 carro), 1,5 m na lateral leste e 4 m de quintal no fundo.
- **Divisa oeste:** a casa encosta nela, sem janelas, e fica protegida do sol da tarde.
- **Recuo leste:** recebe a brisa, as janelas e a água do telhado (embutido em uma água, atrás da platibanda).
- **Programa:** alpendre com redes, sala de estar e jantar, cozinha integrada, área de serviço, suíte, quartos 2 e 3, e banheiro social.
- **Pátio interno de 3 × 6 m:** fica junto à divisa e ilumina e ventila o miolo da casa, com uma galeria aberta ligando a sala aos quartos e ao quintal.
- **Quintal:** cisterna, fossa e sumidouro.

A frente para a rua foi considerada ao norte; se o terreno real tiver outra orientação, a análise de sol e vento muda.

## Modos

- **Planta Baixa** — desenho em escala com paredes, portas, janelas e cotas. Clique nos ambientes para ver área, dimensões, pé-direito, piso, ventilação e benefícios bioclimáticos.
  - Zoom com a roda do mouse / pinça, arraste para mover.
  - Camadas: **Nomes**, **Cotas**, **Sol** (simulação de insolação por hora e estação), **Vento** (brisas leste/sudeste e efeito chaminé), **Móveis** (layout indicativo em escala) e **Instalações** (caimento do telhado, drenagem, cisterna, esgoto até a fossa, caixa d'água/solar e quadro de luz).
  - **Editar** um ambiente altera nome, materiais e textos (salvo no navegador).
- **3D** — botão 2D/3D na planta. Gire, aproxime e clique nos ambientes como no 2D. Paredes com portas e janelas recortadas, pátio rebaixado com jardim, pilares, redes, **Móveis** e **Telhado** (com platibanda) ligáveis, e o **Sol** real de Mamanguape por hora e estação projetando sombras. O Three.js só é baixado quando o 3D é aberto.
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

Stack: Vite, React 19, TypeScript, Tailwind CSS 4, Zustand e React Three Fiber (Three.js) para o 3D.

## Editando a planta

A geometria fica em `src/data/` e é a única fonte para todos os modos. A Casa de Pátio é desenhada em 21 × 18 m e `src/lib/model.ts` gera os tamanhos menores a partir dela; a Casa do Alpendre fica inteira em `src/data/alpendre.ts` (cômodos, aberturas, móveis, instalações, vento, telhado e terreno). Os projetos são listados em `src/lib/projects.ts`. Arquivos da Casa de Pátio:

- `rooms.ts` — ambientes (retângulos em metros, origem no canto noroeste) e textos.
- `openings.ts` — portas e vãos (`OPENINGS`), janelas (`WINDOWS`) e redes (`HAMMOCKS`).
- `furniture.ts` — móveis com a altura de cada peça.
- `budget.ts` — etapas do orçamento.

Áreas, cotas, paredes e totais são calculados a partir desses dados (`src/lib/geometry.ts`), e as paredes 3D também (`src/lib/walls3d.ts`) — mudou a planta, o 2D e o 3D mudam juntos. Os testes em `src/lib/geometry.test.ts` verificam que as áreas fecham, que toda porta e janela está numa parede e que os móveis cabem na casa.
