// Fachada da API: o resto do painel importa daqui e não precisa saber em qual
// arquivo cada rota mora. As implementações estão divididas por domínio.
export { ErroApi } from "./api/base";

export { entrar, obterUsuario, atualizarPerfil } from "./api/auth";
export {
  listarPedidos,
  obterPedido,
  definirStatusPedido,
  definirPagamentoPedido,
  listarBaixoEstoque,
  listarMaisVendidos,
} from "./api/pedidos";
export {
  listarInsumos,
  criarInsumo,
  atualizarInsumo,
  removerInsumo,
  movimentarInsumo,
} from "./api/insumos";
export {
  listarProdutosAdmin,
  obterProdutoAdmin,
  criarProduto,
  atualizarProduto,
  salvarFichaTecnica,
  removerProduto,
  listarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from "./api/produtos";
export { listarRegistros } from "./api/registros";
export { enviarImagem, validarArquivo } from "./api/uploads";
export { urlPublica } from "./api/base";
