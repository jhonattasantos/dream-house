# Dream House

Plantas interativas (2D e 3D) de casas pensadas para o clima do Nordeste, em Mamanguape (PB). Cada projeto tem um número e um endereço próprio; cada um guarda as próprias edições e o próprio orçamento.

| Projeto | Endereço |
|---|---|
| Lista de projetos | https://jhonattasantos.github.io/dream-house/ |
| 1 · Casa de Pátio | https://jhonattasantos.github.io/dream-house/project/1 |
| 2 · Casa do Alpendre | https://jhonattasantos.github.io/dream-house/project/2 |
| 3 · Duas Casas | https://jhonattasantos.github.io/dream-house/project/3 |

A página inicial lista os projetos com miniatura da planta, medidas, área e orçamento. Dentro de um projeto, o ícone da casa volta para a lista e o título troca de projeto.

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

- **Recuos:** 5 m na frente (jardim + vaga para 1 carro), 1,5 m na lateral sul e 4 m de quintal no fundo.
- **Frente para o leste:** o alpendre recebe o sol da manhã e a brisa, que atravessa a casa da frente para os fundos.
- **Divisa norte:** a casa encosta nela, sem janelas.
- **Recuo sul:** quase não recebe sol direto; recebe a brisa sudeste, as janelas e a água do telhado (embutido em uma água, atrás da platibanda).
- **Fundos para o oeste:** as janelas do fundo pegam o sol da tarde e levam veneziana.
- **Programa:** alpendre com redes, sala de estar e jantar, cozinha integrada, área de serviço, suíte, quartos 2 e 3, e banheiro social.
- **Pátio interno de 3 × 6 m:** fica junto à divisa e ilumina e ventila o miolo da casa, com uma galeria aberta ligando a sala aos quartos e ao quintal.
- **Quintal:** cisterna, fossa e sumidouro.

### Duas Casas

Duas casas térreas no mesmo terreno de 10 × 30 m (181 m² construídos), com um só portão social:

- **Frente (5 m):** garagem descoberta para 2 carros lado a lado, jardim e o portão social. A fossa e o sumidouro ficam sob o jardim, perto da rua, para o caminhão limpa-fossa.
- **Casa da frente, 8,5 × 14 m:** alpendre com redes, sala, quartos 1 e 2, suíte com banheiro, banheiro social (ventilado por domus, por estar na divisa) e cozinha com jantar voltada para o quintal.
- **Quintal do meio, 4,5 m:** separa as duas casas e dá luz e ventilação a ambas; a cisterna fica sob ele.
- **Casa dos fundos, 8,5 × 6,5 m, encostada no muro dos fundos:** só tem janelas para o quintal do meio (leste) e para o corredor (sul). A sala com cozinha e o quarto 1 dão para o quintal, e o quarto 2 dá para o corredor. O canto entre as duas divisas, onde não pode haver janela, fica com o banheiro (domus + exaustor) e um depósito/despensa.
- **Corredor sul, 1,5 m:** leva do portão até a casa dos fundos sem passar por dentro da casa da frente, e recebe as janelas, a brisa sudeste e a água dos telhados.
- **Caixa d'água:** fica em uma torre no quintal do meio, junto à divisa norte. Há uma caixa de 1.000 L para cada casa, a cerca de 3 m das duas cozinhas e na mesma parede hidráulica delas. Embaixo da laje ficam as duas lavanderias, uma de cada casa. Cada casa tem seu próprio medidor de água e de luz.
- **Pátio interno:** não tem. O quintal do meio cumpre esse papel.

Nos projetos 2 e 3, a frente para a rua fica a **leste**: o sol nasce na frente e a brisa (leste/sudeste) vem da frente para os fundos. No desenho, a rua fica no alto, o norte à esquerda (divisa onde as casas encostam), o sul à direita (recuo/corredor) e o oeste nos fundos. A bússola, o sol (2D e 3D), as fachadas ao sol e as setas de vento seguem essa orientação, definida em `north` no modelo de cada projeto; a Casa de Pátio continua com o norte para cima.

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

Cada push na `main` roda os testes e publica no GitHub Pages (`.github/workflows/deploy.yml`). O build copia `index.html` para `404.html`, para que o GitHub Pages abra o app quando alguém entra direto em `/project/2` (as rotas são resolvidas no navegador, em `src/lib/router.ts`). Um número de projeto que não existe volta para a lista.

Stack: Vite, React 19, TypeScript, Tailwind CSS 4, Zustand e React Three Fiber (Three.js) para o 3D.

## Editando a planta

A geometria fica em `src/data/` e é a única fonte para todos os modos. A Casa de Pátio é desenhada em 21 × 18 m e `src/lib/model.ts` gera os tamanhos menores a partir dela; a Casa do Alpendre fica inteira em `src/data/alpendre.ts` (cômodos, aberturas, móveis, instalações, vento, telhado e terreno). Os projetos são listados em `src/lib/projects.ts`. Arquivos da Casa de Pátio:

- `rooms.ts` — ambientes (retângulos em metros, origem no canto superior esquerdo do desenho) e textos.
- `openings.ts` — portas e vãos (`OPENINGS`), janelas (`WINDOWS`) e redes (`HAMMOCKS`).
- `furniture.ts` — móveis com a altura de cada peça.
- `budget.ts` — etapas do orçamento.

Áreas, cotas, paredes e totais são calculados a partir desses dados (`src/lib/geometry.ts`), e as paredes 3D também (`src/lib/walls3d.ts`) — mudou a planta, o 2D e o 3D mudam juntos. Os testes em `src/lib/geometry.test.ts` verificam que as áreas fecham, que toda porta e janela está numa parede e que os móveis cabem na casa.
