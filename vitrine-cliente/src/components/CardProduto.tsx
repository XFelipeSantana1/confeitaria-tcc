import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import type { Produto } from "../types";
import { estaDisponivel } from "../lib/disponibilidade";
import { imagemParaProduto } from "../lib/aparenciaProduto";
import { formatarMoeda } from "../lib/formatarMoeda";
import { Estado } from "./ui/Estado";

// Um doce no cardápio, nos DOIS formatos do padrão de cardápio digital:
//
//   CELULAR (base)  = linha escaneável — nome → descrição (2 linhas) → preço
//                     → ação, na coluna da ESQUERDA; miniatura quadrada de
//                     24 na direita. Hairline do pai (`divide-y`) separa os
//                     itens; sem moldura de card — é cardápio impresso, não
//                     vitrine de caixinhas.
//   sm+             = cartão da grade (mesma hierarquia, foto em cima 4:3,
//                     borda hairline + `rounded-card` devolvidos).
//
// O DOM é UM: o texto vem antes da foto (leitor de tela lê o que o doce É
// antes do que ele parece) nos dois formatos; quem troca a ordem visual é
// CSS (`order`). A foto não carrega selo nenhum: categoria e preço já dizem
// o que é.
interface PropriedadesCardProduto {
  produto: Produto;
  /** Card "capa" da categoria: nasce esticado na grade (row-span 2). */
  grande?: boolean;
  quantidadeNaSacola: number;
  aoAdicionar: (produtoId: number) => void;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  /** Lixeira: tira o produto TODO da sacola em um toque. */
  aoRemover: (produtoId: number) => void;
}

export function CardProduto({
  produto,
  grande = false,
  quantidadeNaSacola,
  aoAdicionar,
  aoAlterarQuantidade,
  aoRemover,
}: PropriedadesCardProduto): JSX.Element {
  const disponivel = estaDisponivel(produto);
  const imagem = imagemParaProduto(produto);

  // Se a foto falhar (CDN fora, URL quebrada), o card NÃO inventa doce
  // (nada de emoji/gradiente): o lugar da foto vira fundo areia com o nome.
  // Reseta ao trocar de produto.
  const [falhouImagem, definirFalhouImagem] = useState(false);
  useEffect(() => {
    definirFalhouImagem(false);
  }, [produto.id, imagem]);

  return (
    // `group` liga o zoom leve da foto (efeito ÚNICO de cardápio, e que já
    // estava escrito na img — sem a classe ele nunca disparava). O row-span
    // do card "capa" fica no wrapper (o filho do grid) em GrupoCategoria —
    // aqui só o esticamento (h-full) e a foto flex-1 respondem ao `grande`.
    <article
      className={`group flex items-center gap-3 py-4 sm:h-full sm:flex-col sm:items-stretch sm:gap-0 sm:overflow-hidden sm:rounded-card sm:border sm:border-borda sm:bg-white sm:py-0`}
    >
      {/* MINIATURA/FOTO — à DIREITA no celular, no topo a partir de sm. Em
          impressão some: quem imprime quer a lista de nome e preço. */}
      <div
        className={`relative order-2 h-24 w-24 flex-none overflow-hidden rounded-card border border-borda sm:order-1 sm:h-auto sm:w-full sm:rounded-none sm:border-0 ${
          grande
            ? "sm:aspect-[4/5] lg:aspect-auto lg:min-h-0 lg:flex-1"
            : "sm:aspect-[4/3]"
        } ${disponivel ? "" : "opacity-75 grayscale print:hidden"}`}
      >
        {imagem && !falhouImagem ? (
          <img
            src={imagem}
            alt={produto.nome}
            loading="lazy"
            decoding="async"
            onError={() => definirFalhouImagem(true)}
            className="h-full w-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
          />
        ) : (
          // Sem foto = areia com o nome em Playfair: honesto (não mostra
          // outro doce no lugar) e ainda parece desenhado, não quebrado.
          <div className="grid h-full place-items-center bg-areia px-2 text-center sm:px-4">
            <span className="line-clamp-3 font-display text-base leading-tight text-textoSuave sm:text-lg">
              {produto.nome}
            </span>
          </div>
        )}
      </div>

      {/* COLUNA DE TEXTO — a escada fixa do cardápio: nome, descrição
          curta, preço. Nada compete com o preço (3.1 da direção). */}
      <div className="flex min-w-0 flex-1 flex-col order-1 sm:order-2 sm:p-4">
        <h3 className="font-display text-lg font-semibold leading-snug tracking-tight text-tinta sm:text-balance">
          {produto.nome}
        </h3>
        {/* UMA ideia de descrição por formato: 2 linhas apertadas na lista do
            celular, 1 linha no cartão — descrição longa empurra o preço para
            fora da primeira passada de olho. */}
        <p className="mt-0.5 line-clamp-2 font-corpo text-sm text-textoSuave sm:line-clamp-1">
          {produto.descricao}
        </p>

        <div className="mt-2 sm:mt-auto sm:pt-2">
          <div className="flex items-center justify-between gap-2">
            {/* Preço em Manrope tabular semibold: o peso vem do tamanho e do
                caramelo, não de 800. Na impressão o preço vira tinta. */}
            <b className="font-numero text-lg font-semibold tabular-nums text-carameloForte print:text-tinta">
              {formatarMoeda(produto.preco)}
            </b>
            {quantidadeNaSacola > 0 ? (
              <button
                onClick={() => aoRemover(produto.id)}
                aria-label={`Remover ${produto.nome} do pedido`}
                title="Remover do pedido"
                className="grid h-11 w-11 flex-none place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia/60 hover:text-carameloForte active:translate-y-px print:hidden"
              >
                <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            ) : (
              !disponivel && <Estado />
            )}
          </div>
          {disponivel &&
            (quantidadeNaSacola === 0 ? (
              // A ação de compra: borda de corte + prensa de 1px, como todos
              // os botões de comprar da casa. Em impressão, fora.
              <button
                onClick={() => aoAdicionar(produto.id)}
                aria-label={`Adicionar ${produto.nome} à sacola`}
                className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-campo border-b-2 border-carameloEscuro bg-tinta font-corpo text-sm font-semibold text-creme transition-colors hover:bg-carameloEscuro active:translate-y-px print:hidden"
              >
                <Plus size={16} strokeWidth={1.5} aria-hidden="true" /> Adicionar
              </button>
            ) : (
              // Seletor − 1 +: controles internos em `rounded-lg` (encaixe do
              // contêiner p-1: 12−4=8). Alvos de 44px, prensa de 1px.
              <div className="mt-2 flex items-center justify-between rounded-campo border border-borda bg-white p-1 print:hidden">
                <button
                  onClick={() => aoAlterarQuantidade(produto.id, -1)}
                  aria-label={`Tirar um ${produto.nome} da sacola`}
                  className="grid h-11 w-11 place-items-center rounded-lg font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
                >
                  −
                </button>
                <b className="min-w-6 text-center font-numero text-sm font-semibold tabular-nums text-tinta">
                  {quantidadeNaSacola}
                </b>
                <button
                  onClick={() => aoAlterarQuantidade(produto.id, 1)}
                  aria-label={`Colocar mais um ${produto.nome} na sacola`}
                  className="grid h-11 w-11 place-items-center rounded-lg font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
                >
                  +
                </button>
              </div>
            ))}
        </div>
      </div>
    </article>
  );
}
