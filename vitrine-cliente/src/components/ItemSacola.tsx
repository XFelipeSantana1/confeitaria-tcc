import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import type { ItemCarrinho } from "../types";
import { imagemParaProduto } from "../lib/aparenciaProduto";
import { formatarMoeda } from "../lib/formatarMoeda";

// Uma linha da sacola: foto, nome, preço e controle de quantidade.
// Sem cartão em volta da própria linha — a gaveta já é a superfície, e
// linha-caixa-dentro-de-gaveta era superfície dentro de superfície. Quem
// separa as linhas é a hairline do pai (`divide-y` no CarrinhoDrawer).
interface PropriedadesItemSacola {
  item: ItemCarrinho;
  aoAlterarQuantidade: (produtoId: number, diferenca: number) => void;
  aoRemover: (produtoId: number) => void;
}

export function ItemSacola({
  item,
  aoAlterarQuantidade,
  aoRemover,
}: PropriedadesItemSacola): JSX.Element {
  const { produto, quantidade } = item;
  const imagem = imagemParaProduto(produto);
  const [falhouImagem, definirFalhouImagem] = useState(false);

  // Zera quando o item muda de produto: sem isso, a foto que falhou numa
  // listagem antiga continuava "quebrada" depois de recarregar, porque o
  // componente é reaproveitado pelo React no lugar, não recriado.
  useEffect(() => {
    definirFalhouImagem(false);
  }, [produto.id]);

  return (
    <div className="flex items-center gap-3 py-3">
      <div
        className="h-12 w-12 flex-none overflow-hidden rounded-campo bg-areia"
        aria-hidden="true"
      >
        {imagem && !falhouImagem ? (
          <img
            src={imagem}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => definirFalhouImagem(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          // Sem foto: areia puro, sem emoji nem ícone no lugar da foto — os
          // dois mentiam sobre o doce, e o nome ao lado já diz o que é.
          null
        )}
      </div>
      <div className="min-w-0 flex-1">
        <b className="block truncate font-corpo text-sm font-semibold text-tinta">
          {produto.nome}
        </b>
        {/* Preços em Manrope tabular: os algarismos mudam de largura quando a
            quantidade muda, e o texto "tremeria" a cada toque no +/−. */}
        <span className="font-numero text-xs tabular-nums text-textoSuave">
          {formatarMoeda(produto.preco)} cada ·{" "}
          <b className="font-semibold text-carameloForte">
            {formatarMoeda(produto.preco * quantidade)}
          </b>
        </span>
      </div>
      {/* Alvos de 44px (h-11): a gaveta no celular é tela inteira e o polegar
          erra alvos de 28px. */}
      <div className="flex flex-none items-center gap-1">
        <button
          onClick={() => aoAlterarQuantidade(produto.id, -1)}
          aria-label={`Tirar um ${produto.nome} da sacola`}
          className="grid h-11 w-11 place-items-center rounded-campo border border-borda bg-white font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
        >
          −
        </button>
        <b className="min-w-5 text-center font-numero text-sm font-semibold tabular-nums text-tinta">
          {quantidade}
        </b>
        <button
          onClick={() => aoAlterarQuantidade(produto.id, 1)}
          aria-label={`Colocar mais um ${produto.nome} na sacola`}
          className="grid h-11 w-11 place-items-center rounded-campo border border-borda bg-white font-corpo text-lg font-semibold text-tinta transition-colors hover:bg-tinta hover:text-creme active:translate-y-px"
        >
          +
        </button>
        <button
          onClick={() => aoRemover(produto.id)}
          aria-label={`Remover ${produto.nome} da sacola`}
          title="Remover"
          className="grid h-11 w-11 place-items-center rounded-campo text-textoSuave transition-colors hover:bg-areia hover:text-carameloForte active:translate-y-px"
        >
          <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
