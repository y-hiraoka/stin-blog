// contentlayer.config.ts
import { defineDocumentType, makeSource } from "contentlayer/source-files";
import { remark } from "remark";
import strip from "strip-markdown";

export const Article = defineDocumentType(() => ({
  name: "Article",
  filePathPattern: `*.md`,
  fields: {
    title: { type: "string", required: true },
    createdAt: { type: "string", required: true },
    updatedAt: { type: "string", required: false },
    tags: { type: "list", of: { type: "string" }, required: true },
  },
  computedFields: {
    slug: {
      type: "string",
      resolve: (article) => article._raw.sourceFileName.replace(/\.md$/, ""),
    },
    excerpt: {
      type: "string",
      resolve: async (article) => {
        const stripped = (await remark().use(strip).process(article.body.raw)).toString();
        const excerpt = stripped.trim().replaceAll(/\s+/g, " ").slice(0, 160);
        if (stripped.length > 160) {
          return excerpt + "...";
        }

        return excerpt;
      },
    },
  },
}));

export default makeSource({ contentDirPath: "contents", documentTypes: [Article] });
