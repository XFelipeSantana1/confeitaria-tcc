import type { Categoria, Insumo } from "../types";
import type { DadosProduto } from "./ModalProduto";
import type { Janela } from "../hooks/useJanelaProduto";
import { ModalConfirmacao } from "./ModalConfirmacao";
import { ModalProduto } from "./ModalProduto";

// Modais da tela de produtos (formulário + excluir). Separados para a página
// cuidar só de lista e ações, não de montar cada janela.
// O tipo da janela vem do hook que a controla. Ele vivia duplicado aqui e em
// useJanelaProduto: como as duas uniões eram iguais, compilar escondia o
// desacordo até um membro divergir — e o erro apareceria longe da causa.
export type { Janela as JanelaProduto };

interface PropriedadesModaisProduto {
  janela: Janela;
  categorias: Categoria[];
  insumos: Insumo[];
  salvando: boolean;
  erroModal: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: DadosProduto) => void;
  aoEnviarImagem: (arquivo: File) => Promise<string>;
  aoConfirmarExcluir: () => void;
}

export function ModaisProduto({
  janela,
  categorias,
  insumos,
  salvando,
  erroModal,
  aoFechar,
  aoSalvar,
  aoEnviarImagem,
  aoConfirmarExcluir,
}: PropriedadesModaisProduto): JSX.Element | null {
  if (janela.tipo === "produto") {
    return (
      <ModalProduto
        key={janela.produto?.id ?? "novo"}
        produto={janela.produto}
        fichaInicial={janela.ficha}
        categorias={categorias}
        insumos={insumos}
        salvando={salvando}
        erro={erroModal}
        aoFechar={aoFechar}
        aoSalvar={aoSalvar}
        aoEnviarImagem={aoEnviarImagem}
      />
    );
  }
  if (janela.tipo === "excluir") {
    return (
      <ModalConfirmacao
        titulo={`Remover "${janela.produto.nome}"?`}
        mensagem="Ele some da vitrine. Com vendas vinculadas, a remoção é bloqueada com aviso."
        textoConfirmar="Remover"
        processando={salvando}
        erro={erroModal}
        aoFechar={aoFechar}
        aoConfirmar={aoConfirmarExcluir}
      />
    );
  }
  return null;
}
