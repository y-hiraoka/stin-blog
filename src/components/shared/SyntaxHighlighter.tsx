import highlightjs from "highlight.js";
import "highlight.js/styles/panda-syntax-dark.css";

type Props = {
  code: string;
  language: string;
};

export const SyntaxHighlighter: React.FC<Props> = ({ code, language }) => {
  if (!highlightjs.getLanguage(language))
    return (
      <pre className="hljs">
        <code className="hljs">{code}</code>
      </pre>
    );

  const highlightedCode = highlightjs.highlight(code, { language }).value;

  return (
    <pre className="hljs">
      <code
        className={`hljs ${language}`}
        dangerouslySetInnerHTML={{ __html: highlightedCode }}
      />
    </pre>
  );
};
