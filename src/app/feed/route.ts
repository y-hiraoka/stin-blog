import { NextResponse } from "next/server";
import { generateFeed } from "../../lib/feed";

export const GET = async (): Promise<NextResponse> => {
  const feed = await generateFeed();

  return new NextResponse(feed, {
    status: 200,
    headers: {
      "Cache-Control": "s-maxage=86400, stale-while-revalidate",
      "Content-Type": "text/xml",
    },
  });
};
