/**
 * Chip do contador de pendências, ao lado do item "Pedidos".
 *
 * Papel único agora (desktop e celular usam o MESMO): fundo carameloForte com
 * branco (6,15:1, AA), Manrope tabular, raio de campo. Só aparece quando há
 * trabalho — `0` no menu é ruído, e a ausência já diz "nada esperando".
 * O texto para leitor de tela fica no aria-label do chip (o painel não tem
 * região viva de anúncio; a contagem em base foi registrada no PROGRESSO).
 */
export function ContadorMenu({ valor }: { valor: number | null }): JSX.Element | null {
  if (valor === null || valor === 0) return null;
  return (
    <span
      aria-label={`${valor} pedido${valor === 1 ? "" : "s"} pendente${valor === 1 ? "" : "s"}`}
      className="inline-flex h-5 min-w-5 items-center justify-center rounded-campo bg-carameloForte px-1.5 font-numero text-[11px] font-semibold tabular-nums text-white"
    >
      {valor}
    </span>
  );
}
