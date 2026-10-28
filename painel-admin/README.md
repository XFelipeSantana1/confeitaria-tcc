# Painel do Gestor

Área logada da confeitaria (React + TypeScript + Vite + Tailwind +
react-router-dom). Fala com o backend Express via JWT no header
`Authorization: Bearer`.

## Como rodar

```bash
cd painel-admin
npm install
npm run dev      # http://localhost:5173 (use --port 5174 se a vitrine estiver no ar)
```

Backend no ar (`cd backend && npm run dev`) + MySQL (`docker compose up -d`
na raiz). Primeiro acesso: crie o admin via `POST /api/auth/registrar`
(base vazia libera o bootstrap) e entre com ele em `/entrar`.

## Rotas

- `/entrar` — login (pública)
- `/painel` — Resumo: métricas (pendentes, em preparo, a receber, estoque
  baixo) + mais pedidos + estoque baixo + últimos pedidos
- `/painel/pedidos` — lista com abas por status **e contagem em cada aba** +
  busca não (não precisa, são poucos) + drawer de detalhe (avançar status,
  cancelar com estorno, marcar pagamento)
- `/painel/insumos` — CRUD + busca por nome + registrar entrada/perda/ajuste
  de estoque
- `/painel/produtos` — CRUD + busca por nome + liga/desliga na vitrine + ficha
  técnica + painel lateral de categorias (criar, renomear, remover e
  **filtrar** a tabela por categoria)
- `/painel/registros` — trilha de auditoria, com o diff antes/depois

Duas telas não existem mais, e foram de propósito:

**Categorias** era uma tela com três registros ocupando a página inteira.
Categoria é atributo de produto, não assunto próprio: virou painel dentro de
Produtos (`PainelCategorias`), que ainda aproveita para filtrar a tabela.

**Meu perfil** era uma página do menu para duas linhas de formulário. Virou
janela (`JanelaPerfil`) aberta pelo nome do gestor, no rodapé da sidebar e
da gaveta — que é onde se procura quando se quer trocar a senha.

## Estrutura (`src/`)

- `types/` — `Usuario`, `Sessao`, `Pedido`, `ItemPedido`, `DetalhePedido`,
  `Insumo`, `ProdutoAdmin`, `ItemFicha`, `Categoria`, `ProdutoVendido`,
  `Registro`
- `lib/` — `api/` (uma pasta por assunto, `base.ts` com fetch + `ErroApi`),
  `periodo.ts` (filtro e agrupamento por dia), `formatarData.ts`,
  `sessao.ts`, `formatarMoeda.ts`, `menu.ts` (navegação), `pedido.ts`
  (rótulos/tons/fluxo de status), `aparenciaRegistro.ts`
- `hooks/` — `useAutenticacao` (contexto), `useResumo`, `usePedidos`,
  `useInsumos`, `useProdutos` (dona também das categorias), `useRegistros`,
  `useJanelaProduto`, `useUploadImagem`, `usePedidosPendentes`
- `components/` — `AlertaAcao`, `Busca`, `BuscaComContagem`, `ContadorMenu`,
  `EstadosProdutos`, `GraficoVendas`, `PainelDeProduto`, `PainelCategorias`,
  `JanelaPerfil`, `FormularioSenha`, `Avatar`, `Marca`,
  `BarraLateral`, `EstruturaPainel`, `MenuMobile`,
  `AbasRodape`, `RotaProtegida`, `CabecalhoSecao`, `CartaoMetrica`,
  `ListaMaisVendidos`, `ListaBaixoEstoque`, `UltimosPedidos`, `TabelaInsumos`,
  `TabelaProdutos`, `CartaoProduto`, `DrawerPedido`, `ItensPedido`,
  `AcoesPedido`, `CabecalhoDrawer`, `EditorFicha`, `ModaisProduto`,
  `PainelCategorias`, `JanelaPerfil`, `LinhaRegistro`,
  `Modal{Insumo,Movimentacao,Produto,Confirmacao,Categoria}`,
  `Marca` (símbolo), `ui/` (Botao, Cartao, Entrada, DiscoVazio,
  EsqueletoTabela, AcoesLinha, BotaoEscolher, VazioLista)
- `pages/` — `Entrar`, `Resumo`, `Pedidos`, `Insumos`, `Produtos`, `Registros`

## Padrões

Nomes em português, tipagem explícita (sem `any`), componentes de até ~150
linhas, `carregando` + `erro` + try/catch/finally em toda chamada à API.

Duas regras que valem para qualquer tela nova:

- **A regra de negócio mora no backend.** Cancelar pedido entregue é escondido
  no botão, mas a API é quem recusa (`lib/cicloPedido.ts` do backend). Se a
  regra só existe na tela, qualquer outra chamada burla.
- **Toda escrita mostra o resultado.** Um `void funcao()` sem tratamento
  some com a falha de rede: o selo muda e a informação não. Toda ação que
  escreve precisa de `try/catch` e de um lugar visível para o erro.
- **Contador de pendente em três lugares vem de uma consulta só.** A barra
  lateral, a gaveta e o rodapé do celular leem o mesmo hook; buscar dentro de
  cada um faria a mesma requisição três vezes em toda tela.