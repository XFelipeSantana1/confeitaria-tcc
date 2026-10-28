# PROMPT DE EXECUÇÃO — Vitrine como cardápio digital profissional (Doce & Carinho)

Você é um agente de código. Vai consolidar o **visual** da vitrine pública da
confeitaria Doce & Carinho na linguagem **"Papel e tinta, caramelo no preço e na
compra"** e elevá-la ao padrão de um **cardápio digital profissional**: rápido,
escaneável com o polegar, com navegação por categorias sempre à mão e
impressão limpa.

É a mesma casa do painel-admin (veja `prompt-redesign-painel-admin.md` e o
capítulo final de `PROGRESSO.md`): papel creme, tinta como texto, hairlines em
vez de cartões, e o caramelo reservado para o que importa numa loja: o
**preço** e o **ato de comprar**.

A vitrine já vive grande parte dessa gramática (tokens, raios `campo`/`card`,
sombra única `flutuante`, fotos com hairline, sem gradiente/blur, Playfair +
DM Sans + Manrope tabular). Este prompt é uma **auditoria de consistência
fim-a-fim + um upgrade de padrão de cardápio**. Tudo é específico e verificável
por grep.

Leia tudo antes de editar qualquer arquivo. Onde a especificação decide, não
reabra a decisão. Onde ela manda "ler primeiro", leia o arquivo real e preserve
o comportamento.

---

## 0. Regras inegociáveis

1. **Escopo.** Edite somente `vitrine-cliente/src/**` (className, JSX, estrutura
   de componentes, CSS global em `src/`) e `PROGRESSO.md` (capítulo
   **"Vitrine"**, novo, no fim do arquivo). Única exceção fora de `src/`:
   acrescentar os 3 tokens de cor de estado em `vitrine-cliente/tailwind.config.js`
   (seção 3.1 — valores iguais aos do painel). Intocáveis: backend,
   `docker-compose.yml`, `.env`, `package.json`, `index.html`, `public/` (os
   arquivos continuam; a troca de foto é no JSX), **todo o `painel-admin/**`**,
   e em `vitrine-cliente/src`: `components/ui/Cartao.tsx` se já estiver conforme
   (conferir, não reescrever), todo `hooks/**`, todo `lib/**`, `types/**` —
   exceto apagar `lib/iconeCategoria.ts` SE e SOMENTE SE o grep de consumidor
   der 0 (C3).
2. **Nada de lógica nova.** Não mova handlers, não mude a forma das props de
   dados, não mexa em `useCarrinho`, `usePedidoWhats`, `useAviso`,
   `useCardapio`, `useAvisosSacola`, `useSecaoVisivel`. Não reformate preço
   (a string vem pronta de `lib/`). Estado puramente visual (trocar classe,
   variante, extrair visual duplicado num componente de apresentação) é
   permitido.
3. **Acessibilidade (WCAG 2.2 AA).** Contraste 4.5:1 texto, 3:1 interface; alvos
   de toque ≥ 44px (`min-h-11`); foco SEMPRE visível (`focus-visible`, nunca
   `outline-none` sozinho); preservar TODOS os `aria-*`, `role`s e handlers.
   Respeitar `prefers-reduced-motion` (animações com `motion-safe:`).
4. **Estados sempre com texto.** Nenhum estado só por cor ou só por ícone.
5. **Celular primeiro, mas a vitrine tem breakpoints.** Mantém `sm:`/`md:`/`lg:`
   para colunas, alturas de layout e tamanhos de display. Breakpoints NÃO trocam
   cor/peso/fundo de componente.
6. **Proibido instalar libs** ou liberar novo pacote de ícones — `lucide-react`
   já está lá.
7. **Disciplina de registro.** Ao fim de **cada** clúster (seção 6): `npm run
   build` dentro de `vitrine-cliente/` (tsc + vite) sem erro, lint da raiz sem
   erro, greps do clúster, entrada no capítulo **"Vitrine"** do `PROGRESSO.md`
   (o que mudou, arquivos, resultado dos greps) e um commit parcial:
   `redesign(vitrine): <clúster> — <resumo>`.
8. **Antes de editar um componente**, leia-o inteiro e anote no PROGRESSO quais
   `aria-*`/`role`s/handlers ele tem. Ao terminar o clúster, confira que
   continuam lá.

