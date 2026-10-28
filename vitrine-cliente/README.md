# Vitrine do Cliente — Cardápio 🧁

Cardápio público (sem login, sem build no consumo): React + TypeScript + Vite
+ Tailwind. Consome o backend Express (`GET /api/categorias`,
`GET /api/produtos`) e finaliza o pedido abrindo o WhatsApp com o texto
pronto — **sem checkout via API** (decisão de escopo do MVP).

## Como rodar

```bash
cd vitrine-cliente
npm install
npm run dev      # http://localhost:5173
```

Outros comandos: `npm run build` (gera `dist/`) e `npm run preview`
(serve o build para conferir antes de publicar).

O backend precisa estar no ar (`cd backend && npm run dev`) com o MySQL
(`docker compose up -d` na raiz). Sem API, a vitrine mostra a tela de erro
com **Tentar novamente** — e oferece ver a **demonstração** local.

## Configuração

| Onde | O quê |
|---|---|
| `.env` (`VITE_API_URL`, `VITE_WHATSAPP_LOJA`) | padrões de build |
| Engrenagem ⚙️ na vitrine | URL da API + WhatsApp da loja (salvos no navegador, têm prioridade) |

## Estrutura (`src/`)

- `types/` — `Produto`, `ProdutoBruto`, `Categoria`, `ItemCarrinho`, `EstadoApi`
- `lib/` — funções puras e API: `api.ts` (fetch + normalização do `preco`
  string→number), `mensagemWhats.ts` (total + texto/link do pedido),
  `formatarMoeda.ts`, `disponibilidade.ts`, `estadoApi.ts`,
  `aparenciaProduto.ts`, `dadosDemonstracao.ts`
- `hooks/` — `useCardapio` (busca com `carregando`/`erro`), `useCarrinho`
  (sacola com persistência), `useAviso` (toast temporário)
- `components/` — um por responsabilidade (`CardProduto`, `CarrinhoDrawer`,
  `SecaoCardapio`, `SecaoCategoria`, `AlertaErro`, `EstadoVazio`,
  `EsqueletoCardapio`, `ItemSacola`, `Cabecalho`, `Hero`,
  `SecaoInformacoes`, `Rodape`, `AvisoFlutuante`, `ModalAjuda`,
  `ModalConfiguracoes`, `ui/Botao`)

## Padrões

Nomes em português, tipagem explícita (sem `any`), componentes de até ~150
linhas, comentários explicando o **porquê**. Design: Playfair Display +
DM Sans, primária `#030213`, ícones `lucide-react`.
