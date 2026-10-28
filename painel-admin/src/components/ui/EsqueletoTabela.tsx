interface PropriedadesEsqueleto {
  /** Linhas do placeholder. 3 é o suficiente para não parecer cartão vazio. */
  linhas?: number;
  className?: string;
}

// Esqueleto de tabela: linhas de hairline com blocos areia RETOS, sem raio
// e sem moldura — o esqueleto desenha a LISTA que vem, dentro da mesma
// superfície, e não um cartão que vai sumir quando o dado chegar. As linhas
// repetidas dizem "isto é uma lista"; larguras irregulares dizem "tem dado".
export function EsqueletoTabela({
  linhas = 3,
  className = "",
}: PropriedadesEsqueleto): JSX.Element {
  return (
    <div className={`animate-pulse ${className}`} aria-busy="true" aria-label="Carregando">
      {Array.from({ length: linhas }, (_, indice) => (
        <div key={indice} className="flex items-center gap-3 border-t border-borda py-3">
          <div className="h-8 w-8 flex-none bg-areia" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-1/4 bg-areia" />
            {/* A segunda linha é mais curta e nem todas têm a mesma largura:
                linhas iguais demais denunciam placeholder automático. */}
            <div
              className="h-2 bg-areia/70"
              style={{ width: `${55 + ((indice * 13) % 30)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
