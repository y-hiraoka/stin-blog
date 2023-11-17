import { ImageResponse } from "next/og";
import { getArticleData } from "../../../lib/posts";
import fs from "fs/promises";
import path from "path";

type Props = {
  params: {
    slug: string;
  };
};

const assetsDirectory = process.cwd() + "/assets";

const handler = async ({ params }: Props) => {
  try {
    const article = await getArticleData(params.slug);

    const fontInterPromise = fs.readFile(path.join(assetsDirectory, "Inter-Bold.ttf"));
    const fontNotSansJPPromise = fs.readFile(
      path.join(assetsDirectory, "NotoSansJP-Bold.ttf"),
    );
    const ogimageBasePromise = fs
      .readFile(path.join(assetsDirectory, "article-ogimage-base.png"), {
        encoding: "base64",
      })
      .then((base64) => `data:image/png;base64,${base64}`);

    return new ImageResponse(
      (
        <div
          lang="ja-JP"
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "80px 100px 120px",
            position: "relative",
          }}>
          {/*eslint-disable-next-line @next/next/no-img-element*/}
          <img
            alt=""
            src={await ogimageBasePromise}
            width={1200}
            height={630}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <div
            style={{
              display: "flex",
              fontFamily: "Inter, NotoSansJP",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
              color: "#F1F1F4",
              width: "100%",
              maxHeight: "100%",
              overflow: "hidden",
            }}>
            {article.header.title}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: "Inter",
            data: await fontInterPromise,
            style: "normal",
            weight: 700,
          },
          {
            name: "NotoSansJP",
            data: await fontNotSansJPPromise,
            style: "normal",
            weight: 700,
          },
        ],
      },
    );
  } catch (error) {
    console.error(error);
    return new Response("Not Found", { status: 404 });
  }
};

export default handler;

export const size = {
  width: 1200,
  height: 630,
}