---

## 1. Diagnóstico — o que ainda está fora da casa

Desvios concretos encontrados na leitura de 22/10/2026:

1. **Prensa com pulo de escala.** `active:scale-95` em `ui/Botao.tsx`,
   `Cabecalho.tsx` (sacola), `CardProduto.tsx`, `CardDestaque.tsx`, e
   `hover:-translate-y-0.5` no X do `ModalConfiguracoes`. Decisão do painel
   (C8.1): a prensa é **descida de 1px** (`active:translate-y-px`), nunca escala.
2. **Pesos fora da régua.** `font-extrabold` no lockup do `Cabecalho`, nos
   preços (`CardProduto`, `CardDestaque`, `CarrinhoDrawer`); `font-bold` em
   botões (`ui/Botao`), rótulos do drawer, `BarraSacola`, numeração editorial
   (`GrupoCategoria`), labels do `ModalConfiguracoes`. Régua: **Playfair até
   `bold` (700); DM Sans e Manrope até `semibold` (600); nada de
   extrabold/black.** O peso do preço vem do tamanho e do caramelo, não de 800.
3. **Cor fora de token.** `bg-[#fffdf9]` no `CarrinhoDrawer`. Página = `creme`;
   superfície elevada (drawer, modal, campo) = **`bg-white`**; nenhum valor
   arbitrário de cor (`bg-[#`/`text-[#`/`border-[#`) em `src`.
4. **Raio fora da casa.** `rounded-xl` no X do `ModalConfiguracoes` e
   `rounded-[10px]` no stepper do `CardDestaque`. Permitidos: `campo` (12px),
   `card` (16px), `lg` (8px — só para botão interno aninhado em controle com
   `p-1`: 12−4=8) e `rounded-full` (só o balão do `AvisoFlutuante` e o marcador
   do `Estado`). Nada de `rounded-[…]`, `2xl`, `3xl`.
5. **Discos com ícone em estado.** `AlertaErro` desenha disco `rounded-full
   bg-areia` com `CloudOff` + `RotateCcw`/`Sparkles` nos botões. O erro já
   escreve bem ("O forno esfriou por aqui"); tire o teatro de ícones.
6. **Ícones decorativos em títulos.** `Settings2` em "Configurações" e
   `MessageCircleHeart` em "Como funciona".
7. **Eyebrow redundante.** `Abertura` abre com "confeitaria artesanal" em
   caixa-alta — a mesma frase do lockup do `Cabecalho`, visível no topo da mesma
   tela.
8. **Duplicação de estado indisponível.** "Sem estoque no momento" escrito em
   `CardProduto` e `CardDestaque`, com tratamentos diferentes. Vira o primitivo
   `Estado`.
9. **Botão primário sem corpo.** Os primários do painel ganharam "borda de
   corte" na base (biscoito assado). Os da vitrine ("escura", "Ver sacola",
   "Quero esse") ficaram secos.
10. **Padrão de cardápio ainda de "vitrine de cards".** Em celular, o cardápio
    profissional (referência: apps de delivery e cardápios de restaurante de
    autor) é uma **lista escaneável**: nome, descrição curta e preço à
    esquerda, miniatura à direita, ação ao alcance do polegar. Categorias ficam
    **coladas sob o cabeçalho** durante a rolagem. Hoje a navegação por categoria
    some quando se rola e os cards ocupam altura demais por produto.
11. **Detalhes de plataforma moderna ausentes:** `100vh` em vez de `dvh`,
    sem `overscroll-contain` no drawer, animação sem `motion-safe`, imagens de
    produto sem `decoding="async"`, títulos sem `text-balance`, nada de
    `print:`.

---

## 2. Direção: **"Papel e tinta, caramelo no preço e na compra"**

A vitrine é a marca; o painel é a ferramenta. Mesmo papel, tintas de peso
diferente: o caramelo aparece em DUAS ocasiões — **o preço** (a informação
quente de uma vitrine) e **os botões de compra** (adicionar, ver sacola,
finalizar no WhatsApp, atualizar cardápio). Todo o resto é tinta sobre creme com
hairline.

**Princípios de cardápio profissional (valem para toda decisão):**

