import { useEffect, useRef, VFC } from "react";

// グローバル変数なので `declare global {}` のほうが適切だが、
// 他ファイルで呼び出すことがないので `declare const` で十分
declare const twttr: {
  widgets: {
    load: (element?: Element) => Promise<void>;
  };
};

type EmbeddedTweetProps = {
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

export const EmbeddedTweet: VFC<EmbeddedTweetProps> = props => {
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
        <a href={props.url} target="_blank" rel="noreferrer noopener">
          {props.url}
        </a>
      </blockquote>
    </div>
  );
};
