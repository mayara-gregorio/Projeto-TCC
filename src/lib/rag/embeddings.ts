
const URL = process.env.EMBEDDINGS_URL ?? "http://127.0.0.1:8001";

type Tipo = "passage" | "query";

const DIMENSOES = 768;

async function gerarVetores(
  textos: string[],
  tipo: Tipo
): Promise<number[][]> {
  if (textos.length === 0) return [];

  const resposta = await fetch(`${URL}/embed`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ textos, tipo }),
    cache: "no-store",
    signal: AbortSignal.timeout(120000),
  });

  if (!resposta.ok) {
    throw new Error(
      `Erro no servidor de embeddings: ${resposta.status}`
    );
  }

  const dados: { vetores: number[][] } = await resposta.json();

  if (
    !Array.isArray(dados.vetores) ||
    dados.vetores.length !== textos.length
  ) {
    throw new Error(
      "Quantidade de vetores diferente da quantidade de textos."
    );
  }

  // Valida cada vetor recebido
  for (const vetor of dados.vetores) {
    if (
      !Array.isArray(vetor) ||
      vetor.length !== DIMENSOES ||
      !vetor.every(
        (valor) =>
          typeof valor === "number" &&
          Number.isFinite(valor)
      )
    ) {
      throw new Error(
        "O servidor retornou um embedding inválido."
      );
    }
  }

  return dados.vetores;
}

// Embeddings dos chunks do PDF
export async function vetoresDosPedacos(
  textos: string[]
): Promise<number[][]> {
  return gerarVetores(textos, "passage");
}

// Embedding da pergunta do aluno
export async function vetorDaDuvida(
  duvida: string
): Promise<number[]> {
  const [vetor] = await gerarVetores([duvida], "query");
  return vetor;
}
