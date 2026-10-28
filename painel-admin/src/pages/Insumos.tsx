import { useEffect, useMemo, useState } from "react";
import { useAutenticacao } from "../hooks/useAutenticacao";
import { useInsumos } from "../hooks/useInsumos";
import type { Insumo } from "../types";
import { ErroApi } from "../lib/api";
import { EsqueletoTabela } from "../components/ui/EsqueletoTabela";
import { Botao } from "../components/ui/Botao";
import { BuscaComContagem } from "../components/BuscaComContagem";
import { CabecalhoSecao } from "../components/CabecalhoSecao";
import { TabelaInsumos } from "../components/TabelaInsumos";
import { ModaisInsumo, type JanelaInsumo } from "../components/ModaisInsumo";

// Lista de insumos (/painel/insumos): tabela com CRUD + movimentação auditada.
// A linha em alerta fala "Abaixo do mínimo" na própria linha; excluir com
// vínculo volta 409 explicado, confirmado pelo ModalConfirmacao.
export function Insumos(): JSX.Element {
  const { sessao, sair } = useAutenticacao();
  const {
    insumos,
    carregando,
    erro,
    precisaLogin,
    buscarNovamente,
    criar,
    atualizar,
    movimentar,
    remover,
  } = useInsumos(sessao?.token ?? null);

  const [janela, definirJanela] = useState<JanelaInsumo>({ tipo: "fechada" });
  const [salvando, definirSalvando] = useState(false);
  const [erroModal, definirErroModal] = useState<string | null>(null);

  // Efeito, e não `if` no corpo do render: `sair()` atualiza o estado do
  // provedor de sessão, e mexer no estado de outro componente durante o
  // render é o que o React avisa em tempo de execução.
  useEffect(() => {
    if (precisaLogin) sair();
  }, [precisaLogin, sair]);


  // Busca só no cliente: a lista de insumos é pequena e já está em memória, e
  // chamar a API a cada tecla deixaria a tela piscando. O filtro também ignora
  // maiúsculas e acentos, porque nobody digita "acucar" procurando "Açúcar".
  const [termo, definirTermo] = useState("");
  const insumosVisiveis = useMemo(() => {
    const alvo = termo.trim().toLowerCase();
    if (alvo === "") return insumos;
    const semAcento = (texto: string) =>
      texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return insumos.filter((insumo) => semAcento(insumo.nome).toLowerCase().includes(alvo));
  }, [insumos, termo]);

  async function executar(acao: () => Promise<unknown>): Promise<void> {
    definirSalvando(true);
    definirErroModal(null);
    try {
      await acao();
      definirJanela({ tipo: "fechada" });
    } catch (falha) {
      definirErroModal(
        falha instanceof ErroApi ? falha.message : "A ação falhou. Tente de novo.",
      );
    } finally {
      definirSalvando(false);
    }
  }

  // Abrir a janela sempre limpa o erro: reaproveitar o modal com o aviso do
  // save anterior faz o gestor achar que a falha continua lá.
  function abrir(tipo: Exclude<JanelaInsumo["tipo"], "fechada">, insumo: Insumo | null = null): void {
    definirErroModal(null);
    definirJanela({ tipo, insumo } as JanelaInsumo);
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <CabecalhoSecao
        titulo="Insumos"
        acao={
          <Botao onClick={() => abrir("insumo")}>Novo insumo</Botao>
        }
      />

      <BuscaComContagem
        valor={termo}
        aoMudar={definirTermo}
        placeholder="Buscar insumo pelo nome…"
        rotulo="Buscar insumo pelo nome"
        encontrados={insumosVisiveis.length}
        total={insumos.length}
        palavra="insumos"
      />

      {carregando ? (
        <EsqueletoTabela linhas={4} />
      ) : erro ? (
        <div className="py-8">
          <p role="alert" className="text-sm text-perigo">
            Erro: {erro}
          </p>
          <div className="mt-3">
            <Botao variante="texto" onClick={buscarNovamente}>Tentar de novo</Botao>
          </div>
        </div>
      ) : insumos.length === 0 ? (
        <div className="py-8">
          <b className="block text-base font-semibold text-tinta">Nenhum insumo cadastrado</b>
          <p className="mt-1 text-sm text-textoSuave">Cadastre o primeiro para montar as fichas técnicas.</p>
        </div>
      ) : (
        <TabelaInsumos
          insumos={insumosVisiveis}
          aoMovimentar={(insumo) => abrir("movimentar", insumo)}
          aoEditar={(insumo) => abrir("insumo", insumo)}
          aoExcluir={(insumo) => abrir("excluir", insumo)}
        />
      )}

      <ModaisInsumo
        janela={janela}
        salvando={salvando}
        erroModal={erroModal}
        aoFechar={() => definirJanela({ tipo: "fechada" })}
        aoSalvar={(dados) =>
          void executar(() =>
            janela.tipo === "insumo" && janela.insumo
              ? atualizar(janela.insumo.id, {
                  nome: dados.nome,
                  unidade_medida: dados.unidade_medida,
                  quantidade_minima: dados.quantidade_minima,
                  custo_unitario: dados.custo_unitario,
                })
              : criar(dados),
          )
        }
        aoSalvarMovimentacao={(dados) =>
          void executar(() =>
            janela.tipo === "movimentar"
              ? movimentar(janela.insumo.id, dados)
              : Promise.resolve(),
          )
        }
        aoConfirmarExclusao={() =>
          void executar(() => (janela.tipo === "excluir" ? remover(janela.insumo.id) : Promise.resolve()))
        }
      />
    </div>
  );
}
