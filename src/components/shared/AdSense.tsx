import { useRouter } from "next/router";
import { useEffect, VFC } from "react";

declare global {
  var adsbygoogle: unknown[];
}

export const AdSense: VFC = () => {
  const { asPath } = useRouter();

  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error(error);
    }
  }, [asPath]);

  return (
    <div key={asPath} style={{ textAlign: "center" }}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-adtest={process.env.NODE_ENV === "production" ? "off" : "on"}
        data-ad-client="ca-pub-4010956213409647"
        data-ad-slot="3031428182"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
