import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Insumo } from "../types";
import { Entrada } from "./ui/Entrada";
import { Botao } from "./ui/Botao";

// Registrar movimentação: entrada soma; perda/ajuste baixam (saída manual
// segue bloqueada no backend — só via venda). Baixa sem saldo volta 409.
//
// A escolha do TIPO é a fileira segmentada da 5.4 (borda textoSuave/80,
// selecionado = tinta com branco, o texto do tipo sempre visível). A spec
// imaginava dois segmentos ("Entrada" | "Saída"), mas a API grava TRÊS
// tipos com trilha auditada — achatar Perda/Ajuste destruiria o histórico,
// então a fileira tem três segmentos e o primário nomeia a escolha
// ("Registrar entrada"/"Registrar perda"/"Registrar ajuste"). Desvio
// registrado em PROGRESSO.md.
const TIPOS = [
  { valor: "entrada", rotulo: "Entrada", texto: "Compra ou doação entra no estoque." },
  { valor: "perda", rotulo: "Perda", texto: "Vencido ou quebrado sai do estoque." },
  { valor: "ajuste", rotulo: "Ajuste", texto: "Correção de inventário, com observação." },
];

interface PropriedadesModalMovimentacao {
  insumo: Insumo;
  salvando: boolean;
  erro: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: { tipo: string; quantidade: number; observacao?: string }) => void;
}

export function ModalMovimentacao({
  insumo,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: PropriedadesModalMovimentacao): JSX.Element {
  const [tipo, definirTipo] = useState("entrada");
  const [quantidade, definirQuantidade] = useState("");
  const [observacao, definirObservacao] = useState("");

  const escolhido = TIPOS.find((t) => t.valor === tipo);

  function enviar(evento: FormEvent): void {
    evento.preventDefault();
    aoSalvar({
      tipo,
      quantidade: Number(quantidade),
      observacao: observacao.trim() || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-tinta/50 md:grid md:place-items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Movimentar estoque"
    >
      <form
        onSubmit={enviar}
        className="flex min-h-dvh w-full flex-col gap-3 bg-white p-4 text-tinta shadow-flutuante md:min-h-0 md:max-w-md md:rounded-card md:border md:border-borda md:p-6"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-2 bg-white pb-1 md:static md:pb-0">
          <button
            type="button"
            onClick={aoFechar}
            className="-ml-2 flex-none rounded-campo px-2 text-sm font-medium text-textoSuave hover:text-tinta hover:underline underline-offset-4 md:hidden"
            aria-label="Cancelar e voltar para a lista"
          >
            Cancelar
          </button>
          <div className="min-w-0 flex-1 md:flex-none">
            <h3 className="text-lg font-semibold text-tinta">Movimentar estoque</h3>
            <p className="text-sm text-textoSuave">
              {insumo.nome} · Atual:{" "}
              <span className="font-numero font-semibold tabular-nums text-tinta">
                {insumo.quantidade_atual} {insumo.unidade_medida}
              </span>
            </p>
          </div>
          <button
            type="submit"
            disabled={salvando}
            className="-mr-2 flex-none rounded-campo px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
          >
            {salvando ? "Registrando…" : "Registrar"}
          </button>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="hidden h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia/60 md:grid"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>

        {/* Fileira segmentada: Entrada · Perda · Ajuste. O texto do tipo
            fica SEMPRE visível (5.4); o que muda é o peso e o fundo. */}
        <div role="group" aria-label="Tipo de movimentação" className="flex rounded-campo border border-textoSuave/80 bg-white p-1">
          {TIPOS.map((opcao, indice) => (
            <button
              key={opcao.valor}
              type="button"
              aria-pressed={tipo === opcao.valor}
              onClick={() => definirTipo(opcao.valor)}
              className={`min-h-11 flex-1 px-2 text-sm font-medium transition-colors ${
                indice === 0 ? "rounded-l-campo" : ""
              } ${indice === TIPOS.length - 1 ? "rounded-r-campo" : ""} ${
                tipo === opcao.valor
                  ? "bg-tinta text-white"
                  : "text-tinta hover:bg-areia/50"
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>
        <p className="text-xs text-textoSuave">{escolhido?.texto}</p>

        <Entrada
          id="mov-qtd"
          rotulo={`Quantidade (${insumo.unidade_medida})`}
          type="number"
          min="0"
          step="any"
          value={quantidade}
          onChange={(e) => definirQuantidade(e.target.value)}
          placeholder="Ex: 500"
          className="font-numero tabular-nums"
        />
        <Entrada id="mov-obs" rotulo="Observação (opcional)" value={observacao} onChange={(e) => definirObservacao(e.target.value)} placeholder="Ex: compra no atacadão" />
        {erro ? (
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
        ) : null}
        {/* No celular quem registra é o cabeçalho; primário de rodapé é do
            desktop — igual ao padrão do formulário de produto. */}
        <Botao type="submit" disabled={salvando} className="hidden md:inline-flex">
          {salvando ? "Registrando…" : `Registrar ${escolhido?.rotulo.toLowerCase()}`}
        </Botao>
      </form>
    </div>
  );
}
