// Estado de produto: MARCADOR + texto — um estado nunca fala só por cor ou
// só por ícone (regra 4 da casa). O estado de estoque é NEUTRO: esgotado não
// é erro do cliente, então marcador e texto ficam em `textoSuave`, e a foto
// escurece em `grayscale` como reforço. Os tokens ok/alerta/perigo (os
// mesmos do painel) ficam de reserva para quando a vitrine precisar deles.
//
// O texto-padrão é o rótulo de estoque consumido pelos cards: "Sem estoque
// no momento" existe UMA vez no site — aqui — e os consumidores chamam
// `<Estado />` sem repetir a frase (antes ela vivia duplicada em
// CardProduto e CardDestaque com tratamentos divergentes).
interface PropriedadesEstado {
  /** Rótulo do estado. O padrão é o estado de estoque. */
  texto?: string;
  /** Neutro = marcador e texto em `textoSuave` (estado de estoque). */
  neutro?: boolean;
}

export function Estado({
  texto = "Sem estoque no momento",
  neutro = true,
}: PropriedadesEstado): JSX.Element {
  return (
    <span className="inline-flex items-center gap-2 font-corpo text-xs font-semibold text-textoSuave">
      {/* O marcador circular é EXCEÇÃO registrada ao raio da casa (a mesma
          do balão de aviso): é um ponto de estado, não um controle. */}
      <span
        aria-hidden="true"
        className={`size-2 flex-none rounded-full ${neutro ? "bg-textoSuave" : "bg-alerta"}`}
      />
      {texto}
    </span>
  );
}
