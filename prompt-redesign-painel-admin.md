# PROMPT DE EXECUÇÃO — Redesign visual do painel-admin (Doce & Carinho)

Você é um agente de código. Vai redesenhar o **visual** do painel administrativo
da confeitaria Doce & Carinho, seguindo esta especificação à risca. Leia tudo antes
de editar qualquer arquivo. Onde a especificação decide, não reabra a decisão.
Onde ela manda "ler primeiro", leia o arquivo real e preserve o comportamento.

---

## 0. Regras inegociáveis

1. **Escopo.** Edite somente `painel-admin/src/**` (className, JSX, estrutura de
   componentes) e `PROGRESSO.md`. Única exceção permitida fora de `src/`:
   adicionar 3 tokens de cor de estado em `painel-admin/tailwind.config.js` (seção 3).
   Intocáveis: backend, `docker-compose.yml`, `.env`, `package.json`, `hooks/`,
   `lib/api*`, `types/`, regras de negócio, textos de WhatsApp, e **toda a vitrine
   pública**.
2. **Nada de lógica nova.** Não mova handlers entre componentes, não mude chamadas
   de API, não altere props de dados. Estado puramente visual (abrir/fechar um
   popover) é permitido.
3. **Acessibilidade.** Contraste AA (4.5:1 texto, 3:1 elementos de interface);
   alvos de toque ≥ 44px (`h-11`/`min-h-11`); preservar todos os `aria-*` atuais
   (dialog, tablist, aria-expanded, aria-live) e `role`s.
4. **Estados sempre com texto.** Nenhum estado comunicado só por cor. Cor é reforço.
5. **Celular primeiro.** Classes base = celular. Existe UMA troca de layout:
   `md:` (768px) separa "celular" de "desktop". Não existe tablet; não use `sm:`
   nem `lg:` para trocar layout (pode usar `lg:`/`xl:` só para largura máxima).
6. **Proibido:** instalar libs, mexer em `package.json`, trocar fontes, adicionar
   outra lib de ícones, reescrever lógica.
7. **Disciplina de registro.** Siga o padrão do redesign anterior: ao fim de cada
   clúster (seção 6) rode os critérios, atualize `PROGRESSO.md` (o que mudou,
   arquivos, resultado dos greps) e faça um commit parcial. Mensagem:
   `redesign(painel): <clúster> — <resumo>`.
8. **Antes de editar um componente**, leia-o inteiro e anote (em `PROGRESSO.md`) quais
   `aria-*`, `role`s e handlers ele tem. Ao terminar, confira que continuam lá.

---

## 1. Diagnóstico

O painel atual funciona, mas parece "site de IA" porque repete o molde que todo
gerador devolve: sidebar escura fixa com fila de ícones, botão ativo preenchido em
caramelo, cartões brancos arredondados em tudo (métricas, listas, tabelas, estados
vazios), título serifado grande acima de qualquer tabela, discos coloridos com ícone
em cada estado vazio, separadores decorativos com ponto dourado, eyebrows em
caixa-alta em toda página, e números do resumo em serifada. Tudo tem o mesmo peso
visual, então nada guia o olho: a gestora, que abre o painel no celular para saber
"o que preciso fazer agora", recebe a mesma cerimônia para um pedido pendente e para
uma tela vazia. Falta o que dá cara de ferramenta: hierarquia por tipografia,
tabelas sobre o fundo (não dentro de caixas), números alinhados, e cor reservada
para ação e alerta.

## 2. Direção: **"Papel e tinta, caramelo só na ação"**

Escolha única: **painel-ferramenta neutro (papel/tinta)** com caramelo apenas como
accent de ação e de estado ativo. Justificativa: a vitrine já carrega a marca
caramelo; o painel é ferramenta de trabalho de uma pessoa, e o que ela precisa
ver rápido é *pendência* e *alerta* — isso só funciona se o resto for calmo.
Marca no painel = wordmark Playfair + um traço caramelo; o resto é tinta sobre creme.

Referências verificadas e o que foi aproveitado de cada:

1. **Linear — redesenho da UI**
   https://linear.app/blog/how-we-redesigned-the-linear-ui
   https://linear.app/blog/behind-the-latest-design-refresh
   → Aproveitado: nem todo elemento tem o mesmo peso visual; abas, cabeçalhos e
   filtros ficam discretos para o conteúdo aparecer; e a **poda de ícones** (o time
   reduziu ícones onde a presença tinha crescido demais). Vira nossa regra de ícones
   (seção 3).
2. **Vercel — nova navegação do dashboard**
   https://vercel.com/changelog/dashboard-navigation-redesign-rollout
   → Aproveitado SOMENTE a **barra inferior no celular pensada para uso com uma mão**
   e a ideia de abas iguais em todos os níveis. A sidebar da Vercel NÃO é copiada
   (é exatamente o clichê que a gestora recusou).
3. **Plausible Analytics — tour do dashboard**
   https://docs.plausible.io/guided-tour (demo viva: https://plausible.io/plausible.io)
   → Aproveitado: uma tela só com o essencial, sem submenus nem relatórios para
   montar; o número principal e o gráfico juntos; período como controle simples.
   Vira o desenho do Resumo.
4. **Shopify Polaris — Index table (pedidos/produtos)**
   https://polaris-react.shopify.com/components/tables/index-table
   → Aproveitado: tabela serve para ver rápido objetos do mesmo tipo e abrir o
   detalhe; **células numéricas alinhadas à direita com estilo numérico**; esqueleto
   de carregamento. Vira as tabelas de Pedidos, Produtos e Insumos.
