# Assistente Educacional com LLM e RAG

Plataforma web desenvolvida como parte de um Trabalho de Conclusão de Curso (TCC), com o objetivo de utilizar **Modelos de Linguagem de Grande Escala (LLM)** e **Geração Aumentada por Recuperação (RAG)** para responder, classificar e organizar dúvidas de estudantes com base nos conteúdos e materiais didáticos disponibilizados pelos professores.

## Sobre o projeto

O sistema busca auxiliar professores na identificação de conteúdos que geram mais dúvidas entre os estudantes, oferecendo informações que podem contribuir para o acompanhamento das dificuldades de compreensão e para o planejamento de estratégias de ensino.

A plataforma permite que professores cadastrem disciplinas, organizem tópicos de ensino e disponibilizem materiais didáticos em PDF. Os alunos podem enviar perguntas por meio de um chat integrado a um modelo de linguagem.

As dúvidas são processadas e classificadas de acordo com os tópicos cadastrados, permitindo sua visualização em um painel de acompanhamento docente.

## Funcionalidades

- Autenticação de usuários com perfis de professor e aluno.
- Cadastro e gerenciamento de disciplinas.
- Organização dos conteúdos por tópicos.
- Envio e processamento de materiais didáticos em PDF.
- Chat educacional com inteligência artificial.
- Recuperação de trechos relevantes por similaridade semântica (RAG).
- Classificação automática das dúvidas por tópico.
- Geração de resumos das perguntas dos estudantes.
- Dashboard para acompanhamento da distribuição das dúvidas.

## Tecnologias utilizadas

| Tecnologia | Aplicação |
|---|---|
| Next.js e TypeScript | Desenvolvimento da aplicação web |
| Tailwind CSS e shadcn/ui | Interface do usuário |
| Supabase | Autenticação, banco de dados e armazenamento |
| PostgreSQL e pgvector | Persistência de dados e busca vetorial |
| Python e FastAPI | Serviço de geração de embeddings |
| multilingual-e5-base | Representação vetorial dos textos |
| Qwen 2.5 7B | Geração de respostas e classificação das dúvidas |
| llama.cpp | Execução local do modelo de linguagem |

## Funcionamento

1. O professor cadastra uma disciplina e organiza seus tópicos.
2. Os materiais didáticos são enviados e processados pelo sistema.
3. O estudante envia uma dúvida pelo chat.
4. O mecanismo RAG recupera os trechos mais relevantes dos materiais.
5. O modelo de linguagem utiliza as informações recuperadas para gerar uma resposta e classificar a dúvida.
6. O sistema armazena os resultados e disponibiliza informações organizadas no painel do professor.

## Objetivo acadêmico

Este projeto investiga a aplicação de LLM e RAG na classificação de dúvidas discentes com base em tópicos de ensino e materiais didáticos, buscando avaliar a capacidade do sistema de organizar perguntas e produzir informações relevantes para o acompanhamento docente.

## Repositório

O código-fonte está disponível em:

https://github.com/mayara-gregorio/Projeto-TCC

## Finalidade

Projeto desenvolvido para fins acadêmicos, como parte de um Trabalho de Conclusão de Curso, em 2026.