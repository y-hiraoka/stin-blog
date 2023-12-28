import type { Highlighter } from "shiki";
import { getHighlighter } from "shiki";

let highlighter: Highlighter;

export async function highlightWithShiki(code: string, lang: string): Promise<string> {
  highlighter ??= await getHighlighter({ theme: "dark-plus" });
  return highlighter.codeToHtml(code, { lang });
}
