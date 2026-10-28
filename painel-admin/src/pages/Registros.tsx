import { useEffect } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useRegistros } from "../hooks/useRegistros";
import type { Registro } from "../types";
import { Botao } from "../components/ui/Botao";
import { EsqueletoTabela } from "../components/ui/EsqueletoTabela";
import { CabecalhoSecao } from "../components/CabecalhoSecao";
import { LinhaRegistro } from "../components/LinhaRegistro";

// Histórico de alterações (/painel/registros), 5.5. Existe para responder
// "quem mudou isso e o que era antes?" — a pergunta que aparece quando o
// preço está errado e ninguém sabe desde quando.
//
// A lista agrupa POR DIA com subtitulo de grupo em rótulo-caixa ("Hoje",
// "Ontem", "19 de outubro") — função local PURA abaixo, no render da página:
// não muda busca nem ordenação existentes (a API já entrega desc).

interface GrupoDiario {
  chave: string;
  titulo: string;
  itens: Registro[];
}

function agruparPorDia(registros: Registro[]): GrupoDiario[] {
  const hoje = new Date();
  const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const inicioOntem = new Date(inicioHoje.getTime() - 86_400_000);

  const grupos: GrupoDiario[] = [];
  const indice = new Map<string, GrupoDiario>();

  for (const registro of registros) {
    const data = new Date(registro.criado_em);
    const chave = Number.isNaN(data.getTime())
      ? registro.criado_em
      : data.toISOString().slice(0, 10);

    let grupo = indice.get(chave);
    if (!grupo) {
      grupo = { chave, titulo: tituloDoDia(data), itens: [] };
      indice.set(chave, grupo);
      grupos.push(grupo);
    }
    grupo.itens.push(registro);
  }

  function tituloDoDia(data: Date): string {
    const semHora = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    if (semHora.getTime() === inicioHoje.getTime()) return "Hoje";
    if (semHora.getTime() === inicioOntem.getTime()) return "Ontem";
    const anoAtual = hoje.getFullYear();
    const base = data.toLocaleDateString("pt-BR", { day: "numeric", month: "long" });
    return data.getFullYear() === anoAtual ? base : `${base} de ${data.getFullYear()}`;
  }

  return grupos;
}

export function Registros(): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const {
    registros,
    total,
    pagina,
    temAnterior,
    temProxima,
    carregando,
    erro,
    precisaLogin,
    irParaPagina,
    buscarNovamente,
  } = useRegistros(sessao?.token ?? null);

  // Mesmo tratamento das outras telas: 401 durante a leitura é sessão
  // expirada, e a resposta certa é sair — não insistir numa tela morta.
  // Efeito, e não `if` no corpo do render: `sair()` atualiza o estado do
  // provedor de sessão, e mexer no estado de outro componente durante o
  // render é o que o React avisa em tempo de execução.
  useEffect(() => {
    if (precisaLogin) sair();
  }, [precisaLogin, sair]);

  // A ordem dos grupos segue a ordem em que os dias aparecem na lista
  // (desc): o dia de hoje cabeça a página.
  const grupos = agruparPorDia(registros);

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <CabecalhoSecao
        titulo="Histórico"
        acao={
          <Botao variante="secundario" onClick={buscarNovamente} carregando={carregando}>
            Atualizar
          </Botao>
        }
      />

      <p className="max-w-2xl text-sm text-textoSuave">
        Tudo que o painel grava fica registrado aqui: em ordem de cronologia —
        dia, hora, quem fez e o que era antes. Serve para conferir preço,
        estoque e visibilidade dos doces sem precisar lembrar de cabeça.
      </p>

      {carregando && registros.length === 0 ? (
        <EsqueletoTabela linhas={5} />
      ) : erro !== null ? (
        <div className="py-8">
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
          <div className="mt-3">
            <Botao variante="texto" onClick={buscarNovamente}>Tentar de novo</Botao>
          </div>
        </div>
      ) : registros.length === 0 ? (
        <p className="py-8 text-sm text-textoSuave">
          Assim que você criar, editar ou excluir algo no painel, aparece aqui.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {grupos.map((grupo) => (
            <section key={grupo.chave} className="flex flex-col">
              {/* Rótulo-caixa: o mesmo estilo dos cabeçhos de tabela. */}
              <b className="border-b border-borda pb-2 text-xs font-semibold uppercase tracking-wider text-textoSuave">
                {grupo.titulo}
              </b>
              <ul className="divide-y divide-borda">
                {grupo.itens.map((registro) => (
                  <LinhaRegistro key={registro.id} registro={registro} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {total > 0 && (
        <div className="flex items-center justify-between gap-3 border-t border-borda pt-3 text-sm text-textoSuave">
          <span className="font-numero tabular-nums">
            {pagina * 25 + 1}–{Math.min(pagina * 25 + registros.length, total)} de {total}
          </span>
          <div className="flex gap-2">
            <Botao
              variante="secundario"
              onClick={() => irParaPagina(pagina - 1)}
              disabled={!temAnterior}
            >
              Anterior
            </Botao>
            <Botao
              variante="secundario"
              onClick={() => irParaPagina(pagina + 1)}
              disabled={!temProxima}
            >
              Próxima
            </Botao>
          </div>
        </div>
      )}
    </div>
  );
}
