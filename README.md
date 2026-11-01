# Dream House — Casa de Pátio

Planta baixa interativa da casa dos sonhos: uma casa de pátio (atrium house) pensada para o clima do Nordeste — 21 × 18 m, 342 m² construídos em torno de um pátio descoberto de 6 × 6 m, envolvido por uma varanda de 2,50 m para armar redes (pede lote com pelo menos 24 m de frente). Projetada para Mamanguape (PB).

São 3 suítes + home office: a Suíte Master fica nos fundos (face sul, a mais fresca e silenciosa), a Suíte Hóspedes ao lado do hall de entrada, e o Quarto 3 (com banheiro) e o Home Office na ala oeste. A sala de estar e jantar (5 × 9 m) se abre inteira para a varanda.

Abra `planta_baixa_interativa_casa_de_p_tio.html` no navegador. Não há build — é uma página única que usa Tailwind e Font Awesome via CDN.

## Modos

- **Planta Baixa** — desenho em escala (1 m = 32 unidades) com paredes, portas, janelas e cotas. Clique nos ambientes para ver área, dimensões, pé-direito, piso, ventilação e benefícios bioclimáticos.
  - Zoom com a roda do mouse / pinça, arraste para mover.
  - Camadas: **Cotas**, **Sol** (simulação de insolação por hora e estação) e **Vento** (brisas leste/sudeste e efeito chaminé).
  - **Editar** um ambiente altera nome, materiais e textos (salvo no navegador).
- **Tour Guiado** — percorra os ambientes com mini-mapa; use ← → no teclado.
- **Orçamento** — valores por etapa editáveis, com total, percentuais e custo por m² calculados automaticamente.

## Editando a planta

Os ambientes ficam em `ROOMS_DEFAULT` (retângulos em metros), as portas em `OPENINGS`, as janelas em `WINDOWS` e as redes em `HAMMOCKS`. Áreas, cotas e totais são calculados a partir dessa geometria.
