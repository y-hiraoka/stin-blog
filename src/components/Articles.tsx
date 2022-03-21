import { Grid } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader, ZennArticleHeader } from "../models";
import { ArticleCard } from "./ArticleCard";

type Props = { articles: (ArticleHeader | ZennArticleHeader)[] };

export const Articles: VFC<Props> = ({ articles }) => {
  return (
    <Grid templateColumns={["1fr", "1fr", "1fr 1fr"]} gap="6">
      {articles.map(article => (
        <ArticleCard
          key={article.type === "stin-blog" ? article.slug : article.url}
          article={article}
        />
      ))}
    </Grid>
  );
};
