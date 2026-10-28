import { Botao } from "./ui/Botao";

// Tela de erro de REDE: explica em linguagem de cliente (sem código HTTP e
// sem jargão de desenvolvimento — "backend" não diz nada para quem só quer
// comprar doce), oferece "Tentar de novo" (refaz o fetch) e, como
// alternativa, ver a demonstração local. Nunca tela branca, nunca cardápio
// falso.
//
// Sem disco com ícone e sem ícones nos botões: falha de rede não é culpa do
// cliente, então NÃO é o vermelho de formulário — a tela fica tinta e
// textoSuave, e o título em Playfair carrega o peso sozinho.
interface PropriedadesAlertaErro {
  mensagem: string;
  aoTentarNovamente: () => void;
  aoUsarDemonstracao: () => void;
}

export function AlertaErro({
  mensagem,
  aoTentarNovamente,
  aoUsarDemonstracao,
}: PropriedadesAlertaErro): JSX.Element {
  return (
    <div className="mx-auto max-w-lg px-5 py-12 text-center">
      <h3 className="font-display text-2xl font-bold text-tinta text-balance">
        O forno esfriou por aqui
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-textoSuave text-pretty">
        Não consegui buscar o cardápio agora ({mensagem}). Pode ser a conexão —
        tenta de novo em instantes.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Botao onClick={aoTentarNovamente}>Tentar de novo</Botao>
        <Botao variante="clara" onClick={aoUsarDemonstracao}>
          Ver demonstração
        </Botao>
      </div>
    </div>
  );
}
