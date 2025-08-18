import { useEffect } from "react";

export function useScrollbarReveal() {
  useEffect(() => {
    let t: number | undefined;

    const onScroll = () => {
      document.documentElement.classList.add("nf-scrolling");
      window.clearTimeout(t);
      t = window.setTimeout(() => {
        document.documentElement.classList.remove("nf-scrolling");
      }, 700); // how long the thumb stays visible after scrolling stops
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(t);
    };
  }, []);
}