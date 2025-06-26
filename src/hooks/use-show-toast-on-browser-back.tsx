import { useEffect, useRef } from "react";

// Listen to browser Back/Forward BEFORE navigation occurs
export function useShowToastOnBrowserBack(
  shouldShowToast: () => boolean,
  onToast: () => void
) {
  const shouldShowToastRef = useRef(shouldShowToast);
  const onToastRef = useRef(onToast);

  useEffect(() => {
    shouldShowToastRef.current = shouldShowToast;
    onToastRef.current = onToast;
  }, [shouldShowToast, onToast]);

  useEffect(() => {
    const onPopState = () => {
      if (shouldShowToastRef.current()) {
        onToastRef.current();
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
}
