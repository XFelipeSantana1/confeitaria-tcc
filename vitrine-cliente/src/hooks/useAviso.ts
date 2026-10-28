import { useRef, useState } from "react";

// Balão temporário de confirmação ("Adicionado à sacola").
// Vira hook porque tem ciclo de vida próprio (temporizador que esconde
// sozinho) — o App só chama `mostrarAviso` e lê `aviso`.
//
// 3,2 s em vez de 2,4: 2,4 era pouco para o cliente ler e achar o que era. E
// como o temporizador reinicia a cada chamada, quem adiciona três doces vê o
// balão só sumir depois do terceiro — que é o comportamento certo, senão
// piscaria três avisos atropelados.
const TEMPO_NA_TELA_MS = 3200;

export function useAviso(): {
  aviso: string | null;
  mostrarAviso: (texto: string) => void;
} {
  const [aviso, definirAviso] = useState<string | null>(null);
  const temporizador = useRef<number | undefined>(undefined);

  function mostrarAviso(texto: string): void {
    definirAviso(texto);
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => definirAviso(null), TEMPO_NA_TELA_MS);
  }

  return { aviso, mostrarAviso };
}
