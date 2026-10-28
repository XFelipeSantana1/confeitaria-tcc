// Três garantias da loja, em uma linha só.
//
// Substitui o letreiro corrido (fundo cacau com texto em movimento) que ficava
// entre a abertura e o cardápio. O letreiro ocupava uma faixa inteira da tela
// repetindo quatro frases que a cliente tinha acabado de ler no título — e ainda
// competia com a lista de doces logo abaixo.
//
// Aqui não há animação nem cartão: são três frases em uma faixa com hairline
// em cima e embaixo, do jeito que um papel de embrulho de encomenda explica
// o pedido em uma linha. É
// também a única informação de confiança antes do cardápio — diz o que a loja
// é (artesanal), como se compra (WhatsApp) e o que a cliente NÃO precisa fazer
// (cadastro, pagamento no site).

const GARANTIAS = [
  "Feito artesanalmente",
  "Pedido pelo WhatsApp",
  "Sem cadastro nem pagamento no site",
] as const;

export function Destaques(): JSX.Element {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-2">
      {/* Faixa fina: hairline em cima e embaixo (border-y), sem cartão.
          No celular as três frases empilham CENTRALIZADAS (relato de uso:
          à esquerda liam como blocos "de divisão", um abaixo do outro);
          no desktop ficam em linha com hairline vertical entre elas
          (`divide-x`). */}
      <ul className="flex flex-col items-center border-y border-borda py-0 text-center text-sm sm:flex-row sm:items-center sm:justify-center sm:divide-x sm:divide-borda sm:text-left">
        {GARANTIAS.map((garantia) => (
          <li
            key={garantia}
            className="flex items-center py-3 px-4 sm:px-5 sm:py-3.5 sm:first:pl-0 sm:last:pr-0"
          >
            <span className="font-corpo font-semibold text-tinta">{garantia}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}