import { JSDOM } from "jsdom";

export type SiteMetadata = {
  url: string;
  site_name?: string;
  title?: string;
  description?: string;
  image?: string;
  type?: string;
};

export async function fetchSiteMetadata(url: string): Promise<SiteMetadata> {
  const response = await fetch(url, { next: { revalidate: 60 * 60 } });

  if (!response.ok) {
    throw new Error("Not Found");
  }

  const html = await response.text();
  const metadata: SiteMetadata = { url };
  const jsdom = new JSDOM(html);

  const title = jsdom.window.document.title;
  metadata.title = title;

  const metaTags = jsdom.window.document.getElementsByTagName("meta");

  for (const meta of metaTags) {
    const property = meta.getAttribute("property");

    if (property === "og:site_name") {
      metadata.site_name = meta.getAttribute("content") ?? undefined;
    }
    if (property === "og:title") {
      metadata.title = meta.getAttribute("content") ?? title;
    }
    if (property === "og:description") {
      metadata.description = meta.getAttribute("content") ?? undefined;
    }
    if (property === "og:image") {
      metadata.image = meta.getAttribute("content") ?? undefined;
    }
    if (property === "og:type") {
      metadata.type = meta.getAttribute("content") ?? undefined;
    }

    const metaName = meta.getAttribute("name");

    if (metaName === "description") {
      metadata.description = meta.getAttribute("content") ?? undefined;
    }
  }

  return metadata;
}
