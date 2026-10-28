// Balão de confirmação ("Adicionado à sacola").
//
// Duas decisões que vieram de uso:
//
// 1. Sai de baixo, não de cima. A área de cima da vitrine é a foto da
//    abertura e o cabeçalho fixo; o balão competia com os dois e sumia na
//    hora. Embaixo fica sobre o creme, longe de tudo, e o polegar do cliente
//    fica perto.
// 2. Pílula escura LISA. A barra de acento caramelo da versão anterior era
//    enfeite colado — o contraste do creme sobre tinta já entrega o ponto de
//    atenção em menos de um segundo, e a única sombra do site fica reservada
//    para gaveta/modal.
//
// Some sozinho (temporizador no hook useAviso) — aqui é só apresentação.
interface PropriedadesAvisoFlutuante {
  texto: string;
}

export function AvisoFlutuante({ texto }: PropriedadesAvisoFlutuante): JSX.Element {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-5 z-[80] flex justify-center print:hidden sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <p className="flex max-w-md items-center overflow-hidden rounded-full bg-tinta px-5 text-sm font-semibold text-creme shadow-flutuante">
        <span className="py-3.5 leading-snug motion-safe:animate-[surgir_0.35s_ease-out]">
          {texto}
        </span>
      </p>
    </div>
  );
}
