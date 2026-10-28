import { Loader2, Power, Trash2 } from "lucide-react";
import type { ProdutoAdmin } from "../types";
import { formatarMoeda } from "../lib/formatarMoeda";
import { urlPublica } from "../lib/api";
import { Estado } from "./ui/Badge";
import { BotaoAcao } from "./ui/AcoesLinha";

// Um produto como LINHA DE LISTA — o formato do celular (5.3): thumb 40px,
// nome + categoria, preço à direita em Manrope tabular; a linha TODA abre o
// editor (o mesmo handler do "Editar" do desktop — nada de handler movido) e
// os ícones de ocultar/excluir ficam à direita em 44×44 com aria-label.
// "Oculto" aparece como segunda linha de texto SÓ quando o produto está
// oculto — doce visível não precisa de carimbo.
interface PropriedadesCartaoProduto {
  produto: ProdutoAdmin;
  aoEditar: (produto: ProdutoAdmin) => void;
  aoAlternarAtivo: (produto: ProdutoAdmin) => Promise<void>;
  aoExcluir: (produto: ProdutoAdmin) => void;
  trocando: boolean;
}

export function CartaoProduto({
  produto,
  aoEditar,
  aoAlternarAtivo,
  aoExcluir,
  trocando,
}: PropriedadesCartaoProduto): JSX.Element {
  return (
    <li className="flex items-center gap-1 py-1">
      <button
        onClick={() => aoEditar(produto)}
        aria-label={`Editar ${produto.nome}`}
        className="flex min-h-16 min-w-0 flex-1 items-center gap-3 py-1 text-left transition-colors hover:bg-areia/50"
      >
        {produto.imagem_url ? (
          // urlPublica: o backend devolve "/uploads/x.jpg" e o painel roda em
          // outra porta — sem prefixar a API o <img> procuraria a foto no
          // servidor do painel e mostraria quebrada.
          <img
            src={urlPublica(produto.imagem_url)}
            alt=""
            loading="lazy"
            className="h-10 w-10 flex-none rounded-campo object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-10 w-10 flex-none place-items-center rounded-campo bg-areia font-display text-textoSuave"
          >
            {produto.nome.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <b className="block truncate font-medium text-tinta">{produto.nome}</b>
          <span className="block truncate text-xs text-textoSuave">
            {produto.categoria ?? "Sem categoria"}
          </span>
          {!produto.ativo ? (
            <Estado tom="suave" className="mt-0.5 text-xs">
              Oculto
            </Estado>
          ) : null}
        </span>
        <span className="flex-none font-numero text-sm font-semibold tabular-nums text-tinta">
          {formatarMoeda(produto.preco)}
        </span>
      </button>
      <BotaoAcao
        onClick={() => void aoAlternarAtivo(produto)}
        disabled={trocando}
        rotulo={
          trocando
            ? "Salvando a mudança de visibilidade"
            : produto.ativo
              ? `Ocultar ${produto.nome} da vitrine`
              : `Mostrar ${produto.nome} na vitrine`
        }
        className="text-textoSuave"
      >
        {trocando ? (
          <Loader2 size={16} strokeWidth={1.5} className="motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <Power size={16} strokeWidth={1.5} aria-hidden="true" />
        )}
      </BotaoAcao>
      <BotaoAcao
        onClick={() => aoExcluir(produto)}
        rotulo={`Remover ${produto.nome}`}
        className="text-textoSuave hover:text-perigo"
      >
        <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
      </BotaoAcao>
    </li>
  );
}
