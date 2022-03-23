import { useEffect, useRef, VFC } from "react";

// グローバル変数なので `declare global {}` のほうが適切だが、
// 他ファイルで呼び出すことがないので `declare const` で十分
declare const twttr: {
  widgets: {
    load: (element?: Element) => Promise<void>;
  };
};

type Props = {
  url: string;
  id?: number;
  cards?: "hidden";
  conversation?: "none";
  theme?: "light" | "dark";
  width?: number;
  align?: "left" | "right" | "center";
  /** @see https://developer.twitter.com/en/docs/twitter-for-websites/supported-languages */
  lang?: string;
  dnt?: true;
};

export const EmbeddedTweet: VFC<Props> = props => {
  const rootRef = useRef<HTMLDivElement>(null);

  const key = JSON.stringify(props);

  useEffect(() => {
    if (rootRef.current !== null) {
      twttr.widgets.load(rootRef.current);
    }
  }, [key]);

  return (
    <div ref={rootRef} key={key}>
      <blockquote
        className="twitter-tweet"
        data-id={props.id}
        data-cards={props.cards}
        data-conversation={props.conversation}
        data-theme={props.theme}
        data-width={props.width}
        data-align={props.align}
        data-lang={props.lang}
        data-dnt={props.dnt}>
        <a href={props.url} />
      </blockquote>
    </div>
  );
};

export const EmbeddedTweetScript: VFC = () => {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
  window.twttr = (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0],
      t = window.twttr || {};
    if (d.getElementById(id)) return t;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://platform.twitter.com/widgets.js";
    fjs.parentNode.insertBefore(js, fjs);
  
    t._e = [];
    t.ready = function(f) {
      t._e.push(f);
    };
  
    return t;
  }(document, "script", "twitter-wjs"));
  `,
      }}
    />
  );
};
