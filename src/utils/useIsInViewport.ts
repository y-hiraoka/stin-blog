import React from "react";

export function useIsInViewport(ref: React.RefObject<HTMLElement>) {
  const [isInViewport, setIsInViewport] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;

    if (element === null) return;

    const eventListener = () => {
      const isInViewport = checkIsInViewport(element);
      setIsInViewport(isInViewport);
    };

    window.addEventListener("scroll", eventListener);

    eventListener();

    return () => window.removeEventListener("scroll", eventListener);
  }, []);

  return isInViewport;
}

function checkIsInViewport(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth;

  return (
    rect.top < viewportHeight &&
    rect.left < viewportWidth &&
    rect.bottom > 0 &&
    rect.right > 0
  );
}
