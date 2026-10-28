import type { Insumo } from "../types";
import type { DadosInsumo } from "./ModalInsumo";
import { ModalConfirmacao } from "./ModalConfirmacao";
import { ModalInsumo } from "./ModalInsumo";
import { ModalMovimentacao } from "./ModalMovimentacao";

// As três janelas de insumos (cadastro, movimentação e excluir) saem da tela
// e passam a viver aqui: a página cuida de listar e o que fazer com cada
// janela, e não de desenhar três modais. Mesmo desenho do ModaisProduto.
export type JanelaInsumo =
  | { tipo: "fechada" }
  | { tipo: "insumo"; insumo: Insumo | null }
  | { tipo: "movimentar"; insumo: Insumo }
  | { tipo: "excluir"; insumo: Insumo };

interface PropriedadesModaisInsumo {
  janela: JanelaInsumo;
  salvando: boolean;
  erroModal: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: DadosInsumo) => void;
  aoSalvarMovimentacao: (dados: {
    tipo: string;
    quantidade: number;
    observacao?: string;
  }) => void;
  aoConfirmarExclusao: () => void;
}

export function ModaisInsumo({
  janela,
  salvando,
  erroModal,
  aoFechar,
  aoSalvar,
  aoSalvarMovimentacao,
  aoConfirmarExclusao,
}: PropriedadesModaisInsumo): JSX.Element {
  return (
    <>
      {janela.tipo === "insumo" && (
        <ModalInsumo
          // key força remontar ao trocar de registro: sem ela o formulário
          // continuaria com os dados do insumo anterior.
          key={janela.insumo?.id ?? "novo"}
          insumo={janela.insumo}
          salvando={salvando}
          erro={erroModal}
          aoFechar={aoFechar}
          aoSalvar={aoSalvar}
        />
      )}
      {janela.tipo === "excluir" && (
        <ModalConfirmacao
          titulo={`Remover "${janela.insumo.nome}"?`}
          mensagem="O cadastro sai da lista. Se ele estiver em alguma receita ou movimentação, a remoção é bloqueada com aviso."
          textoConfirmar="Remover"
          processando={salvando}
          erro={erroModal}
          aoFechar={aoFechar}
          aoConfirmar={aoConfirmarExclusao}
        />
      )}
      {janela.tipo === "movimentar" && (
        <ModalMovimentacao
          key={janela.insumo.id}
          insumo={janela.insumo}
          salvando={salvando}
          erro={erroModal}
          aoFechar={aoFechar}
          aoSalvar={aoSalvarMovimentacao}
        />
      )}
    </>
  );
}
