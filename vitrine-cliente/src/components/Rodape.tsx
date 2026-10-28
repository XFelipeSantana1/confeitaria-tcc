import { MessageCircle } from "lucide-react";
import { SimboloClaro } from "./Marca";
import { lerWhats } from "../lib/whatsLoja";
import { identificadorSecao } from "../lib/secoes";

// Rodapé em colunas: marca + contato direto + atalho por categoria (rola até
// a seção) + configuração e crédito. Link âncora de verdade, não texto solto.

export function Rodape({
  secoes,
  aoAbrirConfiguracoes,
  espacoParaSacola = false,
}: {
  secoes: string[];
  aoAbrirConfiguracoes: () => void;
  /** Reserva de fundo para a barra fixa da sacola (só existe com itens). */
  espacoParaSacola?: boolean;
}): JSX.Element {
  // Mesma fonte do botão de finalizar pedido: um número só, e o contato do
  // rodapé nunca diverge do chat o pedido. Vazio/inválido = sem link
  // (wa.me com número errado abre conversa errado).
  const numeroWhats = lerWhats();

  function irParaSecao(categoria: string): void {
    document
      .getElementById(identificadorSecao(categoria))
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <footer className="mt-10 bg-tinta text-creme">
      {/* Rodapé alinhado à esquerda nas duas larguras: tentamos centralizar
          no celular e ficou o ar de "blocos bugados" (relato de uso) — coluna
          de rodapé se lê como cartão de endereço, cartão de endereço é
          alinhado. A reserva `pb-28` existe SÓ quando a barra fixa da sacola
          está na tela: tinta preenche o vão e o fim da página fica contínuo. */}
      <div
        className={`mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3 ${
          espacoParaSacola ? "pb-28 md:pb-12" : ""
        }`}
      >
        <div>
          {/* Símbolo + nome numa linha (o nome somia abaixo de sm por uma
              largura chutada ~80px de uma versão antiga da grade — a coluna
              agora é a largura toda do celular). */}
          <div className="flex items-center gap-2.5">
            <SimboloClaro tamanho={28} />
            {/* A fonte sobe por degrau e não de uma vez: em md a grade vira 3 colunas
              e a primeira fica com ~216px, onde text-2xl estourava 4px. */}
            <p className="font-display text-lg font-bold md:text-xl lg:text-2xl">
              Doce<em className="text-dourado">&amp;</em> Carinho
            </p>
          </div>
          {/* UMA frase curta: havia uma frase aqui e outra na coluna "A casa"
              — a mesma mensagem dita duas vezes. */}
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-creme/60">
            Doces feitos à mão, todos os dias — do forno para a sua sacola.
          </p>
          {/* Falar com a loja: contato REAL, número da finalização. Quando o
              perfil do Instagram existir, entra aqui do lado — mesmo
              formato de link + ícone. Enquanto não existe, o link não
              existe: link morto seria mentira. */}
          {numeroWhats !== "" ? (
            <a
              href={`https://wa.me/${numeroWhats.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-creme/80 transition-colors hover:text-creme"
            >
              <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
              WhatsApp da confeitaria
            </a>
          ) : null}
        </div>
        <nav aria-label="Cardápio">
          <b className="text-xs font-bold uppercase tracking-widest text-dourado">Cardápio</b>
          <ul className="mt-3 flex flex-col gap-2">
            {secoes.map((secao) => (
              <li key={secao}>
                <button
                  onClick={() => irParaSecao(secao)}
                  className="text-sm text-creme/75 transition-colors hover:text-creme"
                >
                  {secao}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          {/* Configuração é tarefa de manutenção, não de compra: sem título
              de seção nem frase de apoio, só o link discreto — texto menor e
              apagado, que escurece no hover. */}
          <button
            onClick={aoAbrirConfiguracoes}
            className="min-h-11 text-xs text-creme/60 transition-colors hover:text-creme"
          >
            trocar API / WhatsApp
          </button>
        </div>
      </div>
    </footer>
  );
}
