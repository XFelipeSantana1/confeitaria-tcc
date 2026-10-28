const FOTO_HERDADA =
  "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=1200&q=80";

// Foto herdada do antigo login do painel (MarcaLogin @ 4166287): os tons são
// quentes como o caramelo e o dourado da marca — a mesma foto que encantou
// ali, agora abrindo a loja. Regras da casa para foto editorial:
//   1. SEM véu translúcido e SEM texto sobre a foto (o desenho do antigo
//      login que perdeu a disputa, "o nome se esconde na cor da foto", não
//      volta) — o texto mora na coluna ao lado, sobre papel;
//   2. a URL não prova conteúdo: o alt abaixo deve ser conferido ao olho
//      antes da publicação (registrado no PROGRESSO como pendência manual);
//   3. loading eager + fetchPriority high (é o LCP) e aspect-* fixo — zero
//      CLS na abertura.

interface PropriedadesAbertura {
  /** Abre a janela que explica o passo a passo do pedido. */
  aoComoFunciona: () => void;
}

export function Abertura({ aoComoFunciona }: PropriedadesAbertura): JSX.Element {
  return (
    <section className="mx-auto max-w-6xl px-5 pt-6 pb-10 lg:pt-14 lg:pb-16">
      {/* No celular a foto vem primeiro; no desktop, o texto ocupa a coluna da
          esquerda. A ordem no DOM é texto-depois-foto (leitor de tela começa
          pelo que a loja é), e o `order` só troca quem aparece em cima. */}
      <div className="grid items-end gap-6 lg:grid-cols-5 lg:gap-10">
        {/* 2/5 do desktop = 40% texto · 3/5 = 60% foto. SEM sobretítulo em
            caixa-alta: a frase "confeitaria artesanal" é a do lockup do
            cabeçalho, visível no topo da MESMA tela — repeti-la aqui era
            brow-redundância (o painel vetou eyebrow por isso mesmo). */}
        <div className="order-2 lg:order-1 lg:col-span-2">
          {/* Título curto em Playfair com tracking levemente negativo; o
              peso da marca fica na foto, não em adjetivos. `text-balance`
              segura o "~carrinho de palavras órfã" no fim da linha. */}
          <h1 className="font-display font-bold text-4xl leading-[1.08] tracking-tight text-tinta sm:text-5xl lg:text-6xl text-balance">
            Doces artesanais, do forno direto para sua mesa.
          </h1>

          <p className="mt-3 max-w-md font-corpo text-base leading-relaxed text-textoSuave text-pretty">
            Escolha no cardápio e finalize com a confeiteira pelo WhatsApp.
          </p>

          {/* `pb-1` compensa a descida da fonte Playfair: alinhado à base
              com `items-end`, a linha do botão casa com a borda da foto. */}
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 pb-1">
            {/* UMA ação em caramelo com borda de corte (a compra) e "Como
                funciona?" como link de texto — dois botões da mesma altura
                competiriam. A prensa desce 1px, nunca escala. */}
            <a
              href="#cardapio"
              className="inline-flex min-h-11 items-center gap-2 rounded-campo border-b-2 border-carameloEscuro bg-carameloForte px-6 font-corpo text-sm font-semibold text-white transition-colors hover:bg-carameloEscuro active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40 focus-visible:ring-offset-2 focus-visible:ring-offset-creme"
            >
              Escolher meus doces
            </a>
            {/* Link de texto discreto, não segundo botão. */}
            <button
              onClick={aoComoFunciona}
              className="min-h-11 font-corpo text-sm font-semibold text-textoSuave underline decoration-borda decoration-2 underline-offset-4 transition-colors hover:text-carameloForte hover:decoration-caramelo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-caramelo/40"
            >
              Como funciona?
            </button>
          </div>
        </div>

        {/* A foto ocupa a coluna inteira (60%) no desktop e alcança ~520px —
            é a vitrine da loja. Aspecto fixo por largura (zero CLS): nem
            altura chutada, nem foto esticada em split tela baixa. Hairline
            na borda, sem sombra: quem separa aqui é a foto, não o efeito. */}
        <div className="order-1 lg:order-2 lg:col-span-3">
          <div className="aspect-[4/5] overflow-hidden rounded-card border border-borda sm:aspect-[16/10] lg:aspect-[16/9]">
            <img
              src={FOTO_HERDADA}
              srcSet={
                `${FOTO_HERDADA.replace("w=1200", "w=600")} 600w, ` +
                `${FOTO_HERDADA.replace("w=1200", "w=900")} 900w, ` +
                `${FOTO_HERDADA} 1200w`
              }
              sizes="(min-width: 1024px) 55vw, 100vw"
              width={1200}
              height={800}
              alt="Doces artesanais da confeitaria Doce & Carinho sobre superfície clara, em luz quente — o alt deve ser conferido ao olho antes de publicar"
              loading="eager"
              fetchPriority="high"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
