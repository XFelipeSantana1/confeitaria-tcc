import { Botao } from "./ui/Botao";

// Mensagem amigável para "não há nada aqui". SEM ilustração genérica: uma
// arte decorativa igual para motivos diferentes (busca sem resultado ≠
// cardápio vazio) apagava essa diferença — o TEXTO explica o que houve e a
// ação oferece o caminho de volta.
interface PropriedadesEstadoVazio {
  titulo: string;
  mensagem: string;
  textoAcao?: string;
  aoAgir?: () => void;
  carregando?: boolean;
}

export function EstadoVazio({
  titulo,
  mensagem,
  textoAcao,
  aoAgir,
  carregando = false,
}: PropriedadesEstadoVazio): JSX.Element {
  return (
    <div className="px-5 py-12 text-center">
      <h3 className="font-display text-2xl font-bold text-tinta text-balance">{titulo}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-textoSuave text-pretty">{mensagem}</p>
      {textoAcao && aoAgir && (
        <div className="mt-5">
          <Botao onClick={aoAgir} carregando={carregando}>
            {textoAcao}
          </Botao>
        </div>
      )}
    </div>
  );
}
