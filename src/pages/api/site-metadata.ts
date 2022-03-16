import { JSDOM } from "jsdom";
import { NextApiHandler } from "next";

export type SiteMetadata = {
  url?: string;
  site_name?: string;
  title?: string;
  description?: string;
  image?: string;
  type?: string;
};

const handler: NextApiHandler = async (req, res) => {
  const url = Array.isArray(req.query.url) ? req.query.url[0] : req.query.url;

  if (!url) {
    res.status(400).send({ message: "url must be passed." });
    return;
  }

  const response = await fetch(url);

  if (!response.ok) {
    res.status(404).send({ message: "Not Found" });
    return;
  }

  const html = await response.text();
  const metadata: SiteMetadata = {};
  const jsdom = new JSDOM(html);
  const metaTags = jsdom.window.document.getElementsByTagName("meta");

  for (const meta of metaTags) {
    const property = meta.getAttribute("property");

    if (property === "og:url") {
      metadata.url = meta.getAttribute("content") ?? undefined;
    }
    if (property === "og:site_name") {
      metadata.site_name = meta.getAttribute("content") ?? undefined;
    }
    if (property === "og:title") {
      metadata.title = meta.getAttribute("content") ?? undefined;
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
  }

  res.setHeader("Cache-Control", "max-age=3600");
  res.send(metadata);
};

export default handler;
