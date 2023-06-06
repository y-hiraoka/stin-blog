import { FC } from "react";
import { getMetadata } from "../lib/getMetadata";
import NotFound from "./articles/not-found";

export const metadata = getMetadata({
  noindex: true,
  pagePath: "/404",
  type: "website",
  title: "404 Not Found",
  description: "指定されたページが見つかりませんでした",
});

const NotFoundPage: FC = () => {
  return <NotFound />;
};

export default NotFoundPage;
