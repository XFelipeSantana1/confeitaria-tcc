import type { Registro } from "../types";

// Uma linha do histórico no formato LOG da 5.5: HORA (tabular textoSuave,
// w-16) · QUEM FEZ + O QUÊ (a descrição embutida do registro) · ANTES →
// DEPOIS à direita — dois valores em Manrope tabular com os rótulos
// "antes"/"depois" em textoSuave; o velho RISCADO (indistinguível de apagado
// sem underline/tachado), o novo em tinta semibold. Hairline entre linhas.
//
// O botão "ver o que mudou" saiu junto com a coluna de ícones: o diff agora
// OCUPA a coluna própria da spec, sempre à vista — nada de recolher
// auditoria. Cada campo alterado rende um par ("antes X → depois Y"); um
// registro criado mostra os campos nascendo do (vazio).
export function LinhaRegistro({ registro }: { registro: Registro }): JSX.Element {
  // `depois` é o estado novo do objeto alterado; as entradas dele são as
  // mudanças registradas (o `antes` pode não existir — criação).
  const mudancas = Object.entries(registro.depois ?? {});

  return (
    <li className="border-b border-borda last:border-0">
      <div className="flex flex-col gap-1 py-3 text-sm md:flex-row md:items-baseline md:gap-4">
        <span className="w-16 flex-none font-numero text-sm tabular-nums text-textoSuave">
          {hora(registro.criado_em)}
        </span>
        <p className="min-w-0 flex-1 text-sm text-tinta">
          {registro.descricao}
          <span className="block text-xs text-textoSuave">
            por {registro.usuario_nome}
          </span>
        </p>
        <div className="flex flex-col items-start gap-1 md:flex-none md:items-end md:text-right">
          {mudancas.length === 0 ? (
            <span className="font-numero text-xs tabular-nums text-textoSuave">
              sem valores alterados
            </span>
          ) : (
            mudancas.map(([campo, valor]) => (
              <div key={campo} className="flex flex-wrap items-baseline gap-x-2">
                <span className="text-xs text-textoSuave">antes</span>
                <span className="font-numero text-sm tabular-nums text-textoSuave line-through">
                  {texto(registro.antes?.[campo] ?? null)}
                </span>
                <span aria-hidden="true" className="text-textoSuave">
                  →
                </span>
                <span className="text-xs text-textoSuave">depois</span>
                <span className="font-numero text-sm font-semibold tabular-nums text-tinta">
                  {texto(valor)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </li>
  );
}

function texto(valor: unknown): string {
  if (valor === null || valor === undefined || valor === "") return "(vazio)";
  return String(valor);
}

function hora(iso: string): string {
  return iso.slice(11, 16);
}
