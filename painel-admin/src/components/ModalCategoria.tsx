import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Categoria } from "../types";
import { Entrada } from "./ui/Entrada";
import { Botao } from "./ui/Botao";

// Criar/renomear categoria no mesmo modal (5.3). Duplicada volta 409 do
// backend e aparece aqui — o nome tem índice único no banco. Erro segue a
// 5.8: "Erro:" + text-perigo, não caixa de areia.
interface PropriedadesModalCategoria {
  categoria: Categoria | null;
  salvando: boolean;
  erro: string | null;
  aoFechar: () => void;
  aoSalvar: (nome: string) => void;
}

export function ModalCategoria({
  categoria,
  salvando,
  erro,
  aoFechar,
  aoSalvar,
}: PropriedadesModalCategoria): JSX.Element {
  const [nome, definirNome] = useState(categoria?.nome ?? "");

  function enviar(evento: FormEvent): void {
    evento.preventDefault();
    aoSalvar(nome.trim());
  }

  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-tinta/50 p-4" role="dialog" aria-modal="true" aria-label={categoria ? "Renomear categoria" : "Nova categoria"}>
      <form onSubmit={enviar} className="flex w-full max-w-sm flex-col gap-3 rounded-card bg-white p-6 text-tinta shadow-flutuante">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-tinta">
            {categoria ? "Renomear categoria" : "Nova categoria"}
          </h3>
          <button
            type="button"
            onClick={aoFechar}
            aria-label="Fechar"
            className="grid h-11 w-11 place-items-center rounded-campo transition-colors hover:bg-areia/60"
          >
            <X size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
        <Entrada
          id="cat-nome"
          rotulo="Nome"
          value={nome}
          onChange={(evento) => definirNome(evento.target.value)}
          placeholder="Ex: Doces, Bolos, Salgados…"
          autoFocus
        />
        {erro ? (
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
        ) : null}
        <Botao type="submit" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar"}
        </Botao>
      </form>
    </div>
  );
}