5. **Stripe — DataTable (tipos de célula)**
   https://docs.stripe.com/stripe-apps/components/datatable
   → Aproveitado: células **tipadas** (status, moeda, data) em vez de texto solto.
   Vira o conjunto de células da seção 3 (status = marcador + texto; moeda = tabular
   à direita; data = tabular, cor suave).

(Fathom, Netlify, Mercado Livre, iFood e Tailwind UI ficam como inspiração geral;
não foram usados como fonte citável.)

---

## 3. Sistema

### 3.1 Cores (tokens atuais mantidos; muda o USO)

| Papel | Token | Hex | Regra de uso |
|---|---|---|---|
| Fundo da página | `creme` | #fdf8f3 | Fundo de tudo. Tabelas e listas ficam **direto sobre ele**. |
| Superfície elevada | `bg-white` | #ffffff | Só drawer, modal, popover e campos de formulário. |
| Superfície sutil | `areia` | #f4e8d8 | Hover de linha (`hover:bg-areia/50`), tile de inicial do produto, bloco esquerdo do login. |
| Texto principal | `tinta` | #2b1e17 | Títulos, valores, rótulos. |
| Texto secundário | `textoSuave` | #6e5c4e | Subtítulos, unidades, datas. (6,0:1 sobre creme — AA.) |
| Linha | `borda` | #e8ddd1 | Hairline decorativa (separador de linhas, topo/base de tabela). |
| Borda de campo | `textoSuave/80` | — | Bordas de input/select (precisa ≥ 3:1; `borda` não atinge). |
| Ação primária | `carameloForte` | #9c4a1f | Fundo do botão primário (texto branco = 6,1:1), links, texto de estado ativo. |
| Ação — hover/pressed | `carameloEscuro` | #7a3a18 | Hover do primário. |
| Accent só-gráfico | `caramelo` | #c4622d | **Nunca como texto pequeno** (3,9:1, reprova AA). Só: sublinhado de 2px da aba ativa, barra destacada do gráfico, anel de foco. |
| Dourado | `dourado` | #d4a24c | Removido do painel, exceto o "&" do wordmark. |
| Estado OK | `ok` (NOVO) | #2f6b3f | 6,0:1 sobre creme. |
| Estado atenção | `alerta` (NOVO) | #8a5a00 | 5,6:1 sobre creme. |
| Estado perigo | `perigo` (NOVO) | #a32a2a | 6,8:1 sobre creme. |

Os três tokens novos entram em `tailwind.config.js` (`colors.ok`, `colors.alerta`,
`colors.perigo`) e são a única edição fora de `src/`.

