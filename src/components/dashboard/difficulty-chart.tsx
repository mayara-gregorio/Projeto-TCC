
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Dificuldade = {
  subject_id: string;
  subject_name: string;
  topic_id: string;
  topic_title: string;
  total: number;
};

// Gera uma cor para cada tópico, sem limite fixo de cores.
function gerarCor(index: number): string {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 65%, 48%)`;
}

export function DifficultyChart({
  data,
}: {
  data: Dificuldade[];
}) {
  const ordenados = [...data].sort(
    (a, b) => b.total - a.total
  );

  const itens = ordenados
    .filter((item) => item.total > 0)
    .map((item, index) => ({
      id: `${item.subject_id}-${item.topic_id ?? "sem-topico"}`,
      label: `${item.subject_name} · ${item.topic_title}`,
      topicTitle: item.topic_title,
      subjectName: item.subject_name,
      total: item.total,
      cor: gerarCor(index),
    }));

  const total = itens.reduce(
    (sum, item) => sum + item.total,
    0
  );

  // Configuração do gráfico de rosca.
  const raio = 78;
  const circunferencia = 2 * Math.PI * raio;

  let percentualAcumulado = 0;

  const segmentos = itens.map((item) => {
    const percentual = (item.total / (total || 1)) * 100;

    const comprimento =
      (percentual / 100) * circunferencia;

    const deslocamento =
      -(percentualAcumulado / 100) * circunferencia;

    percentualAcumulado += percentual;

    return {
      ...item,
      percentual,
      comprimento,
      deslocamento,
    };
  });

  return (
    <Card className="flex max-h-[50vh] flex-col overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">
          Distribuição das dúvidas
        </CardTitle>

        <p className="text-sm text-muted-foreground">
          Perguntas classificadas nas suas disciplinas
        </p>
      </CardHeader>

      <CardContent className="min-h-0 overflow-y-auto">
        {total === 0 ? (
          <div className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            Ainda não há dúvidas classificadas para
            exibir o gráfico.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Gráfico de rosca interativo */}
            <div className="relative size-52 shrink-0">
              <svg
                viewBox="0 0 220 220"
                className="size-full"
                role="img"
                aria-label={`Distribuição de ${total} dúvidas pelos tópicos`}
              >
                <circle
                  cx="110"
                  cy="110"
                  r={raio}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="34"
                  className="text-muted"
                />

                {segmentos.map((segmento) => (
                  <circle
                    key={segmento.id}
                    cx="110"
                    cy="110"
                    r={raio}
                    fill="none"
                    stroke={segmento.cor}
                    strokeWidth="34"
                    strokeDasharray={
                      `${segmento.comprimento} ${circunferencia - segmento.comprimento}`
                    }
                    strokeDashoffset={segmento.deslocamento}
                    transform="rotate(-90 110 110)"
                    className="cursor-help transition-opacity hover:opacity-80"
                    style={{
                      pointerEvents: "stroke",
                    }}
                  >
                    <title>
                      {`${segmento.subjectName}
Tópico: ${segmento.topicTitle}
Dúvidas: ${segmento.total}
Percentual: ${segmento.percentual.toFixed(1)}%`}
                    </title>
                  </circle>
                ))}
              </svg>

              {/* Total no centro */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-3xl font-semibold">
                  {total}
                </strong>

                <span className="text-xs text-muted-foreground">
                  dúvidas
                </span>
              </div>
            </div>

            {/* Legenda dinâmica */}
            <div className="w-full space-y-3">
              {segmentos.map((item) => (
                <div
                  key={item.id}
                  title={`${item.subjectName} · ${item.topicTitle}: ${item.total} dúvidas (${item.percentual.toFixed(1)}%)`}
                  className="flex items-start justify-between gap-3 text-sm"
                >
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className="mt-1 size-2.5 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: item.cor,
                      }}
                    />

                    <span className="break-words text-muted-foreground">
                      {item.label}
                    </span>
                  </div>

                  <span className="shrink-0 font-medium tabular-nums">
                    {item.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
