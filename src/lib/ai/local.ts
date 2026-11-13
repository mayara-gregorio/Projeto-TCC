import { PROMPT_CLASSIFICACAO, PROMPT_RESUMO } from "./prompts";


type Msg = {
  role: "system" | "user" | "assistant";
  content: string;
};

type Topico = {
  id: string;
  titulo: string;
  descricao: string | null;
};

type Fragmento = {
  topico_id: string;
  conteudo: string;
  similaridade: number;
  pagina: number;
  pagina_final: number;
};

type ContextoClassificacao = {
  duvida: string;
  topicos: Topico[];
  fragmentos: Fragmento[];
};

type Classificacao = {
  topic_id: string;
  confidence: number;
};

export async function askLocal(
  messages: Msg[]
): Promise<string> {
  const res = await fetch(
    `${process.env.LLM_BASE_URL}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: messages.slice(-20),
        temperature: 0.2,
      }),
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error(
      "A LLM local não respondeu. O servidor está ligado?"
    );
  }

  const data = await res.json();

  return data.choices[0].message.content;
}

// Classifica a dúvida utilizando o RAG
export async function classificarDuvida(
  contexto: ContextoClassificacao
): Promise<Classificacao> {
  const resposta = await askLocal([
    {
      role: "system",
      content: PROMPT_CLASSIFICACAO,
    },
    {
      role: "user",
      content: JSON.stringify(contexto),
    },
  ]);

  // Remove eventuais blocos Markdown do retorno
  const json = resposta
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();

  const resultado: unknown = JSON.parse(json);

  if (
    typeof resultado !== "object" ||
    resultado === null ||
    Array.isArray(resultado)
  ) {
    throw new Error("Classificação inválida.");
  }

  const dados = resultado as Record<string, unknown>;

  if (
    typeof dados.confidence !== "number" ||
    !Number.isFinite(dados.confidence) ||
    dados.confidence < 0 ||
    dados.confidence > 1
  ) {
    throw new Error("Confiança inválida.");
  }

  if (
    dados.topic_id !== null &&
    typeof dados.topic_id !== "string"
  ) {
    throw new Error("Tópico inválido.");
  }

  // Garante que o ID pertence aos tópicos da disciplina
  const idsPermitidos = new Set(
    contexto.topicos.map((topico) => topico.id)
  );

  if (
    dados.topic_id !== null &&
    !idsPermitidos.has(dados.topic_id)
  ) {
    throw new Error(
      "A LLM retornou um tópico que não pertence à disciplina."
    );
  }

  return {
    topic_id: dados.topic_id as string,
    confidence: dados.confidence,
  };
}


type ContextoResumo = {
  pergunta: string;
  disciplina: string;
  topico: string;
  historico: {
    role: "user" | "assistant";
    content: string;
  }[];
  fragmentos: {
    conteudo: string;
    similaridade: number;
  }[];
};

export async function resumirDuvida(
  contexto: ContextoResumo
) {
  const resposta = await askLocal([
    {
      role: "system",
      content: PROMPT_RESUMO,
    },
    {
      role: "user",
      content: JSON.stringify({
        disciplina: contexto.disciplina,
        topico: contexto.topico,
        historico: contexto.historico.slice(-6),
        pergunta_atual: contexto.pergunta,
        fragmentos: contexto.fragmentos
          .slice(0, 5)
          .map((f) => ({
            conteudo: f.conteudo.slice(0, 450),
            similaridade: f.similaridade,
          })),
      }),
    },
  ]);

  const texto = resposta
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```json\s*/gi, "")
    .replace(/```/g, "")
    .trim();

  const inicio = texto.indexOf("{");
  const fim = texto.lastIndexOf("}");

  if (inicio < 0 || fim <= inicio) {
    throw new Error("JSON não encontrado na resposta.");
  }

  const dados: unknown = JSON.parse(
    texto.slice(inicio, fim + 1)
  );

  if (!dados || typeof dados !== "object") {
    throw new Error("Resumo inválido.");
  }

  const item = dados as Record<string, unknown>;

  if (
    typeof item.title !== "string" ||
    typeof item.summary !== "string" ||
    !item.title.trim() ||
    !item.summary.trim()
  ) {
    throw new Error("Título ou resumo inválido.");
  }

  // Aceita só os três valores de cobertura; na falta de um válido, usa uncertain
  const cobertura = [
    "covered",
    "not_covered",
    "uncertain",
  ].includes(String(item.material_coverage))
    ? String(item.material_coverage)
    : "uncertain";

  return {
    title: item.title.trim().slice(0, 80),
    summary: item.summary.trim().slice(0, 2000),
    material_coverage: cobertura,
  };
}