**Foco:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo focus-visible:ring-offset-2 focus-visible:ring-offset-creme` em todo elemento interativo.

**Estados de pedido (marcador + texto, sempre os dois):**
Pendente = `alerta` · Em preparo = `carameloForte` · Pronto = `ok` · Entregue = `textoSuave` · Cancelado = `perigo`.
**Estados de catálogo/estoque:** Visível = `ok` · Oculto = `textoSuave` · Abaixo do mínimo = `alerta` ("Abaixo do mínimo") · Estoque normal = `textoSuave` ("Normal").

### 3.2 Raios, sombra, bordas

| Elemento | Regra |
|---|---|
| Inputs, botões, thumbs de produto | `rounded-campo` (12px) |
| Drawer, modal, popover de conta | `rounded-card` (16px) — no celular o drawer/modal é tela cheia, **sem** raio |
| Tabelas, listas, linhas, abas, seções | **sem raio e sem moldura** |
| `rounded-full` | apenas `Avatar` e marcadores (`size-2`) de status |
| Sombra | só `shadow-flutuante`, só em drawer/modal/popover |
| Separação | hairline `border-borda`; nunca sombra; nunca gradiente |

### 3.3 Tipografia por papel

| Papel | Fonte / classes |
|---|---|
| Título de página | Playfair Display, `text-2xl md:text-3xl font-semibold tracking-tight text-tinta`. Um por tela. Alinhado à esquerda. |
| Título de seção | DM Sans `text-base font-semibold text-tinta` (não serifada). |
| Corpo | DM Sans `text-sm` em tabelas/listas; `text-base` em formulários e parágrafos. |
| Número (preço, estoque, contador, datas) | Manrope `tabular-nums`, `font-medium` ou `font-semibold`. **Inclusive o número grande do Resumo** (hoje está em serifada: trocar). Em tabelas: `text-right`. |
| Rótulo-caixa | DM Sans `text-xs font-semibold uppercase tracking-wider text-textoSuave`. **Só** em cabeçalho de coluna de tabela e no rótulo de seção do Resumo. Remover eyebrows de página ("CARDÁPIO", "ESTOQUE" etc.). Única exceção: a data no topo do Resumo. |
| Pesos permitidos | 400, 500, 600. Nada de `font-bold`, `font-extrabold`, `font-black`. |
| Rótulo de campo | DM Sans `text-sm font-medium text-tinta`, acima do campo, em caixa normal. |

### 3.4 Ícones

lucide, `strokeWidth={1.5}` sempre. **Ícone só onde carrega função:** abas do menu
inferior (celular), lupa da busca, X de fechar, ações de linha no celular (com
`aria-label`). **Remover** ícones decorativos: no menu desktop, em títulos de seção
("Mais vendidos", "Estoque baixo"), nos estados vazios (discos), nos botões de
cabeçalho ("Ver pedidos", "Ver estoque"), no `Separator` com ponto.

### 3.5 Primitivos (`src/components/ui/`)

- **Botao** — `primario`: `h-11 px-4 rounded-campo bg-carameloForte text-white text-sm font-semibold hover:bg-carameloEscuro`. `secundario`: `h-11 px-4 rounded-campo border border-textoSuave/80 text-tinta hover:bg-areia/50`. `texto`: `min-h-11 px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4`. `perigo`: texto/borda `perigo`. **No máximo um botão primário por região de tela.**
- **Entrada** — `h-11 rounded-campo bg-white border border-textoSuave/80 px-3 text-base`, foco com anel caramelo. Erro: `border-perigo` + mensagem em `text-perigo` começando com a palavra "Erro:"; manter `aria-invalid`/`aria-describedby` atuais.
- **Badge** — vira "Estado": `inline-flex items-center gap-2 text-sm font-medium`, marcador `size-2 rounded-full` na cor do estado, texto em `tinta` (o texto não usa a cor do estado, o marcador sim; exceção: "Abaixo do mínimo" e "Cancelado" usam o texto na cor do estado). Sem fundo preenchido, sem pílula.
- **Cartao** — padrão passa a ser **seção sem moldura** (`border-t border-borda pt-4`, sem fundo, sem raio). Se algum uso precisar mesmo de moldura, passe por prop explícita; não deve sobrar nenhum cartão arredondado em páginas.
- **Separator** — hairline `border-borda` simples (remover o ponto dourado central).
- **DiscoVazio** — **excluir o arquivo**; **VazioLista** — texto puro, alinhado à esquerda: uma linha `text-sm text-textoSuave` com instrução (mantém as frases atuais). Sem ícone, sem disco, sem centralizar.
- **EsqueletoTabela** — linhas de hairline com blocos `bg-areia` retos; sem raio.
- **AcoesLinha / BotaoEscolher** — ver seção 5.

### 3.6 Ritmo

Padding lateral da página `px-4 md:px-8`; largura máxima `max-w-5xl mx-auto`; espaço
entre seções `space-y-10 md:space-y-12`; linhas de lista/tabela `min-h-14` (celular)
e `md:min-h-12`; padding inferior no celular `pb-24` (reserva da barra inferior).

---

## 4. Navegação

### 4.1 Desktop (≥ `md`) — barra superior de textos

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Doce & Carinho    Resumo   Pedidos 3   Insumos   Produtos   Histórico  (G) ▾│  h-14
│                   ━━━━━                                                    │
└──────────────────────────────────────────────────────────────────────────┘
   bg-creme · border-b border-borda · sticky top-0 · sem blur · sem sombra
```

- Esquerda: wordmark (`Marca`) em Playfair `text-lg`, "&" em `dourado`. Link para Resumo.
- Centro-esquerda: 5 links só de **texto**, sem ícones, ordem atual: Resumo, Pedidos, Insumos, Produtos, Histórico (o rótulo visível continua "Histórico"; o arquivo continua Registros).
  Cada link: `px-3 text-sm`, altura total da barra (`h-14`, `items-stretch`).
  - Inativo: `text-textoSuave hover:text-tinta`.
  - **Ativo:** `text-tinta font-semibold` + sublinhado de 2px `bg-caramelo` colado na borda inferior da barra (elemento `absolute inset-x-3 bottom-0 h-0.5`). Manter `aria-current="page"`.
- **Contador de pendentes** ao lado de "Pedidos": número Manrope tabular em `bg-carameloForte text-white text-xs font-semibold min-w-5 h-5 px-1.5 rounded-campo`. Só aparece se > 0. Mantém a região `aria-live` atual e texto para leitor de tela ("3 pedidos pendentes").
- Direita: botão de conta (44×44) com `Avatar` + chevron `ChevronDown` 16px.
  `aria-expanded`, `aria-controls`. Abre um **popover** (`bg-white rounded-card border border-borda shadow-flutuante w-64`) contendo: nome + "admin" (texto), linha hairline, itens "Meu perfil" (abre `JanelaPerfil`) e "Sair", cada um `min-h-11 px-4 text-sm text-left`. Fecha com Esc, clique fora e troca de rota; devolve o foco ao botão.
- **`BarraLateral.tsx` é removido.** `EstruturaPainel` passa a renderizar `BarraSuperior` (novo arquivo) no desktop. Conteúdo: `max-w-5xl` centralizado, sem coluna fixa.

### 4.2 Celular (< `md`)

```
┌──────────────────────────────┐
│ Doce & Carinho           (G) │  header h-14, sticky, border-b
├──────────────────────────────┤
│                              │
│   conteúdo  (px-4, pb-24)    │
│                              │
├──────────────────────────────┤  ← barra inferior fixa, border-t
│ ┈┈┈┈┈                        │     (barra de 2px caramelo no topo da aba ativa)
│ ▢       ▢        ▢       ▢       ▢ │
│Resumo Pedidos[3] Insumos Produtos Histórico │
└──────────────────────────────┘
```

