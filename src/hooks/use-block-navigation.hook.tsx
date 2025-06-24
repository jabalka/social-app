import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

type Blocker = (nextUrl: string) => boolean | Promise<boolean>;

interface RouterWithPushReplace {
  push: (url: string, options?: { scroll?: boolean }) => void;
  replace: (url: string, options?: { scroll?: boolean }) => void;
}

export function useBlockNavigation(blocker: Blocker, enabled = true) {
  const router = useRouter() as RouterWithPushReplace;
  const originalPush = useRef(router.push);
  const originalReplace = useRef(router.replace);

  useEffect(() => {
    if (!enabled) return;

    router.push = async (url, options) => {
      const allow = await blocker(url);
      if (allow) originalPush.current.call(router, url, options);
    };
    router.replace = async (url, options) => {
      const allow = await blocker(url);
      if (allow) originalReplace.current.call(router, url, options);
    };

    return () => {
      router.push = originalPush.current;
      router.replace = originalReplace.current;
    };
  }, [enabled, blocker, router]);
}
