import { NotFound } from "../components/pages/NotFound";
import { SEO } from "../components/shared/SEO";

const Custom404: React.FC = () => {
  return (
    <>
      <SEO
        type="website"
        pagePath="/404"
        noindex
        title="Not found"
        description="指定されたページが見つかりませんでした"
      />
      <NotFound />
    </>
  );
};

export default Custom404;
