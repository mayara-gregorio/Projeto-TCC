#!/bin/bash
# Liga o servidor de embeddings (modelo multilingual-e5-base, na CPU).
# Depois de ligado, a API fica em http://127.0.0.1:8001 (é a porta que o site espera).
# Para desligar: Ctrl+C neste terminal.
#
# O script usa caminhos relativos à própria pasta, então continua funcionando
# mesmo se a pasta do projeto mudar de nome de novo.
cd "$(dirname "$0")"

if [ ! -x ".venv/bin/python" ]; then
  echo "Ambiente .venv não encontrado. Criando e instalando as dependências..."
  python3 -m venv .venv
  .venv/bin/python -m pip install -r requirements.txt
fi

.venv/bin/python -m uvicorn servidor_embeddings:app \
  --host 127.0.0.1 \
  --port 8001
