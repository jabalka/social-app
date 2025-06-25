import { useEffect, useRef } from "react";

/**
 * useInterceptAnchorNavigation
 * 
 * Intercepts all <a> and <Link> clicks in the document and allows you to conditionally block navigation.
 * 
 * @param shouldBlockNavigation (href: string) => boolean | Promise<boolean>
 *   - Return true to allow navigation, false to block (and do your own thing).
 * @param onBlockedNavigation (href: string, event: MouseEvent) => void
 *   - Called if navigation is blocked (e.g. show a modal, etc).
 * @param enabled boolean - Whether to enable interception (default: true)
 */
export function useInterceptAnchorNavigation(
  shouldBlockNavigation: (href: string) => boolean | Promise<boolean>,
  onBlockedNavigation: (href: string, event: MouseEvent) => void,
  enabled = true
) {
  const blockNavRef = useRef(shouldBlockNavigation);
  const blockedNavHandlerRef = useRef(onBlockedNavigation);

  useEffect(() => {
    blockNavRef.current = shouldBlockNavigation;
    blockedNavHandlerRef.current = onBlockedNavigation;
  }, [shouldBlockNavigation, onBlockedNavigation]);

  useEffect(() => {
    if (!enabled) return;

    const onClick = async (e: MouseEvent) => {
      // Only intercept left clicks without modifier keys
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.altKey ||
        e.ctrlKey ||
        e.shiftKey
      )
        return;

      // Find anchor element
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;

      // Ignore anchors that open in a new tab, download, or are external
      if (
        anchor.target === "_blank" ||
        anchor.hasAttribute("download") ||
        anchor.getAttribute("rel") === "external" ||
        anchor.href.startsWith("mailto:") ||
        anchor.href.startsWith("tel:")
      )
        return;

      // Only intercept in-app navigation
      const href = anchor.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("javascript:") ||
        anchor.href === window.location.href // same URL
      )
        return;

      // (Optional) Only block internal navigation
      if (anchor.hostname !== window.location.hostname) return;

      const shouldAllow = await blockNavRef.current(href);
      if (!shouldAllow) {
        e.preventDefault();
        blockedNavHandlerRef.current(href, e);
      }
      // else: allow navigation as usual
    };

    document.body.addEventListener("click", onClick, true);

    return () => {
      document.body.removeEventListener("click", onClick, true);
    };
  }, [enabled]);
}
