"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
}

export function NavigationFeedback() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setPending(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (event.defaultPrevented || isModifiedClick(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;

      setPending(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setPending(false), 8000);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!pending) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] no-print">
      <div className="h-0.5 w-full overflow-hidden bg-transparent">
        <div className="navigation-progress h-full bg-gradient-to-r from-orange-300 via-orange-500 to-orange-400" />
      </div>
      <div className="mx-auto mt-4 flex w-fit items-center gap-3 rounded-2xl border border-neutral-200/80 bg-white/95 px-4 py-3 text-sm font-semibold text-neutral-800 shadow-card backdrop-blur">
        <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-orange-50">
          <span className="absolute h-5 w-5 rounded-full border-2 border-orange-100" />
          <span className="absolute h-5 w-5 rounded-full border-2 border-transparent border-t-orange-500 motion-safe:animate-spin" />
        </span>
        <span>Memuat</span>
      </div>
    </div>
  );
}