1. **Escaneabilidade.** Em 3 segundos o cliente acha a categoria, o nome, o
   preço. Hierarquia fixa em todo item: nome → descrição (máx. 2 linhas) →
   preço. Nada compete com o preço.
2. **Foto honesta, secundária no celular.** A foto ajuda, não manda: miniatura
   quadrada com hairline; sem foto = areia + nome (mantido).
3. **Navegação sempre à mão.** Abas de categoria fixas sob o cabeçalho, com a
   ativa marcada em texto + traço.
4. **Polegar primeiro.** Ações de compra na metade de baixo do item/tela,
   alvos ≥ 44px.
5. **Quieto e rápido.** Sem sombra em card, sem gradiente, sem blur, sem
   animação além da prensa de 1px e do pulso do esqueleto.
6. **Imprimível.** Quem abre o cardápio no computador pode imprimir uma página
   limpa (só cabeçalho da loja + categorias + itens + preços).

Referência por analogia (não copiar visualmente): cardápio impresso de padaria
boa — papel, tipografia, filete, foto honesta, preço claro — com a ergonomia dos
cardápios digitais atuais (abas fixas, lista densa, sacola persistente).

---

## 3. Sistema

### 3.1 Cores (tokens atuais mantidos; entra o trio de ESTADO)

Mantidos: `tinta`, `textoSuave`, `caramelo`, `carameloForte`, `carameloEscuro`,
`dourado`, `creme`, `areia`, `borda`.

Acrescentar EXATAMENTE como no painel:

```js
// Estados (mesmos valores do painel — uma casa, uma régua de estado):
ok: "#2f6b3f", alerta: "#8a5a00", perigo: "#a32a2a",
```

Usos: `perigo` só em erro de formulário (`ModalConfiguracoes`) com prefixo
**"Erro: "**; `alerta` e `ok` reserva. Erro de REDE (`AlertaErro`) não é culpa do
cliente: fica em tinta/`textoSuave`, sem vermelho e sem disco-ícone.

**Conferir contraste** de `textoSuave` sobre `creme`, `areia` e `white` e de
`carameloForte` sobre `creme` (preço): se algum par ficar abaixo de 4.5:1,
registre no PROGRESSO e use `tinta` nesse ponto (não altere o token).

### 3.2 Raios, sombra, bordas

- `rounded-campo` (12px) em campos/botões/controles; `rounded-card` (16px) em
  cards, fotos, modais; `rounded-lg` (8px) só no botão interno de steppers;
  `rounded-full` só no balão de aviso e no marcador do `Estado`.
- Sombra única `shadow-flutuante`, só onde flutua: `CarrinhoDrawer`,
  `ModalConfiguracoes`, `ModalAjuda`, `AvisoFlutuante`. Cards, abas fixas e
  barras encostadas: hairline `border-borda`, nunca sombra.
- Hairline em tudo: `border-borda` (`#e8ddd1`).

### 3.3 Tipografia por papel

| Papel | Fonte | Peso | Nota |
|---|---|---|---|
| Título editorial (hero, card destaque, seção) | `font-display` (Playfair) | até `bold` | nunca extrabold; `text-balance` |
| Nome de produto | `font-display` | `semibold`/`bold` | `text-pretty` |
| Descrição de produto | `font-corpo` | normal | `text-textoSuave`, `line-clamp-2` |
| Corpo, rótulos, botões | `font-corpo` (DM Sans) | até `semibold` | |
| Preços, contadores, numeração | `font-numero` (Manrope) | `semibold` + `tabular-nums` | preço = `text-carameloForte` |
| Sobretítulo funcional (categoria no CardDestaque) | `font-corpo` | `semibold` | caixa-alta só quando INFORMA |

Parágrafos longos (descrições, ajuda): `text-pretty`. Títulos: `text-balance`.

### 3.4 Ícones — lista fechada

Liberados, cada um com função: `Search` e `X` (busca), `Plus`/`Minus` e `Trash2`
(quantidade/remoção), `ShoppingBasket` (sacola), `MessageCircle` (WhatsApp),
`RefreshCw` e `Loader2` (atualizar/buscar), `ChevronDown/Right` (se existir).
Sempre `strokeWidth 1.5`.

