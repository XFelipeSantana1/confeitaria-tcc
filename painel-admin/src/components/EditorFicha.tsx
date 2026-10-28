import { Trash2 } from "lucide-react";
import type { Insumo } from "../types";
import { Botao } from "./ui/Botao";

/** Chave única por linha da ficha. Ver o uso no botão "Adicionar". */
let proximaChave = 1;

// Editor de linhas da ficha técnica (5.3): cada linha é insumo + quantidade
// sobre hairline. Linha sem insumo não entra no salvamento (o pai filtra as
// vazias). Campos no padrão da 3.5; quantidade em tabular; o "-" da linha é
// ação de linha (ícone permitido). "Adicionar ingrediente" é ação de texto.
export interface LinhaFicha {
  chave: number;
  insumo_id: string;
  quantidade: string;
}

interface PropriedadesEditorFicha {
  linhas: LinhaFicha[];
  insumos: Insumo[];
  aoMudar: (linhas: LinhaFicha[]) => void;
}

const CLASSE_CAMPO =
  "border border-textoSuave/80 bg-white px-3 font-corpo text-base text-tinta outline-none transition-colors focus:border-caramelo focus:ring-2 focus:ring-caramelo/40";

export function EditorFicha({ linhas, insumos, aoMudar }: PropriedadesEditorFicha): JSX.Element {
  function mudarLinha(chave: number, campo: "insumo_id" | "quantidade", valor: string): void {
    aoMudar(linhas.map((linha) => (linha.chave === chave ? { ...linha, [campo]: valor } : linha)));
  }

  return (
    <div className="flex flex-col">
      <b className="pb-2 text-sm font-medium text-tinta">Ficha técnica (receita)</b>
      <div className="divide-y divide-borda">
        {linhas.map((linha) => {
          const insumo = insumos.find((i) => String(i.id) === linha.insumo_id);
          return (
            <div key={linha.chave} className="flex items-center gap-2 py-1.5">
              <select
                value={linha.insumo_id}
                onChange={(e) => mudarLinha(linha.chave, "insumo_id", e.target.value)}
                className={`h-11 min-w-0 flex-1 rounded-campo ${CLASSE_CAMPO}`}
                aria-label="Insumo da receita"
              >
                <option value="">Escolher insumo…</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} ({i.unidade_medida})
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                step="any"
                value={linha.quantidade}
                onChange={(e) => mudarLinha(linha.chave, "quantidade", e.target.value)}
                placeholder="Qtd"
                aria-label="Quantidade necessária"
                className={`h-11 w-20 flex-none rounded-campo font-numero tabular-nums ${CLASSE_CAMPO}`}
              />
              <span className="w-12 flex-none text-xs text-textoSuave">
                {insumo?.unidade_medida ?? ""}
              </span>
              <button
                type="button"
                onClick={() => aoMudar(linhas.filter((l) => l.chave !== linha.chave))}
                aria-label="Remover linha da receita"
                className="grid h-11 w-11 flex-none place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia hover:text-perigo"
              >
                <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
      <Botao
        type="button"
        variante="texto"
        // Contador de módulo, e não Date.now(): duas linhas adicionadas no
        // mesmo milissegundo recebiam a mesma chave, e o React avisava de chave
        // duplicada e podia mostrar a linha errada ao remover uma delas.
        onClick={() => aoMudar([...linhas, { chave: proximaChave++, insumo_id: "", quantidade: "" }])}
        className="mt-1 self-start"
      >
        Adicionar ingrediente
      </Botao>
    </div>
  );
}
