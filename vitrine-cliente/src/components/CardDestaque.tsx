import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Produto } from "../types";
import { estaDisponivel } from "../lib/disponibilidade";
import { imagemParaProduto } from "../lib/aparenciaProduto";
import { formatarMoeda } from "../lib/formatarMoeda";
import { Estado } from "./ui/Estado";

// Destaque da casa: o primeiro doce em card horizontal largo (foto à
// esquerda, conteúdo à direita). Quebra a simetria do grid e dá ao olhar
// um ponto de partida — sem ele, todos os cards competem igual. Sem selo
// sobre a foto: o tamanho do card JÁ diz que este é o destaque.
interface PropriedadesCardDestaque {
  produto: Produto;
  quantidadeNaSacola: number;
  aoAdicionar: (produtoId: number) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  /** Lixeira: tira o produto TODO da sacola em um toque. */
  aoRemover: (produtoId: number) => void;
}

export function CardDestaque({
  produto,
  quantidadeNaSacola,
  aoAdicionar,
  aoAlterarQuantidade,
  aoRemover,
}: PropriedadesCardDestaque): JSX.Element {
  const disponivel = estaDisponivel(produto);
  const imagem = imagemParaProduto(produto);
  const [falhouImagem, definirFalhouImagem] = useState(false);
  useEffect(() => {
    definirFalhouImagem(false);
  }, [produto.id, imagem]);

  return (
    <article className="grid overflow-hidden rounded-card border border-borda bg-white text-tinta md:grid-cols-5">
      <div
        className={`relative min-h-56 overflow-hidden md:col-span-2 ${
          disponivel ? "" : "opacity-75 grayscale"
        }`}
      >
        {imagem && !falhouImagem ? (
          <img
            src={imagem}
            alt={produto.nome}
            loading="lazy"
            decoding="async"
            onError={() => definirFalhouImagem(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          // Sem foto = areia com o nome em Playfair (mesma regra dos cards).
          <div className="absolute inset-0 grid place-items-center bg-areia px-6 text-center">
            <span className="font-display text-2xl font-semibold leading-tight text-textoSuave">
              {produto.nome}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center gap-2 p-6 md:col-span-3 md:p-8">
        {/* Categoria como sobretítulo em texto — informação útil, não selo. */}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-carameloForte">
          {produto.categoria}
        </p>
        <h3 className="font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
          {produto.nome}
        </h3>
        {produto.descricao && (
          <p className="max-w-prose font-corpo text-sm leading-relaxed text-textoSuave">
            {produto.descricao}
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-3">
          {/* Preço em semibold: o peso vem do tamanho e do caramelo, não de
              800. Na impressão o preço vira tinta — é a única cor que importa
              no papel. */}
          <b className="font-numero text-3xl font-semibold tabular-nums text-carameloForte print:text-tinta">
            {formatarMoeda(produto.preco)}
          </b>
          {!disponivel ? (
            <Estado />
          ) : quantidadeNaSacola === 0 ? (
            <button
              onClick={() => aoAdicionar(produto.id)}
              aria-label={`Adicionar ${produto.nome} à sacola`}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-campo border-b-2 border-carameloEscuro bg-tinta px-6 font-corpo text-sm font-semibold text-creme transition-colors hover:bg-carameloEscuro active:translate-y-px print:hidden"
            >
              <Plus size={16} strokeWidth={1.5} aria-hidden="true" /> Quero esse
            </button>
          ) : (
            /* Stepper + lixeira NO MESMO lado: no card largo há espaço de
                verdade, então a remoção fica literalmente "do lado" do
                contador — igual à sacola (ItemSacola), o gesto é o mesmo em
                qualquer lugar. Card pequenos de 2 colunas põem a lixeira na
                linha do preço (não cabe ao lado aqui). */
            <div className="flex items-center gap-1">
              <div className="flex items-center gap-1 rounded-campo border border-borda bg-creme p-1">
                <button
                  onClick={() => aoAlterarQuantidade(produto.id, -1)}
                  aria-label={`Tirar um ${produto.nome} da sacola`}
                  className="grid h-11 w-11 place-items-center rounded-lg bg-white font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
                >
                  −
                </button>
                <b className="min-w-6 text-center font-numero text-sm font-semibold tabular-nums">
                  {quantidadeNaSacola}
                </b>
                <button
                  onClick={() => aoAlterarQuantidade(produto.id, 1)}
                  aria-label={`Colocar mais um ${produto.nome} na sacola`}
                  className="grid h-11 w-11 place-items-center rounded-lg bg-white font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => aoRemover(produto.id)}
                aria-label={`Remover ${produto.nome} do pedido`}
                title="Remover do pedido"
                className="grid h-11 w-11 flex-none place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia hover:text-carameloForte active:translate-y-px print:hidden"
              >
                <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
