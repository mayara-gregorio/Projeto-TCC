"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type TopicDraft = { title: string; description: string; selected: boolean };

export function ImportTopicsForm({ subjectId }: { subjectId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [topics, setTopics] = useState<TopicDraft[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function extractTopics() {
    if (!file) return;
    setError("");
    setMessage("");
    setExtracting(true);
    setTopics([]);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch(`/api/subjects/${subjectId}/topics/extract`, {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Não foi possível extrair os tópicos.");
      setTopics((result.topics ?? []).map((topic: { title: string; description: string }) => ({
        title: topic.title,
        description: topic.description,
        selected: true,
      })));
      if (!result.topics?.length) setMessage("Nenhum tópico foi identificado. Você pode cadastrar manualmente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Erro ao processar o documento.");
    } finally {
      setExtracting(false);
    }
  }

  function update(index: number, change: Partial<TopicDraft>) {
    setTopics((current) => current.map((item, i) => i === index ? { ...item, ...change } : item));
  }

  async function saveTopics() {
    const chosen = topics.filter((topic) => topic.selected);
    if (!chosen.length) return setError("Selecione ao menos um tópico.");
    if (chosen.some((topic) => !topic.title.trim() || !topic.description.trim())) {
      return setError("Preencha título e descrição dos tópicos selecionados.");
    }
    const normalized = chosen.map((item) => item.title.trim().toLocaleLowerCase("pt-BR"));
    if (new Set(normalized).size !== normalized.length) return setError("Há títulos repetidos na seleção.");

    setSaving(true);
    setError("");
    setMessage("");
    let saved = 0;
    try {
      // Reutiliza a mesma rota já utilizada pelo CreateTopicForm.
      // Os tópicos são enviados um por vez; os já salvos não são revertidos em caso de falha.
      for (const topic of chosen) {
        const formData = new FormData();
        formData.append("action", "create-topic");
        formData.append("title", topic.title.trim());
        formData.append("description", topic.description.trim());
        const response = await fetch(`/api/subjects/${subjectId}/topics`, {
          method: "POST", body: formData,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? `Falha ao salvar ${topic.title}.`);
        saved++;
      }
      setTopics([]);
      setFile(null);
      setMessage(`${saved} tópico(s) cadastrado(s) com sucesso.`);
      router.refresh();
    } catch (cause) {
      // Retira apenas os itens que já foram cadastrados com sucesso, evitando duplicação no retry.
      const savedTitles = new Set(chosen.slice(0, saved).map((topic) => topic.title));
      setTopics((current) => current.filter((item) => !savedTitles.has(item.title)));
      router.refresh();
      setError(`${saved} tópico(s) salvo(s). ${cause instanceof Error ? cause.message : "Falha no cadastro."}`);
    } finally {
      setSaving(false);
    }
  }

  const busy = extracting || saving;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileUp className="size-5 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Plano de ensino ou ementa (PDF)</p>
            <p className="text-xs text-muted-foreground">
              A LLM identifica os tópicos do documento e gera um breve resumo do conteúdo de cada um.
            </p>
          </div>
        </div>
        <Input
          type="file" accept="application/pdf,.pdf" disabled={busy}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setTopics([]);
            setError("");
          }}
          aria-label="Selecionar plano de ensino em PDF"
        />
        <Button className="mt-3" type="button" disabled={!file || busy} onClick={extractTopics}>
          {extracting ? <Loader2 className="mr-2 size-4 animate-spin" /> : <FileUp className="mr-2 size-4" />}
          {extracting ? "Extraindo tópicos..." : "Extrair tópicos com IA"}
        </Button>
      </div>

      {topics.length > 0 && (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-semibold">Revise antes de cadastrar</h3>
            <p className="text-xs text-muted-foreground">
              Edite os títulos e os resumos, desmarque assuntos indevidos ou adicione outros tópicos.
              Nada é salvo até você confirmar.
            </p>
          </div>
          {topics.map((topic, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={topic.selected} disabled={busy}
                    onChange={(event) => update(index, { selected: event.target.checked })} />
                  Cadastrar tópico {index + 1}
                </label>
                <Button type="button" variant="ghost" size="icon" disabled={busy}
                  aria-label={`Remover tópico ${index + 1}`}
                  onClick={() => setTopics((current) => current.filter((_, i) => i !== index))}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <Input value={topic.title} maxLength={120} disabled={busy}
                aria-label={`Título do tópico ${index + 1}`} placeholder="Título do tópico"
                onChange={(event) => update(index, { title: event.target.value })} />
              <textarea className="min-h-20 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={topic.description} maxLength={500} disabled={busy}
                aria-label={`Resumo do tópico ${index + 1}`} placeholder="Breve resumo do conteúdo"
                onChange={(event) => update(index, { description: event.target.value })} />
            </div>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" disabled={busy}
              onClick={() => setTopics((current) => [...current, { title: "", description: "", selected: true }])}>
              <Plus className="mr-2 size-4" /> Adicionar tópico
            </Button>
            <Button type="button" disabled={busy || !topics.some((item) => item.selected)} onClick={saveTopics}>
              {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
              {saving ? "Cadastrando..." : "Confirmar cadastro"}
            </Button>
          </div>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}
