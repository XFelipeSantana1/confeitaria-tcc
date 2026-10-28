import { useEffect, useMemo } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useResumo } from "../hooks/useResumo";
import { Botao } from "../components/ui/Botao";
import { CartaoMetrica, type ItemFila } from "../components/CartaoMetrica";
import { GraficoVendas } from "../components/GraficoVendas";
import { ListaMaisVendidos } from "../components/ListaMaisVendidos";
import { ListaBaixoEstoque } from "../components/ListaBaixoEstoque";
import { UltimosPedidos } from "../components/UltimosPedidos";
import { formatarMoeda } from "../lib/formatarMoeda";
import { PERIODOS, pedidosDoPeriodo, usePeriodo, vendasPorDia } from "../lib/periodo";

// Resumo (/painel), 5.1: UMA tela com o essencial — fila do que precisa de
// ação, e o número de vendas com o gráfico juntos. Desktop lê em duas colunas
// assimétricas (5/7), não numa grade de cartões. Token expirado desloga.

function saudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function primeiroNome(nome: string | undefined): string {
  const partes = (nome ?? "").trim().split(/\s+/).filter(Boolean);
  return partes[0] ?? "tudo bem";
}

export function Resumo(): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const {
    pedidos,
    baixoEstoque,
    maisVendidos,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente,
  } = useResumo(sessao?.token ?? null);

  useEffect(() => {
    if (precisaLogin) sair();
  }, [precisaLogin, sair]);

  const pendentes = pedidos.filter((p) => p.status === "pendente").length;
  const emPreparo = pedidos.filter((p) => p.status === "em_preparo").length;
  const aReceber = pedidos.filter(
    (p) => p.status_pagamento === "pendente" && p.status !== "cancelado",
  ).length;

  const [periodo, definirPeriodo] = usePeriodo();
  const noPeriodo = useMemo(() => pedidosDoPeriodo(pedidos, periodo), [
    pedidos,
    periodo,
  ]);
  const diasVendidos = useMemo(() => vendasPorDia(pedidos, periodo), [
    pedidos,
    periodo,
  ]);
  const diaDe = useMemo(() => {
    if (diasVendidos.length === 0) return "—";
    return diasVendidos.reduce((melhor, dia) => (dia.total > melhor.total ? dia : melhor))
      .rotulo;
  }, [diasVendidos]);
  const totalPeriodo = useMemo(
    () => diasVendidos.reduce((soma, dia) => soma + dia.total, 0),
    [diasVendidos],
  );
  const pedidosNoPeriodo = useMemo(
    () => diasVendidos.reduce((soma, dia) => soma + dia.quantidade, 0),
    [diasVendidos],
  );

  // As quatro linhas da fila: os destinos são os dos botões "Ver pedidos"/
  // "Ver estoque" que saíram — a linha inteira leva, dispensando botão.
  const fila: ItemFila[] = [
    {
      rotulo: "Pedidos pendentes",
      descricao: "aguardando preparo",
      valor: pendentes,
      tom: pendentes > 0 ? "acao" : "suave",
      para: "/painel/pedidos",
    },
    {
      rotulo: "Em preparo",
      descricao: "no forno agora",
      valor: emPreparo,
      tom: emPreparo > 0 ? "tinta" : "suave",
      para: "/painel/pedidos",
    },
    {
      rotulo: "A receber",
      descricao: "pagamentos pendentes",
      valor: aReceber,
      tom: aReceber > 0 ? "tinta" : "suave",
      para: "/painel/pedidos",
    },
    {
      rotulo: "Estoque baixo",
      descricao: "insumos no limite",
      valor: baixoEstoque.length,
      tom: baixoEstoque.length > 0 ? "alerta" : "suave",
      para: "/painel/insumos",
    },
  ];

  return (
    <div className="flex flex-col space-y-10 md:space-y-12">
      {/* Cabeçalho: a DATA é a única sobretítulo de página que sobrevive no
          painel (exceção declarada da 3.3 — ela dá contexto de dia comercial). */}
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-textoSuave">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-tinta md:text-3xl">
            {saudacao()}, {primeiroNome(sessao?.usuario.nome)}.
          </h1>
        </div>

        {/* Período como controle de TEXTO (mesma lógica do menu): ativo é
            semibold + 2px caramelo; nada de pílula. Celular fica abaixo da
            saudação, desktop na direita. `role="group"`/`aria-pressed`
            preservados do controle de antes. */}
        <div role="group" aria-label="Filtrar o resumo por período" className="flex gap-2 md:gap-5">
          {PERIODOS.map((opcao) => (
            <button
              key={opcao.valor}
              onClick={() => definirPeriodo(opcao.valor)}
              aria-pressed={periodo === opcao.valor}
              className={`relative min-h-11 px-2 text-sm transition-colors ${
                periodo === opcao.valor
                  ? "font-semibold text-tinta"
                  : "text-textoSuave hover:text-tinta"
              }`}
            >
              {opcao.rotulo}
              <span
                aria-hidden="true"
                className={`absolute inset-x-1 bottom-1 h-0.5 bg-caramelo ${
                  periodo === opcao.valor ? "" : "hidden"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Carregamento: blocos areia na proporção do que vem, sem cartão. */}
      {carregando ? (
        <div className="py-8" aria-busy="true" aria-label="Carregando resumo">
          <div className="h-3 w-28 animate-pulse bg-areia" />
          <div className="mt-3 h-3 animate-pulse bg-areia/70" style={{ width: "65%" }} />
          <p className="mt-4 text-sm text-textoSuave">Atualizando o resumo…</p>
        </div>
      ) : erro ? (
        <div className="py-8">
          <b className="block text-base font-semibold text-tinta">O forno esfriou por aqui</b>
          <p className="mt-1 text-sm text-textoSuave">{erro}</p>
          <div className="mt-4">
            <Botao variante="texto" onClick={buscarNovamente}>Tentar de novo</Botao>
          </div>
        </div>
      ) : (
        <>
          {/* 5/7: fila à esquerda, vendas+ranking à direita. Celular empilha
              na ordem fila → vendas → mais vendidos (a leitura de urgência). */}
          <div className="space-y-10 md:grid md:grid-cols-12 md:gap-12 md:space-y-12">
            <div className="md:col-span-5">
              <CartaoMetrica itens={fila} />
              {baixoEstoque.length > 0 ? (
                <div className="mt-4">
                  <ListaBaixoEstoque itens={baixoEstoque} />
                </div>
              ) : null}
            </div>

            <div className="space-y-6 md:col-span-7 md:space-y-10">
              {/* Vendas no período: rótulo-caixa, número MANROPE (não
                  serifada — número grande em serifada era cerimônia), dieta
                  em texto. O gráfico vem logo abaixo, sem moldura. */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-textoSuave">
                  Vendas no período
                </p>
                <p className="mt-1 font-numero text-4xl font-semibold tabular-nums text-tinta">
                  {formatarMoeda(totalPeriodo)}
                </p>
                <p className="mt-1 text-sm text-textoSuave">
                  {pedidosNoPeriodo} {pedidosNoPeriodo === 1 ? "pedido" : "pedidos"} · melhor dia {diaDe}
                </p>
              </div>
              <GraficoVendas dias={diasVendidos} />
              <ListaMaisVendidos itens={maisVendidos} />
            </div>
          </div>

          <UltimosPedidos pedidos={pedidos} />

          <p className="text-sm text-textoSuave">
            {noPeriodo.length === pedidos.length
              ? "Mostrando todos os pedidos. "
              : `Mostrando ${noPeriodo.length} de ${pedidos.length} pedidos. `}
            Pedidos e estoques são gerenciados nas telas do menu.
          </p>
        </>
      )}
    </div>
  );
}
