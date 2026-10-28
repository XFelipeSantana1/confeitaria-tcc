import type { FiltroCategoria } from "../components/PainelCategorias";

/**
 * Os três vazios da tela de Produtos, em um componente.
 *
 * Ficavam dentro da página e deixavam o arquivo em 257 linhas — acima do limite
 * do projeto. E são os três casos em que o gestor não tem nada para fazer:
 * nenhum produto cadastrado, nenhum produto na categoria escolhida, e nenhum
 * produto para o termo buscado.
 *
 * Visual: texto à esquerda, sem disco, sem ícone — vazio de ferramenta é
 * instrução, não ilustração.
 */
export type SituacaoLista =
  | { tipo: "sem-produtos" }
  | { tipo: "sem-categoria"; filtro: FiltroCategoria }
  | { tipo: "sem-resultado"; busca: string; categoria: FiltroCategoria };

export function EstadosProdutos({ situacao }: { situacao: SituacaoLista }): JSX.Element {
  if (situacao.tipo === "sem-produtos") {
    return (
      <div className="py-8">
        <b className="block text-base font-semibold text-tinta">Nenhum produto cadastrado</b>
        <p className="mt-1 text-sm text-textoSuave">
          Cadastre o primeiro doce para encher a vitrine.
        </p>
      </div>
    );
  }

  if (situacao.tipo === "sem-categoria") {
    return (
      <div className="py-8">
        <b className="block text-base font-semibold text-tinta">Nada nesta categoria</b>
        <p className="mt-1 text-sm text-textoSuave">
          {situacao.filtro === "sem"
            ? "Todos os produtos estão classificados."
            : "Nenhum produto usa essa categoria ainda."}
        </p>
      </div>
    );
  }

  // Busca sem resultado: distinguir "não existe isso" de "existe, mas está
  // fora do filtro" é o que evita a pessoa achar que apagou produto por engano.
  const filtrando = situacao.categoria !== "todas";
  return (
    <div className="py-8">
      <b className="block text-base font-semibold text-tinta">
        Nada para “{situacao.busca}”
      </b>
      <p className="mt-1 text-sm text-textoSuave">
        {filtrando
          ? "Nenhum produto com esse nome nesta categoria. Tente “ver todos”."
          : "Nenhum produto com esse nome. Confira a escrita."}
      </p>
    </div>
  );
}