**Saem:** `Settings2`, `MessageCircleHeart`, `CloudOff`, `RotateCcw`,
`Sparkles`, `PlugZap`/`Check` decorativos do teste de conexão, e qualquer ícone
de categoria que sobreviva em `lib/iconeCategoria.ts`.

### 3.5 Primitivos (`src/components/ui/` + 1)

- **`Botao`** — `escura` (primária: `carameloForte` + borda de corte
  `border-b-2 border-carameloEscuro`, hover escurece, `active:translate-y-px`,
  `disabled:active:translate-y-0`), `clara` (branco + borda, hover areia),
  `whats` (igual `escura`; o texto de finalização NUNCA muda). `font-semibold`,
  `rounded-campo`, `min-h-11`, `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-caramelo/40 focus-visible:ring-offset-2`. Nada de
  `active:scale`.
- **`Estado` (novo, `ui/Estado.tsx`)** — marcador `size-2 rounded-full` + texto.
  "Sem estoque no momento" = NEUTRO (`textoSuave`); foto `grayscale` fica.
  Consumido em `CardProduto` e `CardDestaque`.
- **`Cartao`** — conferir (`rounded-card` + `border-borda` + `bg-white`, sem
  sombra); só arrumar se divergir.
- **`EsqueletoCardapio`** — blocos `bg-areia` planos com `motion-safe:animate-pulse`;
  sem gradiente de shimmer. O formato do esqueleto acompanha o novo item de
  lista (texto à esquerda, miniatura quadrada à direita) para não haver salto
  de layout quando o cardápio carrega.

### 3.6 Ritmo e plataforma

- Alvos de 44px em TODOS os controles de toque.
- Respiro grande ENTRE seções de cardápio (manter); itens com `py-4` separados
  por hairline (`divide-y divide-borda`); cards de destaque com `p-4`; drawer
  com `p-5`.
- `env(safe-area-inset-bottom)` da `BarraSacola` intocado.
- Alturas de tela cheia com `dvh` (`h-dvh`/`max-h-dvh`), nunca `vh`.
- Ancoragem de categoria: cada seção com `scroll-mt` que desconta cabeçalho +
  abas fixas (usar `--altura-cabecalho` já existente; não tocar na variável).
- Drawer/modais: `overscroll-contain` no corpo rolável.

---

## 4. A foto herdada do antigo login do painel

```tsx
// Foto herdada do antigo login do painel (MarcaLogin @ 4166287): os tons
// são quentes como o caramelo e o dourado da marca.
const FOTO_HERDADA =
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80";
```

Regras de tratamento:

1. **Sem véu translúcido sobre a foto** e sem texto sobre a foto. O texto mora
   na coluna ao lado, sobre papel. Mantém `rounded-card` + `border border-borda`.
2. **A URL não prova conteúdo.** Abra a URL no navegador, veja o que aparece de
   fato e escreva o `alt` fiel (substitui o alt da foto antiga `/abertura.png`).
3. `loading="eager"` e `fetchPriority="high"` MANTIDOS (é o LCP). Informe
   `width`/`height` reais da imagem (confirme olhando; a fonte entrega ~1200×800)
   e use `aspect-*` (5.1) para o molde fixo — meta: **CLS 0** na abertura.
   Opcional e permitido: acrescentar `&fm=webp` na URL e um `srcSet` com
   `w=600`, `w=900` e `w=1200` + `sizes` coerente com as colunas, para o celular
   não baixar 1200px à toa.
4. É a ÚNICA foto editorial de banco no site. **Proibido criar fallbacks de
   Unsplash por produto** — a regra do `lib/aparenciaProduto.ts` (foto real →
   foto curada das trufas → areia com nome) permanece EXATAMENTE como está: foto
   errada de doce é mentira para o cliente.

`/abertura.png` fica em `public/` intocado (só deixa de ser referenciado).

---

## 5. Especificações por superfície

### 5.1 Abertura (`Abertura.tsx`)

- `src` pela `FOTO_HERDADA`; moldura `rounded-card` com hairline; alt fiel;
  `aspect-[4/5] sm:aspect-[16/10] lg:aspect-[16/9]` no lugar das alturas
  chutadas. No DOM a ORDEM continua texto-depois-foto; a ordem visual invertida
  por CSS como hoje.
