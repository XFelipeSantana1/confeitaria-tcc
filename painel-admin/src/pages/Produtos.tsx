import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useProdutos } from "../hooks/useProdutos";
import { useJanelaProduto } from "../hooks/useJanelaProduto";
import { useUploadImagem } from "../hooks/useUploadImagem";
import { ErroApi } from "../lib/api";
import type { Categoria, ProdutoAdmin } from "../types";
import { EsqueletoTabela } from "../components/ui/EsqueletoTabela";
import { Botao } from "../components/ui/Botao";
import { AlertaAcao } from "../components/AlertaAcao";
import { BuscaComContagem } from "../components/BuscaComContagem";
import { CabecalhoSecao } from "../components/CabecalhoSecao";
import { TabelaProdutos } from "../components/TabelaProdutos";
import { type FiltroCategoria } from "../components/PainelCategorias";
import { PainelDeProduto } from "../components/PainelDeProduto";
import { EstadosProdutos } from "../components/EstadosProdutos";
import type { DadosProduto } from "../components/ModalProduto";

// Produtos (/painel/produtos): tabela com liga/desliga da vitrine, modal com
// ficha técnica dinâmica e excluir com confirmação personalizada.
// A janela (abrir/editar/excluir + tratamento de erro) mora no hook;
// aqui fica só a composição da tela.
//
// Categorias moram aqui também, num painel lateral (ver PainelCategorias).
// Tocar numa categoria filtra a tabela: era três registros numa tela inteira
// e agora o painel trabalha junto com a lista.
export function Produtos(): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const {
    produtos,
    categorias,
    insumos,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente,
    criar,
    atualizar,
    salvarFicha,
    remover,
    criarCategoria,
    atualizarCategoria,
    removerCategoria,
    carregarFicha,
  } = useProdutos(sessao?.token ?? null);

  const janela = useJanelaProduto({
    criar,
    atualizar,
    salvarFicha,
    remover,
    carregarFicha,
  });
  const { enviar: enviarFoto } = useUploadImagem(sessao?.token ?? null);

  const [painelAberto, definirPainelAberto] = useState(false);
  const [filtro, definirFiltro] = useState<FiltroCategoria>("todas");
  const [trocandoId, definirTrocandoId] = useState<number | null>(null);
  const [erroAlternar, definirErroAlternar] = useState<string | null>(null);

  // Efeito, e não `if` no corpo do render: `sair()` atualiza o estado do
  // provedor de sessão, e mexer no estado de outro componente durante o
  // render é o que o React avisa em tempo de execução.
  useEffect(() => {
    if (precisaLogin) sair();
  }, [precisaLogin, sair]);


  const [termo, definirTermo] = useState("");

  // Categoria E texto, nesta ordem: primeiro o que a pessoa escolheu na lista,
  // depois o que ela digitou. Se o texto não bate com a categoria escolhida, a
  // lista fica vazia — e o contador abaixo diz por quê.
  const porCategoria =
    filtro === "todas"
      ? produtos
      : filtro === "sem"
        ? produtos.filter((produto) => produto.categoria_id === null)
        : produtos.filter((produto) => produto.categoria_id === filtro);

  const visiveis = useMemo(() => {
    const alvo = termo.trim().toLowerCase();
    if (alvo === "") return porCategoria;
    const semAcento = (texto: string) =>
      texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return porCategoria.filter((produto) => semAcento(produto.nome).toLowerCase().includes(alvo));
  }, [porCategoria, termo]);

  // Nome da categoria em foco, para o botão de sair do filtro. Busca pelo id
  // porque o filtro guarda o número, não a linha — que pode ter sido renomeada
  // (ou removida, e aí o efeito abaixo devolve para "todas").
  const categoriaDoFiltro =
    typeof filtro === "number" ? categorias.find((c) => c.id === filtro) : null;

  // Remover a categoria que estava em foco solta o filtro: sobraria uma lista
  // vazia sem botão para sair, porque o painel some junto com a linha.
  async function removerCategoriaVisivel(categoria: Categoria): Promise<void> {
    await removerCategoria(categoria.id);
    if (filtro === categoria.id) definirFiltro("todas");
  }

  // Liga/desliga na vitrine. Precisava de tratamento porque o `void` que
  // existia aqui escondia a falha de rede: o selo mudava na tela e o cardápio
  // continuava como estava, sem nenhuma explicação.
  async function alternarAtivo(produto: ProdutoAdmin): Promise<void> {
    definirTrocandoId(produto.id);
    definirErroAlternar(null);
    try {
      await atualizar(produto.id, { ativo: !produto.ativo });
    } catch (falha) {
      definirErroAlternar(
        falha instanceof ErroApi
          ? falha.message
          : "Não foi possível mudar a visibilidade. Tente de novo.",
      );
    } finally {
      definirTrocandoId(null);
    }
  }

  function filtrar(novo: FiltroCategoria): void {
    definirFiltro(novo);
    // Sai do modo edição de produto: filtrar a lista com um formulário aberto
    // escondia o produto que estava sendo editado atrás do resultado do filtro.
    janela.fechar();
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <CabecalhoSecao
        titulo="Produtos"
        acao={
          <div className="flex gap-2">
            <Botao
              variante="secundario"
              onClick={() => definirPainelAberto(true)}
            >
              Categorias
            </Botao>
            {/* No celular "Novo produto" ocupa o resto da linha (5.3). */}
            <Botao onClick={janela.abrirNovo} className="min-w-0 flex-1 md:flex-none">
              Novo produto
            </Botao>
          </div>
        }
      />

      <BuscaComContagem
        valor={termo}
        aoMudar={definirTermo}
        placeholder="Buscar doce pelo nome…"
        rotulo="Buscar produto pelo nome"
        encontrados={visiveis.length}
        total={porCategoria.length}
        palavra="produtos"
      />

      {/* Dois erros podem coexistir (a troca de visibilidade e a janela), e
          quem está em cima é o mais recente. */}
      <AlertaAcao texto={erroAlternar ?? janela.aviso} />

      {filtro !== "todas" ? (
        <div className="flex items-center justify-between gap-2">
          {/* Filtro ativo em TEXTO (sem pílula): o nome e a quantidade da
              seleção; sair do filtro é ação de texto com o X de "fechar". */}
          <span className="min-w-0 truncate text-sm font-medium text-tinta">
            {filtro === "sem" ? "Sem categoria" : categoriaDoFiltro?.nome}
            <span className="ml-1.5 font-numero text-xs tabular-nums text-textoSuave">
              {visiveis.length}
            </span>
          </span>
          <Botao variante="texto" onClick={() => filtrar("todas")} className="flex items-center gap-1">
            <X size={14} strokeWidth={1.5} aria-hidden="true" />
            Ver todos
          </Botao>
        </div>
      ) : null}

      {carregando ? (
        <EsqueletoTabela linhas={4} />
      ) : erro ? (
        <div className="py-8">
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
          <div className="mt-3">
            <Botao variante="texto" onClick={buscarNovamente}>
              Tentar de novo
            </Botao>
          </div>
        </div>
      ) : visiveis.length === 0 ? (
        <EstadosProdutos
          situacao={
            produtos.length === 0
              ? { tipo: "sem-produtos" }
              : termo.trim() !== ""
                ? { tipo: "sem-resultado", busca: termo.trim(), categoria: filtro }
                : { tipo: "sem-categoria", filtro }
          }
        />
      ) : (
        <TabelaProdutos
          produtos={visiveis}
          aoEditar={janela.abrirEdicao}
          aoAlternarAtivo={alternarAtivo}
          aoExcluir={janela.pedirExclusao}
          trocandoId={trocandoId}
        />
      )}

      <PainelDeProduto
        janela={janela.janela}
        categorias={categorias}
        insumos={insumos}
        produtos={produtos}
        filtro={filtro}
        painelAberto={painelAberto}
        salvando={janela.abrindo}
        erroModal={janela.erro}
        aoFecharJanela={janela.fechar}
        aoSalvar={(dados: DadosProduto) => void janela.salvarProduto(dados)}
        aoEnviarImagem={enviarFoto}
        aoConfirmarExcluir={() => void janela.confirmarExclusao()}
        aoFiltrar={filtrar}
        aoFecharCategorias={() => definirPainelAberto(false)}
        aoCriarCategoria={criarCategoria}
        aoRenomearCategoria={atualizarCategoria}
        aoRemoverCategoria={removerCategoriaVisivel}
      />
    </div>
  );
}