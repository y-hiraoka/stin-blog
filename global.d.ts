declare module "remark-html" {
  const html: any;
  export default html;
}

declare module "remark-slug" {
  const slug: any;
  export default slug;
}

declare module "markdown-toc" {
  const toc: (markdown: string) => { content: string };
  export default toc;
}
