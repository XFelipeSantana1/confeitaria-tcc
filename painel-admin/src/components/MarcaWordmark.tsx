import { Simbolo } from "./Marca";

// Wordmark do painel: Playfair com o "&" em dourado — o único lugar em que
// dourado sobrevive no painel (3.1). Símbolo na versão ESCURA: sobre creme,
// a versão clara é da mesma cor do fundo (contraste 1,00:1, invisível).
// O LINK que contém o wordmark já descreve o destino, então o desenho é
// decorativo aqui: escondo o svg por aria-hidden.
interface PropriedadesMarcaWordmark {
  pequena?: boolean;
  /** Lockup grande do login (coluna da marca, coluna inteira). */
  grande?: boolean;
}

export function MarcaWordmark({ pequena = false, grande = false }: PropriedadesMarcaWordmark): JSX.Element {
  return (
    <span
      className={`flex items-center gap-2 font-display text-tinta ${
        grande ? "text-4xl" : pequena ? "text-base" : "text-lg"
      }`}
    >
      <span aria-hidden="true" className="flex-none">
        <Simbolo tamanho={grande ? 36 : pequena ? 20 : 22} />
      </span>
      Doce<em className="text-dourado">&amp;</em> Carinho
    </span>
  );
}
