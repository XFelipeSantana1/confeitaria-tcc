import { Link } from "react-router-dom";

// A FILA do Resumo ("Precisa de você agora") — o antigo CartaoMetrica de
// quatro cartões iguais mudou de forma: agora é uma sequência de LINHAS de
// fila, sem moldura (hairline entre elas), com o número ligado à AÇÃO.
// Nome de arquivo continua CartaoMetrica (o prompt pede para manter os
// nomes); o conteúdo é outra coisa e o Resumo é o dono da ordem.
//
// Inteira clicável, no destino que os botões "Ver pedidos"/"Ver estoque"
// faziam antes de sair: o rótulo diz o que é, o número diz quanto, o link
// leva onde resolve. Zero = textoSuave (silêncio); pendente > 0 carameloForte
// (ação); estoque baixo > 0 alerta (atenção).

export type TomFila = "tinta" | "acao" | "alerta" | "suave";

export interface ItemFila {
  rotulo: string;
  descricao: string;
  valor: number | string;
  tom?: TomFila;
  para: string;
}

const COR_VALOR: Record<TomFila, string> = {
  tinta: "text-tinta",
  acao: "text-carameloForte",
  alerta: "text-alerta",
  suave: "text-textoSuave",
};

export function CartaoMetrica({ itens }: { itens: ItemFila[] }): JSX.Element {
  return (
    <section aria-label="Precisa de você agora">
      <p className="text-xs font-semibold uppercase tracking-wider text-textoSuave">
        Precisa de você agora
      </p>
      <div className="mt-2 divide-y divide-borda">
        {itens.map((item) => (
          <Link
            key={item.rotulo}
            to={item.para}
            className="flex min-h-14 items-center justify-between gap-4 py-1.5 transition-colors hover:bg-areia/50 md:min-h-12"
          >
            <span className="min-w-0">
              <span className="block text-sm font-medium text-tinta">{item.rotulo}</span>
              <span className="block text-sm text-textoSuave">{item.descricao}</span>
            </span>
            <b
              className={`font-numero text-xl font-semibold tabular-nums ${
                COR_VALOR[item.tom ?? "tinta"]
              }`}
            >
              {item.valor}
            </b>
          </Link>
        ))}
      </div>
    </section>
  );
}
