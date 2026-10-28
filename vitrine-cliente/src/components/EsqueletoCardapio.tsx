// Skeleton espelhando o cardápio REAL nos dois formatos — texto à esquerda,
// miniatura quadrada à direita no celular (a lista); cartão com foto em cima
// a partir de sm (a grade). Quando o conteúdo chega, nada pula: a lista
// pousa dentro da lista, o cartão dentro do cartão. Pulso SÓLIDO em areia
// com `motion-safe:animate-pulse` — o gradiente varrendo era textura de
// "site gerado", e quem pediu menos movimento recebe menos movimento.
export function EsqueletoCardapio(): JSX.Element {
  return (
    <div aria-label="Carregando cardápio" aria-busy="true">
      {/* LISTA (celular): linha = coluna de texto + miniatura, separadas por
          hairline — mesmas proporções do CardProduto em lista. */}
      <div className="flex flex-col divide-y divide-borda sm:hidden">
        {Array.from({ length: 6 }, (_, indice) => (
          <div key={indice} className="flex items-center gap-3 py-4">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="h-5 w-2/3 rounded motion-safe:animate-pulse bg-areia" />
              <div className="h-3 w-full rounded motion-safe:animate-pulse bg-areia/70" />
              <div className="h-3 w-4/5 rounded motion-safe:animate-pulse bg-areia/70" />
              <div className="mt-1 h-5 w-16 rounded motion-safe:animate-pulse bg-areia" />
              <div className="h-11 w-full rounded-campo motion-safe:animate-pulse bg-areia" />
            </div>
            <div className="h-24 w-24 flex-none rounded-card motion-safe:animate-pulse bg-areia" />
          </div>
        ))}
      </div>

      {/* GRADE (sm+): mesmas proporções do cartão de CardProduto. */}
      <div
        className="hidden grid-cols-2 gap-3 sm:grid lg:grid-cols-3 lg:gap-4"
        aria-hidden="true"
      >
        {Array.from({ length: 6 }, (_, indice) => (
          <div
            key={indice}
            className="overflow-hidden rounded-card border border-borda bg-white"
          >
            <div className="aspect-[4/3] motion-safe:animate-pulse bg-areia" />
            <div className="flex flex-col gap-2 p-4">
              <div className="h-5 w-2/3 rounded motion-safe:animate-pulse bg-areia" />
              <div className="h-3 w-full rounded motion-safe:animate-pulse bg-areia/70" />
              <div className="h-3 w-4/5 rounded motion-safe:animate-pulse bg-areia/70" />
              <div className="mt-1 flex items-center justify-between">
                <div className="h-5 w-16 rounded motion-safe:animate-pulse bg-areia" />
                <div className="h-11 w-28 rounded-campo motion-safe:animate-pulse bg-areia" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
