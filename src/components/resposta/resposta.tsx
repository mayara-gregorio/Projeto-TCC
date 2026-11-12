"use client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

function ajustar(t: string) {
  return t
    .replace(/\\\[([\s\S]*?)\\\]/g, (_, f) => `$$${f}$$`)
    .replace(/\\\(([\s\S]*?)\\\)/g, (_, f) => `$${f}$`);
}

export default function Resposta({ texto }: { texto: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
      {ajustar(texto)}
    </ReactMarkdown>
  );
}