- Header: wordmark à esquerda; avatar (44×44) à direita abrindo o **mesmo popover** de conta (Meu perfil / Sair), alinhado à direita da tela.
- Barra inferior fixa (`fixed inset-x-0 bottom-0 bg-creme border-t border-borda pb-[env(safe-area-inset-bottom)]`), 5 abas `flex-1 min-h-14`, **ícone 20px (strokeWidth 1.5) acima do rótulo `text-xs`**, rótulo sempre visível.
  - Inativa: ícone e rótulo `textoSuave`.
  - **Ativa:** ícone e rótulo `tinta`, rótulo `font-semibold`, barra `h-0.5 bg-caramelo` no topo da aba (largura da aba menos 16px). Sem fundo preenchido, sem pílula. `aria-current="page"`.
  - Contador de pendentes: mesmo chip do desktop, ao lado do rótulo "Pedidos".
- **Ler antes:** `MenuMobile.tsx` e `AbasRodape.tsx`. Se `MenuMobile` for gaveta/hambúrguer, ele é substituído pelo popover de conta; qualquer conteúdo único dele (ex.: perfil, sair) migra para o popover **reaproveitando os mesmos handlers**. Registre em `PROGRESSO.md` o destino de cada arquivo (reaproveitado / removido).

---

## 5. Especificações por tela

### 5.1 Resumo (`pages/Resumo`, `CabecalhoSecao`, `CartaoMetrica`, `GraficoVendas`, `ListaMaisVendidos`, `ListaBaixoEstoque`, `UltimosPedidos`)

**Decisões**
- Cabeçalho: data em rótulo-caixa (única exceção de eyebrow), saudação "Bom dia, Gestora." em título de página (Playfair, `text-2xl md:text-3xl`). **Remover** os botões "Ver pedidos" e "Ver estoque".
- **Período** (Hoje · 7 dias · 30 dias · Tudo): vira controle de **texto com sublinhado** (mesma lógica do menu), alinhado à direita no desktop e abaixo da saudação no celular; item ativo `text-tinta font-semibold` + 2px `bg-caramelo`; inativo `textoSuave`; `min-h-11`. Preservar `role="tablist"`/`aria-selected` atuais.
- **A fileira de 4 cartões iguais deixa de existir.** `CartaoMetrica` passa a renderizar uma **linha de fila** ("Precisa de você agora"): linha inteira clicável (link para Pedidos/Insumos como hoje), esquerda = rótulo `font-medium tinta` + descrição `text-sm textoSuave`, direita = número Manrope `text-xl font-semibold tabular-nums`. Hairline entre linhas, sem moldura. Número > 0 em "Pedidos pendentes" = `carameloForte`; em "Estoque baixo" = `alerta`; zero = `textoSuave`. (Os nomes de arquivo ficam; anote em `PROGRESSO.md` que `CartaoMetrica` agora é linha.)
- **Layout.** Celular: ordem = Fila → Vendas → Mais vendidos. Desktop: `md:grid md:grid-cols-12 md:gap-12`; Fila em `md:col-span-5`; Vendas + Mais vendidos em `md:col-span-7`.
- **Vendas no período:** rótulo-caixa "Vendas no período"; número total em Manrope `text-4xl font-semibold tabular-nums` (ex.: "R$ 0,00"); ao lado/abaixo, `text-sm textoSuave`: "0 pedidos · melhor dia —". Gráfico logo abaixo, sem moldura.
- **GraficoVendas (SVG próprio):** barras `fill-textoSuave`; a barra do dia mais alto `fill-caramelo`; apenas 3 linhas-guia horizontais em `stroke-borda`; rótulos de eixo `text-xs` Manrope tabular `textoSuave`, só primeiro/meio/último dia no eixo X; **sem `linearGradient`**, sem sombra. Se o gráfico já tem estado de hover/toque, mostre o valor numa linha de texto acima do gráfico (dia · valor · pedidos) com `aria-live="polite"`; não crie lógica nova. Sem vendas: nenhuma barra, uma linha de texto "Nenhuma venda neste período."
- **Mais vendidos:** título de seção DM Sans (sem ícone de troféu); lista numerada com hairline: posição (tabular, `textoSuave`) · nome · quantidade à direita. Vazio: uma linha de texto (frase atual).
- **Estoque baixo:** NÃO é mais um bloco com título próprio quando zero (a linha da Fila já diz). Quando > 0, `ListaBaixoEstoque` aparece abaixo da Fila: linhas hairline "nome — restam 200 g · mín. 150 g" (restam à direita, tabular, `alerta`).
- **Últimos pedidos:** se já aparece no Resumo, mesma linha de pedido da seção 5.2 (versão compacta, máx. 5). Sem cartões.
- Remover os separadores com ponto dourado entre seções; usar só espaço (`space-y-10 md:space-y-12`).

**Resultado esperado**
- Primeira dobra no celular mostra a Fila e o número de vendas, sem rolar.
- Nenhum cartão arredondado, nenhum ícone decorativo na tela.
- Todos os números em Manrope tabular.
- Desktop lê-se em duas colunas assimétricas (5/7), não numa grade uniforme.

### 5.2 Pedidos (`pages/Pedidos`, `TabelaPedidos`, `CartaoPedido`, `DrawerPedido`, `CabecalhoDrawer`, `AcoesPedido`, `ItensPedido`)

