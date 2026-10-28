/**
 * Aviso de erro no topo da tela.
 *
 * Estava copiado em três telas (Produtos, Insumos e o aviso da janela de
 * produto), com o mesmo `role="alert"` e as mesmas classes. Repetido, o
 * próximo erro entrava com uma aparência diferente e o painel ficava com
 * três tipos de faixa de erro — que é justamente o que o manual de design
 * pede para evitar.
 *
 * `role="alert"` faz o leitor de tela anunciar assim que o texto entra, sem
 * precisar que o foco vá para lá. Sem faixa: o erro é TEXTO (5.8) — "Erro:"
 * abre a mensagem e a cor de perigo é o marcador.
 */
export function AlertaAcao({ texto }: { texto: string | null }): JSX.Element | null {
  if (!texto) return null;
  return (
    <p role="alert" className="text-sm text-perigo">
      Erro: {texto}
    </p>
  );
}