- **Remover** o sobretítulo "confeitaria artesanal".
- Título: `lg:text-[3.5rem]` → `lg:text-6xl`, `text-balance`, peso máx. `bold`.
- Ações continuam DUAS: "Escolher meus doces" (primária, borda de corte) e
  "Como funciona?" (link de texto).
- `active:scale-95` → `active:translate-y-px`.

### 5.2 Garantias (`Destaques.tsx`)

Já no padrão (faixa hairline, centro no celular): nada a mudar de classes.
Conferir só que os textos das `GARANTIAS` ficaram idênticos. Intocáveis.

### 5.3 Cardápio (`CabecalhoCardapio`, `SecaoCardapio`, `SecaoCategoria`,
`GrupoCategoria`, `GradeCardapio`, `CardProduto`, `EsqueletoCardapio`)

**Navegação por categoria (`SecaoCategoria`) — LER ANTES.**
- Vira **abas de texto fixas** sob o cabeçalho: contêiner `sticky
  top-[var(--altura-cabecalho)]` com `bg-creme border-b border-borda`, z-index
  abaixo do `Cabecalho` e da `Camadas`; lista em `flex overflow-x-auto
  snap-x` com a barra de rolagem escondida (`[scrollbar-width:none]` e
  `[&::-webkit-scrollbar]:hidden`).
- Cada aba: `min-h-11`, `font-semibold`, ativa = `text-tinta border-b-2
  border-caramelo`, inativa = `text-textoSuave`; foco com anel caramelo.
- `aria-current`/estado ativo preservados como fonte da verdade visual. A aba
  ativa deve ficar visível no trilho: se hoje já existe handler de rolagem,
  preserve; **não crie** lógica nova para isso (registre no PROGRESSO se faltar).
- Se hoje forem pílulas preenchidas, ficam sem `rounded-full` e sem `bg-tinta`.

**Cabeçalho e agrupamento.**
- `CabecalhoCardapio`: título Playfair `bold` com `text-balance`; contador único
  (Manrope tabular); botão de atualizar sem `-translate-y` e com
  `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40`.
- `GrupoCategoria`: numeração "01" em `font-numero font-semibold tabular-nums`;
  nome Playfair `bold`; filete hairline mantido; `scroll-mt` conforme 3.6 para
  que o clique na aba pouse o título logo abaixo das abas fixas.

**Item de cardápio (`CardProduto`) — padrão lista no celular.**
- Celular: **linha** — coluna de texto à esquerda (`nome` Playfair, descrição
  `line-clamp-2`, preço) e **miniatura quadrada** à direita
  (`aspect-square size-24 sm:size-28 rounded-card border border-borda
  object-cover`); botão de adicionar sobre o canto inferior direito da
  miniatura ou logo abaixo dela, `min-h-11 min-w-11`. Itens separados por
  hairline, sem moldura de card.
- `sm:` e acima: `GradeCardapio` volta a ser **grade** de cards (foto em
  cima, `aspect-[4/3]`), mesma hierarquia nome → descrição → preço.
- Foto de produto: `loading="lazy"`, `decoding="async"`, `width`/`height`
  explícitos ou `aspect-*` (zero CLS). Regra de `aparenciaProduto` intocada.
- Preço `font-numero font-semibold tabular-nums text-carameloForte`.
- "Quero esse"/"+" com borda de corte; steppers com `rounded-lg` interno
  (`p-1` no controle); lixeira `h-11 w-11 rounded-campo`, hover
  `bg-areia/60 hover:text-carameloForte`.
- `active:scale-95` → `active:translate-y-px` em todos.
- Sem foto = areia + nome Playfair (MANTIDO).
- Indisponível = `<Estado texto="Sem estoque no momento" neutro>` + foto
  `grayscale`; botão de adicionar desabilitado e **com texto** (nunca só
  esmaecido).

**`CardDestaque`** — continua card maior (é o destaque): mesmos preço, borda
de corte, `rounded-lg` no stepper (adeus `rounded-[10px]`), `Estado` e
`grayscale`.

**`EsqueletoCardapio`** — conferir/ajustar conforme 3.5.

### 5.4 Sacola (`BarraSacola`, `CarrinhoDrawer`, `ItemSacola`, `Camadas`)

