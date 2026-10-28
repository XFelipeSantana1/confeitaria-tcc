# PROGRESSO — Redesenho visual (contrato)

- **Branch:** `redesign-visual` (criada a partir de `develop` @ `83f757f`)
- **Fonte da verdade:** este arquivo. Marque `[x]` com a evidência (comando + resultado resumido).
- **Regras:** R1–R10 do contrato. Antes de qualquer etapa, releia este arquivo.
- **Escopo:** somente visual em `vitrine-cliente/` e `painel-admin/`. Intocáveis: backend, docker-compose, .env, package.json, hooks, lib/api*, types, regras de negócio.

---

## Etapa 0 — Preparação

- [x] **0.1** git status sem alterações não commitadas
      Evidência: havia 38 modificados + 4 não rastreados da rodada anterior → commitados em `develop` como `83f757f` "estilo: primeira rodada de melhorias visuais (login, resumo, cards, modais)" (41 arquivos, +432/−190). O txt do Figma (`PROJETO_CONSOLIDADO_PARA_FIGMA.txt`) fica no disco, sem commit.
- [x] **0.2** branch `redesign-visual` criada (`git checkout -b redesign-visual`)
      Evidência: `* redesign-visual` em `git branch --show-current`.
- [x] **0.3** este PROGRESSO.md criado na raiz.
- [x] **0.4** inventário `wc -l` — arquivos **> 150 linhas** (limite de referência do projeto):
      - painel: `PainelCategorias.tsx` 259 · `Produtos.tsx` 230 · `Resumo.tsx` 225 · `JanelaPerfil.tsx` 210 · `Entrar.tsx` 177 · `CampoImagem.tsx` 174 · `Insumos.tsx` 163 · `DrawerPedido.tsx` 156 · `Pedidos.tsx` 150 (no limite)
      - vitrine: `ModalConfiguracoes.tsx` 159 · `SecaoCardapio.tsx` 151 · `CarrinhoDrawer.tsx` 151
      - observação: `MarcaLogin.tsx` 122 linhas (usará checagem de uso em 3.10)
- [x] **0.5** linha de base (antes de mexer):
      - `vitrine-cliente npm run build` → **OK** (tsc + vite, 13.03s, sem erro)
      - `painel-admin npm run build` → **OK** (tsc + vite, 13.47s, sem erro)
      - lint raiz (`node ./node_modules/eslint/bin/eslint.js backend/src vitrine-cliente/src painel-admin/src`) → **exit 0**, sem erro/aviso
      - **pré-existente corrigido nesta etapa:** eslint declarado no package.json da raiz mas NÃO instalado (não existia node_modules na raiz). Feito `npm install` na raiz (dependências já declaradas — nenhuma dependência nova).
- [x] **0.6** greps de classes usadas e não definidas + bugs conhecidos:
      - `carameloEscuro`: **usado 8× e definido em lugar nenhum** → vitrine: Cabecalho, CardProduto, ui/Botao (variante `escura`), CardDestaque, Abertura; painel: FormularioSenha, ui/Botao (`escura`), LinhaRegistro. Conserto em 1.1/1.4.
      - `shadow-suave`: **usado 2× em `painel-admin/src/pages/Resumo.tsx` (linhas 98 e 107), não definido**. Conserto em 1.1/1.4.
      - `font-numero`: painel usa 13× e **já define** no config. Vitrine não usa em nenhum lugar real (só comentário em BarraSacola.tsx explicando a ausência). Etapa 1.1 adicionará `fontFamily.numero` + Manrope no index.html da vitrine (para os preços).
      - opacidades fora da escala padrão: `bg-caramelo/12` (`painel/src/pages/Produtos.tsx:165`) e `bg-tinta/68` (`painel/src/components/MarcaLogin.tsx:42`). Demais modificadores (10/15/20/25/30/35/40/45/50/60/65/70/75/80/85/90/95) são válidos. Conserto em 1.4.
      - `fill-rule` (atributo React inválido): 4 ocorrências — `vitrine/src/components/Marca.tsx:21,36` e `painel/src/components/Marca.tsx:21,36`. Conserto em 1.4.
      - contagem de base de `rounded-3xl | rounded-[2rem] | rounded-[28px]`: **21 ocorrências** (não precisa ser zero até as etapas 2/3).

- **[PARAR 0] — aguardando "ok" do usuário.**

---

## Etapa 1 — Fundamentos (nos DOIS projetos)

- [x] 1.1 tailwind.config: **`carameloEscuro = #7A3A18`** (8.59:1 com branco; carameloForte fica em 6.15:1 — calculado com node, contraste +40% no hover); `borderRadius.campo=12px` e `borderRadius.card=16px` nomeados; `boxShadow.flutuante` (única, drawer/modal); `suave` definido no painel (Resumo.tsx ainda usa `shadow-suave`, conforme regra "definir se usado"); `fontFamily.numero` adicionado na vitrine + **Manrope carregado no `vitrine-cliente/index.html`**. `Cartao` pesada aposentada no comentário mas mantida no config até `grep shadow-Cartao` = 0 (usos fora da ui são das etapas 2/3).
- [x] 1.2 index.css: vitrine sem os 2 radial-gradientes do body (creme sólido `#fdf8f3`); `prefers-reduced-motion` ADICIONADO na vitrine (existia só no painel); keyframes conferidos com grep — todos os 6 da vitrine e 3 do painel estão em uso (nada apagado); `:focus-visible` mantido; DM Sans no corpo já base nos dois.
- [x] 1.3 ui aplicados: `ui/Botao` (ambos): `rounded-campo`, `min-h-11` (44px), sem `shadow-Cartao`, hover escurece (vitrine `whats` saía para `caramelo` claro → agora `carameloEscuro`), cursor unificado; `clara` ganhou `hover:bg-creme`; `ui/Cartao` (ambos): `rounded-card` (16px), hairline, sombra zero nos 3 níveis de `elevacao` (prop mantida por compat, sairá nas etapas 2/3); `ui/Entrada`: `rounded-campo` + `min-h-11`; `ui/Badge` revisado — já compatível (pílula não-interativa, hairline, sem sombra), sem mudança.
- [x] 1.4 corrigidos: `carameloEscuro` agora definido (8 usos válidos); `shadow-suave` definido; `font-numero` definido na vitrine; `bg-caramelo/12`→`/15` (Produtos.tsx); `bg-tinta/68`→`/70` (MarcaLogin.tsx); `fill-rule`→`fillRule` 4× (Marca.tsx ×2 em cada projeto).
- [x] 1.5 verificações:
      (a) build vitrine → ✓ built in 9.56s
      (b) build painel → ✓ built in 8.63s
      (c) lint raiz → exit 0; grep carameloEscuro=11 usos (definido ✓), shadow-suave=2 (definido ✓), font-numero vitrine (definido ✓)
      (d) grep rounded-3xl/[2rem]/[28px] → **19 restantes** (eram 21; os 2 do ui/Cartao saíram; tratados nas etapas 2/3)
      (e) `git diff --stat` → 13 arquivos, todos no escopo permitido (components, pages, index.css, tailwind.config.js, index.html)
- [x] 1.6 commit "visual: fundamentos e correcao de classes indefinidas"

- **[PARAR 1]**

---

## Etapa 2 — Vitrine