**Decisões**
- Título "Pedidos" (sem eyebrow). Filtros de status (Todos, Pendente, Em preparo, Pronto, Entregue, Cancelado) deixam de ser pílulas e viram **abas de texto** com contagem: `Pendente 3` (contagem em Manrope tabular `textoSuave`); ativa = `tinta font-semibold` + 2px caramelo; no celular, rolagem horizontal (`overflow-x-auto`, sem barra visível não é requisito; garantir `min-h-11`). Preservar `role="tablist"` e `aria-selected`.
- **Desktop — `TabelaPedidos`:** sem moldura. Colunas estáveis: **Pedido** (nº + nome do cliente) · **Itens** (resumo em `textoSuave`, truncado) · **Total** (`text-right` tabular) · **Status** (Estado: marcador + texto) · **Quando** (data/hora tabular `textoSuave`, `text-right`). Cabeçalho em rótulo-caixa com `border-b`; linhas com `border-b border-borda`, `hover:bg-areia/50`, linha inteira abre o drawer (cursor e foco visíveis; manter acessibilidade atual da linha).
- **Celular — `CartaoPedido`:** deixa de ser cartão; vira **linha de lista** `min-h-16 border-b border-borda`: 1ª linha = cliente (`font-medium`) + total à direita (tabular); 2ª linha = Estado (marcador + texto) + "há 12 min"/hora à direita em `textoSuave`. Toda a linha é o alvo de toque.
- **Drawer (`DrawerPedido`):** desktop = painel à direita `w-full max-w-md bg-white shadow-flutuante rounded-card` (raio só nos cantos livres da esquerda: `rounded-l-card`); celular = **tela cheia** (`inset-0`, sem raio). `role="dialog"`, `aria-modal`, foco preso e Esc fecham, como hoje.
  - `CabecalhoDrawer`: "Pedido #123" em DM Sans `text-lg font-semibold` + Estado; botão fechar (X 44×44) à direita; no celular, texto "Voltar" à esquerda em vez de só o X.
  - **Linha do tempo textual** (substitui qualquer indicador colorido): Pendente → Em preparo → Pronto → Entregue em uma linha de textos `text-xs`; o atual em `tinta font-semibold` com sublinhado 2px caramelo, os já passados e os futuros em `textoSuave` (sem reduzir opacidade, para manter o contraste AA).
  - `ItensPedido`: linhas hairline "2 × Cone brigadeiro gourmet" à esquerda, subtotal à direita tabular; linha final "Total" `font-semibold`.
  - `AcoesPedido`: rodapé fixo do drawer (`border-t border-borda bg-white`): **um** botão primário largo cujo rótulo nomeia o próximo status ("Avançar para Em preparo"); à esquerda, botão `texto` em `perigo` "Cancelar pedido" que continua passando pelo `ModalConfirmacao` atual. Mesmos handlers de hoje.
- Vazio: uma linha de texto à esquerda ("Nenhum pedido aqui. Os pedidos que chegam pela vitrine aparecem aqui assim que são feitos."), sem disco/ícone. A dica "Clique numa linha para abrir…" vira `text-sm textoSuave` sem ícone, só visível em `md:`.

**Resultado esperado**
- Celular: lista de linhas de 64px com status legível por texto; abrir um pedido ocupa a tela toda.
- Desktop: tabela densa estilo Stripe/Polaris, valores alinhados à direita.
- Ação principal do pedido é sempre uma só e diz o que vai acontecer.
- Nenhuma pílula, nenhum cartão, nenhum emoji.

### 5.3 Produtos (`pages/Produtos`, `TabelaProdutos`, `CartaoProduto`, `PainelDeProduto`, `ModaisProduto`, `EditorFicha`, `CampoImagem`, `Busca`, `EstadosProdutos`)

**Decisões**
- Cabeçalho: "Produtos" (sem eyebrow "CARDÁPIO"); à direita, botão `secundario` "Categorias" (sem ícone de etiqueta) e botão `primario` "Novo produto" (sem ícone de +). No celular os dois ficam em linha abaixo do título, `Novo produto` ocupando o espaço restante.
- Busca: campo único `h-11`, lupa lucide à esquerda (único ícone), placeholder atual; sem moldura de cartão em volta.
- **Tabela (desktop):** sem moldura. Colunas: **Produto** (thumb 40×40 `rounded-campo` + nome `font-medium` + categoria `textoSuave` abaixo) · **Preço** (`text-right` tabular) · **Na vitrine** (Estado: "Visível"/"Oculto") · **Ações**. Sem foto: tile `bg-areia` com a **inicial do nome** em Playfair `textoSuave` (substitui o ícone de bolo repetido em todas as linhas).
- **Ações de linha (`AcoesLinha`):** desktop = **links de texto** `Editar · Ocultar/Mostrar · Excluir` (`text-sm`, `min-h-11`, `textoSuave`, hover `tinta` + sublinhado; "Excluir" hover `perigo`), na ordem atual de handlers; "Ocultar/Mostrar" reflete o estado atual. Celular = linha toda abre o editor (mesmo handler do botão de editar), e os ícones de ocultar/excluir permanecem à direita como botões 44×44 com `aria-label` (strokeWidth 1.5). **Não mova handlers entre componentes.**
- **Celular — `CartaoProduto`:** vira linha de lista `min-h-16`: thumb 40px, nome + categoria, preço à direita tabular; Estado "Oculto" aparece como segunda linha de texto só quando oculto.
- **Modais de produto/ficha técnica (`ModaisProduto`, `EditorFicha`, `CampoImagem`):** celular = tela cheia com cabeçalho "Cancelar" (texto, esquerda) · título · "Salvar" (texto `carameloForte`, direita) se o componente já tiver ação equivalente; senão manter o rodapé com botão primário. Desktop = modal `max-w-xl bg-white rounded-card shadow-flutuante`. Rótulos de campo em caixa normal acima do campo. `EditorFicha`: linhas hairline "insumo · quantidade · unidade", quantidade à direita tabular. `CampoImagem`: área de upload retangular `rounded-campo border border-dashed border-textoSuave/80`, texto "Escolher foto" (botão `secundario`), prévia 96×96; sem ícone grande.
- **Categorias (`PainelCategorias`, `ModalCategoria`):** abre pelo botão "Categorias". Lista hairline: nome à esquerda, contagem de produtos tabular à direita, ações `Editar`/`Excluir` em texto; botão `primario` "Nova categoria" no rodapé. Sem cartões.
- Estados vazios/erro (`EstadosProdutos`): texto à esquerda, sem disco/ícone; erro com "Erro:" e botão `texto` "Tentar de novo".

