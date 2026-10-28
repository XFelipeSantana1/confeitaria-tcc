import { useEffect, useState } from "react";

// Diz qual seção de categoria está na viewport — alimenta o destaque da
// pílula "onde estou" no cardápio. A faixa de detecção fica no meio da tela
// (rootMargin) para a pílula não trocar a cada pixel rolado.
export function useSecaoVisivel(ids: string[]): {
  visivel: string | null;
  irPara: (id: string) => void;
} {
  const [visivel, definirVisivel] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (ids.length === 0) return;
    definirVisivel((atual) =>
      atual && ids.includes(atual) ? atual : (ids[0] ?? null),
    );
    const observador = new IntersectionObserver(
      (entradas) => {
        const aparente = entradas
          .filter((entrada) => entrada.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (aparente?.target.id) definirVisivel(aparente.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );
    ids.forEach((id) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    return () => observador.disconnect();
    // String estável como dependência: recria o observer só quando a lista
    // de seções muda de verdade, não a cada render do App. A dependência
    // está escrita à mão porque o plugin de hooks não vem neste projeto.
  }, [ids.join("|")]);

  // Scroll suave + destaque imediato (o observer confirma logo depois).
  function irPara(id: string): void {
    definirVisivel(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return { visivel, irPara };
}
