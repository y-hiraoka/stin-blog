import { Metadata } from "next";
import { NotFound } from "@/components/pages/NotFound";

export default NotFound;

export const metadata: Metadata = {
  robots: "noindex",
  title: "Not Found",
  description: "指定されたページが見つかりませんでした",
  openGraph: {
    type: "website",
    title: "Not Found",
    description: "指定されたページが見つかりませんでした",
  },
};