**Resultado esperado**
- Tabela legível como a do Stripe: nome à esquerda, preço alinhado à direita, status em texto.
- Nenhum ícone repetido por linha no desktop.
- Editar um produto no celular é uma tela cheia com campos de 44px e texto 16px (sem zoom do iOS).
- Categorias é uma lista simples, não um painel de cartões.

### 5.4 Insumos (`pages/Insumos`, `TabelaInsumos`, `ModaisInsumo`, `ModalMovimentacao`, `BuscaComContagem`)

**Decisões**
- Cabeçalho: "Insumos" (sem eyebrow "ESTOQUE") + botão `primario` "Novo insumo" (sem ícone).
- `BuscaComContagem`: campo de busca + à direita, texto `textoSuave` "26 insumos" (tabular).
- **Tabela (desktop):** sem moldura. Colunas: **Insumo** (nome `font-medium` + "mín. 300 g" `text-sm textoSuave` abaixo) · **Estoque** (`text-right`, número Manrope tabular + unidade em `textoSuave`, ex. "700 g") · **Custo/un.** (`text-right` tabular) · **Situação** (nova, só visual: Estado "Normal"/"Abaixo do mínimo", calculada comparando os campos que a linha já recebe) · **Ações**.
- Linha abaixo do mínimo: **sem tingir a linha**; o estoque vira `font-semibold` e a Situação mostra marcador `alerta` + o texto "Abaixo do mínimo". Linhas normais: Situação em `textoSuave` ("Normal").
- Ações desktop em texto: `Movimentar · Editar · Excluir` (o ícone de caixa atual, ambíguo, é substituído pela palavra). Celular: ícones 44×44 com `aria-label` ("Movimentar estoque de {nome}", "Editar {nome}", "Excluir {nome}"), strokeWidth 1.5.
- **Celular — linha de lista** `min-h-16`: nome + "mín. 300 g" à esquerda; estoque à direita tabular; 2ª linha: Situação (texto) à esquerda e custo/un. à direita em `textoSuave`.
- `ModalMovimentacao`: modal/tela cheia como em Produtos; escolha Entrada/Saída com `BotaoEscolher` como **dois botões segmentados lado a lado** (`rounded-campo` apenas nas pontas externas, borda `textoSuave/80`, selecionado = `bg-tinta text-white`; manter `aria-pressed`/`role` atuais; o texto "Entrada"/"Saída" sempre visível); campo de quantidade `text-base` tabular; botão primário "Registrar entrada"/"Registrar saída" conforme a escolha.
- Vazio/erro: texto à esquerda, sem disco.
- **Fora do escopo — apenas registrar em `PROGRESSO.md`:** "Custo/un." hoje aparece como `R$ 0.05` (ponto decimal e 2 casas, o que achata custos por grama como 0,012). É formatação que provavelmente vive em `lib/`; **não corrigir**, só anotar para a gestora decidir.

**Resultado esperado**
- Estoque, custo e mínimo alinhados à direita e comparáveis de relance.
- Quem precisa repor lê "Abaixo do mínimo" na própria linha, sem depender de cor.
- Nenhum ícone ambíguo no desktop.

### 5.5 Registros / Histórico (`pages/Registros`, `LinhaRegistro`)

**Decisões**
- Título "Histórico" (rótulo do menu atual). Sem eyebrow.
- Lista agrupada por **dia** (subtítulo de grupo em rótulo-caixa: "Hoje", "Ontem", "19 de outubro") — agrupamento feito no render da página com função local pura; não altera busca nem ordenação existentes.
- `LinhaRegistro` (desktop): três colunas em grid — **Hora** (tabular `textoSuave`, `w-16`) · **Quem fez + o quê** ("Gestora alterou o preço de Cone de morango", `text-sm`) · **Antes → Depois** à direita: dois valores em Manrope tabular com os rótulos de texto `antes`/`depois` em `text-xs textoSuave`; o valor antigo `textoSuave line-through`, o novo `tinta font-semibold`. Hairline entre linhas.
- Celular: empilha — linha 1 hora + ação; linha 2 "antes … → depois …" em `text-sm`.
- Vazio: uma linha de texto.

**Resultado esperado**
- Auditoria legível como log do GitHub/Stripe: hora, ação, diff, nessa ordem.
- Antes/depois distinguíveis sem cor (riscado + rótulo).

