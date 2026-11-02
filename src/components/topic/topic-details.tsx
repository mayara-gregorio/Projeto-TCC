import Link from "next/link";
import { ArrowLeft, BookOpen, ExternalLink, FileText, MessageCircle, MessageSquare, Presentation, UserGroup, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type TopicSummary = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  materialCoverage: "covered" | "not_covered" | "uncertain";
  materialRecommendation: string | null;
};
export type DayCount = { day: string; count: number };
export type SlideSource = {
  key: string;
  filename: string;
  storagePath: string;
  start: number;
  end: number;
  count: number;
  url: string | null;
};

type Props = {
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  description: string | null;
  totalQuestions: number;
  uniqueStudents: number;
  slides: SlideSource[];
  timeline: DayCount[];
  hasError?: boolean;
  groups: DoubtGroup[]
};

export type DoubtGroup = {
  id: string;
  title: string;
  summary: string;
  totalQuestions: number;
  uniqueStudents: number;
};

export function TopicDetails({
  subjectId, subjectName, topicName, description,
  totalQuestions, uniqueStudents, slides, hasError, groups, topicId
}: Props) {

  
  const maxSlides = Math.max(1, ...slides.map((slide) => slide.count));
  const stats = [
    { label: "Perguntas registradas", value: totalQuestions, icon: MessageSquare },
    { label: "Alunos com dúvidas", value: uniqueStudents, icon: Users },
    { label: "Trechos recuperados", value: slides.length, icon: Presentation },
  ];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
      <header className="space-y-3">
        <Button variant="ghost" size="sm" >
          <Link href="/dashboard" className="flex gap-2"><ArrowLeft className="mr-2 size-4" /> Voltar ao dashboard</Link>
        </Button>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{subjectName} / Detalhes do tópico</p>
          <h1 className="text-2xl font-semibold">{topicName}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          <Link href={`/subjects/${subjectId}/topics`} className="inline-block text-xs text-primary hover:underline">Gerenciar materiais desta disciplina</Link>
        </div>
      </header>

      {hasError && <p className="rounded-md border border-destructive p-3 text-sm text-destructive">Alguns dados não puderam ser carregados. Confira as permissões do Supabase.</p>}

      <section className="grid gap-3 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-2xl font-semibold">{value}</p><p className="text-sm text-muted-foreground">{label}</p></div>
              <Icon className="size-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><BookOpen className="size-4" /> Slides mais recuperados</CardTitle></CardHeader>
          <CardContent className="space-y-5 overflow-y-auto max-h-[50vh]">
            {slides.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum trecho recuperado neste tópico.</p>
            ) : slides.map((slide) => (
              <div key={slide.key} className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{slide.start === slide.end ? `Slide ${slide.start}` : `Slides ${slide.start}–${slide.end}`}</p>
                    <p className="break-words text-xs text-muted-foreground">{slide.filename}</p>
                  </div>
                  <Badge variant="secondary">{slide.count} {slide.count === 1 ? "recuperação" : "recuperações"}</Badge>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(slide.count / maxSlides) * 100}%` }} />
                </div>
                {slide.url && <a href={slide.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline"><FileText className="size-3" /> Abrir PDF <ExternalLink className="size-3" /></a>}
              </div>
            ))}
          </CardContent>
            <p className="text-xs text-muted-foreground mx-4">São fragmentos recuperados pela busca RAG, não necessariamente citados pela IA.</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Agrupamento de dúvidas</CardTitle>
            <p className="text-sm text-muted-foreground">Agrupamento das perguntas dos estudantes.</p>
          </CardHeader>
          <CardContent className="space-y-3 overflow-y-auto max-h-[50vh]">
            {groups.length === 0 ? (
              <p className="py-5 text-sm text-muted-foreground">Ainda não existem agrupamentos para este tópico.</p>
            ) : groups.map((item) => (
              <Link href={`/topics/${topicId}/${item.id}`} key={item.id} className="block">
              <div key={item.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {item.summary}
                </p>
                <div className="flex gap-4">
                  <div className="flex gap-2">
                    <UserGroup size={16}/>
                    <p> {item.uniqueStudents} Alunos</p>
                  </div>
                  <div className="flex gap-2">
                    <MessageCircle size={16}/>
                    <p> {item.totalQuestions} Requisições</p>
                  </div>
                </div>
              </div>
              </Link>
            ))}
            {groups.length >= 100 && <p className="text-xs text-muted-foreground">Exibindo os 100 resumos mais recentes.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