- `BarraSacola`: encostada nas bordas (sem raio, sem sombra) — MANTIDO. Pesos →
  semibold; press → `translate-y-px`; três partes em `text-sm`; padding com
  `safe-area` intocado; `print:hidden`.
- `CarrinhoDrawer`: fundo **`bg-white`** (mata `bg-[#fffdf9]`); `max-h-dvh` e
  corpo rolável com `overscroll-contain`; campos ("Seu nome", "Observações")
  no padrão de campo da casa: `bg-white`, `border-textoSuave/80`, foco
  `border-caramelo` + `ring-caramelo/40`; rótulos `text-xs font-semibold`; X do
  topo com anel de foco caramelo; total Manrope semibold tabular; botão `whats`
  NÃO muda o texto "Finalizar no WhatsApp" nem o ícone `MessageCircle`; a frase
  "Você confirma o pagamento direto na conversa." fica; `print:hidden`.
- `Camadas`: z-indexes e overlay (`bg-tinta/45`) intocados; conferir que nada
  ganhou sombra nova.

### 5.5 Modais e aviso (`ModalAjuda`, `ModalConfiguracoes`, `AvisoFlutuante`)

- `ModalAjuda`: `MessageCircleHeart` FORA do título; passo-a-passo mantém a
  numeração em `<b>` (semibold); X com anel de foco; `max-h-dvh` + corpo com
  `overscroll-contain`; `text-pretty` nos parágrafos.
- `ModalConfiguracoes`: X `rounded-xl` → `rounded-campo` e SEM
  `hover:-translate-y-0.5` (hover `bg-areia`); `Settings2` e `PlugZap`/`Check`
  FORA (o estado do teste é TEXTO em `retorno`; erro em `text-perigo` com
  prefixo "Erro: "); labels semibold; campos `bg-white border-textoSuave/80`
  foco caramelo; `role="dialog"`/`aria-modal`/`aria-label` preservados.
- `AvisoFlutuante`: NÃO MUDA (pílula tinta, `rounded-full` exceção registrada,
  `shadow-flutuante`, `role="status"`/`aria-live` preservados); só adicionar
  `print:hidden`.

### 5.6 Estados (carregando/vazio/erro)

- Rede/vazio: SEM disco, SEM ícone. `EstadoVazio` já é texto puro + ação —
  conferir foco do `Botao`.
- `AlertaErro`: remove o disco `CloudOff` e os ícones dos botões; título "O
  forno esfriou por aqui" FICA; o motivo `(mensagem)` fica; botões "Tentar de
  novo" (primária) + "Ver demonstração" (clara) — nomes EXATOS, sem ícones.
- `text-perigo` só no erro de formulário.

### 5.7 Casca e rodapé (`Cabecalho`, `Marca`, `BuscaCardapio`, `Rodape`)

- `Cabecalho`: lockup `extrabold` → `bold` (Playfair), subtítulo semibold;
  sacola no canto direito com borda de corte e press de 1px; contador `<b>`
  tabular; `--altura-cabecalho` e o `ResizeObserver` NÃO SÃO TOCADOS. É o
  elemento sobre o qual as abas fixas se apoiam: conferir no navegador que não
  há vão nem sobreposição entre cabeçalho e abas.
- `BuscaCardapio`: lupa e X ficam; X `rounded-full` → `rounded-campo`; Escape
  limpa (handler preservado); `focus-within` com anel caramelo no contorno do
  campo; o campo inteiro tem ≥ 44px.
- `Rodape`: fundo tinta FICA; `extrabold` → `bold`; link de WhatsApp usa
  `lerWhats()` (não tocar); `espacoParaSacola` intocado.
- **Impressão:** `print:hidden` em `Cabecalho` (botões), `BuscaCardapio`,
  abas fixas, `BarraSacola`, drawer, aviso e botões de adicionar; em `print:`
  as fotos de produto somem (`print:hidden`) e o preço fica em `text-tinta`.
  Só classes; sem CSS novo além disso.

---

## 6. Ordem de execução (clusters e critérios)

Rode os critérios a partir de `vitrine-cliente/`. Ao final de **cada** clúster:
`npm run build` sem erro, lint da raiz sem erro, grep do clúster, entrada no
capítulo **"Vitrine"** do `PROGRESSO.md`, commit `redesign(vitrine): <clúster> —
<resumo>`.

