import { Loader2 } from "lucide-react";
import type { ProdutoAdmin } from "../types";
import { formatarMoeda } from "../lib/formatarMoeda";
import { urlPublica } from "../lib/api";
import { Estado } from "./ui/Badge";
import { CartaoProduto } from "./CartaoProduto";

// Lista de produtos em dois formatos (5.3): LINHA DE LISTA no celular,
// tabela ledger densa no desktop, direto sobre o creme (sem moldura).
// Com 4 colunas a tabela exigia 368px de rolagem lateral numa tela de 360px.
//
// Ações de linha: desktop = LINKS DE TEXTO (Editar · Ocultar/Mostrar ·
// Excluir) com os MESMOS handlers de antes; celular = a linha toda abre o
// editor e os ícones de ocultar/excluir ficam à direita em 44px.
// Sem foto: tile areia com a INICIAL em Playfair — o ícone de bolo repetido
// em cada linha virava textura, não informação.
interface PropriedadesTabelaProdutos {
  produtos: ProdutoAdmin[];
  aoEditar: (produto: ProdutoAdmin) => void;
  // Promise de propósito: quem chama precisa saber se deu certo. Com `void` a
  // falha de rede sumia e o selo de visibilidade mentia sobre o cardápio.
  aoAlternarAtivo: (produto: ProdutoAdmin) => Promise<void>;
  aoExcluir: (produto: ProdutoAdmin) => void;
  /** Id do produto com a troca em andamento, para travar só aquela linha. */
  trocandoId: number | null;
}

// Alvo claro para o dedo e olho: os links de ação das linhas são CHIPS
// fantasmas — texto com corpo no hover (areia + borda), sem virar botão
// colorido. Excluir acorda perigo; editar/mover acordam tinta.
const LINK_ACAO =
  "inline-flex min-h-11 items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-borda hover:bg-areia/60 hover:text-tinta";
const LINK_ACAO_EXCLUIR =
  "inline-flex min-h-11 items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-perigo/60 hover:bg-perigo/10 hover:text-perigo";

export function TabelaProdutos({
  produtos,
  aoEditar,
  aoAlternarAtivo,
  aoExcluir,
  trocandoId,
}: PropriedadesTabelaProdutos): JSX.Element {
  return (
    <>
      {/* CELULAR: linha de lista. */}
      <ul className="divide-y divide-borda md:hidden">
        {produtos.map((produto) => (
          <CartaoProduto
            key={produto.id}
            produto={produto}
            aoEditar={aoEditar}
            aoAlternarAtivo={aoAlternarAtivo}
            aoExcluir={aoExcluir}
            trocando={trocandoId === produto.id}
          />
        ))}
      </ul>

      {/* DESKTOP: tabela. */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-borda text-xs font-semibold uppercase tracking-wider text-textoSuave">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3 text-right">Preço</th>
              <th className="px-4 py-3">Na vitrine</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map((produto) => (
              <tr
                key={produto.id}
                className="border-b border-borda transition-colors last:border-0 hover:bg-areia/50"
              >
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    {produto.imagem_url ? (
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
                    <span className="min-w-0">
                      <b className="block font-medium text-tinta">{produto.nome}</b>
                      <span className="block text-xs text-textoSuave">
                        {produto.categoria ?? "Sem categoria"}
                      </span>
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-right font-numero font-semibold tabular-nums text-tinta">
                  {formatarMoeda(produto.preco)}
                </td>
                <td className="px-4 py-3">
                  <Estado tom={produto.ativo ? "acao" : "suave"}>
                    {produto.ativo ? "Visível" : "Oculto"}
                  </Estado>
                </td>
                <td className="px-4 py-3">
                  <span className="flex justify-end items-center">
                    <button
                      type="button"
                      onClick={() => aoEditar(produto)}
                      aria-label={`Editar ${produto.nome}`}
                      className={LINK_ACAO}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void aoAlternarAtivo(produto)}
                      disabled={trocandoId === produto.id}
                      aria-label={
                        trocandoId === produto.id
                          ? "Salvando a mudança de visibilidade"
                          : produto.ativo
                            ? `Ocultar ${produto.nome} da vitrine`
                            : `Mostrar ${produto.nome} na vitrine`
                      }
                      className={`${LINK_ACAO} disabled:cursor-wait disabled:opacity-60 disabled:hover:no-underline`}
                    >
                      {trocandoId === produto.id ? (
                        <Loader2
                          size={15}
                          strokeWidth={1.5}
                          className="motion-safe:animate-spin inline"
                          aria-hidden="true"
                        />
                      ) : null}
                      {produto.ativo ? "Ocultar" : "Mostrar"}
                    </button>
                    <button
                      type="button"
                      onClick={() => aoExcluir(produto)}
                      aria-label={`Remover ${produto.nome}`}
                      className={LINK_ACAO_EXCLUIR}
                    >
                      Excluir
                    </button>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
