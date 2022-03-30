import { ComponentProps, forwardRef } from "react";

// https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent

type TwitterIntentTweetProps = {
  text?: string;
  url?: string;
  hashtags?: string[];
  via?: string;
  related?: string[];
  in_reply_to?: string;
} & Omit<ComponentProps<"a">, "href" | "target" | "rel">;

export const TwitterIntentTweet = forwardRef<HTMLAnchorElement, TwitterIntentTweetProps>(
  (
    { text, url, hashtags, via, related, in_reply_to, ...intrinsicProps },
    forwardedRef,
  ) => {
    const baseURL = `https://twitter.com/intent/tweet`;

    const searchParams = new URLSearchParams();
    if (text !== undefined) searchParams.set("text", text);
    if (url !== undefined) searchParams.set("url", url);
    if (hashtags !== undefined) searchParams.set("hashtags", hashtags.join(","));
    if (via !== undefined) searchParams.set("via", via);
    if (related !== undefined) searchParams.set("related", related.join(","));
    if (in_reply_to !== undefined) searchParams.set("in_reply_to", in_reply_to);

    const queryString = searchParams.toString();

    const href = queryString !== "" ? `${baseURL}?${queryString}` : baseURL;

    return (
      <a
        ref={forwardedRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        {...intrinsicProps}
      />
    );
  },
);

if (process.env.NODE_ENV === "development") {
  TwitterIntentTweet.displayName = "TwitterShareLink";
}