Branch nova `redesign-vitrine`, criada a partir do fim de `redesign-visual`.
`painel-admin/**` não é tocado.

**C0 — Fundamentos** (`tailwind.config.js` +3 tokens; `ui/Botao`; novo
`ui/Estado`; varreduras globais)
- `grep -n "ok:\|alerta:\|perigo:" tailwind.config.js` → 3 linhas
- `grep -rn "active:scale" src` → 0
- `grep -rnE "font-(extrabold|black)" src` → 0
- `grep -rnE "\[\#" src` → 0
- `grep -rnE "rounded-\[|rounded-2xl|rounded-3xl|rounded-xl" src` → 0
- `grep -rln "rounded-full" src` → só `AvisoFlutuante.tsx`, `ui/Estado.tsx`
  (e `BuscaCardapio` NÃO — vira `rounded-campo` no C1)
- `grep -rn "focus-visible:ring" src/components/ui/Botao.tsx` → ≥ 1

**C1 — Casca** (`Cabecalho`, `Marca`, `BuscaCardapio`, `CabecalhoCardapio`,
`Rodape`)
- `grep -rn "font-extrabold" src/components/Cabecalho.tsx src/components/Rodape.tsx` → 0
- `grep -rn "active:scale-95" src/components/Cabecalho.tsx` → 0
- `grep -rn "focus-visible:ring-caramelo" src/components/BuscaCardapio.tsx src/components/CabecalhoCardapio.tsx` → ≥ 2
- `grep -n "altura-cabecalho" src/components/Cabecalho.tsx` → preservado
- `grep -rn "print:hidden" src/components/Cabecalho.tsx src/components/BuscaCardapio.tsx` → ≥ 1

**C2 — Abertura e destaques** (`Abertura`, `Destaques`, `CardDestaque`)
- `grep -rn "1558961363-fa8fdf82db35" src/components/Abertura.tsx` → ≥ 1
- `grep -rn "confeitaria artesanal" src/components/Abertura.tsx` → 0
- `grep -rn "text-\[3" src/components/Abertura.tsx` → 0
- `grep -rn "rounded-\[10px\]" src/components/CardDestaque.tsx` → 0
- `grep -rn "text-balance" src/components/Abertura.tsx` → ≥ 1
- `grep -rn "GARANTIAS" src/components/Destaques.tsx` → intacto (textos iguais aos registrados no PROGRESSO)

**C3 — Cardápio** (`SecaoCardapio`, `SecaoCategoria`, `GrupoCategoria`,
`GradeCardapio`, `CardProduto`, `EsqueletoCardapio`)
- `grep -rn "font-bold" src/components/GrupoCategoria.tsx` → só em linhas
  `font-display`; número editorial `font-numero font-semibold tabular-nums`
- `grep -rn "Sem estoque no momento" src` → só na chamada de `<Estado>` (0 literais soltos fora dela)
- `grep -rn "grayscale" src/components/CardProduto.tsx src/components/CardDestaque.tsx` → ≥ 2
- `grep -rn "iconeCategoria" src` → 0 usos → apagar `lib/iconeCategoria.ts` (se > 0, NÃO apagar e registrar)
- `grep -rn "rounded-full\|bg-tinta" src/components/SecaoCategoria.tsx` → 0
- `grep -rn "sticky" src/components/SecaoCategoria.tsx` → ≥ 1
- `grep -rn "line-clamp-2" src/components/CardProduto.tsx` → ≥ 1
- `grep -rn "decoding=\"async\"" src/components/CardProduto.tsx` → ≥ 1
- `grep -rn "motion-safe:animate-pulse" src/components/EsqueletoCardapio.tsx` → ≥ 1

**C4 — Sacola** (`BarraSacola`, `CarrinhoDrawer`, `ItemSacola`, `Camadas`)
- `grep -rn "fffdf9" src` → 0
- `grep -rn 'role="dialog"' src/components/CarrinhoDrawer.tsx` → preservado
- `grep -rn "Finalizar no WhatsApp" src` → ≥ 1
- `grep -rn "font-bold" src/components/BarraSacola.tsx` → 0
- `grep -rn "safe-area" src/components/BarraSacola.tsx` → preservado
- `grep -rnE "(^|[^-])h-screen|[^d]vh" src/components/CarrinhoDrawer.tsx` → 0
- `grep -rn "overscroll-contain" src/components/CarrinhoDrawer.tsx` → ≥ 1