### 5.6 Entrar (`pages/Entrar`, `MarcaLogin`)

**Decisões**
- **Não centralizado.** Celular: wordmark no topo à esquerda; título "Entrar no painel" (Playfair `text-2xl`) à esquerda; campos empilhados em largura total; botão `primario` largura total "Entrar"; mensagem de erro em `text-perigo` com "Erro:" abaixo do botão.
- Desktop (`md:grid md:grid-cols-2 min-h-screen`): coluna esquerda `bg-areia` com `MarcaLogin` (wordmark grande em Playfair, uma frase `textoSuave` "Painel da confeitaria") alinhado ao canto inferior esquerdo (`flex items-end p-12`); coluna direita `bg-creme` com o formulário em `max-w-sm`, alinhado à esquerda e centralizado **verticalmente** (não horizontalmente em caixa).
- Sem foto, sem gradiente, sem cartão em volta do formulário. Campo senha com botão `texto` "Mostrar"/"Ocultar" (se já houver alternância; senão não criar).
- Preservar rótulos/`autocomplete`/`aria` atuais.

**Resultado esperado**
- Tela de login sem moldura de cartão, sem logo centralizado no topo.

### 5.7 Perfil (`JanelaPerfil`, `FormularioSenha`, `Avatar`)

**Decisões**
- Abre pelo popover de conta ("Meu perfil"). Dialog `max-w-md bg-white rounded-card shadow-flutuante`; celular = tela cheia.
- Topo: `Avatar` 56px + nome (`text-lg font-semibold`) + "admin" em `textoSuave`.
- Dados como **lista de definição** (`<dl>`) com linhas hairline: rótulo `textoSuave` à esquerda, valor `tinta` à direita.
- Seção "Alterar senha" com título de seção DM Sans e `FormularioSenha` (campos empilhados, regras da senha em `text-sm textoSuave`, botão `primario` "Salvar nova senha"). "Sair" como botão `texto` em `perigo` no rodapé do dialog (mesmo handler do popover).
- `Avatar`: círculo `bg-areia text-tinta` com inicial em Playfair (substitui o círculo caramelo cheio).

**Resultado esperado**
- Perfil é um formulário simples, não uma "janela de configurações" genérica.

### 5.8 Componentes transversais

- **ModalConfirmacao / AlertaAcao:** modal `max-w-sm`, texto à esquerda (nada de `text-center`), título `text-base font-semibold`, descrição `textoSuave`, botões à direita no desktop e em coluna (primário em cima) no celular; botão destrutivo = `bg-perigo text-white font-semibold` (7,2:1, AA).
- **Esqueletos/carregando:** linhas `bg-areia` retas.
- **Toasts (se existirem):** barra `bg-tinta text-creme rounded-campo` com texto; sem ícone colorido.
- **RotaProtegida, Marca, ContadorMenu:** só estética; sem mudar lógica.

---

## 6. Ordem de execução (clusters e critérios)

Rode os critérios a partir de `painel-admin/`. Ao final de **cada** clúster: `npm run build` (tsc + vite) sem erro, lint da raiz sem erro, grep do clúster, entrada no `PROGRESSO.md`, commit.

**C0 — Fundamentos** (tailwind.config.js: 3 tokens; `ui/*`: Botao, Entrada, Badge→Estado, Cartao, Separator, VazioLista, EsqueletoTabela; excluir `DiscoVazio`; `Avatar`)
- `grep -rn "DiscoVazio" src` → 0 e arquivo inexistente
- `grep -rn "bg-gradient\|backdrop-blur\|linearGradient" src` → 0
- `grep -rnE "font-(bold|extrabold|black)" src` → 0
- `grep -rn "text-center" src` → 0
- `grep -n "ok:\|alerta:\|perigo:" tailwind.config.js` → 3 linhas

**C1 — Navegação** (`EstruturaPainel`, novo `BarraSuperior`, `MenuMobile`, `AbasRodape`, `ContadorMenu`, popover de conta, `Marca`)
- `grep -rn "BarraLateral" src` → 0 e `src/components/BarraLateral.tsx` não existe
- `grep -rn "bg-tinta" src/components/BarraSuperior.tsx src/components/AbasRodape.tsx` → 0
- `grep -rn "aria-current" src/components/BarraSuperior.tsx src/components/AbasRodape.tsx` → ≥ 2
- `grep -rn "aria-live" src/components` → mesma contagem de antes (registrada no PROGRESSO)

**C2 — Resumo** (`Resumo`, `CabecalhoSecao`, `CartaoMetrica`, `GraficoVendas`, `ListaMaisVendidos`, `ListaBaixoEstoque`, `UltimosPedidos`)
- `grep -rn "grid-cols-4" src/pages/Resumo.tsx src/components/CartaoMetrica.tsx` → 0
- `grep -rn "Trophy\|AlertTriangle\|TriangleAlert" src` → 0
- `grep -rn "tabular-nums" src/components/GraficoVendas.tsx src/pages/Resumo.tsx` → ≥ 2

**C3 — Pedidos** (`Pedidos`, `TabelaPedidos`, `CartaoPedido`, `DrawerPedido`, `CabecalhoDrawer`, `AcoesPedido`, `ItensPedido`)
- `grep -rn "rounded-full" src/pages/Pedidos.tsx src/components/CartaoPedido.tsx src/components/TabelaPedidos.tsx` → 0 (as abas não são mais pílulas)
- `grep -rn 'role="dialog"' src/components/DrawerPedido.tsx` → preservado
- `grep -rn "text-right" src/components/TabelaPedidos.tsx` → ≥ 2

