# PROMPT DE EXECUÇÃO — Consolidação visual da vitrine-cliente (Doce & Carinho)

Você é um agente de código. Vai consolidar o **visual** da vitrine pública da
confeitaria Doce & Carinho na linguagem **"Papel e tinta, caramelo no preço e na
compra"** — a mesma casa do painel-admin (veja `prompt-redesign-painel-admin.md`
e o capítulo final de `PROGRESSO.md`): papel creme, tinta como texto, hairlines
em vez de cartões, e o caramelo reservado para o que REALMENTE importa numa
loja: o **preço** e o **ato de comprar**.

A vitrine já vive grande parte dessa gramática (tokens, raios `campo`/`card`,
sombra única `flutuante`, fotos com hairline, sem gradiente/blur, Playfair +
DM Sans + Manrope tabular). Este prompt **não é uma fundação: é uma auditoria de
consistência fim-a-fim** — apontei os pontos que escaparam e o que falta para os
dois apps serem a mesma casa. Tudo específico e verificável por grep.

Leia tudo antes de editar qualquer arquivo. Onde a especificação decide, não
reabra a decisão. Onde ela manda "ler primeiro", leia o arquivo real e preserve
o comportamento.

---

## 0. Regras inegociáveis

1. **Escopo.** Edite somente `vitrine-cliente/src/**` (className, JSX, estrutura
   de componentes) e `PROGRESSO.md` (capítulo **"Vitrine"**, novo, no fim do
   arquivo). Única exceção fora de `src/`: acrescentar os 3 tokens de cor de
   estado em `vitrine-cliente/tailwind.config.js` (seção 3.1 — valores iguais
   aos do painel). Intocáveis: backend, `docker-compose.yml`, `.env`,
   `package.json`, `index.html`, `public/` (os arquivos continuam, a troca de
   foto é no JSX), **todo o `painel-admin/**`**, e em `vitrine-cliente/src`:
   todo `hooks/**`, todo `lib/**`, `types/**` — exceto apagar
   `lib/iconeCategoria.ts` SE e SOMENTE SE o grep de consumidor der 0 (seção 6,
   C3).
2. **Nada de lógica nova.** Não mova handlers, não mude filas de props de dados,
   não mexa em `useCarrinho`, `usePedidoWhats`, `useAviso`, `useCardapio`,
   `useAvisosSacola`, `useSecaoVisivel`. Estado puramente visual (trocar classe,
   trocar variante, extrair visual duplicado num componentzinho de apresentação)
   é permitido.
3. **Acessibilidade.** Contraste AA (4.5:1 texto, 3:1 interface); alvos de toque
   ≥ 44px (`h-11`/`min-h-11` — o X de 24px DENTRO da busca é o campo inteiro
   que é o alvo; a lixeira de card é `h-11 w-11`); preservar TODOS os `aria-*`,
   `role`s e handlers (`role="dialog"`, `aria-live`, `aria-pressed`,
   `aria-current` etc.).
4. **Estados sempre com texto.** Nenhum estado comunicado só por cor ou só por
   ícone. Cor é reforço, texto é o recado.
5. **Celular primeiro, mas a vitrine tem breakpoints.** Diferente do painel (que
   só tem `md:`), a vitrine é página editorial pública e **mantém `sm:`/`md:`/
   `lg:`** para colunas, alturas de layout e tamanhos de display. O que os
   breakpoints NÃO fazem: trocar cor/peso/fundo de componentes (isso muda no
   arquivo, não na viewport).
6. **Proibido instalar libs** ou liberar novo pacote de ícones — lucide-react já
   está lá.
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

A vitrine erra pouco, mas erra nos mesmos pontos que o painel errava antes. São
desvios CONCRETOS, encontrados na leitura de hoje (22/10/2026):

1. **Prensa com pulo de escala.** `active:scale-95` em `ui/Botao.tsx`,
   `Cabecalho.tsx` (sacola), `CardProduto.tsx`, `CardDestaque.tsx`,
   `ModalConfiguracoes.tsx` (`hover:-translate-y-0.5` no X — o mesmo
   "pulinho" que o painel retirou e que `CabecalhoCardapio` já registrou ter
   saído daqui). O painel decidiu em C8.1: o toque é **descida de 1px**
   (`active:translate-y-px`), nunca escala.