**C5 — Modais, aviso e estados** (`ModalAjuda`, `ModalConfiguracoes`,
`AvisoFlutuante`, `EstadoVazio`, `AlertaErro`)
- `grep -rnE "rounded-xl|-translate-y-0" src/components/ModalConfiguracoes.tsx` → 0
- `grep -rnE "CloudOff|RotateCcw|Sparkles|Settings2|MessageCircleHeart|PlugZap" src` → 0
- `grep -rn 'role="status"' src/components/AvisoFlutuante.tsx` → preservado
- `grep -rn "text-perigo" src/components/ModalConfiguracoes.tsx` → ≥ 1 (erro com "Erro: ")

**C6 — Auditoria final**
- `grep -rn "active:scale" src` → 0
- `grep -rnE "font-(extrabold|black)" src` → 0; `font-bold` SÓ em Playfair
  (`grep -rln "font-bold" src`, conferir arquivo por arquivo)
- `grep -rnE "\[\#|rounded-\[" src` → 0
- `grep -rnE "shadow-(sm|md|lg|xl|2xl|inner)" src` → 0; `grep -rn "shadow-flutuante" src` → só drawer/modais/aviso
- `grep -rnE "(bg|text|border|ring)-(purple|violet|indigo|blue|sky|fuchsia|pink|slate|gray|zinc|neutral|stone)-" src` → 0
- `LC_ALL=C.UTF-8 grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` → 0
- `grep -rnE "outline-none" src | grep -v "focus-visible:outline-none"` → 0 (nenhum foco apagado sem substituto)
- `git diff --exit-code -- src/lib/mensagemWhats.ts src/lib/whatsLoja.ts src/hooks` → 0 mudanças
- `git diff --name-only <commit-antes>..HEAD | grep -v "^vitrine-cliente/src/"` → somente `vitrine-cliente/tailwind.config.js`, `PROGRESSO.md` e, se aplicável, a exclusão de `lib/iconeCategoria.ts`
- `npm run build` sem erro; lint da raiz sem erro
- **Verificação no navegador** (registrar no PROGRESSO, não é grep): celular
  360px e desktop 1280px — abas fixas sem vão sob o cabeçalho; clique na aba
  pousa o título da seção visível; miniaturas sem salto de layout; drawer cabe
  em tela baixa com teclado aberto; Ctrl+P mostra só o cardápio.

---

## 7. Fora de escopo (registrar como backlog no PROGRESSO, NÃO implementar)

Itens típicos de cardápio profissional que exigem dado ou lógica novos:
etiquetas de alérgenos/dietas (sem lactose, vegano), tempo de preparo,
variações/adicionais por item, modo escuro, QR code de acesso ao cardápio,
JSON-LD `Menu`/`MenuItem` para SEO (exige tocar `index.html`/dados), foto
própria por produto. Se o `types/` já tiver algum desses campos, apenas anote.

---

## 8. Checklist final (responda SIM/NÃO, com a evidência)

1. A vitrine é reconhecível como a MESMA casa do painel (papel, hairlines,
   caramelo em ação/preço)?
2. Nenhum botão pula de escala (`active:scale` = 0) e todos descem 1px?
3. Nenhum peso fora da régua (display ≤ 700; corpo/número ≤ 600)?
4. Nenhuma cor ou raio fora de token?
5. Os estados dizem em TEXTO o que acontece (sem disco-ícone)?
6. A foto herdada está na Abertura, com alt fiel, sem véu e sem CLS?
7. No celular, o cardápio é uma lista escaneável (nome → descrição → preço,
   miniatura à direita) com abas de categoria fixas sob o cabeçalho?
8. Nenhum texto de WhatsApp, garantia ou preço mudou?
9. Todos os `aria-*`/`role`s de antes continuam (comparação por clúster no
   PROGRESSO)? Todo foco é visível e `prefers-reduced-motion` é respeitado?
10. A impressão (Ctrl+P) sai limpa?
11. Build e lint verdes, e o escopo do diff é só o permitido?
