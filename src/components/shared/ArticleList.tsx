import { Grid } from "@chakra-ui/react";
import { VFC } from "react";
import { ArticleHeader } from "../../models";
import { ArticleCard } from "./ArticleCard";

type Props = { articles: ArticleHeader[] };

export const ArticleList: VFC<Props> = ({ articles }) => {
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