2. **Pesos fora da régua.** `font-extrabold` no lockup do `Cabecalho`,
   nos preços (`CardProduto`, `CardDestaque`, `CarrinhoDrawer`),
   `font-bold` em botões (`ui/Botao`), rótulos de campo do drawer,
   `BarraSacola`, pseudo-número editorial (`GrupoCategoria`), labels do
   `ModalConfiguracoes`. Régua da casa: **Playfair (display) até `bold` (700);
   DM Sans e Manrope (corpo/número) até `semibold` (600); nada de
   extrabold/black**. O "peso" do preço fica no tamanho e no caramelo, não em
   800.
3. **Cor fora de token.** `bg-[#fffdf9]` no `CarrinhoDrawer` — um branco-duro
   inventado entre o creme e o branco. O sistema decidiu: página = `creme`;
   superfície elevada (drawer, modal, campo) = **`bg-white`**; nenhum valor
   arbitrário de cor (`bg-[#`/`text-[#`/`border-[#`) no `src`.
4. **Raio fora da casa.** `rounded-xl` no X do `ModalConfiguracoes` e
   `rounded-[10px]` no stepper do `CardDestaque`. Raios permitidos na vitrine:
   `campo` (12px), `card` (16px), `lg` (8px — SÓ para o botão interno aninhado
   num controle com `p-1`, porque 12−4=8 é a matemática do encaixe) e
   `rounded-full` (SÓ o balão do `AvisoFlutuante`). Nada de `rounded-[` e
   nada de `2xl/3xl`.
5. **Discos com ícone em estado (o vício do painel).** `AlertaErro` desenha um
   disco `rounded-full bg-areia h-16` com `CloudOff` de 28px + um `RotateCcw`
   e um `Sparkles` dentro dos botões. O painel lobotomizou exatamente isso
   (regra "estados sempre com texto", primitivo `Estado`). O erro da vitrine
   escreve bem ("O forno esfriou por aqui") — só sobra tirar o teatro de
   ícones em volta.
6. **Ícones decorativos nos títulos.** `Settings2` com "Configurações" e
   `MessageCircleHeart` com "Como funciona" — a etiqueta de título não precisa
   de ícone (o painel fez a mesma poda nos títulos).
7. **Eyebrow que repete a informação acima dela.** `Abertura` abre com o
   sobretítulo em caixa-alta "confeitaria artesanal" — a MESMA frase do
   lockup do `Cabecalho`, visível no topo da mesma tela. O painel vetou
   eyebrow de página por redundância; aqui é o mesmo caso.
8. **Duplicação de estado indisponível.** A frase "Sem estoque no momento"
   existe escrita em `CardProduto` e em `CardDestaque` (com tratamentos
   ligeiramente diferentes) + `grayscale` na foto. Escrita em dois lugares =
   o mesmo problema do duplo-marca do antigo Entrar do painel. Vira o
   primitivo `Estado` (seção 3.5), consumido nos dois.
