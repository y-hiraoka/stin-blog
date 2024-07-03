import { codeToHtml } from "shiki";

export async function highlightWithShiki(code: string, lang: string): Promise<string> {
  return codeToHtml(code, { lang, theme: "dark-plus" });
}
