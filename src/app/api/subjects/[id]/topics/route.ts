
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { dividirEmPedacos } from "@/lib/rag/dividir-em-pedacos";
import { extrairPaginas } from "@/lib/rag/extrair-paginas";
import { vetoresDosPedacos } from "@/lib/rag/embeddings";

type Props = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: Props) {
  const { id: subjectId } = await params;
  const supabase = await createClient();

  // Verifica a autenticação
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "Usuário não autenticado." },
      { status: 401 }
    );
  }

  // Verifica se o usuário é professor da disciplina
  const { data: membership, error: membershipError } = await supabase
    .from("subject_members")
    .select("user_id")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .eq("role", "teacher")
    .maybeSingle();

  if (membershipError) {
    console.error("Erro ao verificar professor:", membershipError);

    return NextResponse.json(
      { error: "Erro ao verificar permissões." },
      { status: 500 }
    );
  }

  if (!membership) {
    return NextResponse.json(
      { error: "Você não tem permissão nesta disciplina." },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const action = formData.get("action");

    // CRIAR TÓPICO
    if (action === "create-topic") {
      const title = String(formData.get("title") ?? "").trim();
      const description = String(
        formData.get("description") ?? ""
      ).trim();

      if (!title || title.length > 120) {
        return NextResponse.json(
          { error: "Nome do tópico inválido." },
          { status: 400 }
        );
      }

      const { data, error } = await supabase
        .from("topics")
        .insert({
          subject_id: subjectId,
          title,
          description,
        })
        .select("id, title")
        .single();

      if (error) {
        console.error("Erro ao criar tópico:", error);

        return NextResponse.json(
          { error: "Não foi possível criar o tópico." },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Tópico criado com sucesso!",
          topic: data,
        },
        { status: 201 }
      );
    }

    // ENVIAR E PROCESSAR PDF
    if (action === "upload-pdf") {
      const topicId = String(formData.get("topic_id") ?? "");
      const file = formData.get("file");

      if (!topicId) {
        return NextResponse.json(
          { error: "Tópico inválido." },
          { status: 400 }
        );
      }

      // Confirma que o tópico pertence à disciplina
      const { data: topic, error: topicError } = await supabase
        .from("topics")
        .select("id")
        .eq("id", topicId)
        .eq("subject_id", subjectId)
        .maybeSingle();

      if (topicError) {
        console.error("Erro ao consultar tópico:", topicError);

        return NextResponse.json(
          { error: "Erro ao consultar o tópico." },
          { status: 500 }
        );
      }

      if (!topic) {
        return NextResponse.json(
          { error: "Tópico não encontrado." },
          { status: 404 }
        );
      }

      // Valida o PDF
      if (!(file instanceof File) || file.size === 0) {
        return NextResponse.json(
          { error: "Selecione um arquivo PDF." },
          { status: 400 }
        );
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "O PDF deve ter no máximo 10 MB." },
          { status: 400 }
        );
      }

      if (
        !file.name.toLowerCase().endsWith(".pdf") ||
        file.type !== "application/pdf"
      ) {
        return NextResponse.json(
          { error: "Somente arquivos PDF são permitidos." },
          { status: 400 }
        );
      }

      // Verifica a assinatura básica do PDF
      const signature = new Uint8Array(
        await file.slice(0, 5).arrayBuffer()
      );

      const isPdf =
        signature.length === 5 &&
        signature[0] === 0x25 &&
        signature[1] === 0x50 &&
        signature[2] === 0x44 &&
        signature[3] === 0x46 &&
        signature[4] === 0x2d;

      if (!isPdf) {
        return NextResponse.json(
          { error: "Arquivo PDF inválido." },
          { status: 400 }
        );
      }

      // 1. Extrai, divide e gera os embeddings
      let paginas: Awaited<ReturnType<typeof extrairPaginas>>;
      let pedacos: ReturnType<typeof dividirEmPedacos>;
      let vetores: number[][];

      try {
        const bytes = await file.arrayBuffer();

        paginas = await extrairPaginas(bytes);
        pedacos = dividirEmPedacos(paginas);

        if (pedacos.length === 0) {
          return NextResponse.json(
            { error: "Nenhum texto foi encontrado no PDF." },
            { status: 400 }
          );
        }

        // Envia os textos ao modelo multilingual-e5-base
        const textos = pedacos.map(
          (pedaco) => pedaco.conteudo
        );

        vetores = await vetoresDosPedacos(textos);

        // Valida quantidade e dimensões dos embeddings
        const vetoresValidos =
          vetores.length === pedacos.length &&
          vetores.every(
            (vetor) =>
              Array.isArray(vetor) &&
              vetor.length === 768 &&
              vetor.every(
                (numero) =>
                  typeof numero === "number" &&
                  Number.isFinite(numero)
              )
          );

        if (!vetoresValidos) {
          throw new Error(
            "Os embeddings retornados são inválidos."
          );
        }

        console.log("Páginas extraídas:", paginas.length);
        console.log("Chunks gerados:", pedacos.length);
        console.log("Vetores gerados:", vetores.length);
        console.log("Dimensões:", vetores[0].length);

      } catch (error) {
        console.error("Erro ao processar PDF:", error);

        return NextResponse.json(
          {
            error: "Erro ao extrair texto ou gerar embeddings.",
          },
          { status: 422 }
        );
      }

      // 2. Envia o PDF para o Storage
      const bucket = "storage_materials";

      const storagePath =
        `${subjectId}/${topicId}/${crypto.randomUUID()}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (uploadError) {
        console.error("Erro no Storage:", uploadError);

        return NextResponse.json(
          { error: "Não foi possível enviar o PDF." },
          { status: 500 }
        );
      }

      // 3. Registra o PDF na tabela materials
      const { data: material, error: insertError } = await supabase
        .from("materials")
        .insert({
          filename: file.name,
          storage_path: storagePath,
          status: "sent",
          topic_id: topicId,
        })
        .select("id, filename, status")
        .single();

      if (insertError || !material) {
        console.error("Erro ao registrar material:", insertError);

        // Remove o PDF caso o cadastro falhe
        const { error: removeError } = await supabase.storage
          .from(bucket)
          .remove([storagePath]);

        if (removeError) {
          console.error("Erro ao remover PDF:", removeError);
        }

        return NextResponse.json(
          { error: "Não foi possível registrar o material." },
          { status: 500 }
        );
      }

      // 4. Associa cada chunk ao seu embedding
      const chunks = pedacos.map((pedaco, indice) => ({
        material_id: material.id,
        subject_id: subjectId,
        topic_id: topicId,

        chunk_index: pedaco.indice,
        page: pedaco.slideInicio,
        page_end: pedaco.slideFim,

        content: pedaco.conteudo,
        embedding: vetores[indice],
      }));

      // 5. Salva os chunks com embeddings no banco
      const { error: chunksError } = await supabase
        .from("chunks")
        .insert(chunks);

      if (chunksError) {
        console.error("Erro ao salvar chunks:", chunksError);

        const { error: statusError } = await supabase
          .from("materials")
          .update({ status: "failed" })
          .eq("id", material.id);

        if (statusError) {
          console.error("Erro ao atualizar status:", statusError);
        }

        return NextResponse.json(
          {
            error: "PDF enviado, mas houve erro ao salvar os chunks.",
          },
          { status: 500 }
        );
      }

      // 6. Atualiza o material para processado
      const { data: updatedMaterial, error: updateError } =
        await supabase
          .from("materials")
          .update({ status: "processed" })
          .eq("id", material.id)
          .select("id, filename, status")
          .single();

      if (updateError || !updatedMaterial) {
        console.error("Erro ao atualizar material:", updateError);

        return NextResponse.json(
          {
            error: "Chunks salvos, mas não foi possível atualizar o status do material.",
          },
          { status: 500 }
        );
      }

      // 7. Retorna o resultado
      return NextResponse.json(
        {
          message: "PDF processado com sucesso!",
          material: updatedMaterial,
          totalPaginas: paginas.length,
          totalChunks: chunks.length,
          dimensoes: vetores[0].length,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { error: "Operação inválida." },
      { status: 400 }
    );

  } catch (error) {
    console.error("Erro na rota de tópicos:", error);

    return NextResponse.json(
      { error: "Erro ao processar a solicitação." },
      { status: 500 }
    );
  }
}