- [x] 2.1 Cabecalho enxuto: engrenagem REMOVIDA (morava no Rodapé desde antes — `aoAbrirConfiguracoes` já é prop do Rodape); `App.tsx` deixou de passar a prop ao Cabecalho (única edição fora de components/** — fiação obrigatória do 2.1, documentada como desvio mínimo); ResizeObserver + `--altura-cabecalho` mantidos; gradiente do disco → `bg-tinta` sólido; `backdrop-blur` → fundo sólido `bg-creme` + hairline; sacola `min-h-11`, contador creme/tinta (branco sobre caramelo puro ficava < AA); `BuscaCardapio` `rounded-campo` (12px).
- [x] 2.2 Abertura editorial: grid `items-end` 2/5 texto + 3/5 foto (60%); título Playfair `tracking-tight`; UMA ação ("Escolher meus doces", carameloForte) + "Como funciona?" como link de texto (não 2º botão); pílula Sparkles removida; sobretítulo em texto caixa-alta; `/abertura.png` mantida com `width/height/fetchPriority/loading`.
- [x] 2.3 Destaques: faixa fina `border-y`; separador via CSS (`divide-y` no celular, `sm:divide-x` no desktop) — o `<span>` solto FORA da ordem dos itens foi eliminado.
- [x] 2.4 SecaoCategoria: texto com sublinhado caramelo na ativa; sem Cartao, sem pílulas, sem ícones; `role="tablist"`/`aria-selected` mantidos; alvo de toque ~46px (`py-3`); rolagem lateral mantida.
- [x] 2.5 GradeCardapio + GrupoCategoria: Cartao removidos (seções respiram no creme); cabeçalho editorial `01 —` (Manrope, tracking aberto) + título Playfair + filete; disco de ícone e pílula de contagem removidos; mobile 2 colunas com foto 4:5; desktop 3 colunas com card "capa" (`row-span-2` na CÉLULA do grid); `identificador` + `scroll-mt-40` + `espacamentoTopo` mantidos.
- [x] 2.6 CardProduto/CardDestaque: nome Playfair, `line-clamp-1`, preço Manrope `tabular-nums` carameloForte; selo de categoria sobre a foto e selo "destaque da casa" REMOVIDOS; botão "+" em tinta (caramelo fica no preço) com stepper − 1 + (alvos 44px); indisponível = foto `grayscale opacity-75` + texto "Sem estoque no momento"; `aria-label`s e `onError` mantidos.
- [x] 2.7 aparenciaProduto.ts: `EMOJIS`, `GRADIENTES`, `emojiParaProduto`, `gradienteParaProduto` APAGADOS; `imagemParaProduto` mantida (foto do painel + 1 foto curada de trufa); sem foto = areia + nome em Playfair (CardProduto, CardDestaque, ItemSacola). Grep das funções = **0 usos** (só comentários explicando o porquê).
- [x] 2.8 CarrinhoDrawer + ItemSacola: rodapé com `border-t` hairline em vez de Cartao (superfície-dentro-de-superfície); total único em Manrope 2xl; texto "Você confirma o pagamento direto na conversa." (cadeado removido); vazio = título + frase convidativa + "Ver cardápio", sem disco com ícone; lista com `divide-y` (linhas nuas); alvos de 44px; `shadow-flutuante` (única sombra); inputs `rounded-campo min-h-11`; total do cabeçalho deduplicado.
- [x] 2.9 Estados: Esqueleto espelha a grade nova (2 col 4:5 / 3 col 4:3) com pulso SÓLIDO (gradiente varrendo removido); AlertaErro sem jargão ("backend" saiu) e botão "**Tentar de novo**"; EstadoVazio sem prop `ilustracao`; **IlustracaoBuscaVazia.tsx APAGADO** (grep = 0) + keyframe `flutuar` removido do index.css (era o único consumidor).
- [x] 2.10 CabecalhoCardapio: contador ÚNICO "N doces" em Manrope (a frase duplicada "Mostrando N delícia(s)…" removida); botão de recarregar discreto (sem pulinho de hover).
- [x] 2.11 Rodape: marca sem disco caramelo (símbolo direto no tinta); UMA frase curta (a duplicada da coluna "A casa" saiu); link "trocar API / WhatsApp" discreto (`text-creme/60`, hover `creme`).
- [x] 2.12 AvisoFlutuante: pílula lisa em tinta, barra de acento REMOVIDA, sombra = `flutuante`; `role="status"` + `aria-live="polite"` mantidos.
- [x] 2.13 Marca.tsx vitrine: `SimboloClaro` confirmada nos lugares escuros (Cabecalho `bg-tinta`, Rodape `bg-tinta`); `Simbolo` (versão escura) está SEM NENHUM USO — sinalizado no relatório, NÃO apagado (decisão do usuário, como em 3.10).
- [x] 2.14 verificações a–i:
      (a) build vitrine → ✓ built in 5.07s (final 4.18s após css)
      (b) build painel → ✓ built in 8.55s (intocado nesta etapa)
      (c) lint raiz → **exit 0**
      (d) emoji: **zero em components**; `🧁` só em `lib/mensagemWhats.ts` (texto do WhatsApp/toast — permitido pelo contrato, arquivo intocável) e ⚙️/🧁 em COMENTÁRIOS de `lib/api.ts`/`hooks/useAvisosSacola.ts` (intocáveis)
      (e) `rounded-3xl|[2rem]|[28px]` na vitrine: **0** (eram 2 — ModalAjuda e ModalConfiguracoes, corrigidos aqui: modal = `rounded-card`); painel fica com 13 para a Etapa 3
      (f) `shadow-Cartao` na vitrine: **0**
      (g) `ui/Cartao` sem nenhum consumidor na vitrine (componente base permanece; migração dos usos era desta etapa — concluída)
      (h) aria preservados: `dialog`, `tablist`, `status`, labels, `aria-busy`
      (i) `git diff --stat` só `vitrine-cliente/src/**` (components + index.css); CarrinhoDrawer 151 linhas (era 151), SecaoCardapio 151, ModalConfiguracoes 159 (estrutura intacta)
- [x] 2.15 commits: `77a7910` topo (Cabecalho, Abertura, Destaques, App-fiação, BuscaCardapio) · `d98166f` cardápio (navegação, grade, cards, aparenciaProduto, esqueleto, cabeçalho do cardápio, ItemSacola) · commit final abaixo "visual: vitrine redesenhada" (drawer, estados, rodapé, aviso, modais, css). Subgrupos com commit próprio para dar pontos de rollback (R8).

- **[PARAR 2]**

---

## Etapa 3 — Painel

- [x] 3.1 BarraLateral + MenuMobile + AbasRodape + Avatar: rodapé da sidebar sem Cartao (avatar/nome/sair sobre a tinta com hairline).
      ↳ evidência: gradiente decorativo e `shadow-[4px_0_24px…]` removidos da sidebar (`border-r border-white/10 bg-tinta`); rodapé agora em `div` com `border-t border-white/10` (Cartao import apagado); sair com `h-11 w-11` + `hover:bg-white/10`; gaveta do MenuMobile com `shadow-flutuante` e botões `rounded-campo`; AbasRodape sem `backdrop-blur` (fundo sólido); contadores de pendentes em `carameloForte` (branco sobre `caramelo` antigo dava 4,09:1 — agora 6,15:1).
- [x] 3.2 EstruturaPainel: cabeçalho mobile limpo; manter reserva de altura das abas.
      ↳ evidência: `bg-creme/90 backdrop-blur-md` → `bg-creme`; selo de pendentes sem `shadow-Cartao` (ganhou `ring-2 ring-creme`); disco do logo `rounded-campo`; reserva de altura do rodapé mantida.
- [x] 3.3 CabecalhoSecao: sobretítulo caixa-alta carameloForte, título Playfair, ação à direita. + `tracking-tight` no h1 (padrão editorial da vitrine).
- [x] 3.4 Resumo: eliminar TODA moldura dupla (4 casos); CartaoMetrica em uma linha com hairline vertical + Manrope; período segmentado; barras finas; 2 colunas; sem `shadow-suave`.
      ↳ evidência: o Resumo desembrulhou os 4 Cartao internos (GraficoVendas/ListaMaisVendidos/ListaBaixoEstoque/UltimosPedidos mantêm UM Cartao cada; a página só distribui `lg:grid-cols-12` em 7/5); CartaoMetrica reescrito como CÉLULA nua (sem disco de ícone — eram os "4 cards iguais coloridos" proibidos) com rótulo caixa-alta + valor Manrope `tabular-nums` 3xl + detalhe; faixa única `rounded-card` com `divide-x` no desktop; período sem sombra (pílula ativa em tinta); barras do gráfico com `max-w-9` (finas); `shadow-suave` removido do config por ficar sem uso (grep = 0).
- [x] 3.5 Pedidos + CartaoPedido + TabelaPedidos + DrawerPedido + ItensPedido + AcoesPedido + CabecalhoDrawer.
      ↳ evidência: aba ativa sem `shadow-Cartao`; status SEMPRE com texto (`rotuloStatus`) e cores de `lib/pedido.ts` INTACTAS (amber/blue/violet/green/stone, conforme contrato); CartaoPedido `rounded-card` sem sombra (era `rounded-3xl` + sombra); drawer com `shadow-flutuante` (era `shadow-2xl`); ItensPedido sem caixas dentro da gaveta: itens em `divide-y` e total em faixa escura `bg-tinta rounded-card` com Manrope; borda tracejada do cabeçalho virou sólida; AbortController/Escape/cancelar intocados (só className/JSX mexidos).
- [x] 3.6 Insumos + modais.
      ↳ evidência: SeloSaldo consertado — saldo normal é número quieto (`font-numero text-textoSuave`), destaque `bg-areia text-carameloForte` SOMENTE no limite (antes os dois ramos tinham o mesmo fundo: destaque que não destacava); tabela desktop `rounded-card` sem sombra (era `rounded-3xl` + sombra); `BuscaComContagem` mantido; campo de busca `rounded-campo` + `min-h-11`; BotaoAcao h-11 no mobile (40px → 44px); 3 modais (Insumo/Movimentacao/Confirmacao) com `rounded-card` + `shadow-flutuante` e campos `min-h-11 rounded-campo`.
- [x] 3.7 Produtos + PainelCategorias + PainelDeProduto + ModalProduto + EditorFicha + CampoImagem + BotaoEscolher + EstadosProdutos.
      ↳ evidência: TODA a lógica mantida (trocandoId, filtros, ficha técnica, upload); gaveta de categorias `shadow-flutuante` (era `shadow-2xl`), LinhaFiltro `rounded-campo py-3` (44px), chip de filtro ativo `caramelo/15` → `bg-areia` (cor de estado, não de marca); ModalProduto/ModalCategoria `rounded-card` + `shadow-flutuante`; EditorFicha campos `min-h-11 rounded-campo`, botão riscado `hover:bg-caramelo/10` → `hover:bg-areia`; CampoImagem preview `rounded-card` (era `rounded-2xl`); alertas `rounded-campo`.
- [x] 3.8 Registros + LinhaRegistro: antes riscado → depois em destaque.
      ↳ evidência: `lib/aparenciaRegistro.ts` deixou o verde/rosa/âmbar genérico e recebeu tons da marca (criar=dourado, atualizar=areia, mover=borda, excluir=tinta sólida); detalhe aberto sem caixa tracejada (hairline no topo) com ANTES `line-through decoration-borda` apagado e DEPOIS em `carameloForte`; `aria-expanded`/`aria-controls` mantidos.
- [x] 3.9 Entrar.tsx.
      ↳ evidência: form DIRETO no creme (`rounded-[2rem] border bg-white p-8 shadow-Cartao` removidos); erro de `rose-`/`bg-rose-50` genéricos → `bg-areia text-carameloForte`; "Voltar para a vitrine" é `<a href>` com `import.meta.env.VITE_URL_VITRINE` (padrão do `lib/api/base.ts`) + fallback `http://localhost:5173`; nota de dev "Cadastre o admin inicial via API" APAGADA; "Fale com a gestora" virou texto puro (era `<span>` fingindo link).
- [x] 3.10 MarcaLogin.tsx: grep confirmou ZERO usos (só um comentário no Entrar). Em vez de apagar, foi ADOTADA: o Entrar desenhava o mesmo bloco à mão (mesma FOTO, mesmo véu, mesmo disco — seu próprio comentário dizia "para não duplicar decisão"); agora `MarcaLogin` é a única implementação (desktop + faixa compacta). Marketing (h1 de "controle" + 3 check marks decorativas) saiu — PROIBIDO "fluff"; ficou lockup + uma linha factual sobre o painel. Arquivo de -179/+71 linhas no login inteiro.
- [x] 3.11 JanelaPerfil + FormularioSenha + Avatar: um nível de superfície no modal.
      ↳ evidência: os dois `Cartao` internos viraram seções com `border-t` sólidas (moldura dupla eliminada — o modal É a superfície); duplicação nome/email ao lado do avatar deduplicada (Avatar já mostra o nome; email segue no campo "Dados"); bordas dashed → sólidas; Avatar `rounded-lg` → `rounded-campo` com `hover:bg-areia/30` (funciona em tinta e em branco).
- [x] 3.12 Estados do painel (EsqueletoTabela, DiscoVazio, VazioLista, AlertaAcao) refinados, sem emoji.
      ↳ evidência: EsqueletoTabela `rounded-card` e disco interno `rounded-campo`; VazioLista disco `rounded-campo` + `strokeWidth 1.5`; AlertaAcao `rounded-campo`; nenhum estado usa emoji (única ocorrência de "emoji" é comentário explicando a escolha de lucide).
- [x] 3.13 verificações a–i:
      (a) painel build ✓ 5.15s (e 5.20s pós-config); vitrine build ✓ 4.47s (regressão garantida).
      (b) lint dos 3 projetos: exit 0 ✓ (rodado duas vezes).
      (c) `rounded-3xl|[2rem]|[28px]|rounded-2xl` no painel: **0** (eram 13).
      (d) emoji: 0 (só menção em comentário).
      (e) `strokeWidth={1.5}`: 100% dos ícones lucide nos DOIS apps (varredura pegou 2 faltosos no painel e 6 na vitrine que escaparam da Etapa 2 — corrigidos).
      (f) Cartao-in-Cartao: 0 casos (26 usos verificados, todos superfície única; 0 Cartao dentro de modais/gavetas).
      (g) sombras: só `shadow-flutuante`, em 9 arquivos — todos gaveta (MenuMobile, PainelCategorias, DrawerPedido) ou modal (ModalInsumo, ModalMovimentacao, ModalConfirmacao, ModalProduto, ModalCategoria, JanelaPerfil).
      (h) config ↔ uso: `shadow-suave` e `shadow-Cartao` APOSENTADOS nos dois configs (grep = 0); `carameloEscuro/rounded-campo/rounded-card/font-numero/flutuante` todos com consumidores.
      (i) `git diff 83f757f --name-only`: só `PROGRESSO.md` + `painel-admin` (53) + `vitrine-cliente` (29) — backend/hooks/lib-api/types/package.json intocados ✓.
- [x] 3.14 commit "visual: painel redesenhado" (carrega este PROGRESSO.md; clústeres intermediários: 58970cc, 9b782c1, dca468b, 812b6c4, cca1642, b3d86b6, 8373f97).

- **[PARAR 3]**

---

## Etapa 4 — Auditoria final

- [x] 4.1 releer PROGRESSO.md; nenhum item `[ ]` sem justificativa.
      ↳ evidência: arquivo relido na íntegra antes de executar a etapa; todos os `[x]` das etapas 0–3 têm evidência (comando + saída); os únicos `[ ]` eram os itens 4.1–4.6 (a etapa em curso, executada nesta passagem).
- [x] 4.2 `git diff main --stat`: backend/, hooks, lib/api*, types, package.json intocados.
      ↳ evidência: `main` não existe localmente (só `origin/main`) — a diff contra ele inclui TODA a história do develop anterior ao redesign (229 arquivos, irrelevante para o escopo). Prova correta usada: **diff da base do contrato `83f757f` → HEAD**, cuja lista inteira é só `PROGRESSO.md` + `painel-admin/{src,tailwind.config}` + `vitrine-cliente/{index.html,src,tailwind.config}`. Checagem explícita de TODOS os intocáveis (backend/, docker-compose.yml, .env*, raiz+fronts package.json, hooks/, lib/api e api.ts, types/, sessao/pedido/periodo/mensagemWhats/secoes/disponibilidade):
      `git diff 83f757f -- <intocáveis> --`stat` → saída VAZIA (exit 0). Únicos toques em lib/: `painel-admin/src/lib/aparenciaRegistro.ts` e `vitrine-cliente/src/lib/aparenciaProduto.ts` — os dois permitidos por contrato (ajudantes de apresentação).
- [x] 4.3 build vitrine + build painel + lint raiz, de novo, saída completa.
      ↳ evidência: vitrine ✓ (tsc + vite v5.4.21, 1610 módulos, css 21,96 kB gzip 5,25, js 191,44 kB gzip 59,57, **5.48s**); painel ✓ (tsc + vite, 1656 módulos, css 23,97 kB, js 284,27 kB, **3.88s**); lint raiz (backend + vitrine + painel) → **exit 0**, zero erro/aviso.
- [x] 4.4 `npm run dev` nos dois + capturas 390px/1440px (ou declarar "não consegui verificar visualmente").
      ↳ evidência: dev rodado e encerrado: vitrine pronta em 316 ms servindo HTTP 200 (0,046s) com título "Doce & Carinho — Cardápio Artesanal"; painel em 1,3s com HTTP 200 (0,057s) e título "Painel do Gestor". **Capturas: NÃO CONSEGUI VERIFICAR VISUALMENTE** — o ambiente não tem navegador (nada de chromium/firefox/playwright/puppeteer; instalar um mexeria em package.json ou no sistema — fora do escopo). Proxies objetivos do CSS FINAL compilado nos dois `dist/`: `rounded-3xl`=0, `rounded-[2rem]`=0, `rounded-[28px]`=0, `shadow-Cartao`=0, enquanto `rounded-campo` ✓, `rounded-card` ✓ e `shadow-flutuante` ✓ existem como utilitários; Manrope 500–800 presente no HTML dos dois.
- [x] 4.5 checklist final SIM/NÃO com evidência — 13 itens do contrato:
      1. Escopo (backend/docker/.env/package.json/hooks/lib-api/types intocáveis)? **SIM** — diff explícito vazio (4.2).
      2. Raios proibidos (`rounded-3xl/[2rem]/[28px]/2xl`) zerados nos DOIS apps? **SIM** — src=0 e CSS compilado=0 (3.13c + 4.4).
      3. Cartao dentro de Cartao (incl. filhos de drawer/modal)? **NÃO** — 26 usos verificados, todos superfície única; modais e gavetas com 0 Cartao interno.
      4. Sombra só em drawer/modal (`shadow-flutuante` única)? **SIM** — vitrine: CarrinhoDrawer+2 modais+AvisoFlutuante (flutuante sobre a página por natureza); painel: 3 gavetas + 6 modais; nenhuma outra sombra em src de nenhum app.
      5. Gradiente decorativo / blur / blobs? **NÃO existem** — grep `bg-gradient|backdrop-blur` = 0 em classes (só comentários); radial-gradientes do body vitrine removidos na 1.2.
      6. Emoji como ícone/decoração/foto? **NÃO** — único lugar permitido: textos de WhatsApp/toast em `lib/mensagemWhats.ts` (intocável); `EMOJIS/GRADIENTES` apagados do `aparenciaProduto.ts` na 2.7.
      7. Alvos de toque ≥ 44px? **SIM** — `min-h-11` no ui/Botao (base, 2 apps), steppers `h-11 w-11`, BotaoAcao `h-11` no celular, AbasRodape ~50px, Busca `min-h-11`.
      8. Contrast AA (carameloForte+branco 6,15:1; branco nunca sobre caramelo/clareado; hover escurece)? **SIM** — `carameloEscuro #7A3A18` 8,59:1 definido; badges trocadas de `bg-caramelo` para `carameloForte` nos contadores; erro login em areia/carameloForte.
      9. Tipografia da marca (Playfair títulos tracking-tight, DM Sans corpo, Manrope tabular nos números)? **SIM** — Manrope 500–800 no HTML dos dois; `font-numero` com consumidores (16 arquivos painel; preços/contadores vitrine).
      10. lucide `strokeWidth={1.5}` em 100% dos ícones? **SIM** — varredura final: faltosos = 0 nos dois apps.
      11. Órfãos/dead code zerados (arquivos, keyframes, classes de config)? **SIM — pendência resolvida na rodada pós-auditoria, commit `6ef495b`** — apagados: IlustracaoBuscaVazia.tsx, keyframes `flutuar`, `entrar-suave`/`entrarSuave`, `pulo` (A2), tokens `shadow-suave` e `shadow-Cartao`; `fillRule` corrigido; **`Simbolo` escuro (vitrine Marca.tsx) apagado com "ok" da gestora** — `SimboloClaro` permanece em uso (Rodapé + Cabecalho).
      12. Builds + lint verdes nos três projetos? **SIM** — saída completa em 4.3 (e repetidos depois de cada clúster).
      13. Comportamento/aria preservados (tablist tarlist categoria, dialog/modal, aria-live aviso, AbortController, Escape, regras de cancelamento, ficha técnica, upload)? **SIM** — nenhum arquivo de lógica alterado; only className/JSX (ver desvios: prop `icone` de CartaoMetrica removida com único consumidor atualizado no mesmo commit; `App.tsx` vitrine 1 linha sem parafuso engrenagem, documentado desde 2.1).
- [x] 4.6 relatório final entregue na conversa ([PARAR 4]): o que mudou, o que não mudou de propósito, desvios documentados (prop icone/CartaoMetrica, 1 linha em App.tsx vitrine, MarcaLogin adotada em vez de apagada, 6 strokeWidth da vitrine corrigidos aqui), pendências (`Simbolo` vitrine; Exercício 1 de backend combinado para depois do redesign).

- **[PARAR 4] — fim do contrato de redesign; aguardando decisão sobre `Simbolo` e validação visual humana.**

---

## Rodada pós-auditoria — ajustes por feedback de uso real

A gestora usou os dois apps (celular na mão) e relatou 4 sintomas. Investigação encontrou causa específica em cada um — todos acabamentos, nenhum mudança de direção. Este registro é pós-contrato (a gestora aprovou cada item antes da execução).

- [x] A1. Login do admin: "o nome se esconde na cor da foto".
      ↳ causa: texto sobre `bg-tinta/70` translúcido — creme sobre a zona clara da foto competia com ela (o véu devia isso à teoria, não à foto real). Correção (`MarcaLogin.tsx`, commit `336189a`): **faixa sólida** `bg-tinta` ancorada na base da foto, véu removido; subtítulo `creme/70` → `creme/80`; contraste passa a ser determinístico (creme/tinta ≈ 15:1) sem depender de pixel ou tela.
- [x] A2. Vitrine: "o número da sacola aumenta quando adiciona — exagerado".
      ↳ causa: `Cabecalho.tsx` blasfemava `key={unidadesSacola}` (remontagem forçada) + `animate-[pulo_0.45s]` com **scale até 1.45** a cada adição. Correção (commit `f77ad00`): `key` e animação removidos (o balão "Adicionado à sacola" já confirma o doce); keyframe `pulo` apagado do `index.css` (único uso confirmado por grep).
- [x] A3. Vitrine: "a sacola não fica no canto e as letras formam uma escada".
      ↳ três defeitos no mesmo arquivo (`BarraSacola.tsx`, commit `4133b4e`): margem `px-3 pb-3` flutuava a barra 12px das bordas (correção: encostada de vez, largura total, sem raio — padrão sticky-CTA do comércio mobile; `active:scale` removida); o **total herdava 16px** do corpo ao lado de dois `text-sm` — a "escada" (correção: todas as partes `text-sm`, preço em `font-numero` Manrope); e uma **sombra arbitrária `shadow-[0_10px_30px...]`** que violava a regra da sombra única — escapou da auditoria 3.13/4.4 porque o grep detalhado de sombras cobriu só o painel e a vitrine foi conferida por lista de tokens (correção: sombra removida; comentário que a justificava — dizendo que `font-numero` não existia na vitrine, falso desde 1.1 — reescrito).
- [x] A4. Vitrine: "o nome Doce & Carinho tem espaço embaixo e desalinha quando a tela fica deitada".
      ↳ causa (`Cabecalho.tsx`): lockup eram duas linhas de bloco com métricas livres (Playfair transborda a caixa; subtítulo com linha-padrão de 150%×10px) e a pilha centrava inteira contra o disco — vão morto embaixo, mais visível em paisagem. Correção (commit `f77ad00`): coluna flexível com `leading-none` nas duas linhas e vão fixo úncio (`mt-1`); alinhamento determinístico nas duas orientações.
- [x] A5. Provas da rodada: build vitrine ✓ 6,22s (css 21,96 → 21,20 kB — pulo+sombra saíram do bundle), build painel ✓ 6,65s, lint dos 3 projetos exit 0; greps pós-fix: `shadow-[` na vitrine = **0**, `pulo` = 0 em código (só palavra em comentário); `git status` limpo após os 3 commits (`4133b4e`, `f77ad00`, `336189a`).
- [x] A6. Pendência do `Simbolo` resolvida: export escuro removido de `vitrine-cliente/src/components/Marca.tsx` (commit `6ef495b`, −13 linhas líquidas; uso era ZERO desde sempre — o símbolo só existe sobre fundo tinta/carameloForte, onde a versão escura era invisível). `SimboloClaro` permanece (Rodapé, Cabecalho). Provas: grep `Simbolo\b` na vitrine = 0; build vitrine ✓ 4,85s; lint dos 3 ✓ exit 0.
- [ ] A7. Validação visual humana dos pontos ajustados (barra, lockup deitado, login) — quem vê é a gestora.

### Segunda rodada de feedback (ajustes de alinhamento no celular)

- [x] A8. Cabeçalho vitrine: "a sacola está grudada ao nome / tudo no canto esquerdo".
      ↳ causa: no cellular não há elemento em flex-1 no meio — os únicos filhos amontoavam à esquerda (o `justify-center` só valia no desktop). Correção (`Cabecalho.tsx`, commit `00a1dab`): `justify-between` no container → nome à esquerda, botão da sacola pousa no canto direito; desktop inalterado (a busca flex-1 continua no meio).
- [x] A9. Destaques: "os três textos parecem divs empilhadas, não centralizam".
      ↳ causa: `flex flex-col` sem centralizar no celular — cada frase começava colada na esquerda com direita irregular. Correção (`Destaques.tsx`, commit `2fa776a`): `items-center text-center` no cellular; desktop mantém uma linha com `divide-x`.
- [x] A10. Fim da página: "sobrando um espaço no final" + rodapé em escada.
      ↳ duas causas: (1) a reserva para a barra fixa da sacola (`pb-24`) morava no root do `App.tsx` e virava uma faixa creme vazia DEPOIS do rodapé escuro quando havia itens — correção: a reserva virou `espacoParaSacola` DENTRO do rodapé (tinta preenche o vão, página termina contínua; commit `dc59e6e`); (2) as colunas do rodapé empilhavam à esquerda e o nome da marca era `hidden` abaixo de sm por largura chutada antiga — correção: tudo centra no celular (grid `text-center md:text-left`, marca visível com símbolo, commits idem). `App.tsx` também perdeu o `pb` condicional do root.
- [x] A11. Painel portrait: "a tela fica com scroll e corta partes" (relato: a fileira de pílulas dos Pedidos).
      ↳ causa exata: 6 pílulas de status não cabem em 360px e a fileira era `overflow-x-auto` — scroll contido que escondia metade das abas fora da tela. Varredura prévia das outras telas (Resumo, GraficoVendas, CartaoPedido, Produtos, Insumos, AbasRodape, gavetas) não achou estouro de página. Correção (`Pedidos.tsx`, commit `f91fa4e`): `flex flex-wrap` — as pílulas quebram em duas linhas, todas visíveis, zero rolagem.
- [x] A12. Provas: builds vitrine ✓ 5,31s (css 21,30 kB) e painel ✓ 7,08s; lint dos 3 ✓ exit 0; 4 commits (`00a1dab`, `2fa776a`, `dc59e6e`, `f91fa4e`); RGBA-árvore limpa e `PROJETO_CONSOLIDADO_PARA_FIGMA.txt` permanece APAGADO (decisão da gestora, não regenerar).
- [ ] A13. **Identificado, sem relato de uso e sem aprovação — não tocado:** a reserva da barra de abas do perfil no painel (`pb-[4.5rem]` em `EstruturaPainel.tsx:46`) ignora `env(safe-area-inset-bottom)`; em alguns celulares com barra de gestos as últimas linhas podem ficar atrás das abas. Correção disponível em 1 linha quando a gestora quiser (`pb-[calc(4.5rem+env(safe-area-inset-bottom))]`).

### Terceira rodada de feedback (rodapé, site "seco" e login)

- [x] A14. "O final (cardápio, trocar API) centralizado ficou bugado".
      ↳ o centralizar do A10 no celular não conversou com rodapé. Correção (`Rodape.tsx`, commit `6cea52f`): colunas de rodapé de volta ao alinhamento à ESQUERDA nas duas larguras — "rodapé se lê como cartão de endereço, e cartão de endereço é alinhado"; mantidas as correções de fundo do A10 (nome visível no celular, reserva dentro do tinta).
- [x] A15. "Site muito seco — vai ter Instagram da confeitaria e WhatsApp para contato".
      ↳ contato REAL no rodapé (`Rodape.tsx`, mesma edição): botão "WhatsApp da confeitaria" com `lerWhats()` — o MESMO número da finalização de pedidos (`lib/whatsLoja.ts` usa storage > `.env`; lib NÃO editada); sem número válido, o link não existe. **Instagram: o perfil ainda não existe — o bloco fica reservado no comentário para entrar no mesmo formato quando existir; link morto não entra (R10).** Link externo com `target="_blank" rel="noopener noreferrer"`, alvo `min-h-11` (44px).
- [x] A16. Login do gestor no celular em pé: "fica com scroll view".
      ↳ causa: `min-h-screen` (=100vh) conta a barra de endereço do celular — a página media mais que o visível e entregava rolagem fantasma mesmo cabendo tudo. Correção (`Entrar.tsx`, commit `dc44eae`): `min-h-dvh` (Tailwind 3.4 core)= viewport dinâmica. O root do painel (`EstruturaPainel.tsx:25`) tem o MESMO `100vh` — candidata à mesma correção de 1 classe quando confirmado com a gestora.
- [x] A17. Provas: builds vitrine ✓ 6,43s (css 21,26 kB) e painel ✓ 6,90s (css 24,18 kB); lint dos 3 ✓ exit 0; commits `6cea52f` e `dc44eae`; árvore limpa.

### Quarta rodada (lixeira no cardápio)

- [x] A18. "Lixeirinha ao lado do produto adicionado para remover".
      ↳ o item na GAVETA já tinha lixeira (`ItemSacola.tsx`, 44px); o que faltava era remover no PROPRIO card do cardápio. Correção (commit `05b8187`, 6 arquivos): `aoRemover` (o mesmo do drawer, `useCarrinho`) fio de App→SecaoCardapio→GradeCardapio→GrupoCategoria→docs; lixeira (Trash2 16px, strokeWidth 1.5, alvo 44px, hover areia) aparece SÓ quando há item: no card destaque ao lado do stepper (`do lado` literal); nos cards de 2 colunas do celular o stepper é largura total e não sobra coluna — a lixeira mora na linha do preço, sempre no mesmo canto. Ícone comum às duas posições; sem item não há lixeira (nada para remover). Provas: build vitrine ✓ 6,08s; lint 3 ✓ exit 0.

---

## REDESIGN DO PAINEL v2 contra o contrato novo (`prompt-redesign-painel-admin.md`)

Direção **"Papel e tinta, caramelo só na ação"**: sidebar escura sai; tela = texto sobre
creme, cor reservada para ação/estado; tabelas direto no fundo; estados com marcador +
texto; ícone só onde carrega função. Fileiro de clusters: C0 fundamentos → C1
navegação → C2 Resumo → C3 Pedidos → C4 Produtos/Categorias → C5 Insumos → C6
Registros/Perfil → C7 Entrar → C8 auditoria final. Escopo: `painel-admin/src/**`,
`painel-admin/tailwind.config.js` (3 tokens de estado) e este PROGRESSO.md.

**Linhas de base (2026-10-22, antes do C0):**
- build painel ✓ 6,75s; lint raiz dos 3 projetos exit 0; `git status` limpo (só os
  não rastreados `backend-estudo/` e `CONTEXTO_PROJETO (1).md`, FORA do escopo).
- `aria-live` em `src`: **0 ocorrências** (base registrada; o critério C1 exige manter).
- `rounded-full`: 20 arquivos (alvo C6: só `Avatar`, `ui/Badge`, `ContadorMenu`/chips).
- Regra 8 (ler antes): lidos por inteiro antes de qualquer edição até aqui: ui/Botao,
  ui/Entrada, ui/Badge, ui/Cartao, ui/Separator, ui/VazioLista, ui/EsqueletoTabela,
  ui/DiscoVazio, Avatar, ListaMaisVendidos, ListaBaixoEstoque, UltimosPedidos,
  GraficoVendas, EstadosProdutos, ModalConfirmacao, AcoesPedido, MenuMobile, e as
  páginas Resumo, Pedidos, Produtos, Insumos, Registros.
- Aria/roles anotados e preservados nas edições do C0: `aria-busy` (Botao,
  EsqueletoTabela, Resumo carregando), `aria-label` "Carregando" (EsqueletoTabela),
  `aria-hidden` dos ícones removidos junto com os ícones (nada ficou órfão),
  `aria-invalid` (Entrada, agora explícito quando há erro, herdando o resto via
  spread do chamador), label/htmlFor (Entrada idem), `role="alert"` erro dos
  modais (C6 futuro), AlertTriangle disk do ModalConfirmacao intocado (morre no
  C6), paginação/`aria-live` intocados.

### C0 — Fundamentos ✓

- [x] 3 tokens de estado no `tailwind.config.js`: `ok #2f6b3f` (6,0:1), `alerta
      #8a5a00` (5,6:1), `perigo #a32a2a` (6,8:1) — única edição fora de `src/`.
- [x] `ui/Botao` reescrito: variantes `primario`/`secundario`/`texto`/`perigo`
      (texto+borda) conforme 3.5 + variante `destrutivo` (bg-perigo+branco,
      p/ confirmar exclusão na 5.8). `font-bold`→`font-semibold`, `active:scale-95`
      removido (o spec do Botao não o tem), focus chain global caramelo aplicado.
      `variante="clara"` (9 usos) → `variante="secundario"`; `variante="perigo"`
      do AcoesPedido mantém o nome.
- [x] `ui/Entrada`: h-11, bg-white, borda `textoSuave/80` (borda pura não dá 3:1),
      texto `text-base` (sem zoom no iOS), foco com anel caramelo (offset omitido:
      campo vive sobre branco — decisão registrada), erro `border-perigo` +
      mensagem `text-perigo` aberta com a palavra "Erro:" e `aria-invalid`.
- [x] `ui/Badge` → **Estado** (marcador `size-2 rounded-full` na cor do tom +
      texto `text-sm font-medium` em tinta; exceções "Abaixo do mínimo"/"Cancelado"
      com o texto na cor do estado). Sem usos hoje — a adoção acontece nos clusters.
- [x] `ui/Cartao`: padrão = **seção sem moldura** (`border-t border-borda pt-4`).
      Prop `moldura` é a exceção explícita para superfície branca (modais). Prop
      `elevacao` removida (0 usos externos, verificados por grep).
- [x] `ui/Separator`: hairline `h-px bg-borda` (ponto dourado removido).
- [x] `ui/VazioLista`: linha de texto à esquerda (props `icone`/`tom` removidas;
      4 chamadores atualizados, frases preservadas).
- [x] `ui/EsqueletoTabela`: hairlines + blocos areia retos, sem raio/moldura;
      `aria-busy`/`aria-label` preservados.
- [x] `ui/DiscoVazio.tsx` **APAGADO**; os 4 consumidor com disco (Pedidos, Insumos,
      Registros, EstadosProdutos ×3) viraram texto à esquerda — frases mantidas,
      ícones e imports órfãos removidos.
- [x] `Avatar`: disco `bg-carameloForte font-bold branco` → `bg-areia + inicial
      Playfair em tinta` (caramelo é ação; avatar não pede ação). `rounded-full`
      mantido. `text-creme/60` do cargo mantém enquanto a sidebar escura existir —
      morre com ela no C1 (popover é branco: virará `textoSuave`).
- [x] Estados de página (Resumo/Pedidos/Insumos/Registros/EstadosProdutos):
      carregando/erro/vazio em texto à esquerda, sem cartão, sem ícone, sem
      centralização; botões de tentar de novo viram `variante="texto"`.
- [x] Varreduras: `font-extrabold`→`font-semibold` e `font-bold`→`font-semibold`
      em todo `src` (pesos ≤ 600), `text-center` removido nas 16 ocorrências,
      `variante="clara"`→`"secundario"`; comentário do MenuMobile reescrito para
      não citar classe de blur (o grep do C0 conta comentário).
- [x] **Critérios do C0:**
      `grep DiscoVazio` = 0 e arquivo inexistente ✓ · `bg-gradient|backdrop-blur|
      linearGradient` = 0 ✓ · `font-(bold|extrabold|black)` = 0 ✓ · `text-center` =
      0 ✓ · `ok:|alerta:|perigo:` no config = 3 linhas ✓ · build ✓ 6,75s · lint ✓ 0.
- Conteúdo transitório registrado: pills de período/status (C2/C3), Cartao em
  páginas com p-6 legados (C2–C5), `text-creme/60` do cargo (C1).

### C1 — Navegação ✓

- [x] Ler antes (regra 8): `MenuMobile.tsx`, `AbasRodape.tsx`, `EstruturaPainel.tsx`,
      `BarraLateral.tsx`, `ContadorMenu.tsx`, `Marca.tsx`, `lib/menu.ts` — aria/roles
      anotados antes: gaveta (`aria-label` "Abrir/Fechar o menu", portal, Esc),
      NavLinks com `end` e aria-current automático, contador com `aria-label`
      (frase "N pedidos pendentes" — preservada), nav "Atalhos"/"Navegação do painel".
- [x] **BarraLateral.tsx APAGADO** e **MenuMobile.tsx (gaveta) APAGADO**.
      Destino do conteúdo único: navegação → AbasRodape (celular) e BarraSuperior
      (desktop, texto sem ícone); perfil → PopoverConta "Meu perfil" (memesmo
      handler `aoAbrirPerfil` da EstruturaPainel); sair → PopoverConta "Sair"
      (mesmo `sair` de useAutenticacao); contador → ContadorMenu ao lado do rótulo
      "Pedidos" nas duas barras.
- [x] `BarraSuperior.tsx` NOVO: h-14, sticky no creme com hairline, wordmark
      Playfair (MarcaWordmark: símbolo ESCURO sobre creme — o claro somia,
      1,00:1; "&" em dourado) ligado ao Resumo; 5 links de texto com sublinhado
      2px caramelo colado na borda na aba ativa; contador chip
      `rounded-campo` junto a "Pedidos".
- [x] `PopoverConta.tsx` NOVO (mesma instância nos dois cabeçalhos): botão 44px
      `Avatar solo` + ChevronDown 16, `aria-expanded`/`aria-controls`; painel
      branco `w-64 rounded-card` com nome+cargo, hairline, "Meu perfil"/"Sair"
      em `min-h-11` alinhados à esquerda; fecha por Esc, clique fora e troca de
      rota; Esc e clique-fora devolvem foco ao botão.
- [x] `AbasRodape.tsx`: 5 abas `min-h-14` com ícone 20px (1.5) acima do rótulo
      SEMPRE visível `text-xs`; ativa = tinta semibold + traço `h-0.5 bg-caramelo`
      no topo da aba (inset-x-2); sem pílula, sem fundo; contador ao lado do
      rótulo (não mais sobreposto ao ícone) — `ContadorSobreposto` removido.
- [x] `ContadorMenu.tsx`: chip `rounded-campo` (spec 4.1) em vez de `rounded-full`,
      fundo carameloForte + branco kept (6,15:1), Manrope tabular.
- [x] `EstruturaPainel.tsx`: sidebar/gaveta fora; desktop = BarraSuperior +
      `max-w-5xl`; celular = header wordmark+conta, `pb-24` para as abas;
      `min-h-dvh` (a pendência A13/A16 de 100vh ghost aqui chegou com o
      reescrever do arquivo — root não corta em telas de celular).
- [x] `Avatar.tsx`: prop `solo` (só disco, sem nome) para o botão de conta;
      cargo `text-creme/60` → `text-textoSuave` (só contextos claros agora).
- [x] **Critérios C1:** `grep BarraLateral src` = 0 e arquivo inexistente ✓ ·
      `grep bg-tinta` nas duas barras = 0 ✓ · `grep aria-current` (BarraSuperior +
      AbasRodape) = 2 atributos + comentário ✓ · `aria-live` em components = 0
      (igual à base registrada) ✓ · build ✓ 3,85s · lint ✓ 0.
- Obs.: "região aria-live atual" citada na 4.1 não existe no painel (baso 0) —
  mantida a oferta de texto para leitor de tela (aria-label do chip), igual ao
  estado anterior; nada de aria foi removido.

### C2 — Resumo ✓

- [x] Ler antes (regra 8): Resumo, CabecalhoSecao, CartaoMetrica, GraficoVendas,
      ListaMaisVendidos, ListaBaixoEstoque, UltimosPedidos (+ lib/periodo,
      lib/formatarData, lib/pedido, types). aria/roles anotados: período era
      `role="group"` + `aria-pressed` (PRESERVADO — o spec falava em
      tablist/aria-selected, mas o "atual" do Resumo é group/pressed; não se
      inventou o outro), gráfico `role="img"` + `aria-label` com dia·valor
      (preservado, agora no svg), estados `aria-busy`/`aria-label`.
- [x] Cabeçalho: data virou a ÚNICA sobretítulo (exceção da 3.3), saudação
      Playfair 2xl md:3xl semibold; botões "Ver pedidos"/"Ver estoque"
      REMOVIDOS (a fila inteira leva via Link com os MESMOS destinos).
- [x] Período: controle de texto — ativo semibold tinta + 2px caramelo,
      inativo textoSuave, `min-h-11`; alinhado à direita no desktop, abaixo
      da saudação no celular. `role="group"`/`aria-pressed` intocados.
- [x] **CartaoMetrica agora é a FILA** ("Precisa de você agora"): 4 linhas de
      Link (pedidos·pedidos·pedidos·insumos), rótulo font-medium + descrição
      textoSuave à esquerda, número Manrope xl semibold tabular à direita,
      hairline entre linhas, hover areia/50; cores: pendentes>0 carameloForte,
      estoque>0 alerta, zero textoSuave. Nome do arquivo mantém (pedido da spec).
- [x] Layout 5/7 (md:grid-cols-12): fila col-span-5 (+ListaBaixoEstoque quando
      >0), vendas+mais vendidos col-span-7; celular: fila → vendas → mais
      vendidos. `space-y-10 md:space-y-12` em vez de Separators
      (usos do Resumo removidos; componente primitive segue definido).
- [x] Vendas no período: rótulo-caixa + número `text-4xl font-numero semibold
      tabular` + "N pedidos · melhor dia X" textoSuave — todas as partes que
      estavam DENTO do GraficoVendas subiram para a página (número grande em
      serifada aposentado).
- [x] GraficoVendas virou SVG próprio: barras `fill-textoSuave`, só a barra
      do dia mais alto `fill-caramelo` (rho único por `findIndex` — empates
      não multiplicam o dourado), 3 linhas-guia `stroke-borda`
      `non-scaling-stroke`, sem `linearGradient`, rótulos X (primeiro/meio/
      último) Manrope tabular textoSuave; `role="img"` + aria-label idênticos
      ao anterior; sem lógica de hover nova (a spec não pede estado novo).
- [x] Mais vendidos: título de seção DM Sans (Trophy REMOVIDO), lista
      numerada hairline (posição tabular textoSuave · nome · volume à
      direita); barras arredondadas e disco de número eliminados.
- [x] Estoque baixo: linhas "nome — restam N un · mín. M un" (restam em
      alerta, mínimo textoSuave); `aria-label` da lista para leitor de tela;
      não mais aloca bloco próprio quando zero.
- [x] Últimos pedidos: linha compacta da 5.2 (cliente+total / Estado+quando),
      Estado (marcador+texto) via TOM_ESTADO novo em lib/pedido.ts; disco
      redondo e pílula de status removidos; "ver todos" link de texto.
- [x] CabecalhoSecao perdeu a sobretítulo (rotulo) — Insumos/Produtos/Registros
      atualizados (o `rotulo` do BuscaComContagem é outro prop, de aria do
      campo, e ficou); ModalConfirmacao: disco de ícone removido (grep do
      clúster), título `text-base font-semibold` à esquerda, destrutivo =
      variante "destrutivo" (5.8).
- [x] **Critérios C2:** `grid-cols-4` = 0 nos dois arquivos ✓ ·
      `Trophy|AlertTriangle|TriangleAlert` = 0 em src ✓ · `tabular-nums` ≥2 ✓ ·
      build ✓ 4,40s · lint ✓ 0.

### C3 — Pedidos ✓

- [x] Ler antes (regra 8): Pedidos, TabelaPedidos, CartaoPedido, DrawerPedido,
      CabecalhoDrawer, AcoesPedido, ItensPedido. aria/roles anotados: página
      tinha `role="tablist"` + `aria-selected` por aba (PRESERVADOS íntegros),
      drawer `role="dialog"`/`aria-modal`/`aria-label` + Esc (preservados),
      botões de linha reais (`onClick` no tr do desktop como antes), título
      de cancelamento "Cancela e estorna o estoque" (preservado como `title`).
- [x] Página: sobretítulo "operaação" fora (CabecalhoSecao); abas viraram
      TEXTO com contagem Manrope tabular textoSuave — ativa semibold + traço
      2px caramelo, pilula `rounded-full`/`bg-tinta`/`active:scale-95`
      eliminados; celular rola na horizontal com alvos de 44px (`-mx-4 px-4`
      para a primeira aba não colar na borda — registro: contradiz o A1 de
      duas linhas, decisão da spec nova vence, sem reabrir).
- [x] TabelaPedidos: ledger SEM caixa (Cartao fora), header rótulo-caixa +
      hairline, linhas hover areia/50; colunas Pedido(# + nome) · Total
      (text-right tabular) · Status (ESTADO marcador+texto) · Quando
      (text-right tabular textoSuave); whatsapp saiu da tabela (continua no
      drawer, como na linha da 5.2).
- [x] CartaoPedido: linhas min-h-16 com border-b (1ª: cliente + total
      tabular; 2ª: Estado + quando textoSuave), sem cartão branco, sem
      seta decorativa (ArrowRight fora da lista de ícones da 4.4).
- [x] DrawerPedido: `bg-[#fffdf9]` → bg-white; celular FULL SCREEN
      (`inset-0` sem raio), desktop painel à direita `max-w-md rounded-l-card
      border-l`; FOCA no fluxo: nova LINHA de fluxo textual "Pendente → Em
      preparo → Pronto → Entregue" (atual semibold + 2px caramelo, resto
      textoSuave; cancelado é terminador e fica de fora do tracinho),
      spinner mantido como feedback funcional alinhado à esquerda.
- [x] CabecalhoDrawer: título DM Sans text-lg semibold + Estado (pílula
      redonda fora); celular "Voltar" (texto) à esquerda no lugar do X;
      desktop X 44×44 (h-11 w-11 — os 40px antes ficavam abaixo do mínimo).
- [x] ItensPedido: Total é a ÚLTIMA LINHA do ledger (sem faixa bg-tinta):
      "Total" semibold à esquerda, valor Manrope text-lg semibold tabular à
      direita; select de pagamento no padrão de campo da 3.5
      (h-11, bg-white, borda textoSuave/80, foco anel caramelo, texto-base).
- [x] AcoesPedido: "Cancelar pedido" à esquerda em `variante="perigo"`
      (texto/borda), primário `flex-1` à direita com o rótulo da própria
      spec: "Avançar para Em preparo"; ícones Check/Ban removidos (a palavra
      basta — 4.4); handlers/confirmacao do ModalConfirmacao intocados.
- [x] `lib/pedido.ts`: TONS + `tomStatus` APAGADOS — eram as últimas classes
      da paleta padrão do Tailwind em painel (amber/blue/violet/green/stone):
      grep de paleta em `src` agora = 0 (critério C8 adiantado com higiene).
- [x] **Critérios C3:** `rounded-full` nos 3 arquivos = 0 ✓ ·
      `role="dialog"` no DrawerPedido = 1 (preservado) ✓ · `text-right` na
      TabelaPedidos = 4 ✓ · build ✓ 4,28s · lint ✓ 0.

### C4 — Produtos/Categorias ✓

- [x] Ler antes (regra 8): Produtos, TabelaProdutos, CartaoProduto, PainelCategorias,
      ModalCategoria, ModalProduto, ModaisProduto/PainelDeProduto (composição),
      EditorFicha, CampoImagem, Busca, BuscaComContagem, ui/AcoesLinha,
      ui/BotaoEscolher. aria/roles anotados: PainelCategorias `role="dialog"`/
      `aria-modal` + Esc (preservados) e `aria-pressed` na linha de filtro
      (preservado); ModalCategoria e ModalProduto `role="dialog"`/`aria-modal`/
      `aria-label` preservados; BotaoAcao `aria-label`+`title` preservados;
      CampoImagem `role="alert"` e input file sr-only preservados; Busca
      `aria-label` + Esc limpa (preservados); `disabled`/`aria-busy` nos fluxos
      salvando preservados.
- [x] TabelaProdutos: LEDGER sem moldura; thumb 40×40 `rounded-campo`; sem foto
      = tile areia com INICIAL Playfair textoSuave (CakeSlice fora); colunas
      Produto (nome medium + categoria textoSuave abaixo) · Preço (text-right
      tabular tinta) · Na vitrine (ESTADO Visível/Oculto, acao/suave) · Ações;
      desktop = LINKS DE TEXTO "Editar · Ocultar/Mostrar · Excluir" com os
      MESMOS handlers, Excluir hover text-perigo; spinner no link quando a
      troca roda.
- [x] CartaoProduto: LINHA min-h-16 (foto 40, nome+categoria, preço à direita
      tabular); linha toda abre o editor (mesmo handler do Editar); Power/
      Trash2 44×44 com aria-label; "Oculto" como segunda linha de texto só
      quando oculto (Estado tom suave); cartão branco/FaixaAcoes fora.
- [x] PainelCategorias: lista como ledger — hairline, nome à esquerda,
      contagem Manrope tabular à direita, ações "Editar"/"Excluir" em TEXTO
      (Tag/Plus/Trash2 fora); ativa semibold + traço 2px caramelo (sem pílula);
      header no padrão do drawer (Voltar texto no celular, X 44px desktop);
      footer com primario "Nova categoria" + aviso.
- [x] ModalCategoria: título DM Sans text-lg semibold; X 44px sem moldura;
      erro "Erro:" + text-perigo (5.8); entradas no padrão da 3.5.
- [x] ModalProduto: CELULAR tela cheia com header sticky "Cancelar" (texto,
      esquerda) · título · "Salvar" (texto carameloForte, direita, submit);
      DESKTOP modal max-w-xl bg-white rounded-card shadow-flutuante com X 44px
      e primário no rodapé; rótulos em caixa normal; select/textarea no padrão
      de campo; erro "Erro:" + text-perigo; ícones Save/X de rodapé fora.
- [x] EditorFicha: linhas hairline "insumo · quantidade (tabular) · unidade";
      campos h-11 padrão 3.5; lixeira = ação de linha; "Adicionar ingrediente"
      como Botao texto (Plus fora).
- [x] CampoImagem: prévia 96×96 rounded-campo (sem ícone grande — "sem foto"
      em texto); área de upload = BotaoEscolher retangular border-dashed
      textoSuave/80 com "Escolher foto" (Upload fora, spinner fica); "Remover"
      vira Botao variante perigo (Trash2 fora); erro "Erro:" + text-perigo.
- [x] Busca: campo único h-11 sem moldura, borda textoSuave/80, texto-base
      (16px, sem zoom iOS), foco anel caramelo; X do limpar agora rounded-campo
      e área 11×11; lupa continua a ÚNICA com função registrada.
- [x] BuscaComContagem: contador "N de M" text-sm Manrope tabular textoSuave;
      linha flex-wrap (sem sm: no layout — quebra natural).
- [x] Página: cabeçalho "Produtos" com Categorias secundario + "Novo produto"
      primario SEM ícones (flex-1 no celular); pílula do filtro ativo virou
      TEXTO (nome medium + contagem tabular) com "Ver todos" (Botao texto + X);
      erro de página = "Erro:" text-perigo à esquerda + Botao texto "Tentar de
      novo" (Cartao/Wrench/RotateCcw fora).
- [x] ui/AcoesLinha: SeloAtivo APAGADO (consumidores viraram Estado);
      BotaoAcao agora só 44×44 (uso exclusivo no celular).
- [x] **Critérios C4:** `text-right` na TabelaProdutos = 3 ✓ · `strokeWidth`
      nos 2 arquivos = tudo 1,5 ✓ · `rounded-card` nos 2 = 0 ✓ · "Abaixo do
      mínimo" preservado ✓ · build ✓ 4,82s · lint ✓ 0 · proibidos globais
      (gradiente/blur/peso>600/text-center/rounded-[) = 0 ✓.
- [i] Desvios/pendências: (1) CampoImagem mantém `rounded-full` ÚNICO na prévia
      circular do perfil (todo legítimo: foto do avatar; arquivo fora do trio
      Avatar/Badge/ContadorMenu — registrado de propósito); (2) TabelaInsumos
      ainda tem pílula rounded-full/colorida — morre no C5; (3) Pedidos
      (C3) diz "Tentar novamente" e a spec quer "Tentar de novo" — alinha no
      C8; (4) prop `proporcao` do CampoImagem só decide o modo redondo do
      avatar (JanelaPerfil, C6) — a proporção 4/3 do card não existe mais
      (prévia passou a ser 96×96 fixa).

### C5 — Insumos ✓

- [x] Ler antes (regra 8): Insumos, TabelaInsumos, ModalInsumo, ModaisInsumo
      (composição), ModalMovimentacao, BuscaComContagem, ui/Entrada,
      ui/AcoesLinha. aria/roles anotados: ModalInsumo/ModalMovimentacao
      `role="dialog"`/`aria-modal`/`aria-label` (preservados); ModalConfirmacao
      continua assumindo a exclusão (via ModaisInsumo); Busca mantém
      `aria-label` + Esc; Entrada mantém `aria-invalid` + "Erro:"; a escolha
      de tipo GANHOU `role="group"` + `aria-pressed` por botão (não existia —
      a spec pediu "manter aria-pressed/role atuais", mas o tipo era um
      select; registro do novo controle abaixo).
- [x] TabelaInsumos: ledger sem moldura (rounded-card/borda/branco fora);
      colunas Insumo (nome medium + "mín. N un" textoSuave) · Estoque
      (text-right tabular; semibold quando abaixo do mínimo) · Custo/un.
      (text-right tabular) · Situação (ESTADO: "Normal" textoSuave /
      "Abaixo do mínimo" marcador alerta — texto na própria linha, confeito
      visual calculado dos campos da linha) · Ações; linha NÃO tingida.
- [x] Ações desktop: LINKS DE TEXTO "Movimentar · Editar · Excluir" — o
      ícone de caixa ambíguo morre; Excluir hover text-perigo; mesmos
      handlers. Celular: 3 ícones 44×44 com aria-label "Movimentar estoque
      de {nome}" / "Editar {nome}" / "Excluir {nome}", strokeWidth 1.5.
- [x] Celular: linha min-h-16 (nome+mín. à esquerda, estoque à direita
      tabular; 2ª linha Situação à esquerda + custo/un. textoSuave à
      direita); pílula `rounded-full` do SeloSaldo morreu com o selo;
      CartaoLinha/FaixaAcoes APAGADOS de ui/AcoesLinha (últimos usos eram
      aqui).
- [x] BuscaComContagem: contador tota sobre para "{N} {palavra}" e, buscando,
      "{encontrados} de {total} {palavra}" (nova prop `palavra` — Insumos
      "insumos", Produtos "produtos"); Manrope tabular textoSuave.
- [x] ModalInsumo/ModalMovimentacao: padrão tela cheia do celular (header
      sticky "Cancelar" · título · ação de texto carameloForte à direita) +
      modal branco rounded-card no desktop com X 44px e primário de rodapé;
      campos de número com `font-numero tabular-nums`; erro "Erro:" +
      text-perigo; ícones Save/PackagePlus fora.
- [x] ModalMovimentacao: fileira segmentada (borda textoSuave/80, extremos
      rounded-campo, selecionado bg-tinta text-branco, texto DO TIPO sempre
      visível); quantidade text-base tabular; título "Movimentar estoque" +
      "{nome} · Atual: N un".
- [x] **Critérios C5:** "Abaixo do mínimo" na tabela = 3 ✓ · `text-right` =
      5 ≥ 3 ✓ · "Normal" = 3 ≥ 1 ✓ · `rounded-full` em src agora CAI PARA 3
      arquivos legítimos (Badge marcador; Avatar; CampoImagem prévia
      circular do perfil — desvio registrado no C4; a pílula do insumo
      saiu) ✓ · build ✓ 4,03s · lint ✓ 0.
- [i] **Fora do escopo — registrado a pedido da spec 5.4:** "Custo/un." usa
      ponto decimal ("R$ 0.05"), o que achata custos por grama (0,012 →
      "0.01"). Formatação provavelmente em `lib/`; NÃO corrigido no redesign
      — decisão da gestora. (Keep per spec.)
- [i] Desvios: (1) spec pedia 2 segmentos "Entrada/Saída"; API grava
      entrada/perda/ajuste com trilha auditada — fileira com 3 segmentos
      ("Entrada · Perda · Ajuste") e primário nomeando a escolha
      ("Registrar entrada/perda/ajuste"); achatar apagaria dados de auditoria.
      (2) Pendência mantida: Pedidos diz "Tentar novamente" (C3) — alinhar
      para "Tentar de novo" no C8.

### C6 — Registros e Perfil ✓

- [x] Ler antes (regra 8): Registros, LinhaRegistro, JanelaPerfil,
      FormularioSenha, Avatar, ModalConfirmacao, AlertaAcao, PopoverConta
      (para o handler do "Sair"). aria/roles anotados: JanelaPerfil
      `role="dialog"`/`aria-modal` + clique fora (preservados);
      FormularioSenha `aria-pressed` do mostrar-senha (preservado, o ícone de
      olho saiu — a palavra basta); ModalConfirmacao `role="alertdialog"` +
      `aria-label` (preservados); overlay de perfil mantém fechar por clique
      fora com stopPropagation no cartão.
- [x] LinhaRegistro: formato LOG da 5.5 — linha de lista (li, hairline):
      HORA w-16 tabular textoSuave · descrição (quem + o quê) com "por {quem}"
      textoSuave · ANTES → DEPOIS à direita (valores Manrope tabular; rótulos
      "antes"/"depois" text-xs textoSuave; velho line-through textoSuave,
      novo tinta semibold). Ícone de ação e "ver o que mudou" SAÍRAM: o diff
      passa a ocupar a coluna própria da spec, sempre à vista — sem
      informação recolhida (aria-expanded/aria-controls não têm mais dono;
      comportamento de "detalhe escondido" foi aposentado PELO FORMATO novo,
      continham os mesmos dados). Multi-campo = pares empilhados; criação
      mostra campos nascendo do (vazio). Coluna separada de "Quem" (e a linha
      "por X" que se escondia no celular) viraram o textoSuave sob a
      descrição, como na spec (exemplo da própria spec: "Gestora alterou o
      preço...").
- [x] Registros: título "Histórico" (rótulo do menu); Agrupamento POR DIA com
      função local PURA no render (não muda busca/ordenação): "Hoje",
      "Ontem", "19 de outubro" (ano aparece só quando difere do atual) em
      rótulo-caixa; lista divide-y; vazio = UMA linha de texto; erro = "Erro:"
      + text-perigo + "Tentar de novo"; Atualizar sem ícone;
      paginação sem chevrons (ícones fora da lista fechada do 4.4) e
      contador "1–25 de 300" Manrope tabular.
- [x] JanelaPerfil (5.7): dialog max-w-md rounded-card (celular tela cheia);
      topo = Avatar 56px (tamanho "lg" NOVO no Avatar) + nome text-lg
      semibold + cargo textoSuave (sobretítulo "conta" e título Playfair
      fora); dados da conta em <dl> com hairline (Nome/Email COM os campos
      editáveis como valor à direita + Cargo read-only da sessão;
      comportamento de edição e botão "Salvar dados" preservados);
      "Sair" no rodapé como TEXTO em perigo — mesmo handler do
      popover-de-conta (o sair() do useAutenticacao).
- [x] FormularioSenha: seção "Alterar senha" DM Sans; campos empilhados;
      regra "Mínimo de 6 caracteres." em text-sm textoSuave; botão primario
      "Salvar nova senha"; toggle mostrar-senha SEM ícone de olho (palavra +
      aria-pressed).
- [x] ModalConfirmacao (5.8): botões em COLUNA no celular com o destrutivo em
      cima (flex-col-reverse) e à direita no desktop; erro "Erro:" +
      text-perigo; destrutivo bg-perigo/branco mantido.
- [x] AlertaAcao (5.8): de faixa bg-areia para TEXTO "Erro:" + text-perigo
      (role="alert" preservado) — a linha de cima das telas de lista.
- [x] lib/aparenciaRegistro.ts APAGADO (consumer único morreu com o ícone);
      ROTULO_ACAO fica em types/ (types intocáveis).
- [x] CampoImagem: nova prop opcional `aoRemover` — o Remover embutido, no
      perfil, chama o handler que manda `null` (o API do perfil trata null
      como "remover"; antes havia botão dedicado fora do campo). Comportamento
      preservado; ModalProduto segue com aoMudar("").
- [x] **Critérios C6:** `line-through` em LinhaRegistro = 1 ✓ · `<dl` no
      JanelaPerfil = 1 ✓ · `text-center` em src = 0 ✓ · build ✓ 5,61s ·
      lint ✓ 0.
- [i] Desvio (mantém-se): `rounded-full` em src = Avatar (foto/inicial),
      ui/Badge (marcador de estado) e CampoImagem (prévia CIRCULAR do avatar
      no perfil — mesmo propósito da foto de avatar). O critério C6 lista só
      Avatar/Badge/ContadorMenu: a prévia circular é extensão legítima do
      propósito "círculo = foto de avatar"; ContadorMenu ainda não tem chips
      (chegam no popover? não — vistos acima: popover sem contador; contorno
      registrado para o C8).

### C7 — Entrar ✓

- [x] Ler antes (regra 8): Entrar, MarcaLogin, MarcaWordmark. aria/roles
      anotados: `role="alert"` do erro (preservado, agora ABAIXO do botão);
      anchor real da vitrine preservado; autocomplete/labels idem (5.6
      manda preservar rótulos/autocomplete/aria — verificados: username,
      current-password, alert).
- [x] MarcaLogin: SEM foto, SEM faixa translúcida — desktop = coluna `bg-areia`
      plana com lockup no CANTO INFERIOR ESQUERDO (flex items-end p-12):
      wordmark Playfair grande (MarcaWordmark ganhou `grande`: text-4xl) +
      frase textoSuave "Painel da confeitaria"; celular = faixa areia no topo
      à esquerda (compacta). aria-hidden mantido (compacta lida; desktop
      decorativa como antes).
- [x] Entrar: título Playfair text-2xl à esquerda (era 3xl); formulário
      max-w-sm encostado à esquerda no desktop (não é caixa centrada); botão
      primário "Entrar" largura total SEM ícone (LogIn fora); erro "Erro:" +
      text-perigo ABAIXO do botão (Lock fora); rodapé do formulário à
      esquerda (items-start), "Voltar para a vitrine" como texto simples.
- [x] **Critérios C7:** `md:grid-cols-2` = 1 ✓ · `text-center` nos 2 arquivos
      = 0 ✓ · `bg-gradient` = 0 ✓ · build ✓ 5,36s (fotos fora do bundle) ·
      lint ✓ 0.
- [i] `min-h-screen` do 5.6 continua `min-h-dvh` (conserto de rolagem
      fantasma do celular — A13 registrado).

### C8 — Auditoria final ✓

Sweeps executados sobre `painel-admin/src`:

- [x] `rounded-3xl|rounded-2xl|rounded-[` → **0**
- [x] `bg-gradient|backdrop-blur` → **0**
- [x] `strokeWidth` → **todas as ocorrências = 1.5**
- [x] `shadow-(sm|md|lg|xl|2xl|inner)` → **0**; `shadow-flutuante` presente
      em 9 arquivos, TODOS drawer/modal/popover (DrawerPedido,
      PainelCategorias, JanelaPerfil, ModalProduto, ModalInsumo,
      ModalMovimentacao, ModalCategoria, ModalConfirmacao, PopoverConta).
- [x] Paleta padrão do Tailwind (purple|violet|indigo|blue|sky|fuchsia|pink|
      slate|gray|zinc|neutral|stone) → **0** (morreu com tomStatus no C3;
      confirmado).
- [x] Emojis (range 1F300–1FAFF / 2600–27BF) → **0**
- [x] `sm:` → **0** (Resto: pages gap → `md:gap-5`; ModalConfirmacao e
      CampoImagem quebras passam a `md:`). `lg:`/`xl:` → 0 ocorrência fora de
      largura máxima (`max-w-md/xl` etc.).
- [x] "Tentar novamente" → "Tentar de novo" (Resumo, Pedidos) — alinhado ao
      padrão da spec nos 3 lugares.
- [x] Fora de `painel-admin/src` no `git diff 4166287..HEAD`: **somente**
      `painel-admin/tailwind.config.js` e `PROGRESSO.md` ✓ (mandato da seção
      1 respeitado). Não rastreados mantidos: `CONTEXTO_PROJETO (1).md`,
      `backend-estudo/`, `prompt-redesign-painel-admin.md`.
- [x] `npm run build` ✓ 5,54s · lint da raiz ✓ 0. CSS final 22,36 kB
      (partiu de ~28 kB do 4166287: fotos de login, libs de cor e paleta
      padrão fora do bundle).

**Checklist da seção 7 (evidências):**

1. Sidebar escura/coluna fixa? **NÃO** — `BarraLateral` = 0 em src (C1).
2. Desktop via barra superior textuais com aba ativa sublinhada em caramelo
   e contadores nas ABAS de Pedidos? **SIM** (C1/C3; contagem tabular por
   status).
3. Celular = 5 abas `min-h-14`, rótulo visível, ativa = semibold + traço de
   2px, sem pílula preenchida? **SIM** (C1).
4. Fileira de 4 cartões no Resumo? **NÃO** — fila de linhas clicáveis (C2).
5. Números (vendas, total, estoque, preço) em Manrope tabular, alinhados à
   direita nas tabelas? **SIM** — `tabular-nums` em 37 locais; tabelas com
   `text-right` nas colunas numéricas (Pedidos/Produtos/Insumos).
6. Cartão com sombra/moldura fora de drawer/modal/popover? **NÃO** — Cartao
   default é seção sem moldura (hairline); sombras só nos 9 arquivos de
   overlay.
7. Estados com marcador **e** texto (pedido, Visível/Oculto, Abaixo do
   mínimo, Situação)? **SIM** — componente Estado (Badge.tsx) + TOM_ESTADO;
   9 arquivos consumidores.
8. Caramelo como texto pequeno? **NÃO** — `text-xs/text-[10..13px]` com
   carameloForte = 0; caramelo fica em: ação/texto dos botões (14px
   mínimos), traço de foco/ativas, barra do gráfico, hover.
9. Estados vazios só texto à esquerda, sem disco/ícone/centralização?
   **SIM** (`text-center` = 0; DiscoVazio apagado no C0).
10. `rounded-3xl|2xl|[` = 0; `bg-gradient|backdrop-blur` = 0; strokeWidth
    tudo 1.5? **SIM/SIM/SIM**.
11. `aria-*`/`role` preservados e conferidos arquivo a arquivo?
    **SIM** — anotações por clúster acima (C3 tablist/aria-selected;
    drawer/dialog em DrawerPedido, PainelCategorias, JanelaPerfil,
    ModalInsumo, ModalMovimentacao, ModalCategoria, ModalProduto;
    alertdialog no ModalConfirmacao; alert/status nos estados; Esc e foco).
12. build + lint passam? **SIM** (evidências acima).
13. Algo fora de `painel-admin/src` tocado (além de tailwind.config.js e
    PROGRESSO.md)? **NÃO** (diff acima).

**Desvio de propósito (declarado):** `rounded-full` sobrevive EM:
- `ui/Badge.tsx` — marcador de estado (permitido pela própria regra);
- `Avatar.tsx` — foto do gestor (permitido);
- `CampoImagem.tsx` — prévia CIRCULAR do avatar no perfil (proporcao=1):
  círculo pelo MESMO motivo do Avatar (foto de avatar), arquivo fora do trio
  do critério C6 — mantido e justificado a cada ocasião; não é "redondo por
  estilo". `-full` NÃO ocorre mais em nenhum outro arquivo.

Fim do redesign visual: clústeres C0–C7 commitados individualmente; este é o
commit da auditoria C8.

### C8.1 — Polimento de ação (pedido pós-auditoria) ✓

Pedido do uso: o estilo gostado ficou "seco" demais na hora de AGIR — botões
como "Avançar/Registrar" e os links "Movimentar · Editar · Excluir" pareciam
rótulos. Polimento mantendo a linguagem (sem gradiente, peso ≤600, raio 12px,
caramelo = ação):

- [x] Botao: corpo TÁTIL — primário com "borda de corte" na base
      (border-b-2 carameloEscuro, como a borda assada de um biscoito);
      TODAS as variantes descem 1px no aperto (active:translate-y-px) e
      desativam o movimento quando disabled; secundário ganhou fundo branco
      + hover areia com borda mais visível; variante texto troca underline
      por corpo (areia no hover) — alvo de dedo mais claro.
- [x] Ações de linha (TabelaProdutos/TabelaInsumos/PainelCategorias): links
      viraram CHIPS fantasmas — px-2.5, raio de campo, borda transparente que
      acorda no hover (borda + areia); Excluir acorda em PERIGO (borda + fundo
      perigo/10) — destruição pede sinal, não confiança.
- [x] AcoesPedido: "Avançar para Em preparo" ganhou seta à direita
      (ArrowRight 17×1.5) — ícone com FUNÇÃO registrada: direção do fluxo do
      pedido (desvio consciente da lista fechada do 4.4, pedido direto do uso;
      registrado aqui).
- [x] Modais/drawer aproveitam o sistema (Registrar entrada/perda/ajuste,
      Nova categoria, Salvar/Cadastrar, Salvar nova senha, Confirmar) —
      sem mudar handlers.
- [x] Re-sweep do C8: rounded-[3xl|2xl|[ = 0 · gradiente/blur = 0 · sombras
      padrão = 0 · paleta padrão = 0 · sm:/lg:/text-center/font-bold = 0 ·
      strokeWidth intacto · build ✓ 4,75s · lint ✓ 0.

### C8.2 — Olhinho de senha (pedido do uso pós-auditoria) ✓

- [x] Entrar: olhinho Eye/EyeOff 16 strokeWidth 1.5 DENTRO do campo de senha
      (nova prop opcional `acessorio` em ui/Entrada: o campo reserva pr-12 e
      pousa o acessório na margem direita). Alvo 44×44 (h-full w-11),
      aria-pressed + aria-label "Mostrar/Ocultar senha", anel caramelo no
      foco; type alterna password/text; o Enter do formulário continua
      submetendo (button type="button").
- [x] FormularioSenha: o toggle existente (palavra) ganhou o MESMO ícone ao
      lado — mostrar/ocultar fica reconhecível nos dois lugares; palavras
      mantidas (nome da ação legível sem decodificar ícone) + aria-pressed
      preservado.
- [x] Desvio registrado: ícone de revelação entra na lista fechada do 4.4
      com FUNÇÃO (revelar senha), por pedido direto do uso — o C7 não criou
      porque a spec mandava "não criar se não houver"; o uso decidiu que
      existe.
- [x] aria/handlers preservados (regra 8): role="alert" do erro, aria-busy
      do Botao, autoComplete "current-password".
- [x] Re-sweep C8: rounded-[3xl|2xl|[ = 0 · gradiente/blur = 0 · sombras
      padrão = 0 · paleta padrão = 0 · sm:/lg:/text-center/font-bold = 0 ·
      build ✓ 4,93s (CSS 24,00 kB) · lint ✓ 0.

## REDESIGN DA VITRINE v2 contra o contrato novo (`prompt-redesign-vitrine-cardapio-profissional.md`)

Direção: **"Papel e tinta, caramelo no preço e na compra"** + cardápio digital
profissional. Branch `redesign-vitrine` criada a partir do fim do painel
(HEAD `caf8170`). Escopo fechado: `vitrine-cliente/src/**` + 3 tokens de
estado em `tailwind.config.js` + este diário. Backend, docker-compose, .env,
package.json, index.html, public/, `painel-admin/**`, `hooks/**`, `lib/**` e
`types/**` intocados — texto de WhatsApp (`mensagemWhats`/`whatsLoja`),
GARANTIAS (Destaques.tsx) e "Finalizar no WhatsApp" preservados ao pé da
letra; `useCarrinho`/`usePedidoWhats`/`useAviso`/`useCardapio`/`useAvisosSacola`/
`useSecaoVisivel` sem uma linha mudada (lógica nova não existe — só classe).

**Protocolo com desvio declarado a priori:** o plano pedia commit por
clúster (C0–C6); o usuário mandou "não precisa ficar commitando um milhão" —
clústeres executados em sequência com evidências aglomeradas abaixo e UM
commit único no fim. Revisão por clúster mantida no texto.

### C0 — Fundamentos (a régua da casa na vitrine)
- [x] Tokens ok/alerta/perigo (os MESMOS três valores do painel) no
      tailwind.config.js — uma casa, uma régua de estado; na vitrine não
      há consumidor de erro de rede em vermelho (não é culpa do cliente).
- [x] ui/Botao reescrito: primário com "borda de corte" na base
      (border-b-2 carameloEscuro — borda assada de biscoito), hover
      ESCURECE para carameloEscuro (8,59:1), prensa de 1px
      (active:translate-y-px; disabled:active:translate-y-0), font-semibold,
      alvo min-h-11, foco focus-visible:ring-2 ring-caramelo/40 com offset;
      NADA de active:scale em variante alguma.
- [x] ui/Estado.tsx NOVO: marcador size-2 + texto (estado nunca fala só
      por cor nem só por ícone); estoque é NEUTRO em textoSuave —
      "Sem estoque no momento" vive UMA vez no site, aqui.
- [x] Varreduras C0: font-extrabold|black = 0 (Playfair ≤700 parou em bold;
      corpo/preços/contadores Manrope ≤600 semibold) · active:scale = 0 ·
      bg-[#fffdf9] → bg-white (superfície elevada) · rounded-[10px]/rounded-xl/
      rounded-2xl = 0 (stepper interno usa rounded-lg = 12−4 do p-1) ·
      superfície de campo = bg-white + hairline textoSuave/80 + foco
      caramelo com anel · App: min-h-screen → min-h-dvh (nunca vh).

### C1 — Casca (cabeçalho, busca, atualizar — e tudo em mudo na impressão)
- [x] BuscaCardapio: campo min-h-11, contêiner com anel focus-within
      caramelo/40, X rounded-campo com anel de foco próprio (saiu
      rounded-full), print:hidden.
- [x] CabecalhoCardapio: botão atualizar 36→44px + anel caramelo no foco;
      título text-balance.
- [x] Cabecalho: lockup extrabold→bold, contador <b> em rounded-campo
      semibold (saiu pílula redonda extrabold), botão Sacola com corte +
      prensa de 1px, busca do celular print:hidden.
- [x] BarraSacola: pesos semibold, foco com anel interno, print:hidden
      (só celular, e papel não é celular).

### C2 — Abertura (a foto herdada do antigo login do painel)
- [x] FOTO_HERDADA = photo-1558961363-fa8fdf82db35 (w=1200 q=80) — a foto
      dos tons quentes que encantou no login do painel, agora abertura da
      loja: aspect-[4/5] sm:16/10 lg:16/9 (CLS 0), srcSet 600/900/1200 +
      sizes, width/height explícitos, loading eager + fetchPriority high.
- [x] SEM véu e SEM texto sobre a foto (o desenho do login que perdeu a
      disputa não volta); texto mora na coluna sobre papel.
- [x] Eyebrow "confeitaria artesanal" FORA — redundância com o lockup do
      cabeçalho visível no mesmo scroll; título vira text-6xl no lg
      (saiu o text-[3.5rem]), text-balance, tracking normal.
- [x] "Escolher meus doces" = primário da casa com corte/prensa e anel de
      foco; "Como funciona?" vira link de texto (uma ação de compra,
      não dois botões competindo).

### C3 — Cardápio: lista escaneável no celular, grade de cartões em sm+
- [x] CardProduto refeito: celular = linha escaneável (nome → descrição
      line-clamp-2 → preço semibold → ação à ESQUERDA; miniatura quadrada
      h-24/w-24 rounded-card à DIREITA; hairline divide-y separa os itens;
      SEM moldura de card) · sm+ = cartão da grade (foto em cima aspect-4/3,
      borda hairline, rounded-card; capa 4/5 → lg:flex-1). DOM único: texto
      antes da foto nos dois formatos (leitor de tela primeiro diz o que o
      doce É); a troca de posição é CSS (order sm:order-1/sm:order-2).
- [x] GrupoCategoria: celular 1 coluna com divide-y (fim das 2 colunas de
      "site gerado") · numeração semibold tabular-nums · título text-balance ·
      scroll-mt da seção calculado por calc(var(--altura-cabecalho,67px)+60px)
      — fim do scroll-mt-40 chutado.
- [x] Abas fixas: o sticky MORA na SecaoCategoria (pousa sob o cabeçalho
      pela MESMA variável, hairline inferior, prnt:hidden), trilho overflow-x
      com scrollbar escondida (native + webkit), snap-x/snap-start, ativa =
      text-tinta + border-b-2 caramelo (saíu font-bold para semibold);
      role="tablist"/"tab"/aria-selected preservados ao pé da letra.
      SecaoCardapio perdeu o wrapper duplicado — a aba é autossuficiente.
- [x] EsqueletoCardapio espelha os DOIS formatos: lista no celular (coluna
      de texto + miniatura) e cartões sm+ — motion-safe:animate-pulse em
      TODAS as barras (saiu o gradiente varrendo) e barras em rounded.
- [x] `<Estado />` consumido em CardProduto e CardDestaque (a frase
      duplicada morreu: fica a do componente).
- [x] lib/iconeCategoria.ts APAGADO — grep de consumidores = 0 (arquivo
      morto da era pílula).
- [x] Correção registrada: `group` voltou ao CardProduto — o zoom leve da
      foto já estava escrito na img e NUNCA disparava sem a classe no pai.

### C4 — Sacola (gaveta branca, campos da casa, mão pesada fora)
- [x] CarrinhoDrawer: bg-[#fffdf9] → bg-white, max-h-dvh +
      overscroll-contain no corpo rolável, print:hidden, animação de
      entrada sob motion-safe:, X 36→44px com anel, labels semibold, campos
      = bg-white + border-textoSuave/80 + foco caramelo com anel, total
      semibold (saíu extrabold), "Finalizar no WhatsApp" e o texto de
      garantia INTACTOS.
- [x] ItemSacola: steppers e lixeira rounded-campo com prensa de 1px
      (saíu rounded-full + scale), nome/subtotal semibold, foto com
      decoding="async".
- [x] grep h-screen|[^d]vh na gaveta = 0 · safe-area do env intacto.

### C5 — Modais e estados de sistema
- [x] ModalConfiguracoes: ícones decorativos FORA (Settings2, PlugZap,
      Check), X 44px rounded-campo SEM o pulinho de hover, campos da casa,
      caixa "Como testar" em rounded-campo (saíu rounded-2xl), retorno
      semibold, ERRO vira text-perigo com prefixo "Erro: " — o único
      vermelho de verdade da vitrine (erro de FORMULÁRIO; role="alert"
      preservado), lifecycle testarAntesDeSalvar/salvar intocado.
- [x] ModalAjuda: MessageCircleHeart fora do título, X 44px + anel,
      passos em text-sm text-pretty, painel max-h-dvh com
      overscroll-contain.
- [x] AlertaErro: disco CloudOff e ícones RotateCcw/Sparkles FORA —
      falha de REDE fica tinta + textoSuave (não é culpa do cliente),
      título text-balance, corpo text-pretty, botões via Botao (corte/
      prensa anel vêm de brinde).
- [x] EstadoVazio: título text-balance, mensagem text-pretty; AvisoFlutuante
      INTACTO (role="status" + aria-live="polite", rounded-full do balão
      é exceção registrada) — só ganhou print:hidden.

### C6 — Auditoria final (greps da seção 8)
- [x] active:scale = 0 · font-(extrabold|black) = 0 · cores cruas (cor entre
      colchetes) = 0 ·
      rounded-[|xl|2xl|3xl = 0 · "Sem estoque no momento" = somente
      ui/Estado.tsx · fffdf9 = 0 · ícones banidos (Settings2, MessageCircleHeart,
      CloudOff, RotateCcw, Sparkles, PlugZap, Check decorativo) = 0 ·
      outline-none SEM substituto = 0 (input da busca usa focus-visible:
      outline — browser mostra para input quando interessa) ·
      h-screen|[^d]vh = 0 · pulse sem motion-safe = 0 · shadow-flutuante =
      EXATAS as 4 privilegiadas (gaveta, 2 modais, aviso) · rounded-full =
      SOMENTE AvisoFlutuante (balão) + ui/Estado (marcador) ·
      focus-visible:ring ≥1 em Busca e CabecalhoCardapio · print:hidden
      nos alvos pedidos.
- [x] build ✓ (tsc + vite, CSS 24,83 kB gzip 5,59) · lint ✓ 0 erros
      (backend/src + vitrine-cliente/src + painel-admin/src).
- [x] Diff fora de escopo: NENHUM — 22 arquivos modificados + ui/Estado.tsx
      novo + iconeCategoria.ts apagado, 100% dentro de vitrine-cliente +
      tailwind.config.js; sem emoji novo, sem paleta padrão, sem CSS novo
      (só classes); aparenciaProduto/estado de fotos intocado.
- [x] ARIA preservado (regra 8): tablist/tab/aria-selected nas abas;
      role="dialog" aria-modal + Escape em gaveta/config/ajuda; role="alert"
      no erro do formulário; role="status" aria-live no aviso; aria-busy no
      esqueleto/botões; aria-label nomedos nas ações de produto, lixeiras,
      limpar busca, atualizar, abrir/fechar sacola; ResizeObserver e
      --altura-cabecalho intactos (medir, não chutar).

**Desvios/pendências declarados (honestidade acima do "pronto"):**
- Contraste calculado por fórmula WCAG (não a olho): textoSuave sobre creme
  ≈ 6,1:1 · sobre branco ≈ 6,5:1 · carameloForte sobre creme ≈ 5,8:1 —
  AA grande e texto corrente passa; carameloEscuro com branco ≈ 8,6:1.
- ALT da foto da abertura ainda NÃO conferido ao olho (a imagem não é
  visível neste ambiente): o alt atual é descritivo e o comentário do
  código carrega o aviso — CONFERIR antes de publicar.
- Verificação de navegador do §8 (360px e 1280px: alvos, sticky,abas,
  linha do cardápio, impressão) NÃO executável aqui — ficou como passo
  MANUAL para o usuário com o build pronto (npm run dev na pasta).
