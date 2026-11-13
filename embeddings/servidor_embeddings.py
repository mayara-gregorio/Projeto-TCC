from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer

NOME_MODELO = "intfloat/multilingual-e5-base"


modelo = SentenceTransformer(
    NOME_MODELO,
    device="cpu",
)

app = FastAPI()


class PedidoEmbed(BaseModel):
    textos: list[str]
    tipo: Literal["passage", "query"]


@app.get("/")
def status():
    return {
        "ok": True,
        "modelo": NOME_MODELO,
        "dimensao": modelo.get_embedding_dimension(),
    }


@app.post("/embed")
def embed(pedido: PedidoEmbed):
    textos = [f"{pedido.tipo}: {t}" for t in pedido.textos]
    vetores = modelo.encode(textos, normalize_embeddings=True, batch_size=16)
    return {"vetores": vetores.tolist()}
