// Divide o texto de um PDF em pedaços de ~1000 caracteres SEM quebrar um slide no meio.
// Regra: cada página do PDF é um slide. Slides inteiros vão sendo juntados até chegar
// perto do limite. Um slide que sozinho passa do limite vira pedaço próprio; se ele for
// grande demais (mais que o dobro do limite), é dividido por parágrafo.

export type Pagina = {
  numero: number; // número da página/slide no PDF (começa em 1)
  texto: string;
};

export type Pedaco = {
  indice: number; // ordem do pedaço dentro do PDF (0, 1, 2...)
  conteudo: string;
  slideInicio: number; // primeiro slide que está neste pedaço
  slideFim: number; // último slide que está neste pedaço
};

const TAMANHO_ALVO = 1000;
const TAMANHO_MAXIMO_SLIDE = 2000; // acima disso, o slide é dividido por parágrafo

// Tira espaços repetidos e linhas vazias em excesso, sem perder as quebras de linha
// (importantes para o código Java dos slides).
function limparTexto(texto: string): string {
  return texto
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((linha) => linha.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Usado só para slides muito grandes: junta parágrafos até ~1000 caracteres.
function dividirSlideGrande(texto: string, limite: number): string[] {
  const paragrafos = texto.split(/\n\s*\n|\n/).filter((p) => p.trim().length > 0);
  const partes: string[] = [];
  let atual = "";

  for (const paragrafo of paragrafos) {
    // Parágrafo sozinho maior que o limite: corta no último espaço antes do limite.
    if (paragrafo.length > limite) {
      if (atual) {
        partes.push(atual);
        atual = "";
      }
      let resto = paragrafo;
      while (resto.length > limite) {
        let corte = resto.lastIndexOf(" ", limite);
        if (corte <= 0) corte = limite;
        partes.push(resto.slice(0, corte).trim());
        resto = resto.slice(corte).trim();
      }
      atual = resto;
      continue;
    }

    const junto = atual ? `${atual}\n${paragrafo}` : paragrafo;
    if (junto.length > limite && atual) {
      partes.push(atual);
      atual = paragrafo;
    } else {
      atual = junto;
    }
  }
  if (atual) partes.push(atual);
  return partes;
}

export function dividirEmPedacos(paginas: Pagina[], tamanhoAlvo = TAMANHO_ALVO): Pedaco[] {
  const pedacos: Pedaco[] = [];

  // Pedaço que está sendo montado.
  let conteudo = "";
  let inicio = 0;
  let fim = 0;

  const fecharPedaco = () => {
    if (!conteudo) return;
    pedacos.push({ indice: pedacos.length, conteudo, slideInicio: inicio, slideFim: fim });
    conteudo = "";
  };

  for (const pagina of paginas) {
    const texto = limparTexto(pagina.texto);
    if (!texto) continue; // slide só com imagem, sem texto extraível

    // Cada slide leva uma marcação para a LLM saber de onde veio a informação.
    const slide = `[Slide ${pagina.numero}]\n${texto}`;

    // Caso 1: slide muito grande -> fecha o que estava montando e divide por parágrafo.
    if (slide.length > TAMANHO_MAXIMO_SLIDE) {
      fecharPedaco();
      const partes = dividirSlideGrande(texto, tamanhoAlvo);
      partes.forEach((parte, i) => {
        pedacos.push({
          indice: pedacos.length,
          conteudo: `[Slide ${pagina.numero} - parte ${i + 1}/${partes.length}]\n${parte}`,
          slideInicio: pagina.numero,
          slideFim: pagina.numero,
        });
      });
      continue;
    }

    // Caso 2: o slide inteiro não cabe no pedaço atual -> fecha o atual e começa outro.
    const junto = conteudo ? `${conteudo}\n\n${slide}` : slide;
    if (conteudo && junto.length > tamanhoAlvo) {
      fecharPedaco();
      conteudo = slide;
      inicio = pagina.numero;
      fim = pagina.numero;
      continue;
    }

    // Caso 3: cabe -> junta o slide ao pedaço atual.
    if (!conteudo) inicio = pagina.numero;
    conteudo = junto;
    fim = pagina.numero;
  }

  fecharPedaco();
  return pedacos;
}
