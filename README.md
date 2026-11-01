# Dream House — Casa de Pátio

Planta baixa interativa da casa dos sonhos: uma casa de pátio (atrium house) pensada para o clima do Nordeste — 18 × 15 m, 234 m² construídos em torno de um pátio descoberto de 36 m².

Abra `planta_baixa_interativa_casa_de_p_tio.html` no navegador. Não há build — é uma página única que usa Tailwind e Font Awesome via CDN.

## Modos

- **Planta Baixa** — desenho em escala (1 m = 40 unidades) com paredes, portas, janelas e cotas. Clique nos ambientes para ver área, dimensões, pé-direito, piso, ventilação e benefícios bioclimáticos.
  - Zoom com a roda do mouse / pinça, arraste para mover.
  - Camadas: **Cotas**, **Sol** (simulação de insolação por hora e estação) e **Vento** (brisas leste/sudeste e efeito chaminé).
  - **Editar** um ambiente altera nome, materiais e textos (salvo no navegador).
- **Tour Guiado** — percorra os ambientes com mini-mapa; use ← → no teclado.
- **Orçamento** — valores por etapa editáveis, com total, percentuais e custo por m² calculados automaticamente.

## Editando a planta

Os ambientes ficam em `ROOMS_DEFAULT` (retângulos em metros), as portas em `OPENINGS` e as janelas em `WINDOWS`. Áreas, cotas e totais são calculados a partir dessa geometria.
