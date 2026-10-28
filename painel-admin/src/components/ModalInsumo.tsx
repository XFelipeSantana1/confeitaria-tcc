import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Insumo } from "../types";
import { Entrada } from "./ui/Entrada";
import { Botao } from "./ui/Botao";

const UNIDADES = ["g", "kg", "ml", "l", "unidade"];

// Criação e edição no mesmo modal (5.4), no padrão do ModalProduto:
// CELULAR = tela cheia com "Cancelar" (texto, esquerda) · título · "Salvar"
// (texto carameloForte, direita); DESKTOP = modal branco com X e primário de
// rodapé. Sem insumo abre vazio (criar), com insumo preenche (editar).
// Estoque atual só aparece no criar — depois só via movimentação (regra do
// backend, não da tela).
export interface DadosInsumo {
  nome: string;
  unidade_medida: string;
  quantidade_atual: number;
  quantidade_minima: number;
  custo_unitario: number;
}

interface PropriedadesModalInsumo {
  insumo: Insumo | null;
  salvando: boolean;
  erro: string | null;
  aoFechar: () => void;
  aoSalvar: (dados: DadosInsumo) => void;
}

export function ModalInsumo({
  insumo,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: PropriedadesModalInsumo): JSX.Element {
  const [nome, definirNome] = useState(insumo?.nome ?? "");
  const [unidade, definirUnidade] = useState(insumo?.unidade_medida ?? "g");
  const [atual, definirAtual] = useState(String(insumo?.quantidade_atual ?? 0));
  const [minima, definirMinima] = useState(String(insumo?.quantidade_minima ?? 0));
  const [custo, definirCusto] = useState(String(insumo?.custo_unitario ?? 0));

  function enviar(evento: FormEvent): void {
    evento.preventDefault();
    aoSalvar({
      nome: nome.trim(),
      unidade_medida: unidade,
      quantidade_atual: Number(atual),
      quantidade_minima: Number(minima),
      custo_unitario: Number(custo),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[70] overflow-y-auto bg-tinta/50 md:grid md:place-items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={insumo ? "Editar insumo" : "Novo insumo"}
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
          <h3 className="min-w-0 flex-1 text-lg font-semibold text-tinta md:flex-none">
            {insumo ? "Editar insumo" : "Novo insumo"}
          </h3>
          <button
            type="submit"
            disabled={salvando}
            className="-mr-2 flex-none rounded-campo px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60 md:hidden"
          >
            {salvando ? "Salvando…" : "Salvar"}
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
        <Entrada id="insumo-nome" rotulo="Nome" value={nome} onChange={(e) => definirNome(e.target.value)} placeholder="Ex: Leite condensado" />
        <label className="flex flex-col gap-1.5 text-sm font-medium text-tinta">
          Unidade de medida
          <select value={unidade} onChange={(e) => definirUnidade(e.target.value)} className="h-11 rounded-campo border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40">
            {UNIDADES.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-3 gap-3">
          {insumo ? null : (
            <Entrada id="insumo-atual" rotulo="Estoque inicial" type="number" min="0" step="any" value={atual} onChange={(e) => definirAtual(e.target.value)} className="font-numero tabular-nums" />
          )}
          <Entrada id="insumo-minima" rotulo="Mínimo" type="number" min="0" step="any" value={minima} onChange={(e) => definirMinima(e.target.value)} className="font-numero tabular-nums" />
          <Entrada id="insumo-custo" rotulo="Custo (R$)" type="number" min="0" step="any" value={custo} onChange={(e) => definirCusto(e.target.value)} className="font-numero tabular-nums" />
        </div>
        {erro ? (
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
        ) : null}
        <Botao type="submit" disabled={salvando} className="hidden md:inline-flex">
          {salvando ? "Salvando…" : insumo ? "Salvar" : "Cadastrar"}
        </Botao>
      </form>
    </div>
  );
}
