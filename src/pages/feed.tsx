import { GetServerSideProps } from "next";
import { generateFeed } from "../lib/feed";

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const feed = await generateFeed();

  res.statusCode = 200;
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
  res.setHeader("Content-Type", "text/xml");
  res.end(feed);

  return { props: {} };
};

const Page = () => null;
export default Page;
