import { Pencil, PackagePlus, Trash2 } from "lucide-react";
import type { Insumo } from "../types";
import { Estado } from "./ui/Badge";
import { BotaoAcao } from "./ui/AcoesLinha";

// Lista de insumos (5.4): tabela ledger no desktop, linha de lista no
// celular — direto sobre o creme, SEM moldura de cartão (720px de tabela
// exigiam 368px de rolagem lateral numa tela de 360px).
//
// SITUAÇÃO é a coluna nova, só visual: compara o que a linha JÁ recebe
// (atual ≤ mínimo) e fala o que a cor não diria sozinha — "Normal" quieto em
// textoSuave, "Abaixo do mínimo" com o marcador alerta (o texto herda a cor
// da situação, como nos demais estados de exceção). A linha em si não é
// tingida: o destaque fica no ESTOQUE semibold, que é o número que a
// gestora precisa enxergar primeiro.
//
// "Custo/un." continua com a formatação existente (ponto decimal — fora do
// escopo do redesign, registrado em PROGRESSO.md para a gestora decidir).
interface PropriedadesTabelaInsumos {
  insumos: Insumo[];
  aoMovimentar: (insumo: Insumo) => void;
  aoEditar: (insumo: Insumo) => void;
  aoExcluir: (insumo: Insumo) => void;
}

// Alvo claro para o dedo e olho: os links de ação das linhas são CHIPS
// fantasmas — texto com corpo no hover (areia + borda), sem virar botão
// colorido. Excluir acorda perigo; editar/mover acordam tinta.
const LINK_ACAO =
  "inline-flex min-h-11 items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-borda hover:bg-areia/60 hover:text-tinta";
const LINK_ACAO_EXCLUIR =
  "inline-flex min-h-11 items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-perigo/60 hover:bg-perigo/10 hover:text-perigo";

export function TabelaInsumos({
  insumos,
  aoMovimentar,
  aoEditar,
  aoExcluir,
}: PropriedadesTabelaInsumos): JSX.Element {
  return (
    <>
      {/* CELULAR: linha de lista. */}
      <ul className="divide-y divide-borda md:hidden">
        {insumos.map((insumo) => (
          <li key={insumo.id} className="flex items-center gap-1 py-1">
            <div className="min-h-16 min-w-0 flex-1 py-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-medium text-tinta">{insumo.nome}</span>
                <span className="flex-none font-numero text-sm font-semibold tabular-nums text-tinta">
                  {insumo.quantidade_atual}
                  <span className="ml-1 text-xs font-normal text-textoSuave">
                    {insumo.unidade_medida}
                  </span>
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline justify-between gap-3">
                {/* 2ª linha: a SITUAÇÃO em texto à esquerda (não depende de
                    cor), custo/un. em textoSuave à direita. */}
                <Situacao insumo={insumo} className="text-xs" />
                {/* Formato de cá Registers igual ao de antes (ponto decimal —
                    fora do escopo, registrado em PROGRESSO.md). */}
                <span className="flex-none font-numero text-xs tabular-nums text-textoSuave">
                  R$ {insumo.custo_unitario.toFixed(2)}/un
                </span>
              </div>
            </div>
            <BotaoAcao
              onClick={() => aoMovimentar(insumo)}
              rotulo={`Movimentar estoque de ${insumo.nome}`}
              className="text-carameloForte"
            >
              <PackagePlus size={16} strokeWidth={1.5} aria-hidden="true" />
            </BotaoAcao>
            <BotaoAcao
              onClick={() => aoEditar(insumo)}
              rotulo={`Editar ${insumo.nome}`}
              className="text-textoSuave"
            >
              <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
            </BotaoAcao>
            <BotaoAcao
              onClick={() => aoExcluir(insumo)}
              rotulo={`Excluir ${insumo.nome}`}
              className="text-textoSuave hover:text-perigo"
            >
              <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
            </BotaoAcao>
          </li>
        ))}
      </ul>

      {/* DESKTOP: tabela. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-borda text-xs font-semibold uppercase tracking-wider text-textoSuave">
              <th className="px-4 py-3">Insumo</th>
              <th className="px-4 py-3 text-right">Estoque</th>
              <th className="px-4 py-3 text-right">Custo/un.</th>
              <th className="px-4 py-3">Situação</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {insumos.map((insumo) => {
              const abaixo = insumo.quantidade_atual <= insumo.quantidade_minima;
              return (
                <tr
                  key={insumo.id}
                  className="border-b border-borda transition-colors last:border-0 hover:bg-areia/50"
                >
                  <td className="px-4 py-3">
                    <b className="block font-medium text-tinta">{insumo.nome}</b>
                    <span className="block text-xs text-textoSuave">
                      mín. {insumo.quantidade_minima} {insumo.unidade_medida}
                    </span>
                  </td>
                  {/* Sem tingir a LINHA: quando o limite aperta, o peso do
                      número sublinha o que a Situação já diz. */}
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`font-numero tabular-nums text-tinta ${abaixo ? "font-semibold" : ""}`}
                    >
                      {insumo.quantidade_atual}
                    </span>
                    <span className="ml-1 text-xs text-textoSuave">
                      {insumo.unidade_medida}
                    </span>
                  </td>
                  <td className="text-right font-numero tabular-nums text-tinta px-4 py-3">
                    R$ {insumo.custo_unitario.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <Situacao insumo={insumo} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => aoMovimentar(insumo)}
                        aria-label={`Movimentar estoque de ${insumo.nome}`}
                        className={LINK_ACAO}
                      >
                        Movimentar
                      </button>
                      <button
                        type="button"
                        onClick={() => aoEditar(insumo)}
                        aria-label={`Editar ${insumo.nome}`}
                        className={LINK_ACAO}
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => aoExcluir(insumo)}
                        aria-label={`Excluir ${insumo.nome}`}
                        className={LINK_ACAO_EXCLUIR}
                      >
                        Excluir
                      </button>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** Estado "Normal"/"Abaixo do mínimo" — comparação só visual entre campos já recebidos. */
function Situacao({ insumo, className = "" }: { insumo: Insumo; className?: string }): JSX.Element {
  const alerta = insumo.quantidade_atual <= insumo.quantidade_minima;
  return alerta ? (
    <Estado tom="alerta" className={className}>
      Abaixo do mínimo
    </Estado>
  ) : (
    <Estado tom="suave" className={`text-textoSuave ${className}`}>
      Normal
    </Estado>
  );
}
