
import { getPath } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";
import type { Pagina } from "./dividir-em-pedacos";

// Configura o worker utilizado pelo pdf-parse
PDFParse.setWorker(getPath());

export async function extrairPaginas(
  arquivo: Buffer | ArrayBuffer | Uint8Array
): Promise<Pagina[]> {
  const dados =
    arquivo instanceof Uint8Array
      ? arquivo
      : new Uint8Array(arquivo);

  const parser = new PDFParse({ data: dados });

  try {
    const resultado = await parser.getText();

    return resultado.pages.map((pagina) => ({
      numero: pagina.num,
      texto: pagina.text,
    }));
  } finally {
    await parser.destroy();
  }
}
