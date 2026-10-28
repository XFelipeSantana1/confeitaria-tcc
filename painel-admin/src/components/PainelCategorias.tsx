import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import type { Categoria, ProdutoAdmin } from "../types";
import { ErroApi } from "../lib/api";
import { Botao } from "./ui/Botao";
import { ModalCategoria } from "./ModalCategoria";
import { ModalConfirmacao } from "./ModalConfirmacao";

/** O que a lista está mostrando: todas, uma categoria, ou os sem categoria. */
export type FiltroCategoria = "todas" | "sem" | number;

interface PropriedadesPainelCategorias {
  categorias: Categoria[];
  produtos: ProdutoAdmin[];
  filtro: FiltroCategoria;
  aoFiltrar: (filtro: FiltroCategoria) => void;
  // As escritas devolvem Promise e podem rejeitar: o painel espera, e só
  // fecha o modal quando deu certo. Quem segura `salvando` e `erro` é o
  // painel, não a tela — assim o 409 de nome duplicado aparece no modal em
  // vez de sumir junto com ele.
  aoCriar: (nome: string) => Promise<void>;
  aoRenomear: (id: number, nome: string) => Promise<void>;
  aoRemover: (categoria: Categoria) => Promise<void>;
  aoFechar: () => void;
}

type EmEdicao = { tipo: "nova" } | { tipo: "renomear"; categoria: Categoria };

/**
 * Categorias dentro da tela de Produtos (5.3).
 *
 * Continua como gaveta que abre pelo botão "Categorias", mas a lista interna
 * é um LEDGER: hairline entre linhas, nome à esquerda, contagem tabular à
 * direita, ações "Editar"/"Excluir" EM TEXTO (não ícone). Tocar na linha
 * filtra a tabela logo abaixo — o painel serve à tela, como antes.
 */
