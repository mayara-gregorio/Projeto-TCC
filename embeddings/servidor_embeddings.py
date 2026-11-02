# API local de embeddings com o modelo intfloat/multilingual-e5-base
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

NOME_MODELO = "intfloat/multilingual-e5-base"

# carrega o modelo uma vez, ao iniciar o servidor
# roda na CPU para deixar a memória da placa de vídeo livre para o Qwen
modelo = SentenceTransformer(
    NOME_MODELO,
    device="cpu",
)

app = FastAPI()


class PedidoEmbed(BaseModel):
    textos: list[str]
    # "passage" para os pedaços do material, "query" para a dúvida do aluno
    tipo: Literal["passage", "query"]


@app.get("/")
def status():
    return {
        "ok": True,
        "modelo": NOME_MODELO,
        "dimensao": modelo.get_sentence_embedding_dimension(),
    }


@app.post("/embed")
def embed(pedido: PedidoEmbed):
    # o E5 exige o prefixo "passage: " ou "query: " em cada texto
    textos = [f"{pedido.tipo}: {t}" for t in pedido.textos]
    vetores = modelo.encode(textos, normalize_embeddings=True, batch_size=16)
    return {"vetores": vetores.tolist()}
