import { useAutenticacao } from "../hooks/useAutenticacao";
import { usePedidos } from "../hooks/usePedidos";
import { useEffect, useMemo, useState } from "react";
import { rotuloStatus } from "../lib/pedido";
import { STATUS_PEDIDO } from "../types";
import { EsqueletoTabela } from "../components/ui/EsqueletoTabela";
import { Botao } from "../components/ui/Botao";
import { CartaoPedido } from "../components/CartaoPedido";
import { TabelaPedidos } from "../components/TabelaPedidos";
import { DrawerPedido } from "../components/DrawerPedido";
import { CabecalhoSecao } from "../components/CabecalhoSecao";

// Pedidos (/painel/pedidos), 5.2: abas de texto com contagem, tabela ledger
// no desktop, linha de lista no celular e drawer com avanço/cancelamento.
// Linha atualiza in-place após o PATCH.
const ABAS = ["todos", ...STATUS_PEDIDO];

export function Pedidos(): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const {
    pedidos,
    todos,
    filtro,
    definirFiltro,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente,
    mudarStatus,
    mudarPagamento,
  } = usePedidos(sessao?.token ?? null);
  const [abertoId, definirAbertoId] = useState<number | null>(null);

  // Contagem por status, contada na lista inteira e não na aba visível: a
  // aba "Pendente" precisa mostrar quantos pendentes existem, e a lista
  // filtrada mostraria zero para todas as outras.
  const contagens = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const pedido of todos) {
      mapa.set(pedido.status, (mapa.get(pedido.status) ?? 0) + 1);
    }
    return mapa;
  }, [todos]);

  // Efeito, e não `if` no corpo do render: `sair()` atualiza o estado do
  // provedor de sessão, e mexer no estado de outro componente durante o
  // render é o que o React avisa em tempo de execução.
  useEffect(() => {
    if (precisaLogin) sair();
  }, [precisaLogin, sair]);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <CabecalhoSecao titulo="Pedidos" />

      {/* Abas de TEXTO — sem pílula. Ativa: semibold + traço de 2px no caramelo;
          inativa: textoSuave. A contagem (tabular) é o que dá à aba utilidade
          de alerta: sem ela, o gestor precisa abrir cada uma para saber onde
          há trabalho. `role`/`aria-selected` preservados do controle antigo.
          Em telas pequenas rola na horizontal — cada aba com alvo de 44px e
          contagem sempre legível. */}
      <div
        role="tablist"
        aria-label="Filtrar por status"
        className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-1 md:mx-0 md:gap-6 md:overflow-visible md:px-0"
      >
        {ABAS.map((aba) => (
          <button
            key={aba}
            role="tab"
            aria-selected={filtro === aba}
            onClick={() => definirFiltro(aba)}
            className={`relative flex-none min-h-11 px-1 text-sm transition-colors ${
              filtro === aba
                ? "font-semibold text-tinta"
                : "text-textoSuave hover:text-tinta"
            }`}
          >
            {aba === "todos" ? "Todos" : rotuloStatus(aba)}
            <span className="ml-1.5 font-numero text-xs tabular-nums text-textoSuave">
              {aba === "todos" ? todos.length : (contagens.get(aba) ?? 0)}
            </span>
            <span
              aria-hidden="true"
              className={`absolute inset-x-1 bottom-1 h-0.5 bg-caramelo ${
                filtro === aba ? "" : "hidden"
              }`}
            />
          </button>
        ))}
      </div>

      {carregando ? (
        <EsqueletoTabela linhas={4} />
      ) : erro ? (
        <div className="py-8">
          <b className="block text-base font-semibold text-tinta">O forno esfriou por aqui</b>
          <p className="mt-1 text-sm text-textoSuave">{erro}</p>
          <div className="mt-4">
            <Botao variante="texto" onClick={buscarNovamente}>Tentar de novo</Botao>
          </div>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="py-8">
          <b className="block text-base font-semibold text-tinta">Nenhum pedido aqui</b>
          <p className="mt-1 text-sm text-textoSuave">
            {filtro === "todos"
              ? "Os pedidos que chegam pela vitrine aparecem aqui assim que são feitos."
              : "Tente outra aba ou aguarde novos pedidos."}
          </p>
        </div>
      ) : (
        <>
          {/* Celular: linha de lista (5.2). A tabela de 640px exigia 288px de
              rolagem lateral numa tela de 360px. */}
          <ul className="divide-y divide-borda md:hidden">
            {pedidos.map((pedido) => (
              <CartaoPedido
                key={pedido.id}
                pedido={pedido}
                aoAbrir={(escolhido) => definirAbertoId(escolhido.id)}
              />
            ))}
          </ul>

          {/* Desktop: tabela ledger. */}
          <TabelaPedidos pedidos={pedidos} aoAbrir={(pedido) => definirAbertoId(pedido.id)} />
        </>
      )}

      <p className="hidden text-xs text-textoSuave md:block">
        Clique numa linha para abrir o detalhe e avançar o status.
      </p>

      {abertoId !== null ? <div className="fixed inset-0 z-[60] animate-[aparecer_0.25s_ease] bg-tinta/45" onClick={() => definirAbertoId(null)} aria-hidden="true" /> : null}
      <DrawerPedido
        pedidoId={abertoId}
        token={sessao?.token ?? ""}
        aoFechar={() => definirAbertoId(null)}
        aoMudarStatus={mudarStatus}
        aoMudarPagamento={mudarPagamento}
      />
    </div>
  );
}
