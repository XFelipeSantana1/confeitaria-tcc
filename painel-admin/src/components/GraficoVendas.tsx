import { formatarMoeda } from "../lib/formatarMoeda";
import type { DiaVendido } from "../lib/periodo";
import { VazioLista } from "./ui/VazioLista";

interface PropriedadesGraficoVendas {
  dias: DiaVendido[];
}

/**
 * Vendas por dia, em SVG próprio (zero biblioteca de gráfico).
 *
 * Barras silenciosas em textoSuave; a barra do dia mais alto é a única cor
 * (caramelo, e só como BARRA — nunca como texto pequeno). Três linhas-guia em
 * hairline bastam para comparar com o olho; rótulos do eixo ficam Manrope
 * tabular, só primeiro/meio/último dia, que é o que cabe em 360px.
 *
 * O número já está no `aria-label` de cada fecha modo. Cape ou ouve: dia e
 * valor entram na ordem do gráfico.
 */
export function GraficoVendas({ dias }: PropriedadesGraficoVendas): JSX.Element {
  if (dias.every((dia) => dia.total === 0)) {
    return <VazioLista texto="Nenhuma venda neste período." />;
  }

  const maior = Math.max(...dias.map((dia) => dia.total), 1);
  const diaDe = dias.findIndex((dia) => dia.total === maior);
  const n = dias.length;
  const LARGURA = 700;
  const ALTURA = 150;
  const trilha = LARGURA / n;

  return (
    <div>
      <svg
        viewBox={`0 0 ${LARGURA} ${ALTURA}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label={`Vendas por dia: ${dias
          .map((dia) => `${dia.rotulo} ${formatarMoeda(dia.total)}`)
          .join(", ")}`}
      >
        {/* Três linhas-guia horizontais apenas — mais do que isso, é ruído. */}
        {[1, 2, 3].map((trimestre) => (
          <line
            key={trimestre}
            x1={0}
            x2={LARGURA}
            y1={(ALTURA * trimestre) / 4}
            y2={(ALTURA * trimestre) / 4}
            className="stroke-borda"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {dias.map((dia, indice) => {
          if (dia.total === 0) return null;
          const altura = (dia.total / maior) * (ALTURA - 6);
          return (
            <rect
              key={dia.chave}
              x={indice * trilha + trilha * 0.16}
              width={trilha * 0.68}
              y={ALTURA - altura}
              height={altura}
              className={indice === diaDe ? "fill-caramelo" : "fill-textoSuave"}
            />
          );
        })}
      </svg>
      {/* Rótulos só nas pontas: um por barra em 360px vira listra ilegível. */}
      <div className="mt-2 flex justify-between font-numero text-xs tabular-nums text-textoSuave">
        <span>{dias[0]?.rotulo}</span>
        {n > 2 ? <span>{dias[Math.floor(n / 2)]?.rotulo}</span> : null}
        <span>{dias[n - 1]?.rotulo}</span>
      </div>
    </div>
  );
}