export function PainelCategorias({
  categorias,
  produtos,
  filtro,
  aoFiltrar,
  aoCriar,
  aoRenomear,
  aoRemover,
  aoFechar,
}: PropriedadesPainelCategorias): JSX.Element {
  const [emEdicao, definirEmEdicao] = useState<EmEdicao | null>(null);
  const [excluindo, definirExcluindo] = useState<Categoria | null>(null);
  const [salvando, definirSalvando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);

  async function executar(
    acao: () => Promise<void>,
    fechar: () => void,
  ): Promise<void> {
    definirSalvando(true);
    definirErro(null);
    try {
      await acao();
      fechar();
    } catch (falha) {
      definirErro(falha instanceof ErroApi ? falha.message : "A ação falhou. Tente de novo.");
    } finally {
      definirSalvando(false);
    }
  }

  // A contagem vem dos produtos que a tela já carregou: nenhuma requisição
  // extra, e o número é sempre o mesmo que o gestor vê na tabela.
  const contagem = useMemo(() => {
    const mapa = new Map<number, number>();
    let sem = 0;
    for (const produto of produtos) {
      if (produto.categoria_id === null) {
        sem += 1;
      } else {
        mapa.set(produto.categoria_id, (mapa.get(produto.categoria_id) ?? 0) + 1);
      }
    }
    return { mapa, sem };
  }, [produtos]);

  useEffect(() => {
    function aoTeclar(evento: KeyboardEvent): void {
      if (evento.key !== "Escape") return;
      if (emEdicao || excluindo) return;
      aoFechar();
    }
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [aoFechar, emEdicao, excluindo]);

  return (
    <>
      <button
        onClick={aoFechar}
        aria-label="Fechar categorias"
        className="fixed inset-0 z-[60] animate-[aparecer_0.2s_ease] bg-tinta/40"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Categorias do cardápio"
        className="fixed inset-0 z-[61] flex animate-[deslizar_0.35s_cubic-bezier(0.32,0.72,0,1)] flex-col bg-white text-tinta shadow-flutuante md:inset-y-0 md:left-auto md:right-0 md:w-full md:max-w-sm md:rounded-l-card md:border-l md:border-borda"
      >
        {/* O padrão de fechar é o do drawer de pedidos: "Voltar" em texto no
            celular (tela cheia), X de 44px no desktop. */}
        <header className="flex items-start justify-between gap-2 border-b border-borda p-5">
          <button
            onClick={aoFechar}
            className="-ml-2 flex-none rounded-campo px-2 text-sm font-medium text-carameloForte hover:underline underline-offset-4 md:hidden"
            aria-label="Voltar para a lista de produtos"
          >
            Voltar
          </button>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-tinta">Categorias</h3>
            <p className="mt-0.5 text-sm text-textoSuave">Toque para filtrar a lista.</p>
          </div>
          <button
            onClick={aoFechar}
            aria-label="Fechar categorias"
            className="hidden h-11 w-11 flex-none place-items-center rounded-campo transition-colors hover:bg-areia/60 md:grid"
          >
            <X size={19} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        <ul className="flex flex-1 flex-col divide-y divide-borda overflow-y-auto p-4">
          <LinhaFiltro
            ativo={filtro === "todas"}
            nome="Todos os produtos"
            quantidade={produtos.length}
            aoTocar={() => aoFiltrar("todas")}
          />
          {categorias.map((categoria) => (
            <li key={categoria.id} className="flex items-stretch">
              <LinhaFiltro
                ativo={filtro === categoria.id}
                nome={categoria.nome}
                quantidade={contagem.mapa.get(categoria.id) ?? 0}
                aoTocar={() => aoFiltrar(categoria.id)}
                crescendo
              />
              <button
                onClick={() => definirEmEdicao({ tipo: "renomear", categoria })}
                aria-label={`Renomear ${categoria.nome}`}
                className="inline-flex min-h-11 flex-none items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-borda hover:bg-areia/60 hover:text-tinta"
              >
                Editar
              </button>
              <button
                onClick={() => definirExcluindo(categoria)}
                aria-label={`Remover ${categoria.nome}`}
                className="inline-flex min-h-11 flex-none items-center rounded-campo border border-transparent px-2.5 text-sm text-textoSuave transition-colors hover:border-perigo/60 hover:bg-perigo/10 hover:text-perigo"
              >
                Excluir
              </button>
            </li>
          ))}
          {contagem.sem > 0 ? (
            <LinhaFiltro
              ativo={filtro === "sem"}
              nome="Sem categoria"
              quantidade={contagem.sem}
              aoTocar={() => aoFiltrar("sem")}
            />
          ) : null}
        </ul>

        <footer className="border-t border-borda p-4">
          <Botao
            className="w-full"
            onClick={() => {
              definirEmEdicao({ tipo: "nova" });
            }}
          >
            Nova categoria
          </Botao>
          {/* Aviso aqui e não só no modal: a consequência aparece já na lista,
              antes de a pessoa apertar remover. */}
          <p className="mt-2.5 text-xs leading-relaxed text-textoSuave">
            Remover não apaga produtos: eles ficam sem categoria.
          </p>
        </footer>
      </aside>

      {emEdicao ? (
        <ModalCategoria
          key={emEdicao.tipo === "renomear" ? emEdicao.categoria.id : "nova"}
          categoria={emEdicao.tipo === "renomear" ? emEdicao.categoria : null}
          salvando={salvando}
          erro={erro}
          aoFechar={() => definirEmEdicao(null)}
          aoSalvar={(nome) =>
            executar(
              () =>
                emEdicao.tipo === "renomear"
                  ? aoRenomear(emEdicao.categoria.id, nome)
                  : aoCriar(nome),
              () => definirEmEdicao(null),
            )
          }
        />
      ) : null}
      {excluindo ? (
        <ModalConfirmacao
          titulo={`Remover "${excluindo.nome}"?`}
          mensagem={`${contagem.mapa.get(excluindo.id) ?? 0} produto(s) continuam no cardápio, mas ficam sem categoria.`}
          textoConfirmar="Remover"
          processando={salvando}
          erro={erro}
          aoFechar={() => definirExcluindo(null)}
          aoConfirmar={() =>
            executar(
              () => aoRemover(excluindo),
              () => definirExcluindo(null),
            )
          }
        />
      ) : null}
    </>
  );
}

interface PropriedadesLinhaFiltro {
  ativo: boolean;
  nome: string;
  quantidade: number;
  aoTocar: () => void;
  /** Dentro de um <li> com botões ao lado, a linha cresce para não desalinhar. */
  crescendo?: boolean;
}

function LinhaFiltro({
  ativo,
  nome,
  quantidade,
  aoTocar,
  crescendo = false,
}: PropriedadesLinhaFiltro): JSX.Element {
  return (
    <button
      onClick={aoTocar}
      aria-pressed={ativo}
      className={`flex min-h-12 items-center justify-between gap-3 py-1 text-left text-sm transition-colors ${
        crescendo ? "min-w-0 flex-1" : "w-full"
      } ${ativo ? "font-semibold text-tinta" : "text-tinta hover:bg-areia/50"}`}
    >
      {/* Ligação clara do estado ativo: semibold + o mesmo traço de 2px das
          abas — sem fundo, sem pílula, sem ícone de etiqueta. */}
      <span className={`relative min-w-0 truncate ${ativo ? "font-semibold" : ""}`}>
        {nome}
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 bottom-0 h-0.5 bg-caramelo ${ativo ? "" : "hidden"}`}
        />
      </span>
      <span className="flex-none font-numero text-xs tabular-nums text-textoSuave">
        {quantidade}
      </span>
    </button>
  );
}
