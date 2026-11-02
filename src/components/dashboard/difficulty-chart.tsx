import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type Dificuldade = {
  subject_id: string;
  subject_name: string;
  topic_id: string | null;
  topic_title: string;
  total: number;
};

const cores = ["#15803d", "#4ade80", "#86efac", "#bbf7d0", "#e5e7eb"];

export function DifficultyChart({ data }: { data: Dificuldade[] }) {
  const ordenados = [...data].sort((a, b) => b.total - a.total);
  const top = ordenados.slice(0, 4);
  const restantes = ordenados.slice(4).reduce((sum, item) => sum + item.total, 0);
  const itens = [
    ...top.map((item) => ({
      label:
        item.topic_title === "Outro conteúdo"
          ? "Outro assunto"
          : `${item.subject_name} · ${item.topic_title}`,
      total: item.total,
    })),
    ...(restantes > 0
      ? [{ label: "Demais tópicos", total: restantes }]
      : []),
  ];
  const total = itens.reduce((sum, item) => sum + item.total, 0);
  let percentual = 0;
  const segmentos = itens.map((item, index) => {
    const inicio = percentual;
    percentual += (item.total / (total || 1)) * 100;
    return `${cores[index]} ${inicio}% ${percentual}%`;
  });

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">Distribuição das dúvidas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Perguntas classificadas nas suas disciplinas
        </p>
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <div className="flex min-h-56 items-center justify-center text-center text-sm text-muted-foreground">
            Ainda não há dúvidas classificadas para exibir o gráfico.
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            <div
              role="img"
              aria-label={`Distribuição de ${total} dúvidas pelos tópicos`}
              className="flex size-52 shrink-0 items-center justify-center rounded-full"
              style={{ background: `conic-gradient(${segmentos.join(", ")})` }}
            >
              <div className="flex size-36 flex-col items-center justify-center rounded-full bg-card">
                <strong className="text-3xl font-semibold">{total}</strong>
                <span className="text-xs text-muted-foreground">dúvidas</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              {itens.map((item, index) => (
                <div key={item.label} className="flex items-start justify-between gap-3 text-sm">
                  <div className="flex min-w-0 items-start gap-2">
                    <span
                      className="mt-1 size-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: cores[index] }}
                    />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="shrink-0 font-medium tabular-nums">{item.total}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
