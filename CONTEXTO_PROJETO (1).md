# CONTEXTO_PROJETO — Doce & Carinho (TCC Confeitaria)

> Arquivo de memória viva do projeto. Toda instância do OpenCode deve ler
> este arquivo PRIMEIRO antes de qualquer outra coisa ao começar a trabalhar.
> Atualizar ao final de cada tarefa significativa (nova tela, bug corrigido,
> decisão de arquitetura). Última atualização: **2026-10-04 — auditoria
> completa do projeto, identidade e refactor das telas do painel**.
>
> **Nome da marca: "Doce & Carinho"** (era ConfeitoGest, depois "Ateliê do
> Doce"). A identidade oficial está em `marca/` e foi gerada por IA a
> partir do briefing `IDENTIDADE.md`, com o nome já correto. Símbolo: cupcake
> com cobertura em faísca, coração e saia.
>
> **`spec.md` foi apagado** (decisão do autor, 2026-10-04): a documentação de
> escopo virou o `README.md`, que é a primeira coisa que o professor abre.

## 0. Como rodar tudo HOJE (estado do ambiente)

**Codespace ativo:** `verbose-space-eureka-4qvwj6xrj6v4fjgp4`

| Serviço | Comando | URL pública |
|---|---|---|
| MySQL | `docker compose up -d` (raiz) | porta 3306 (local) |
| Backend | `cd backend && npm run dev` | `https://verbose-space-eureka-4qvwj6xrj6v4fjgp4-3000.app.github.dev/api` |
| Painel | `cd painel-admin && npm run dev` | `https://verbose-space-eureka-4qvwj6xrj6v4fjgp4-5173.app.github.dev/painel` |
| Vitrine | `cd vitrine-cliente && npm run dev` | porta do Vite (abrir em outra aba) |

- Portas 3000 e 5173 já configuradas como **public** no Codespace.
- `painel-admin/.env` aponta para a URL pública do backend (vale ao abrir pelo
  navegador; `localhost` NÃO funciona pelo browser no Codespace).
- Admin já existe no banco: **`admin@confeitaria.com` / `admin123`**.
  Para recriar em base vazia: `POST /api/auth/registrar` com `cargo:"admin"`
  (só o 1º usuário é livre — bootstrap).
- Comandos de banco (não há cliente `mysql` na máquina):
  `docker exec minha-api-mysql mysql -u api_user -proot123 confeitaria_db -e "SQL"`
- `backend/.env` **já tem segredos reais** (2026-10-04: `JWT_SECRET` e
  `BOT_API_KEY` rotacionados). Novo `src/config/env.ts` recusa o boot se o
  `JWT_SECRET` estiver com placeholder ou tiver menos de 32 caracteres —
  se aparecer "`.env inválido`" no log, é isso.
- **CORS por lista, em `backend/src/config/origens.ts`.** Libera
  `localhost:5173/5174`, `127.0.0.1:5173/5174` e, quando `CODESPACE_NAME`
  existe, `https://<nome>-5173.<dominio>` e `-5174`. As URLs do Codespace são
  montadas por código porque o hostname muda quando o ambiente é recriado —
  escrever à mão foi exatamente o que quebrou o acesso na primeira vez.
  `CORS_ORIGENS` no `.env` acrescenta origens (produção).
- **As duas vitrines usam a porta 5173** (padrão do Vite): para subir as duas
  ao mesmo tempo, `npm run dev -- --port 5174` no segundo.

## 1. Resumo do projeto

TCC de Desenvolvimento de Sistemas (Etec, técnico integrado ao EM, conclusão
2026): ecossistema digital para microempreendedores de confeitaria artesanal.

- **Vitrine do cliente (cardápio web):** catálogo público por categoria,
  carrinho lateral (drawer), botão "Finalizar no WhatsApp" via `wa.me` com
  texto do pedido pronto. Consulta disponibilidade ao carregar a página
  (SEM WebSocket/tempo real — Socket.io descartado conscientemente).
- **Painel do gestor:** login JWT + BCrypt; CRUD categorias/insumos/produtos;
  ficha técnica (`produto_insumo`) como argumento central (resolve "furo de
  estoque"); pedidos com status (lista + seletor, NÃO Kanban); dashboard sem
  recharts no MVP (cards + listas).
- **Stack:** React SPA + Tailwind + shadcn/ui (protótipo Figma Make) |
  Node + Express + TypeScript | MySQL 8.4 via Docker (`confeitaria_db`) |
  API REST = o próprio Express (não há "API separada").
- **Branches:** `feature/*` → `develop` → `main`. Backend mergeia em `develop`
  primeiro, nunca direto em `main`.
- **Estado do repo:** repositório enxuto — `main` (intocado, aguardando a
  liberação para o merge final) e `develop` (todo o projeto, já no GitHub).
  As branches de módulo serviram para organizar o trabalho durante o
  desenvolvimento e foram removidas depois do merge: quem pegar um módulo
  novo cria a branch a partir de `develop`. Fluxo: `feature/*` →
  `develop` → `main`.
  `spec.md` e `README.md` versionados.
  **Não versionado (.gitignore):** `CONTEXTO_PROJETO.md` (este arquivo),
  `prompt-opencode.md` e `PROMPT-IMAGENS.md` — o repositório mostra só o
  projeto.

## 2. O que já está PRONTO (estado consolidado 2026-10-04)

- [x] Modelagem MySQL validada (`backend/seed/schema.sql`): usuarios,
      categorias, insumos, produtos, produto_insumo (PK composta),
      clientes, pedidos, itens_pedido, movimentacoes_estoque + índices.
- [x] Seed mínimo (`backend/seed/seed.sql`): 3 categorias, 4 insumos,
      2 produtos + fichas.
- [x] Backend Express+TS completo e compilando: `server.ts`, `config/db.ts`
      (pool mysql2/promise), middlewares `auth.ts` (JWT) e `apiKeyBot.ts`,
      5 controllers, 6 arquivos de rotas.
- [x] Rotas (todas testadas ao vivo; ver seção 5 para o que mudou depois da
  revisão): `POST /api/auth/login`, `POST /api/auth/registrar` (bootstrap),
  `GET|PUT /api/auth/me`; `/api/categorias` (GET público, resto com JWT);
  `/api/insumos` + `/baixo-estoque` + `/:id/movimentar` (tudo JWT);
  `/api/produtos` público + `/admin/todos` + `/admin/mais-vendidos` +
  `/admin/:id` (com ficha, JWT) + `/:id/ficha-tecnica` (JWT) —
  `GET /:id` foi removido por ser rota morta;
  `/api/pedidos` + `/:id/status` + `/:id/pagamento` (JWT);
  `POST /api/bot/pedidos` (x-api-key, fail-closed); `GET /api/health`.
- [x] Criação de pedido com débito de estoque em TRANSAÇÃO
  (`beginTransaction`/`commit`/`rollback`, `SELECT ... FOR UPDATE`).
- [x] Padrões de código: `Number(req.params.id)`, `COALESCE(?, col)` +
      `?? null`, `affectedRows === 0 → 404`, transações com
      `getConnection()` em try/catch/finally, queries parametrizadas `?`,
      status 201/204/400/404/409. `express-async-errors` + error handler
      central 500 genérico.

## 3. O que FALTA

### Bloqueia a entrega
- [ ] **Commitar** — são ~118 arquivos alterados/novos, nada commitado desde
      `6d31e49`. Verificado em tipos, lint e build dos três projetos, e
      testado ao vivo contra o MySQL (fluxo de pedido inteiro).
- [ ] **PR de `develop` -> `main`**. `main` continua intocada.
- [ ] Conferir se `docker-compose.yml` publica a senha do MySQL
      (`MYSQL_ROOT_PASSWORD: root`, `MYSQL_PASSWORD: root123`) — as mesmas
      espelhadas em `backend/.env.example`. Num repositório público isso é
      senha publicada; para a apresentação, pelo menos explicar que são
      credenciais de estudo, de uma base que só existe no Docker local.

### Decide com o autor (não é bug)
- [ ] **Fotos em disco local** (`backend/uploads/`, fora do git). Não
      sobrevivem a restart do container nem a `docker compose down -v`, e o
      banco continua apontando para `/uploads/...` sem detectar. Duas saídas:
      volume nomeado no `docker-compose.yml` (recomendado) ou documentar o
      limite no README (já está lá, em "Estrutura").
- [ ] **Login sem rate limit.** A rota `/api/auth/login` é pública e aceita
      tentativa em sequência; para exposição real precisaria de limite (com
      biblioteca nova ou contador em memória). Hoje é aceitável porque a API
      só roda no Codespace.

### Feito e verificado nesta rodada (2026-10-04)
- [x] `JWT_SECRET` e `BOT_API_KEY` rotacionados, com validação no boot.
- [x] 48 erros de `no-explicit-any` do backend corrigidos (`ResultSetHeader`
      nas escritas, `RowDataPacket` nos SELECT, `unknown` + narrowing nos
      `catch`) + `lib/erros.ts` com `ehDuplicado`/`ehReferenciaInvalida`/
      `temCodigo`/`mensagemDoErro`.
- [x] Ciclo de vida do pedido virando máquina de estados no backend
      (`lib/cicloPedido.ts`) — a tela escondia o botão, a API não recusava.
- [x] Estorno do cancelamento lendo `movimentacoes_estoque` (o que saiu) em
      vez da ficha técnica atual (que pode ter sido editada depois da venda).
- [x] `README.md` da raiz escrito (escopo, como rodar, o que o sistema
      garante, convenções).
- [x] `spec.md` apagado; READMEs dos três projetos conferidos.
- [x] `painel-admin/README.md` reescrito (as telas que documentavam ja nao
      existem).

## 4. Decisões de arquitetura (e o porquê)

- **Ficha técnica (`produto_insumo`) como centro do TCC:** liga produto↔insumo
  e permite baixa automática — o "furo de estoque" é o problema que o artigo
  resolve.
- **Transação + `SELECT ... FOR UPDATE` no pedido:** impede corrida entre
  pedidos simultâneos disputando o mesmo insumo escasso; ou confirma tudo ou
  nada (pedido + itens + baixas + movimentações).
- **`COALESCE(?, coluna)` em vez de query dinâmica:** atualização parcial sem
  montar SQL por concatenação (menos risco de SQL injection, código uniforme).
- **Sem Socket.io/tempo real:** complexidade desproporcional ao benefício;
  vitrine consulta disponibilidade no load da página.
- **Sem Kanban arrastável / sem recharts no MVP:** lista com seletor de status
  e dashboard em cards/listas bastam para o MVP.
- **JWT no header `Authorization: Bearer` no painel:** o gestor é humano e
  tem sessão com validade.
- **`quantidade_atual` fora do `PUT` de insumos:** estoque só muda via
  `movimentar` ou venda (auditoria em `movimentacoes_estoque`), nunca por
  edição de cadastro.
- **CORS aberto (`app.use(cors())`):** aceitável em dev/Codespaces; restringir
  origem em produção (pendência registrada).
- **Vitrine usa `Botao` próprio estilo shadcn em vez da lib + Radix:** três
  variantes bastam; evita peso e dependências novas sem necessidade clara.
- **Demonstração é opt-in explícito, nunca fallback silencioso:** erro de rede
  aparece como erro (com "Tentar novamente"); a demo só entra se a pessoa
  pedir — cardápio falso passando por real seria pior que erro visível.
- **Scripts `dev`/`build` da vitrine chamam `node` direto** (mesma blindagem do
  backend contra `.bin` sem permissão de execução neste Codespace).
- **Fotos dos produtos em 3 camadas** (`imagemParaProduto`): `imagem_url` do
  painel vence; sem foto, curadoria por palavra-chave/categoria (Unsplash
  verificado por curl + conferência visual, 6 fotos); se falhar, emoji +
  gradiente via `onError`. Seed e banco ao vivo ganharam `imagem_url` nos
  2 cones.
- **Tema chocolate suave (superado pela paleta creme acima):** existiu entre
  duas rodadas; tokens `noite/chantilly` removidos, nenhum uso restante.
  Ícones por categoria via `iconeCategoria.ts` (lucide:
  Cake/Candy/Croissant/CupSoda/PartyPopper), sem FontAwesome para não
  adicionar dependência.
- **Carrossel mobile com setas (`GrupoCategoria`):** no celular os cards têm
  80% da largura em trilho snap com setas no cabeçalho (só mobile); no
  desktop vira grid. Scrollbar escondida, passo de 80% insinuando o próximo.
- **Paleta creme da casa (briefing):** fundo `#FDF8F3`, texto `#2B1E17`,
  terracota `#C4622D` (preço+botão), dourado `#D4A24C` (secundário), bege
  `#E8DDD1` (bordas); suave `#6E5C4E` para textos secundários; pílula ativa
  marrom escuro, info em blocos cacau com ícone dourado.
- **Cone tradicional com foto de granulado:** trufas escuras não combinavam;
  agora cupcakes com granulado colorido (seed + banco ao vivo + demo +
  palavra-chave "cone").
- **Toast em todo incremento (`useAvisosSacola`):** a pessoa precisa ver a
  contagem subir; o + do stepper também avisa ("2x…/3x…"), o − é mudo.
- **Adicionar é 1 toque = 1x (sem 2ª confirmação):** depois de testar a
  confirmação por quantidade, o autor optou pelo fluxo simples — o stepper
  inline já resolve ajuste sem sair do cardápio.
- **Painel: `font-numero` (Manrope, tabular-nums) em números e ids:** números
  tabulares passam precisão de ferramenta; Playfair fica só nos títulos.
- **Confirmação de excluir sempre em `ModalConfirmacao`:** nunca mais
  `window.confirm`/`alert` (aparência de protótipo e mensagem genérica).
- **Sem badge "mais vendido" na vitrine:** não há dado público de vendas
  (rankeamento exige JWT) e inventar selo seria desonesto; o destaque é
  editorial fixo (primeiro produto), assumido como tal.

## 5. Bugs conhecidos / pendências técnicas (revisão 2026-09-22)

**Críticos (1 e 5 corrigidos em 2026-09-23; 2, 3 e 4 corrigidos em 2026-09-23):**
1. `POST /api/auth/registrar` PÚBLICA — CORRIGIDO: exige JWT admin (livre só
   no bootstrap de base vazia) + valida cargo.
2. `criarViaBot` sem validar quantidade — CORRIGIDO: normaliza e exige
   `produto_id` e `quantidade` inteiros > 0 (400); testado 0/-2/ausente → 400.
3. `apiKeyBot.ts` fail-open — CORRIGIDO: fail-closed (500 sem chave); testado.
4. `backend/src/token.txt` com JWT real — CORRIGIDO: arquivo apagado +
   `token.txt` no `.gitignore`. FALTA: rotacionar `JWT_SECRET` (segredo pode
   ter vazado) e trocar placeholders do `.env` antes de apresentar.
5. `router.get("/auth", autenticar)` sem handler — CORRIGIDO: virou
   `GET /api/auth/me`.

**Médios (todos corrigidos em 2026-09-23, bateria ao vivo verde):**
6. `atualizarFichaTecnica` cega — CORRIGIDO: 404 se produto não existe + valida itens.
7. `movimentar` sem 404 — CORRIGIDO: `SELECT FOR UPDATE` (404) + trava contra
   estoque negativo (409 em perda/ajuste sem saldo).
8. `atualizarPagamento` sem enum — CORRIGIDO: valida `pendente|pago|estornado` (400).
9. `criarViaBot` forma sem validação — CORRIGIDO: `pix|cartao|dinheiro|outro` (400).
10. `produto.criar`/ficha sem validação — CORRIGIDO: preço > 0, itens com
    `insumo_id`/quantidade > 0 (400) + FK mapeada (`fk_produtos_categoria` /
    `fk_pi_insumo` → 404).
11. `remover` com vendas/receitas → 500 — CORRIGIDO: `ER_ROW_IS_REFERENCED_2` → 409.
12. `categoria` sem `ER_DUP_ENTRY` — CORRIGIDO: criar/atualizar → 409.
13. `registrar` cargo sem validação — JÁ CORRIGIDO no item 1 (`admin|gestor`, 400).
14. `insumo.criar` sem validação — CORRIGIDO: enum de unidade + não-negativos
    (400), inclusive no `atualizar` parcial.
15. `GET /produtos/:id` vazava ficha — CORRIGIDO: público sem ficha; nova
    `GET /produtos/admin/:id` (JWT) com ficha; rotas admin primeiro (item 18
    de brinde).
16. Cancel sem estorno/transições livres — CORRIGIDO: sair de `cancelado` → 409;
    entrar em `cancelado` estorna insumos agrupados + `movimentacoes` auditada
    (testado: 2000→1920→2000).
17. `movimentar` (`ajuste` subtrai, `saida` bloqueada, NaN passava) — CORRIGIDO:
    `Number()` estrito (400), sem estoque negativo; `saida` manual segue
    bloqueada por decisão (só via venda) e `ajuste` é baixa corretiva.

**Baixos / higiene:**
18. Ordem das rotas em `produtoRoutes.ts` — CORRIGIDO de passagem: `/admin/*`
    ficou antes de `/:id`.
19. `categoria.atualizar` retorna `{id, nome}` — CORRIGIDO: devolve sempre o
    nome final (o do body ou o que já estava), nunca `undefined`.
20. `pedido.listar?status=` sem validacao — CORRIGIDO: `?status=` repetido
    (array) nao passa mais o array pro driver; so string vira filtro.
    `Number(req.params.id)` com id nao numerico segue virando 404 (aceitavel).
21. Preco em float nao resolvido: `valorTotal` e a soma de DECIMAL do banco,
    que o driver ja entrega arredondado na coluna. Fica anotado como
    limite conhecido, nao como bug.
22. CORRIGIDO no que importava: `express.json()` com limite explicito (ja
    existia, dimensionado para o base64 do upload); checagem de `JWT_SECRET`
    no boot (`src/config/env.ts`); `login` com colunas explicitas e sem
    `senha_hash` na resposta; CORS trocado de aberto para lista de origens.
    **Ficou de fora:** handler 404 JSON para rota desconhecida.
23. Concorrência: travas `FOR UPDATE` por ingrediente em loop podem travar o
    mesmo insumo 2x se dois produtos o compartilham — funciona, mas agrupar
    baixas por insumo (ou travar em ordem de id) reduz risco de deadlock.
24. Repo: as branches de modulo foram apagadas depois do merge (verificado
    que nenhuma tinha commit exclusivo); sobraram `main` (intocada) e
    `develop`. **Pendente: commitar e abrir o PR `develop` -> `main`.**

- **Branches:** as 6 branches de modulo (`chore/estrutura-base`,
  `feature/database-schema`, `feature/backend-servidor`,
  `feature/frontend-vitrine`, `feature/frontend-painel`, `docs/projeto`)
  organizaram o trabalho e foram apagadas em 2026-10-03, depois de verificar
  que nenhuma tinha commit exclusivo. O historico preserva os merges.
  Restaram `main` (intocada) e `develop`.

## 6. Identidade e o refactor das telas (2026-10-04)

### A identidade oficial entrou no código
O autor gerou **14 arquivos** de identidade a partir do prompt do
`IDENTIDADE.md` e o assistente descartou tudo o que tinha desenhado antes
(atenção: o nome da marca nos 14 arquivos é **"Doce & Carinho"**, não "Doce &
Afeto"). Os arquivos ficaram em `marca/`:
`simbolo(. -light).svg`, `logo(. -horizontal).svg`, `logo-vertical*.svg`,
`favicon.svg`, `favicon-16/32/48.png`, `logo-512.png`, `logo-1024-preto.png`.

Como entraram no projeto:
- `Marca.tsx` (nos dois fronts) embute o desenho do SVG em vez de `<img
  src>`, porque existe versão clara e escura e quem escolhe precisa ser o
  componente: a sidebar é escura, a vitrine é clara.
- `public/` dos dois fronts recebeu `favicon.svg`, `favicon-16x16.png`,
  `favicon-32x32.png`, `icon-48.png`, `icon-512.png`, `logo.svg`,
  `simbolo.svg`; os dois `index.html` declaram `<link rel="icon">` e
  `theme-color` (creme na vitrine, tinta no painel).
- O símbolo entrou **só nos pontos de marca** (topo e rodapé da vitrine,
  sidebar, gaveta, header do painel, login). Nos pontos de interface
  (menu de Produtos, "sem foto" na tabela, disco de lista vazia) continua o
  ícone do lucide: colocar o logo como placeholder de "sem foto" seria
  enganoso.
- Medido: "Doce & Carinho" (15 caracteres) é mais longo que "Ateliê do Doce"
  (14). Cabe em todos os 8 pontos de marca; a única correção foi no rodapé da
  vitrine, que em 3 colunas no celular dá ~80px por coluna — lá o nome some
  abaixo de `sm` e fica só o símbolo.

### Duas telas viraram uma só cada
**Categorias dentro de Produtos** (`PainelCategorias.tsx`): eram três
registros ocupando a tela inteira, e categoria é atributo de produto, não
assunto próprio. Virou painel lateral que além de criar/renomear/remover
**filtra a tabela** ao tocar numa categoria — que é o que se quer 90% das
vezes. As escritas de categoria foram para o `useProdutos` (que já tinha a
lista e o recarregamento); `hooks/useCategorias.ts` e `pages/Categorias.tsx`
sumiram. O painel é dono do `salvando`/`erro` dos modais, senão o 409 de nome
duplicado aparecia e sumia junto com a janela.

**Perfil como janela** (`JanelaPerfil.tsx`): era página do menu para duas
linhas de formulário. Abre pelo nome do gestor, no rodapé da sidebar e da
gaveta (que fecha junto). O estado mora na `EstruturaPainel` porque quem
abre são dois irmãos diferentes — context novo só para um booleado não
compensa.

Menu ficou com **5 telas**: Resumo, Pedidos, Insumos, Produtos, Histórico. O
rodapé do celular repete as cinco (antes eram sete e o alvo de toque caía
para 40px).

## 7. Auditoria completa do projeto (2026-10-04)

Uma varredura dos três projetos achou 60 pontos; os que **quebravam alguma
coisa** foram corrigidos e testados ao vivo. Os que eram só estilo ficaram
para depois. Achados que valem como aviso para o resto do trabalho:

**Regras de negócio na tela, não na API.** Cancelar pedido entregue era
proibido por um `if` no botão. A API aceitava, e devolvia o estoque de uma
mercadoria já entregue. A regra virou `lib/cicloPedido.ts` no backend. A
lição: tela escondida não é validação.

**Estorno reconstituindo o passado com o presente.** O cancelamento
recalculava a devolução com `JOIN produto_insumo` — a ficha técnica **atual**.
Editar a receita depois da venda fazia o estorno devolver insumo errado, e
insumo nenhum também. Agora lê `movimentacoes_estoque` (`tipo = 'saida'`),
que é literalmente o que saiu. Testado: venda, edição da receita, cancelamento
→ os 3 insumos originais voltaram, não o da receita nova.

**`setState` de outro componente no corpo do render.** As 5 telas faziam
`if (precisaLogin) sair()` direto no render, e `sair()` altera o estado do
provedor de sessão — é o que faz o React avisar em execução. Virou
`useEffect` nas 5.

**`void funcao()` escondendo falha de rede.** O liga/desliga de visibilidade
do produto chamava `atualizar` sem `await` nem `catch`: se a rede falhasse, o
selo mudava na tela e o cardápio continuava como estava, sem nenhum aviso.
Agora tem `try/catch`, spinner na linha e mensagem. Vale como regra: **toda
escrita mostra o resultado**.

**Estado que nunca volta.** `precisaLogin` só ia para `true`: um 401 isolado
travava o logout para sempre, mesmo com a sessão renovada. Zera a cada busca.

**Filtro que guardava a lista já filtrada.** `usePedidos` guardava só a aba
visível, então mudar de aba refazia a requisição (o filtro é do cliente) e um
pedido que saía da aba continuava nela com o status novo. Agora guarda a lista
inteira e deriva a aba.

**Resposta velha chegando depois da nova.** O `DrawerPedido` buscava o
detalhe sem `AbortController`: abrir o pedido #5 e logo o #6 fazia a
primeira consulta voltar depois e a tela mostrar os dados do #5 com o título
"Pedido #6".

**Texto de interface que promete o que não existe.** "O gerenciamento de
pedidos e estoques chega nas próximas telas" (existem), "Os pedidos feitos
pelo WhatsApp e no balcão" (não existe criação de pedido no painel), "hoje /
pedido médio em minutos" sem número nenhum (o banco não tem hora de entrega —
virou "a partir de R$ X", que é dado real), "são 7 telas" no menu que tem 5.
Texto que mente sobre o próprio software é pior que texto genérico.

**`Boolean("0") === true`.** O painel fazia `Boolean(ativo)` para o selo de
visibilidade. Funciona porque o driver devolve `TINYINT` como número; se
vier como string, todo produto desativado voltaria a "Visível". Virou
`ehVerdadeiro()` no `lib/api/base.ts`.

**Categoria inventada na vitrine.** `categoria || "Doces"` punha todo produto
sem categoria dentro de "Doces" — se essa categoria existisse, informação
falsa para o cliente, e o balde "Outros" nunca pegava nada. Agora `categoria`
é `string | null` de verdade e o "Outros" funciona.

**`LIMIT 1.5` virava 500.** `?limite=1.5` ia cru para o MySQL como
`LIMIT 1.5`, que é erro de sintaxe, numa tela que só devia paginar.
`Math.floor` antes de limitar.

**`descricao` VARCHAR(255) estourada.** Um nome de 120 caracteres renomeado
gerava 280 de descrição → `ER_DATA_TOO_LONG` → e o `catch` da auditoria
engolia, então a renomeação sumia do histórico sem nenhuma pista. Agora
`registrar()` corta no limite da coluna.

**Validação que existia em metade dos caminhos.** `PUT /produtos/:id` não
validava nada (dava para renomear produto para "" ou preço -5, e o preço
negativo aparecia na vitrine); cadastro de usuário aceitava senha de 1
caractere enquanto o perfil exigia 6; insumo aceitava nome vazio no PUT.
Todos com limite de tamanho de campo também, porque passar do VARCHAR dava
500 em vez de 400.

**Comparação de chave com `!==`.** A chave do bot saía no primeiro byte
diferente, e essa diferença de tempo serve de oráculo. Agora passa por
SHA-256 antes do `timingSafeEqual` (os digests têm sempre 32 bytes, então a
comparação é de tamanho fixo).

**Corrida no cadastro do cliente.** `SELECT` do whatsapp seguido de `INSERT`
quebrava com dois pedidos do mesmo número novo (violava o índice único → 500).
Virou `INSERT ... ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`.

**`GET /api/produtos/:id` era rota morta.** Nenhum front pedia detalhe de
produto — a vitrine monta a tela a partir da linha da listagem. Rota e
handler removidos.

**Código morto e tipos duplicados, removidos:** `useCategorias`, `Categorias`,
`Perfil`, `montarItens`, `StatusPedido`, `Registro.tabela` (buscado e nunca
mostrado), `ItemFicha.insumo_nome`/`unidade_medida` (preenchidos e
descartados no `map`), as ações `entrar`/`sair` do enum de auditoria (nenhuma
rota as produz), `LinhaId` do pedidoController, e `JanelaProduto` duplicada em
`ModaisProduto` + `useJanelaProduto` (agora uma fonte só).

**Pendências que ficaram (com a razão):**
- Login sem rate limit — precisa de biblioteca nova ou contador em memória.
- `Boolean` do painel: resolvido.
- Fotos em disco local: pendência de infraestrutura (volume nomeado).
- `descricao` de 255 caracteres: corta em vez de 500, mas o corte esconde o
  fim da frase — se as descrições ficarem longas de novo, o certo é alargar a
  coluna no `schema.sql` **e** no `migracoes.sql`.

## 8. O que a revisão de 2026-10-04 (tarde) consertou

**CORS quebrado — minha culpa, e foi sério.** Troquei `cors()` aberto por lista
de origens e a lista só tinha `localhost:5173` e `:5174`. Quem abre pelo URL
público do Codespace (`https://<nome>-5173.app.github.dev`) passou a ser
bloqueado pelo navegador — e o sintoma é "não achou a API" no modal da vitrine
e login que não funciona no painel, sem nenhuma pista. Não dá para diagnosticar
pelo que aparece (o navegador só diz "failed to fetch").

Corrigido em `backend/src/config/origens.ts`: quando `CODESPACE_NAME` existe,
as URLs `<nome>-<porta>.<dominio>` entram sozinhas, com `localhost` e
`127.0.0.1` sempre. Verificado: URL do Codespace liberada nos dois ports,
`localhost` liberado, e um domínio aleatório continua bloqueado.

**Armadilha do `cors`:** a função `origin(req, callback)` funciona nos tipos
novos, mas o `cors` instalado (2.8.6) compara por igualdade contra o array e
ignora função — o `runtime` não bate com os tipos. Passar função deixava a
requisição pendurada sem resposta (a API parecia caída). A solução é o array.

**Contraste da logo: 1,00:1.** O símbolo na vitrine estava na versão **escura**
dentro do disco escuro do header. A silhueta externa da versão escura é
`#2B1E17`, a mesma cor do fundo — contraste 1,00:1, ou seja, cupcake
invisível. O mesmo erro no header do celular do painel. Os dois agora usam a
versão **clara** (15,3:1), igual à sidebar, à gaveta e ao login.

Como medir isso certo: a peça que encosta no fundo da página é só a silhueta
externa (corpo/prato/pé). A cobertura e o coração ficam DENTRO do corpo, e o
contraste deles é contra o corpo — o mesmo em qualquer fundo. Comparar cada
peça contra o fundo da página dá número errado e leva a decisão errada.

**Favicon:** os arquivos em `public/` estavam certos (conferidos byte a byte
contra `marca/`). O que você via era o cache do navegador com o ícone
antigo (o caramelo que eu tinha desenhado), na mesma URL `/favicon.svg`. Duas
coisas: `apple-touch-icon.png` era declarado no HTML e não existia (404 em
toda carga de página — agora usa o PNG oficial quadrado de 512px), e os links
ganharam `?v=1` para invalidar o cache sem depender de recarga forçada.

## 9. Foto do perfil, painel de enquadrar e a foto da home (2026-10-04, tarde)

**Foto do perfil.** Coluna `imagem_url` em `usuarios` (schema.sql +
migracoes.sql, idempotente, rodada duas vezes sem efeito). `PUT /api/auth/me`
aceita; `/auth/me` e o login devolvem. Dois cuidados:

- O campo **não** usa `COALESCE` como os outros do PUT: sem foto é para
  REMOVER (gravar NULL), e COALESCE transformaria em "mantém a anterior" — a
  pessoa clicaria em remover e nada aconteceria.
- O backend só aceita caminho que começa com `/uploads/`. Sem isso, dava para
  gravar `javascript:...` no campo e sair num `<img>` com isso no `src`
  (testado: 400).

`Avatar.tsx` mostra a foto e cai para a inicial quando não há — o quadrado
vazio parece quebrado.

**Painel de enquadrar (`AjusteImagem.tsx` + `lib/ajustarImagem.ts`).**
Usado no perfil (quadro 1:1) e na foto do produto (4:3, o card real da
vitrine). Zoom, arrastar e girar 90°. A mesma função de desenho gera a prévia
e o arquivo final — se usassem contas diferentes, o que a pessoa arrastava
não seria o que ela salvava.

Por que antes do upload: depois de enviar, se o enquadramento estiver errado,
a pessoa só descobre com a foto já no servidor. E a foto do celular vem
quadrada de 4000px para um quadro 4:3.

O ajuste é **opcional**: a foto vai direto, e o painel abre só quando a
pessoa pede "Enquadrar".

**Foto da home.** `public/abertura.png` (1536x1024, a imagem que o autor
gerou pelo prompt de `PROMPT-IMAGENS.md`). O `alt` foi reescrito para descrever
o que está NA imagem.

**Favicon só com o cupcake.** `apple-touch-icon` e `icon-512` estavam
apontando para o logo **completo** (cupcake + nome), que é justamente o que não
serve de ícone em tamanho pequeno. Rasterizei o `simbolo-light.svg` oficial
em 180 e 512 px com canto arredondado (mesma proporção do `rx="14"` do
`favicon.svg`): `marca/cupcake-{180,512}.png`.

**AJUSTE DE FOTO — ERRADO, E O AUTOR TEM RAZÃO.** Fiz um painel de recorte
próprio (`AjusteImagem` com zoom, arrastar e girar) achando que era preciso.
Não é: **o seletor nativo do celular já traz o ajuste de recorte** — é o
"cortar" do próprio Android/iOS depois de escolher a foto. O autor reclamou
que "às vezes não aparece a foto ou simplesmente fecha", e o diagnóstico bateu
com a causa: o painel abria, a imagem demorava a carregar, o botão de confirmar
ficava desabilitado sem explicação, e parecia quebrado.

**Removido:** `AjusteImagem.tsx` e `lib/ajustarImagem.ts` saíram, junto com
`enviarImagemAjustada` na API e o `enviarAjustada` no hook. sobrou o
`<input type="file">` nativo.

O que ficou, e é o que o seletor nativo **não** faz:
- preview na proporção **real** (4:3 no card do produto, 1:1 no avatar);
- erro de formato e de tamanho na hora, antes de subir;
- envio direto e `--maxlength` nos campos, para o arquivo não pesar.

`accept="image/jpeg,image/png,image/webp"` é **explícito de propósito**: com
`image/*` o iOS oferece HEIC, que o backend recusa (só grava JPG/PNG/WebP).
Pedir a lista certa faz o sistema converter antes de entregar o arquivo.

**A lição:** não reconstruir o que a plataforma já dá. Vale para seletor de
arquivo, e vale para recorte — a pergunta certa é "o sistema já faz isso?".

**Duas tentativas que não valem a pena repetir** (levaram tempo e foram
removidas):

- **Escrever um JPEG baseline em Python puro.** A máquina não tem
  ImageMagick, ffmpeg, Pillow nem sharp. O encoder deu seis bugs de formato
  antes de ficar decodificável (comprimento do SOF0, nº de componentes,
  fator de subamostragem, BITS com uma posição a menos, ordem natural ×
  zigzag na quantização, percurso de MCU). Quando finalmente produziu um
  arquivo que o leitor aceitou, o tamanho era 691 KB — ainda alto. **Decisão:
  não entregar imagem que não dá para verificar.** A PNG de 2,7 MB fica.
- **Recomprimir a PNG** com filtro adaptativo por linha: ficou **pior** (3,7
  MB). O encoder original já escolhe melhor.

**A lição sobre o que é verificável:** nesta máquina, PNG renderiza (o
`read` mostra a imagem) e JPEG também — então "não decodifica" era sinal de
erro real, não de ferramenta. Foi isso que permitiu achar os seis bugs. Se
fosse o contrário, a conclusão seria a mesma: sem prova visual, não entrega.

**Deixado em aberto:** `abertura.png` pesa 2,7 MB. Se o autor pedir um JPEG
menor ao gerador (ou reexportar a mesma arte em JPEG), é só substituir o
arquivo e apontar o `src` — o código já está preparado.

## 10. Log de atividades

- **2026-09-25 — Revisão de todos os arquivos e telas (autor pediu).**
  Achados e correções: **(1) acessibilidade** — zero `focus-visible` no
  projeto inteiro (quem usava Tab não via o foco): adicionado global nos dois
  fronts. **(2) polimento** — 15 botões com `hover` sem transição (cor
  pulava); e a vitrine usava `text-stone-*` (cinza padrão do Tailwind) no
  texto secundário enquanto o painel usava o bege da casa: unificado em
  `textoSuave`. **(3) organização** — `lib/api.ts` do painel (335 linhas)
  dividida por domínio (`api/auth|pedidos|insumos|produtos|base`) com
  `api.ts` como fachada, para nenhum import quebrar; `Hero.tsx` →
  `Abertura.tsx`; `useJanelaProduto` extraído (Produtos.tsx 156→118); tipos de
  escrita do produto nomeados.
  **(4) bug achado na refatoração:** ao salvar produto novo, o caminho de
  criação não tinha `return` e caía no de edição (criaria e atualizaria em
  seguida) — corrigido. `spec.md` sumiu por engano na limpeza e foi
  restaurado. Verificado: 4 builds sem erro, 0 arquivos >150 linhas, zero
  `any` nos fronts.
  **Nota:** o navegador desktop não estava conectado, então a revisão visual
  foi feita por leitura de código (tokens, escala, estados), não por captura
  de tela.
- **2026-09-24 — Achados de banco em teste de venda.** Os 2 produtos estavam
  com `ativo=0` (invisíveis na vitrine) — corrigido. A transação de estoque
  foi validada ao vivo: pedido de 2 cones (R$20) baixou 2000→1920 / 50→48 /
  1000→940 com 3 movimentações auditadas; com massa de cone em 1, o pedido
  foi barrado por 409 ("Estoque insuficiente"). Dados de teste limpos e
  estoque do seed restaurado.
- **2026-09-24 — Histórico do git refeito (honesto) e docs publicados.**

- **2026-09-24 — Histórico do git refeito (honesto) e docs publicados.**
  Como o autor informou que fez o projeto sozinho, removi as branches
  `feature/*` (que implicavam trabalho dos colegas) e reconstruí o histórico
  de `develop` em 5 commits lineares e um único autor: estrutura → backend →
  vitrine → painel → docs. `CONTEXTO_PROJETO.md` e `prompt-opencode.md`
  foram para o `.gitignore` (só o projeto vai para o GitHub); `spec.md` e
  `README.md` mantidos por serem documentação legítima. `main` intocado.
  Builds reconfirmados depois do reset (backend/painel/vitrine OK).

- **2026-09-24 — Git organized + docs.** `.gitignore` raiz (node_modules,
  dist, `.env` em todas as pastas, `token.txt`); `develop` + 3 branches de
  feature criadas; 3 commits por área (backend 27 arquivos, vitrine 48,
  painel 55) mergeados em `develop` com `--no-ff`; commit de docs com
  `README.md` (visão geral + como rodar + branches) e `spec.md` (problema,
  escopo do MVP, decisões, regras de negócio, papéis). Working tree limpo.
  **NÃO fiz push** (aguarda autorização). `main` intocado, como o fluxo exige.
- **2026-09-24 — Tela Categorias do painel (painel completo).**
  `/painel/categorias`: grid de cards numerados com renomear/remover
  (`ModalCategoria` + `ModalConfirmacao`), `useCategorias` com CRUD.
  E2E: criar → duplicada 409 → renomear → produto apontado para ela e categoria
  removida (produto sobrevive com `categoria_id` null, ON DELETE SET NULL) →
  base restaurada. **Painel 100% das telas do MVP.**
- **2026-09-24 — Tela Produtos do painel (concluída).** `/painel/produtos`:
  tabela (foto mini, categoria, preço, selo Visível/Oculto, ação de power
  liga/desliga da vitrine), `ModalProduto` com ficha técnica dinâmica
  (`EditorFicha`: insumo + quantidade, linhas vazias descartadas), edição em
  2 chamadas (dados + ficha), `ModaisProduto` e `CabecalhoSecao` extraídos
  para manter a página em 156 linhas. `useProdutos` + API de produtos
  (criar/atualizar/ficha/remover/admin/:id) e `listarCategorias` (público).
  E2E ao vivo: criar com 2 insumos → `GET /admin/:id` devolve a ficha →
  substituir por 1 item (200) → insumo inexistente (404). Base limpa.
  Build limpo, sem `any`. **PRÓXIMO PASSO SUGERIDO: Categorias no painel.**
- **2026-09-24 — Adicionar direto + painel com corpo.** Vitrine sem 2ª
  confirmação (1 toque = 1x, stepper ajusta; `SeletorConfirmacao` removido) e
  botão centralizado proporcional (`self-center`, sem esticar). Painel com
  Manrope nos números (`font-numero` tabular), `UltimosPedidos` no Resumo e
  rótulo GERENCIAR na sidebar. Builds limpos, previews 200.
- **2026-09-24 — Pegada premium (anti "cara de IA").** Vitrine: `FaixaRolante`
  (letreiro terracota, 1 keyframe, motion-safe), seções numeradas "01…",
  zoom na foto + seta no botão, rodapé em 3 colunas cacau com âncoras;
  `identificadorSecao`/`numeroSecao` centralizados em `lib/secoes.ts`. Painel:
  barras CSS no ranking (sem lib de gráfico, honrando o descopo do recharts).
  Builds limpos, previews 200, sem `any`.
- **2026-09-24 — Perfil + confirms + polimento.** Backend `PUT /auth/me`
  (nome/email + senha com atual, 409 dup); painel `/painel/perfil` com sessão
  refletida na hora; `ModalConfirmacao` no excluir (adeus alert nativo);
  login split-screen + sidebar em degradê; vitrine com botão full-width
  "Adicionar produto" (preço em cima, sem corte no carrossel). E2E perfil
  (200/409/401/login nova senha); builds limpos, previews 200.
- **2026-09-24 — Tela Insumos do painel.** Tabela com selo verde/vermelho,
  CRUD em `ModalInsumo` (estoque inicial só no criar) + `ModalMovimentacao`
  (entrada/perda/ajuste); excluir com `confirm` nativo + 409 explicado.
  E2E ao vivo (criar→editar→entrada 600→perda 409→delete 409 com vínculo);
  base limpa. Build limpo, preview 200, tudo ≤150 linhas.
- **2026-09-24 — Tela Pedidos do painel.** Abas por status, tabela clicável,
  drawer (`CabecalhoDrawer` + `ItensPedido` + `AcoesPedido`) com avanço no
  fluxo, cancelar com estorno e seletor de pagamento; `lib/pedido.ts` com
  rótulos/tons/próximo. E2E ao vivo (pedido real 28.50, 2 itens, avanço até
  entregue); base limpa, usuário do Felipe preservado. Build limpo, preview
  200, tudo ≤150 linhas, sem `any`.
- **2026-09-23 — Painel-admin: Entrar + Resumo.** Scaffold Vite+TS+router;
  `useAutenticacao` (contexto, valida token salvo, 401 desloga); `/painel`
  com 4 métricas + ranking + alerta (vazios amigáveis, retry, skeleton).
  Futuras com selo "em breve". Contrato validado contra backend real;
  build limpo, preview 200, sem `any`, tudo ≤150 linhas.
- **2026-09-23 — Lote dos médios 6–17 corrigido.** Validações + mapeamento
  FK/enum em categoria/insumo/produto/pedido; ficha fora da vitrine
  (`/admin/:id`); cancel com estorno auditado. Bateria ao vivo: ~20 casos
  (400/404/409/201) todos verdes, ciclo 2000→1920→2000. `tsc` limpo, base
  limpa (0 pedidos/usuários/clientes). Backend pronto para `develop`
  (falta só rotacionar `JWT_SECRET`).
- **2026-09-23 — Críticas 2, 3 e 4 corrigidas.** (2) `criarViaBot` normaliza e
  valida itens (inteiros > 0, 400); testado ao vivo: sem key 401, qtd 0/-2 e
  sem produto_id 400, pedido válido 201 com débito. (3) `apiKeyBot` fail-closed
  (500 sem chave); testado com `BOT_API_KEY` vazia. (4) `token.txt` apagado +
  gitignorado. Pedido de teste removido e estoque restaurado (0 pedidos).
  `tsc` limpo. PENDENTE: rotacionar `JWT_SECRET`, itens médios 6–17, painel,
  docs e fluxo de branches.
- **2026-09-23 — Confirmação antes da sacola + hero sortido.** Nada entra
  direto: 1º toque abre `SeletorConfirmacao` (quantidade + ✓ + X),
  compartilhado por `CardProduto` e `CardDestaque`; `useCarrinho` ganhou
  `adicionarVarios`. Hero com caixa de chocolates sortidos (verificada
  visualmente). Build limpo, preview 200, todos ≤150 linhas.
- **2026-09-23 — Paleta creme + foto do cone.** Tema escuro revertido para o
  briefing (creme `#FDF8F3`, tinta `#2B1E17`, terracota `#C4622D`, dourado
  `#D4A24C`, bege `#E8DDD1`, suave `#6E5C4E`); 15 arquivos tocados, zero
  `noite/chantilly` restante. Cone tradicional com foto de granulado (seed +
  banco + demo + keyword). Build limpo, preview 200, bundle sem `#1e100a`.
- **2026-09-23 — Hero menor + correção de fontes.** Foto trocada (fatia de
  frutas vermelhas, contrasta com o cacau), altura 62svh→44svh. Invisíveis
  corrigidos: título do destaque herdava chantilly no card branco (agora
  `text-tinta` no article) e link do rodapé carameloForte no cacau (agora
  caramelo claro); auditoria grep sem stone-sobre-escuro restante. Build
  limpo, preview 200.
- **2026-09-23 — Tema cacau escuro + fix do "1x".** Véu removido (foto limpa
  62svh + conteúdo no cacau); página toda em noite/chantilly, cards claros em
  contraste, caramelo vira primário. Toast em todo + via `useAvisosSacola`.
  Build limpo, preview 200, véu fora do bundle, todos ≤150 linhas.
- **2026-09-23 — Hero full-bleed.** Foto do bolo cobre a tela inteira como
  fundo (`min-h-[94svh]`), texto branco sobre véu em degradê até o creme da
  página. Build limpo, preview 200.
- **2026-09-23 — Carrossel mobile + hero com foto.** `GrupoCategoria` virou
  carrossel snap com setas ‹ › no mobile (cards 80%, scrollbar oculta) e grid
  no desktop; `Hero` trocou os 3 balões por foto real do bolo em arco com
  frase, agora visível no mobile. Build limpo, preview 200.
- **2026-09-23 — Refinamento UI/UX da vitrine.** Auditoria anti-genérico:
  simetria total, sombra única, preço neutro, drawer linear, ícone sacola
  genérico, contador estático, pílulas sem "onde estou", skeleton genérico,
  "volta em breve" vago, sem press-feedback, sem motion-safe. Mudanças:
  seções por categoria com scroll-spy (`useSecaoVisivel` + pílulas sticky) e
  ritmo mt-12/gap-4; `CardDestaque` horizontal quebrando a simetria; preço no
  acento caramelo queimado; drawer com easing natural + overlay em fade;
  `ShoppingBasket` no lugar de `ShoppingBag`; pulo no contador (key remount);
  stepper inline já existia (mantido); rodapé do drawer já era fixo (mantido);
  skeleton espelha o card 4:3; vazio com CTA "Ver cardápio"; "Sem estoque no
  momento"; `active:scale-95` global; `motion-safe` nas animações; foto
  `aspect-[4/3]` consistente. Novos: `CardDestaque`, `GrupoCategoria`,
  `CabecalhoCardapio`, `useSecaoVisivel`, `lib/secoes.ts`. Sem badge "mais
  vendido" (sem dado público; destaque é editorial). Verificado: build limpo,
  preview 200, bundle com todos os fluxos. Backend NÃO tocado.
- **2026-09-23 — Conexão robusta + fotos + tema chocolate.** (a) Causa do "não
  conecta": base sem `/api` no final (fetch ia para `/categorias` → 404);
  backend estava no ar. `obterUrlBase` agora normaliza (completa `/api` quando
  falta) — testado nos 3 formatos. (b) Fotos reais: 8 candidatas validadas por
  curl, 6 conferidas visualmente; cone tradicional=trufas, morango=fatia de
  frutas vermelhas; `seed.sql` + banco ao vivo com `imagem_url`; fallback por
  categoria/palavra-chave + emoji via `onError`. (c) Toast agora mostra
  "2x Cone doce tradicional na sacola 🧁" (`mensagemAdicionado` pura em lib).
  (d) Tema cacau suave + ícones por categoria (lucide, sem FontAwesome).
  Verificado: build limpo, preview 200, bundle com fotos/toast/wa.me, App 150
  linhas (toast movido para `SecaoCardapio`). `CONTEXTO` atualizado.
- **2026-09-23 — Revisão e padronização da vitrine (React+TS).** Site estático
  antigo removido; `vitrine-cliente/` agora é Vite+React+TS+Tailwind+lucide-react
  na estrutura types/lib/hooks/components. Checklist da tarefa: tipagem completa
  (`Produto` normalizado com `preco` number — API entrega string via DECIMAL);
  `useCarrinho` (`adicionar/remover/alterarQuantidade/total/limpar` +
  `quantidades`, persistência em localStorage); indisponível com badge +
  opacidade + sem botão (via `disponivel`/`quantidade_disponivel`/`ativo`
  opcionais — backend ainda não envia estoque por produto, UI já pronta;
  demo inclui 1 item zerado para exibir o estado); drawer com vazio amigável e
  tela cheia no mobile; skeleton animado; erro de rede com "Tentar novamente" +
  demo opt-in; `alt`/`aria-label`/`role=dialog`; grid 1→4 colunas. Backend NÃO
  tocado. Verificado: `tsc` + `vite build` limpos, zero `any`, maior componente
  151 linhas (App), contrato da API validado contra backend real (2 produtos),
  `vite preview` serve 200 com bundle contendo sacola/produtos/wa.me. Correção
  no caminho: `Botao` usava prop `filhos` e quebrava `children` do JSX —
  padronizado em `children` (API do React, como `onClick`). `CONTEXTO` atualizado.
- **2026-09-23 — Erros de `npm run dev` e vitrine diagnosticados.** Backend tinha
  3 problemas ambientais (nenhum no código): (1) `tsx: Permission denied` —
  binários em `backend/node_modules/.bin` sem bit de execução; corrigido com
  `chmod +x` e blindado em `backend/package.json` (`dev`/`build` agora chamam
  `node ./node_modules/...` direto, sem depender do `.bin`). (2) Faltava
  `backend/.env` — criado a partir do `.env.example` (segredos ainda são os
  placeholders: TROCAR antes de apresentar). (3) Tabelas inexistiam
  (`ER_NO_SUCH_TABLE`) — aplicados `seed/schema.sql` + `seed.sql` via
  `docker exec` (sem cliente mysql no Codespace). Verificado de ponta a ponta
  na porta 3001 (a 3000 está ocupada NESTE Codespace por outro serviço; no PC
  do Felipe a 3000 deve estar livre, senão `PORT=3001 npm run dev`):
  `/health`, `/categorias`, `/produtos` OK; registrar bootstrap 201, 2º sem
  token 401, login + `/me` OK. Usuário de teste removido (base limpa).
  Vitrine: arquivos servem HTTP 200 e contrato de dados confere
  (`categoria/nome/preco/imagem_url/descricao`); aguardando mensagem exata do
  erro que o Felipe viu para fechar o diagnóstico.
- **2026-09-23 — Correções 1 e 5 + vitrine do cliente.** (a) `auth.ts`:
  validação `Bearer` + `autenticarOpcional`; `authController.registrar`:
  bootstrap livre só com base vazia, depois exige admin (401/403), valida
  cargo, retorna cargo no 201; novo `me` (`GET /api/auth/me`);
  `authRoutes.ts` reescrita (fim da rota fantasma `/auth`). Decisão: bootstrap
  aberto documentado como exceção intencional (sem seed de usuários, o primeiro
  admin precisa ser criado de algum jeito). (b) `vitrine-cliente/` criada:
  cardápio público por categoria com busca, grade de produtos, sacola em drawer
  com nome/obs, checkout via `wa.me` com texto pronto, config de API/WhatsApp
  em localStorage, modo demonstração com dados do seed quando a API está fora.
  Design: Playfair Display + DM Sans, primária #030213, lucide, responsivo.
  Verificado: `tsc --noEmit` limpo, `node --check app.js` OK, `http.server`
  serve `index.html` com 200. FALTA: itens 2–4 e médios da revisão; painel-admin;
  preencher spec/README.
- **2026-09-22 — Revisão do backend (TAREFA 1) concluída, sem alterações no
  código.** Lidos: `server.ts`, `config/db.ts`, ambos middlewares, 5
  controllers, 6 rotas, `schema.sql`, `seed.sql` (parcial), `.env.example`,
  `tsconfig.json`. `tsc --noEmit` passa limpo. Achados acima (5 críticos,
  ~12 médios, ~7 baixos) reportados ao autor; aguardando confirmação do que
  corrigir. `CONTEXTO_PROJETO.md` criado (TAREFA 3). TAREFA 2 bloqueada:
  `painel-admin` e `vitrine-cliente` não existem no workspace.

- **2026-09-28 — Vitrine não atualizava quando o gestor mudava um produto.**
  Causa raiz: `useCardapio` buscava os produtos UMA vez na montagem — não havia
  botão de recarregar nem atualização automática, só o F5. Pior: a API mandava
  `ETag` sem `Cache-Control`, então recarregar podia devolver a cópia guardada
  pelo navegador. O "Limpar busca" parecia quebrado por efeito colateral: ele
  limpa o texto, mas se o produto estava `ativo=0` continuava invisível.
  Correções: recarga ao voltar para a aba (`focus` + `visibilitychange`, com
  trava de 15 s), botão "Atualizar" com spinner, estado `atualizando`
  separado de `carregando` (recarga silenciosa não derruba a tela), falha de
  recarga vira balão e não tela de erro, `cache: "no-store"` no cliente e
  `Cache-Control: no-store` nas rotas públicas. O painel ganhou
  `no-store` também em produtos/categorias.
- **2026-09-28 — Fim dos emojis de estado.** O 🍰 do "Nada por aqui" virou
  ilustração em SVG (`IlustracaoBuscaVazia`: prato visto de cima com a lupa
  por cima, madeirinha assimétrica de propósito). 🧺 da sacola e 🏷️🧁🧾🌾 do
  painel viraram ícones lucide num disco (`DiscoVazio`), no mesmo desenho do
  aviso de erro. 🔌 saiu das 6 telas. Os emojis de frase (🍓 do rodapé, ✦ do
  letreiro) ficaram: ali são marca, não estado. E a vitrine ganhou uma seção
  nova de texto sem emoji nos avisos de sacola.
- **2026-09-28 — Esqueleto de carregamento do painel.** O bloco branco liso
  (`h-64 animate-pulse`) parecia tela quebrada; virou `EsqueletoTabela` com
  linhas na proporção de uma lista e larguras irregulares (linhas iguais
  demais denunciam placeholder automático). API respondia em 2–8 ms: a demora
  era só o placeholder. `Botao` dos dois fronts ganhou `carregando` (spinner
  + trava o clique, senão dois cliques criam dois registros).
- **2026-09-28 — Trilha de auditoria (`registros`).** Tabela nova com quem
  fez, quando, em qual registro, e o ANTIGO/DEPOIS em JSON. Existe porque o
  painel edita por `COALESCE` (campo omitido mantém o anterior), então
  comparar o corpo da requisição com a tabela produziria log mentiroso
  ("preço: 9,90 → 9,90" em todo save); a leitura do antes vem ANTES do
  UPDATE. Save sem mudança não gera registro. Auditoria é efeito colateral:
  falhou, a ação do gestor já foi commitada — nunca derruba a operação.
  Rota `GET /api/registros` (JWT), tela `/painel/registros` com diff
  expansível campo a campo.
  **Consequência a saber:** `nome` entrou no payload do JWT (a auditoria não
  pode consultar o banco a cada registro). Tokens já emitidos não trazem o
  nome e aparecem como "Sistema" até o próximo login (o token dura 8 h).
  **Fora do log:** entradas/saídas de pedido — a `movimentacoes_estoque` já
  guarda com `pedido_id`; duplicar seria guardar o mesmo fato duas vezes.
- **2026-09-28 — `schema.sql` não era reaplicável.** `CREATE TABLE` sem
  `IF NOT EXISTS` morre na segunda execução, então tabela nova nunca entrava
  em base já montada. Agora todo `CREATE TABLE` tem `IF NOT EXISTS`, e os
  índices foram para `backend/seed/migracoes.sql` (o MySQL não tem
  `CREATE INDEX IF NOT EXISTS`; usa `information_schema` + `PREPARE`).
  Testado rodando duas vezes seguidas e do zero.
- **2026-09-29 — Upload de foto do produto.** Substituiu o campo de URL no
  modal: clicar abre o explorador de arquivos, e também aceita arrastar.
  Vai como base64 no corpo JSON em vez de multipart — evitar o multer
  (dependência nova) vale os 33% de inchaço do base64 para uma foto de
  catálogo. Foto sobe no momento da escolha, não no submit: guardar o File em
  estado seguraria o arquivo em memória e perderia tudo num refresh.
  Limite 5 MB; só JPG/PNG/WebP (SVG é vetor de script, fora). O nome do
  arquivo é UUID gerado no servidor — nome do cliente é ignorado, senão
  `../../../etc/passwd.png` sai da pasta. `entity.too.large` do body parser
  virou 413 com "o limite é 5 MB" em vez de 500 genérico.
  O caminho relativo (`/uploads/x.jpg`) precisa ser prefixado com a base da
  API nos dois fronts (`urlPublica` no painel, `urlDaImagem` na vitrine) —
  senão o `<img>` procura a foto no servidor do front e mostra quebrada.
  `backend/uploads/` no `.gitignore`: é conteúdo da loja, não código.
- **2026-09-29 — `README.md` vazio.** Perdeu-se na reescrita do histórico
  (setembro): o commit de docs entrou com o arquivo de 0 linhas. O `spec.md`
  está íntegro. Não reescrevi sozinho porque o texto é do autor — montou-se o
  esqueleto a partir do código, para ele completar.
- **2026-09-29 — `Insumos.tsx` acima de 150 linhas.** Os três modais foram
  para `ModaisInsumo.tsx` (mesmo desenho do `ModaisProduto`) e o cabeçalho
  passou a usar `CabecalhoSecao` como as outras telas. 156 → 118 linhas.
- **2026-09-29 — `spec.md` desatualizado.** Tinha o bot no escopo (removido
  a pedido do autor), uma tabela de papéis com os nomes dos colegas (o
  projeto é solo) e citava o README que está vazio. Reescrito: escopo real
  (auditoria + upload entram, bot sai), decisões conscientes com o porquê de
  não usar S3/CDN, e fluxo de branches sem nomes de pessoa.
- **2026-09-29 — Balão da vitrine sumia (bug de CSS).** Não era cor: o
  contraste estava em 15,3:1 (tinta sobre creme). O keyframe `subir` anima
  `transform`, e o mesmo elemento usava `-translate-x-1/2` para se centralizar
  — durante os 0,3 s a animação vencia o transform do Tailwind e o balão saía
  do centro, parecendo sumir. Novo keyframe `surgir` anima SÓ opacidade. O
  balão também foi para baixo (a área de cima era a foto do hero), ganhou
  barra de acento caramelo e ficou 3,2 s na tela em vez de 2,4.
- **2026-09-29 — Painel sem navegação no celular.** A sidebar tinha
  `max-md:hidden` e o cabeçalho do mobile não tinha UM link: o gestor entrava
  no painel e não conseguia sair da tela inicial. Agora tem `MenuMobile`
  (gaveta com as 7 telas) + `AbasRodape` (5 atalhos). A lista de navegação foi
  para `lib/menu.ts` — antes sidebar e rodapé teriam listas separadas e
  divergiriam.
- **2026-09-29 — Tabelas viraram cards no celular.** Medido: produtos e
  insumos exigiam 392px de rolagem lateral numa tela de 360px (mais que a
  largura da tela inteira), pedidos 312px, histórico 192px. Abaixo de `md`
  cada linha vira card empilhado; no desktop a tabela continua. Peças
  compartilhadas foram para `ui/AcoesLinha.tsx`.
- **2026-09-29 — Alvos de toque.** Os botões de ícone eram `h-9` (36px),
  abaixo dos 44px confortáveis. Agora `h-10` no celular, `h-9` no desktop.
- **2026-09-29 — Campo de foto do produto redesenhado.** A caixa tracejada
  gigante ocupava meia tela do modal sem dizer nada. Agora a área é uma linha
  com botão ao lado, e o espaço vai para a pré-visualização em 4:3 — a
  proporção REAL do card do cardápio, para o gestor ver o recorte que o
  cliente vai ver. Os manipuladores de drag foram para `ui/BotaoEscolher.tsx`.
- **2026-09-29 — Modal do produto com altura limitada no celular.** É o
  formulário mais longo do painel; sem `max-h` o botão Cadastrar ficava fora
  da tela. `max-h-[calc(100dvh-1.5rem)]` + `overflow-y-auto` no mobile, altura
  livre no desktop.
- **2026-09-29 — Emojis do dashboard fora.** ✅ (ListaBaixoEstoque), 🏆
  (ListaMaisVendidos), 🧾 (UltimosPedidos), ✅ (Perfil) e 🍓 (Entrar) saíram.
  Viraram `ui/VazioLista.tsx`: ícone lucide num disco de 32px + texto, com
  tom verde no "tudo Certain" e neutro no "ainda não aconteceu". Disco de 32px
  e não 56px como o DiscoVazio das telas de cadastro — aqui o vazio é uma
  linha dentro de cartão pequeno, e um disco grande ocuparia mais que o
  conteúdo. Zero emoji em código nos dois fronts agora.
- **2026-09-29 — "Pedidos do bot" saiu da tela de login.** Era a última
  menção ao bot no repositório (o `bot-whatsapp/` tinha sido removido antes).
  Virou "Pedidos chegando direto no painel".
- **2026-09-29 — Rolagem do painel no celular.** O autor reclamou de "rolagem
  horrível": o dashboard media 1064px (1,5 tela) num celular de 360px. O
  exagero eram as 4 métricas empilhadas em 1 coluna (488px) — agora são 2×2
  com o cartão na vertical (288px). O `pb-24` do <main> (96px) sobrava 45px
  de rolagem vazia no fim de TODA tela, porque o rodapé de abas tem ~51px:
  trocado por `pb-[4.5rem]` (72px). Gaps `gap-5` → `gap-4` no celular.
  Resultado: 1064px → 796px, de 1,5 tela para 1,1.
- **2026-09-29 — Gaveta do menu mobile não abria (bug de CSS).** Sintoma: no
  celular o botão de menu abria uma "fatia" fina em vez do menu. Causa: a
  gaveta é `fixed inset-0`, mas era renderizada DENTRO do `<header>`, que usa
  `backdrop-blur-md`. Pelo spec do CSS, um `backdrop-filter` no ancestral
  transforma-se no bloco contentor dos descendentes `position: fixed` — então
  a gaveta de "tela cheia" estava sendo desenhada nos ~60px do cabeçalho.
  Corrigido com `createPortal` para o `document.body`, que escapa da regra sem
  depender de z-index. Auditei os outros 6 overlays dos dois fronts: nenhum
  está dentro de um ancestral com backdrop-blur (são todos irmãos do header ou
  filhas do <main>), então o menu era o único caso.
- **2026-09-30 — Foto no login + fim das menções ao TCC.** O lado esquerdo do
  login era um bloco marrom sólido; agora tem foto de biscoitos (Unsplash
  `photo-1558961363-fa8fdf82db35`), escolhida entre 5 candidatas por ter fundo
  escuro (encaixa no `bg-tinta`), tons quentes como a paleta e espaço negativo
  para o texto. Véu de tinta 68% + gradiente no rodapé: o pior caso (a parte
  clara do biscoito) dá 7,9:1 contra o creme, acima dos 4,5:1 da WCAG — medido.
  NO CELULAR a faixa de marca some inteira (`hidden md:block`): o gestor via
  só o formulário, sem nenhuma pista de onde estava. Agora há uma faixa de
  160px no topo com a foto e o logo.
  **"TCC de Desenvolvimento de Sistemas — Etec" saiu de todo lugar:** rodapé da
  vitrine, tela de login e um comentário no `registroService`. Também tirei do
  `spec.md` e do `README.md` (que ainda tinha só "# TCC"). Zero ocorrência de
  TCC/ETEC em tudo que vai pro git agora. As menções no `CONTEXTO_PROJETO.md`
  continuam — esse arquivo é gitignored e é minha memória de trabalho.
- **2026-10-03 — Nome trocado para "Ateliê do Doce".** O autor escolheu entre
  o nome que propus e o "Ateliê Doce Açúcar" dele. Registrando a razão da
  troca de "ConfeitGest": (a) `doce` + `açúcar` repetem a mesma ideia — em
  português só formam composto quando o segundo é o TIPO (doce de leite, doce
  de chocolate), e "doce açúcar" soa redundante; (b) o nome antigo codificava
  as duas metades do projeto (confeitaria + gestão) e o novo soa como nome de
  LOJA, não de sistema. Aceita: em produto de TCC é comum o nome do cliente.
  "Ateliê" (com circunflexo, grafia do Acordo) = oficina de trabalho manual.
  O briefing passou a explicar que a marca precisa funcionar nas DUAS leituras
  (placa de loja de bairro E sistema confiável).
  **O nome é 27% mais longo** e o header da vitrine no celular estourava 7px:
  a fonte caiu para `text-lg sm:text-xl` só ali. Os outros 6 lugares tinham
  folga (mínima: sidebar, 47px).
  Monograma passa de CG para AD, e o briefing proíbe explicitamente de
  abrevitar a assinatura completa para "AD" — duas letras não dizem
  confeitaria.
  Trocado em 11 pontos: topo e rodapé da vitrine, sidebar, gaveta mobile,
  header do painel, login, `<title>` dos dois HTML, README, spec e um
  comentário. Os dois `<em>` de segunda cor continuam marcando o "do Doce".
- **2026-10-03 — Nome final: "Doce & Afeto".** Trocou de novo, agora
  **só no `IDENTIDADE.md`** (o prompt da logo). O código segue com
  "Ateliê do Doce" de propósito: o autor quer mandar o prompt primeiro e só
  depois aplicar nome + logo + refactor das telas numa leva só.
  **PENDENTE APPLY:** os 8 pontos do código com "Ateliê do Doce" (topo e
  rodapé da vitrine, sidebar, gaveta mobile, header do painel, login, 2
  `<title>`, README, spec) precisam virar "Doce & Afeto".
  Medido: "Doce & Afeto" tem 12 caracteres contra 14 de "Ateliê do Doce", ou
  seja, é **mais curto** — sobra 40px no header da vitrine no celular (o
  `text-lg` que coloquei para o nome longo continua, com folga). Nenhum
  ajuste de layout vai ser preciso na troca.
  No briefing: o "&" ganhou seção própria dizendo que ele é o melhor elemento
  do nome e que **não pode virar rabinho de "e"**; e que o favicon **não pode
  ser o "&"** (a 16px vira mancha). Monograma passa para `D&A` (era CG, depois
  AD). "Abreviar para DA" proibido na assinatura.
- **2026-10-04 — Logo desenhada em SVG e aplicada nos dois fronts.** O autor
  gerou uma folha de apresentação no ChatGPT (11 peças rotuladas numa imagem
  única de 1536×1024) — não dá para usar: os "favicon-16" dali são miniaturas
  desenhadas, não arquivos de 16 px, e o PNG é RGB sem transparência (o
  "fundo transparente" era xadrez pintado). Redesenhei o símbolo em SVG
  (viewBox 0 0 100, só M/L/H/V/C/Z — sem arco, para ser editável à mão).
  **PARA VER:** o navegador do OpenCode segue desconectado e não há
  ImageMagick/Pillow/sharp na máquina, então escrevi um rasterizador PNG puro
  em Python (`/tmp/opencode/raster.py`) só para conferir o desenho.
- **2026-10-04 — Favicon: quadrado caramelo com coração creme.** Testei 7
  variantes a 16/32/48 px. O símbolo completo empilha 4 formas verticais e a
  16px vira um bloco marrom — isso foi medido, não suposto. A versão aprovada
  usa UMA forma dentro de um quadrado que preenche 100% do quadro: lê em
  qualquer tamanho. Escolhi caramelo (cor de assinatura) em vez de marrom
  escuro, que se confunde com qualquer favicon genérico.
  **A onda da cobertura ficou só na versão grande** e o favicon usa faixa
  reta — foi a melhor das 4 primeiras simplificações.
- **2026-10-04 — Nome "Doce & Afeto" aplicado em 11 pontos** (topo e rodapé
  da vitrine, sidebar, gaveta mobile, header do painel, login, 2 `<title>`,
  README, spec, 1 comentário). O símbolo entrou nos 5 pontos de MARCA;
  ficou o `CakeSlice` do lucide nos 4 pontos de INTERFACE (menu de Produtos,
  "sem foto" na tabela, disco de lista vazia) — colocar o logo como
  placeholder de "sem foto" seria enganoso.
- **2026-10-04 — Avatar de sidebar e gaveta.** Os dois eram só texto, sem
  símbolo nenhum. Aproveitei que o import ficou sem uso e adicionei.
  Medido: cabe em todos os 8 pontos (min 34px de sobra na sidebar).
  **Rodapé da vitrine foi a exceção:** em 3 colunas no celular cada coluna
  fica com ~80px e nome + símbolo estouravam 90px. O bloco de fundo do
  símbolo some abaixo de `md` e a fonte cai para `text-lg`.
- **2026-10-04 — Backend não subia: três processos na porta 3000.** O sintoma
  era "a API não inicia". A causa: eu tinha deixado dois conjuntos de
  processos ao mesmo tempo — um `tsx src/server.ts` (que segurava a 3000) e
  um `npm run dev` antigo (`tsx watch`) que não conseguia bindar e reiniciava
  em loop. Quem tentava subir batia em `EADDRINUSE`.
  **COMO CONFERIR antes de subir qualquer coisa:**
  `ss -ltnp | grep :3000` mostra o pid que está segurando a porta.
  `pgrep -af "src/server.ts"` mostra quantos conjuntos existem — deve ser
  **um** (o par `sh -c` + `tsx watch` é normal; são três linhas que contam
  como um processo só).
  **Limpar antes de subir:** `kill -9 $(ss -ltnp | grep ':3000' | grep -o 'pid=[0-9]*' | cut -d= -f2)`.
  **NÃO usar `pkill -f "tsx.*server"`**: o padrão casa com o próprio comando do
  shell e mata a sessão (aconteceu duas vezes aqui, com "Killed by SIGTERM").