9. **Botão primário sem corpo.** Depois do C8.1 do painel, a casa ganhou a
   "borda de corte" na base do primário (feeling de biscoito assado). Os
   primários da vitrine (`ui/Botao` "escura", barra "Ver sacola", "Quero
   esse") ficaram secos perto do irmão do painel — ganham o mesmo
   acabamento.

---

## 2. Direção: **"Papel e tinta, caramelo no preço e na compra"**

A vitrine é a marca; o painel é a ferramenta. Mesmo papel, pesos de tintas
diferentes: aqui o caramelo aparece em DUAS ocasiões — **o preço** (a informação
quente de uma vitrine é quanto custa) e **os botões de compra** (adicionar,
ver sacola, finalizar no WhatsApp, atualizar cardápio). Todo o resto é tinta
sobre creme com hairline: categorias com numeração editorial, garantias numa
faixa de papel, fotos de verdade com hairline e sem moldura.

Referência por analogia (não copiar nada visualmente): cardápio impresso de
padaria boa — papel, tipografia, filete, foto honesta, preço grande.

---

## 3. Sistema

### 3.1 Cores (tokens atuais mantidos; entra o trio de ESTADO)

Mantidos todos: `tinta`, `textoSuave`, `caramelo`, `carameloForte`,
`carameloEscuro`, `dourado`, `creme`, `areia`, `borda`.

Acrescentar EXATAMENTE como no painel (mesma fileira, mesmo valor):

```js
// Estados (mesmos valores do painel — uma casa, uma régua de estado):
ok: "#2f6b3f", alerta: "#8a5a00", perigo: "#a32a2a",
```

Usos na vitrine: `perigo` para mensagens de erro de formulário
(`ModalConfiguracoes`) com prefixo **"Erro: "** (mesma gramática do painel);
`alerta` reserva; `ok` reserva. O erro de REDE (AlertaErro) NÃO é culpa do
cliente — fica em tinta/textoSuave, sem vermelho e sem disco-ícone.

### 3.2 Raios, sombra, bordas

- Raios: `rounded-campo` (12px) em campos/botões/controles;
  `rounded-card` (16px) em cards, fotos, modais; `rounded-lg` (8px) só no
  botão interno de steppers; `rounded-full` só no balão de aviso.
- Sombra: **uma só** (`shadow-flutuante`) e só onde flutua de fato:
  `CarrinhoDrawer`, `ModalConfiguracoes`, `ModalAjuda`, `AvisoFlutuante`.
  Cards e barras encostadas: hairline `border-borda`, nunca sombra. É hoje
  o estado — manter (`grep` do C6 confere).
- Hairline em tudo: `border-borda` (`#e8ddd1`).

### 3.3 Tipografia por papel

| Papel | Fonte | Peso | Nota |
|---|---|---|---|
| Título editorial (hero, card destaque, seção) | `font-display` (Playfair) | até `bold` (700) | nunca extrabold |
| Nome de produto | `font-display` | `semibold`/`bold` | idem |
| Corpo, rótulos, botões | `font-corpo` (DM Sans) | até `semibold` (600) | |
| Preços, contadores, numeração editorial | `font-numero` (Manrope) | `semibold` + `tabular-nums` | o extrabold do preço vira semibold |
| Sobretítulo funcional (categoria no CardDestaque) | `font-corpo` | `semibold` | caixa-alta ok quando INFORMA |

### 3.4 Ícones — lista fechada

Liberados, cada um com FUNÇÃO declarada (decorativo entra no PROGRESSO como
desvio explicado): `Search` e `X` (busca), `Plus`/`Minus` e `Trash2`
(quantidade/remoção), `ShoppingBasket` (sacola), `MessageCircle` (WhatsApp —
também BrandIcon de função), `RefreshCw` e `Loader2` (atualizar/buscar),
`ChevronDown/Right` (se algum chevron existir). Sempre `strokeWidth 1.5`.

**Saem** (decorativos): `Settings2` e `MessageCircleHeart` (títulos),
`CloudOff`, `RotateCcw`, `Sparkles` (erro), e qualquer ícone de categoria que
ainda sobreviva em `lib/iconeCategoria.ts`.

### 3.5 Primitivos (`src/components/ui/` + 1)

- **`Botao` (ui/Botao)** — variante `escura` (primária, carameloForte +
  **borda de corte**: `border-b-2 border-carameloEscuro`, hover escurece,
  `active:translate-y-px`, `disabled:active:translate-y-0`), `clara` (branco
  + borda, hover areia), `whats` (igual `escura`, texto idêntico — o texto de
  finalização NUNCA muda). Peso `font-semibold` em todos; `rounded-campo`.
  Nada de `active:scale`.
- **`Estado` (novo, `ui/Estado.tsx`)** — marcador (`size-2 rounded-full` +
  texto) para estados de produto/fluxo. Estado "Sem estoque no momento" =
  NEUTRO: marcador e texto em `textoSuave`, foto `grayscale` fica. Consumir
  em `CardProduto` e `CardDestaque` (mata a duplicação do diagnóstico 8).
  `rounded-full` do marcador é EXCEÇÃO registrada (mesma do `Badge` do
  painel).
- **`Cartao`** — conferir conformidade (rounded-card + border-borda +
  bg-white, sem sombra); só arrumar se divergir.
- **`EsqueletoCardapio`** — blocos `bg-areia` planos com pulso; sem
  gradiente de shimmer.

### 3.6 Ritmo

- Alvos de 44px (`min-h-11`) em TODOS os controles de toque.
- Seções de cardápio com respiro grande ENTRE seções (já existe — manter);
  cards com `p-4`, drawer com `p-5`.
- `env(safe-area-inset-bottom)` da BarraSacola intocado (é infra de toque).

---

## 4. A foto herdada do antigo login do painel

O painel tinha esta foto na tela de login (o C7 a aposentou ali; a decisão
deste prompt é reaproveitá-la aqui, na abertura da vitrine):

```tsx
// Foto herdada do antigo login do painel (MarcaLogin @ 4166287): os tons
// são quentes como o caramelo e o dourado da marca.
const FOTO_HERDADA =
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80";
```

Regras de tratamento (lições QUE JÁ ESTÃO aprendidas — não redescubrir):

1. **Sem véu translúcido sobre a foto** e sem texto sobre a foto. O desenho da
   Abertura do painel que perdeu a disputa ("o nome se esconde na cor da
   foto") não volta; e a vitrine nem precisa: o texto mora na coluna ao lado
   da foto, sobre papel. Mantém `rounded-card` + `border border-borda`.
2. **A URL não prova conteúdo** (lição do `lib/aparenciaProduto.ts`): abra a
   URL no navegador, veja o que aparece de fato, e escreva o `alt` fiel
   (substitui o alt atual, que descreve a foto antiga `/abertura.png`).
3. `loading="eager"` e `fetchPriority="high"` MANTIDOS (é o LCP da página);
   informe `width`/`height` reais da imagem (a fonte entrega 1200×~800;
   confirme olhando) para o layout não pular — a troca de `h-[300px]` etc.
   por `aspect-*` (5.1) dá o molde fixo.
4. A foto vira a ÚNICA foto editorial de banco no site. **Proibido criar
   fallbacks de Unsplash por produto** — a regra do `aparenciaProduto` (foto
   real → foto curada das trufas → areia com nome) permanece EXATAMENTE como
   está, porque registrada por uso: foto errada de doce é mentira para
   cliente.

O `/abertura.png` fica em `public/` intocado (não é o trabalho desta branch
apagar asset — só deixa de ser referenciado).

---

## 5. Especificações por superfície

### 5.1 Abertura (`Abertura.tsx`)

- Trocar o `src` da foto pela `FOTO_HERDADA` (seção 4); mantém moldura
  `rounded-card` com hairline; alt fiel; `aspect-[4/5] sm:aspect-[16/10]
  lg:aspect-[16/9]` no lugar das alturas chutadas; no DOM a ORDEM continua
  texto-depois-foto (leitor de tela lê "o que a loja é" antes da foto),
  ordem visual invertida por CSS como hoje.
- **Remover o sobretítulo "confeitaria artesanal"** (diagnóstico 7 — a frase
  é a do lockup, repetida).
- Título: `lg:text-[3.5rem]` → `lg:text-6xl` (não há tamanho arbitrário fora
  do sistema); peso max `bold`.
- Ações continuam DUAS: "Escolher meus doces" (primária, com a borda de
  corte) e "Como funciona?" (link de texto) — hierarquia já decidida e boa.
- `active:scale-95` → `active:translate-y-px`.

### 5.2 Garantias (`Destaques.tsx`)

Estado atual está NO padrão (faixa hairline, centro no celular): nada a
mudar de classes; conferir apenas que os textos das `GARANTIAS` ficaram
idênticos. Os textos das 3 garantias são intocáveis (palavra da loja).

### 5.3 Cardápio (`CabecalhoCardapio`, `SecaoCardapio`, `SecaoCategoria`,
`GrupoCategoria`, `GradeCardapio`, `CardProduto`, `EsqueletoCardapio`)

- `CabecalhoCardapio`: título Playfair `bold` ok; contador ok (único, Manrope
  tabular). Botão de atualizar: sem `-translate-y` (já removido ali —
  conferir), foco visível (anel caramelo) — o foco hoje NÃO tem anel
  declarado: adicionar `focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-caramelo/40`.
- `SecaoCategoria` — LER ANTES: se as categorias forem PÍLULAS preenchidas
  ativas, virar **abas de texto com sub-traço caramelo** (mesmo desenho das
  `AbasRodape` do painel): texto `semibold`, mínimo `min-h-11`, traço
  `border-b-2 border-caramelo` na ativa, inativo `text-textoSuave`.
  `aria-current`/estado ativo preservados como fonte da verdade visual.
- `GrupoCategoria`: numeração editorial "01" — `font-numero` `semibold`
  (hoje `bold`) com o tracking; nome Playfair `bold` ok; o filete/hairline
  fica.
- `CardProduto` e `CardDestaque`:
  - preço `font-numero` **semibold** tabular carameloForte;
  - "Quero esse"/"+" com borda de corte; steppers com `rounded-lg` interno;
  - lixeira `rounded-campo` (não `rounded-full`), hover
    `bg-areia/60 hover:text-carameloForte` como hoje;
  - `active:scale-95` → `active:translate-y-px` em todos os botões;
  - sem foto = areia + nome Playfair (MANTIDO como está — é bonito e
    honesto);
  - indisponível = `<Estado texto="Sem estoque no momento" neutro>` + foto
    `grayscale` (mantida — reforço visual do estado).
- `EsqueletoCardapio`: conferir blocos `bg-areia` + pulso, sem gradiente.

### 5.4 Sacola (`BarraSacola`, `CarrinhoDrawer`, `ItemSacola`, `Camadas`)

- `BarraSacola`: encostada nas bordas (sem raio, sem sombra) — MANTIDO.
  Pesos → semibold; press → `translate-y-px`; as três partes na mesma
  escala `text-sm` (já está assim). Intocável: o padding com
  `env(safe-area-inset-bottom)`.
- `CarrinhoDrawer`: fundo **`bg-white`** (mata o `bg-[#fffdf9]`); campos
  ("Seu nome", "Observações") no padrão de campo da casa: `bg-white`,
  `border-textoSuave/80`, foco `border-caramelo` + `ring-caramelo/40` (mesma
  régua do painel `Entrada`); rótulos `text-xs semibold` (hoje
  `font-bold`); X do topo com `focus-visible` anel caramelo; total Manrope
  semibold tabular; o botão `whats` NÃO muda o texto "Finalizar no WhatsApp"
  nem o ícone `MessageCircle` (função); a frase "Você confirma o pagamento
  direto na conversa." fica (é garantia da loja).
- `Camadas`: z-indexes e overlay (`bg-tinta/45`) intocados; conferir apenas
  que nada ganhou sombra nova.

### 5.5 Modais e aviso (`ModalAjuda`, `ModalConfiguracoes`, `AvisoFlutuante`)

- `ModalAjuda`: ícone `MessageCircleHeart` FORA do título (a etiqueta é
  texto); o passo a passo mantém a numeração manual em `<b>`
  (`1.` `2.` `3.`) com peso semibold; X com anel de foco; nada mais.
- `ModalConfiguracoes`: X `rounded-xl` → `rounded-campo` e o
  `hover:-translate-y-0.5` FORA (o campo X é estático, hover `bg-areia`);
  `Settings2` e `PlugZap`/`Check` decorativos FORA (o estado do teste é
  TEXTO no `retorno`, e o erro em `text-perigo` com prefixo "Erro: ");
  labels semibold; campos `bg-white border-textoSuave/80` foco caramelo
  (régua do painel); `role="dialog"`/`aria-modal`/`aria-label` preservados.
- `AvisoFlutuante`: NÃO MUDA (pílula tinta, `rounded-full` de balão é
  exceção registrada, sombra flutuante ok, `role="status"`/`aria-live`
  preservados).

### 5.6 Estados (carregando/vazio/erro)

- Estados de rede/vazio: SEM disco, SEM ícone (5.5/3.5). `EstadoVazio` já
  é texto puro + ação — conferir foco do Botao.
- `AlertaErro`: remove o disco `CloudOff` e os ícones dos botões; título
  "O forno esfriou por aqui" FICA (é a voz da loja); o motivo `(mensagem)`
  espremido entre parênteses fica; botões: "Tentar de novo" (primária) +
  "Ver demonstração" (clara) — nomes EXATOS, sem ícones.
- Nenhum estado usa `text-perigo` além do erro de formulário: perigo é de
  formulário (3.1), erro de rede não é culpa do cliente.

### 5.7 Casca e rodapé (`Cabecalho`, `Marca`, `BuscaCardapio`, `Rodape`)

- `Cabecalho`: lockup — `extrabold` → `bold` (Playfair) e semibold no
  subtítulo; sacola no canto direito (já decidido por uso) com a borda de
  corte e press de 1px; o <b> do contador mantém tabular; a variável
  `--altura-cabecalho` e o ResizeObserver NÃO SÃO TOCADOS (infra).
- `BuscaCardapio`: lupa e X ficam; X `rounded-full` → `rounded-campo`;
  `escape` limpa (handler preservado); foco pelo contorno do campo
  (`focus-within`) já existe — anel caramelo no contorno.
- `Rodape`: fundo tinta é a assinatura da loja — FICA; `extrabold` →
  `bold`; link de WhatsApp do rodapé usa `lerWhats()` (não tocar);
  `espacoParaSacola` (reserva da barra) intocado.

---

## 6. Ordem de execução (clusters e critérios)

Rode os critérios a partir de `vitrine-cliente/`. Ao final de **cada** clúster:
`npm run build` sem erro, lint da raiz sem erro, grep do clúster, entrada no
capítulo **"Vitrine"** do `PROGRESSO.md`, commit
`redesign(vitrine): <clúster> — <resumo>`.

Executar em branch nova `redesign-vitrine`, criada a partir do fim da branch
`redesign-visual` (o diff do redesign do painel não se mistura com o da
vitrine). `painel-admin/**` não é tocado durante os clústeres.

**C0 — Fundamentos** (`tailwind.config.js` +3 tokens; `ui/Botao` com a borda
de corte e pesos; novo `ui/Estado`; varreduras globais)
- `grep -n "ok:\|alerta:\|perigo:" tailwind.config.js` → 3 linhas
- `grep -rn "active:scale" src` → 0
- `grep -rnE "font-(extrabold|black)" src` → 0
- `grep -rnE "\[\#" src` → 0 (o `bg-[#fffdf9]` morre aqui)
- `grep -rn "rounded-\[\|rounded-2xl\|rounded-3xl\|rounded-xl" src` → 0
- `grep -rln "rounded-full" src` → registrar a fileira no PROGRESSO; ao fim
  do C6 a lista final é somente `AvisoFlutuante.tsx` (balão) +
  `ui/Estado.tsx` (marcador). Os `rounded-full` que ainda existirem em X de
  busca e lixeira de card são convertidos nos C1–C3.

**C1 — Casca** (`Cabecalho`, `Marca`, `BuscaCardapio`, `CabecalhoCardapio`,
`Rodape`)
- `grep -rn "font-extrabold" src/components/Cabecalho.tsx src/components/Rodape.tsx` → 0
- `grep -rn "active:scale-95" src/components/Cabecalho.tsx` → 0
- `grep -rn "focus-visible:ring-caramelo" src/components/BuscaCardapio.tsx src/components/CabecalhoCardapio.tsx` → ≥ 2
- `grep -n "altura-cabecalho" src/components/Cabecalho.tsx` → preservado
  (ResizeObserver e variável CSS são infra intocada)

**C2 — Abertura e destaques** (`Abertura`, `Destaques`, `CardDestaque`)
- `grep -rn "1558961363-fa8fdf82db35" src/components/Abertura.tsx` → 1
- `grep -rn "confeitaria artesanal" src/components/Abertura.tsx` → 0
  (a frase só pode existir no lockup do `Cabecalho`, não na Abertura)
- `grep -rn "text-\[3" src/components/Abertura.tsx` → 0
- `grep -rn "rounded-\[10px\]" src/components/CardDestaque.tsx` → 0
- `grep -rn "GARANTIAS" src/components/Destaques.tsx` → intacto (texto igual ao anterior no PROGRESSO)

**C3 — Cardápio** (`SecaoCardapio`, `SecaoCategoria`, `GrupoCategoria`,
`GradeCardapio`, `CardProduto`, `EsqueletoCardapio`)
- `grep -rn "font-bold" src/components/GrupoCategoria.tsx` → só em linhas
  `font-display` (Playfair); o número editorial (`font-numero`) fica
  `semibold` com o `tabular-nums`
- `grep -rn "Sem estoque no momento" src` → 0 (virou `<Estado>`, definido em `ui/Estado.tsx`)
- `grep -rn "grayscale" src/components/CardProduto.tsx src/components/CardDestaque.tsx` → ≥ 2 (mantido)
- `grep -rn "iconeCategoria" src` → 0 usos — aí apagar `lib/iconeCategoria.ts` (se > 0, NÃO apagar e registrar em PROGRESSO)
- pílulas: `grep -rn "rounded-full\|bg-tinta" src/components/SecaoCategoria.tsx` → 0 (abas de texto com traço)

**C4 — Sacola** (`BarraSacola`, `CarrinhoDrawer`, `ItemSacola`, `Camadas`)
- `grep -rn "fffdf9" src` → 0
- `grep -rn 'role="dialog"' src/components/CarrinhoDrawer.tsx` → preservado
- `grep -rn "Finalizar no WhatsApp" src` → ≥ 1 (texto intacto)
- `grep -rn "font-bold" src/components/BarraSacola.tsx` → 0
- `grep -rn "safe-area" src/components/BarraSacola.tsx` → preservado

**C5 — Modais, aviso e estados** (`ModalAjuda`, `ModalConfiguracoes`,
`AvisoFlutuante`, `EstadoVazio`, `AlertaErro`)
- `grep -rn "rounded-xl\|-translate-y-0" src/components/ModalConfiguracoes.tsx` → 0
- `grep -rn "CloudOff\|RotateCcw\|Sparkles\|Settings2\|MessageCircleHeart" src` → 0
- `grep -rn "role=\"status\"" src/components/AvisoFlutuante.tsx` → preservado
- `grep -rn "text-perigo" src/components/ModalConfiguracoes.tsx` → ≥ 1 (erro com "Erro: ")

**C6 — Auditoria final**
- `grep -rn "active:scale" src` → 0
- `grep -rn "bg-gradient\|backdrop-blur\|linearGradient" src` → 0
- `grep -rnE "font-(extrabold|black)" src` → 0; `font-bold` SÓ em Playfair
  (`grep -rln "font-bold" src` conferir arquivo por arquivo)
- `grep -rnE "\[\#|rounded-\[" src` → 0
- `grep -rnE "shadow-(sm|md|lg|xl|2xl|inner)" src` → 0; `grep -rn "shadow-flutuante" src` → só drawer/modais/aviso
- `grep -rnE "(bg|text|border|ring)-(purple|violet|indigo|blue|sky|fuchsia|pink|slate|gray|zinc|neutral|stone)-" src` → 0
- `LC_ALL=C.UTF-8 grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src` → 0
- `git diff --exit-code -- src/lib/mensagemWhats.ts src/lib/whatsLoja.ts src/hooks` → 0 mudanças
- `git diff --name-only <commit-antes>..HEAD | grep -v "^vitrine-cliente/src/"` → somente `vitrine-cliente/tailwind.config.js`, `PROGRESSO.md` e, se aplicável, a exclusão de `lib/iconeCategoria.ts`
- `npm run build` sem erro; lint da raiz sem erro

---

## 7. Checklist final (responda SIM/NÃO, com a evidência)

1. A vitrine é reconhecível como a MESMA casa do painel (mesmo papel, mesmas
   hairlines, mesmo caramelo em ação/preço)?
2. Nenhum botão pula de escala (`active:scale` = 0) e todos descem 1px?
3. Nenhum peso fora da régua (display ≤700; corpo/número ≤600)?
4. Nenhuma cor ou raio fora de token?
5. Os estados dizem em TEXTO o que acontece (sem disco-ícone, sem adivinhação)?
6. A foto herdada está na Abertura, com alt fiel e sem véu?
7. Nenhum texto de WhatsApp, garantia ou preço mudou?
8. Todos os `aria-*`/`role`s de antes continuam (comparação registrada no
   PROGRESSO por clúster)?
9. Build e lint verdes, e o escopo do diff é só o permitido?