**C4 — Produtos e Categorias** (`Produtos`, `TabelaProdutos`, `CartaoProduto`, `PainelDeProduto`, `ModaisProduto`, `EditorFicha`, `CampoImagem`, `PainelCategorias`, `ModalCategoria`, `Busca`, `EstadosProdutos`)
- `grep -rn "text-right" src/components/TabelaProdutos.tsx` → ≥ 1
- `grep -rn "strokeWidth" src/components/TabelaProdutos.tsx src/components/CartaoProduto.tsx` → todo valor = 1.5
- `grep -rn "rounded-card" src/components/TabelaProdutos.tsx src/components/CartaoProduto.tsx` → 0

**C5 — Insumos** (`Insumos`, `TabelaInsumos`, `ModaisInsumo`, `ModalMovimentacao`, `BuscaComContagem`, `BotaoEscolher`, `ListaBaixoEstoque` se faltar)
- `grep -rn "Abaixo do mínimo" src/components/TabelaInsumos.tsx` → ≥ 1
- `grep -rn "text-right" src/components/TabelaInsumos.tsx` → ≥ 3
- `grep -rn "Normal" src/components/TabelaInsumos.tsx` → ≥ 1

**C6 — Registros e Perfil** (`Registros`, `LinhaRegistro`, `JanelaPerfil`, `FormularioSenha`, `Avatar`, `ModalConfirmacao`, `AlertaAcao`)
- `grep -rn "line-through" src/components/LinhaRegistro.tsx` → ≥ 1
- `grep -rn "<dl" src/components/JanelaPerfil.tsx` → ≥ 1
- `grep -rn "rounded-full" src` → ocorrências **somente** em `Avatar.tsx`, `ui/Badge.tsx` e `ContadorMenu.tsx`/chips de contador (conferir com `grep -rln "rounded-full" src`)

**C7 — Entrar** (`Entrar`, `MarcaLogin`)
- `grep -rn "md:grid-cols-2" src/pages/Entrar.tsx` → ≥ 1
- `grep -rn "mx-auto text-center\|text-center" src/pages/Entrar.tsx src/components/MarcaLogin.tsx` → 0
- `grep -rn "bg-gradient" src/pages/Entrar.tsx src/components/MarcaLogin.tsx` → 0

**C8 — Auditoria final**
- `grep -rn "rounded-3xl\|rounded-2xl\|rounded-\[" src` → **0**
- `grep -rn "bg-gradient\|backdrop-blur" src` → **0**
- `grep -rE "strokeWidth" src` → **todo valor = 1.5**
- `grep -rnE "shadow-(sm|md|lg|xl|2xl|inner)" src` → 0; `grep -rn "shadow-flutuante" src` → só drawer/modal/popover
- `grep -rnE "(bg|text|border|ring|from|to|via|fill|stroke)-(purple|violet|indigo|blue|sky|fuchsia|pink|slate|gray|zinc|neutral|stone)-" src` → 0
- `LC_ALL=C.UTF-8 grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` → 0 (nenhum emoji)
- `grep -rn "sm:\|lg:" src` → nenhum `sm:`; `lg:`/`xl:` apenas para largura máxima
- `git diff --name-only <commit-antes-do-redesign>..HEAD | grep -v "^painel-admin/src/"` → somente `painel-admin/tailwind.config.js` e `PROGRESSO.md`
- `npm run build` sem erro; lint da raiz sem erro

---

## 7. Checklist final (responda SIM/NÃO, com a evidência)

1. Existe alguma sidebar escura ou coluna fixa de navegação no desktop? (esperado: NÃO)
2. O desktop usa barra superior só com textos, com aba ativa sublinhada em caramelo e contador de pendentes em Pedidos? (SIM)
3. O celular tem barra inferior de 5 abas com rótulo sempre visível, alvos ≥ 44px e aba ativa marcada por texto semibold + traço, sem pílula preenchida? (SIM)
4. O Resumo ainda tem fileira de 4 cartões iguais de métrica? (NÃO)
5. O número grande de vendas e todos os valores/estoques/preços usam Manrope `tabular-nums`, alinhados à direita nas tabelas? (SIM)
6. Há algum cartão arredondado com sombra ou moldura fora de drawer/modal/popover? (NÃO)
7. Todo estado (status de pedido, Visível/Oculto, Abaixo do mínimo) aparece com marcador **e** texto? (SIM)
8. O caramelo `#c4622d` aparece como texto pequeno em algum lugar? (NÃO — só traço, barra do gráfico e foco)
9. Os estados vazios são só texto à esquerda, sem disco, ícone ou centralização? (SIM)
10. `rounded-3xl|2xl|[` = 0; `bg-gradient|backdrop-blur` = 0; todo `strokeWidth` = 1.5? (SIM/SIM/SIM)
11. `aria-*`, `role` de dialog/tablist e regiões `aria-live` foram preservados e conferidos arquivo a arquivo no `PROGRESSO.md`? (SIM)
12. `npm run build` e o lint da raiz passam sem erro? (SIM)
13. Algum arquivo fora de `painel-admin/src/` (além de `tailwind.config.js` e `PROGRESSO.md`) foi alterado, ou a vitrine foi tocada? (NÃO)
