"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

interface ParallaxLayerProps {
  children: ReactNode;
  /**
   * How fast this layer moves relative to scroll. Positive values drift the
   * layer opposite to scroll direction (classic "background moves slower"
   * feel); try small values like 0.1–0.3. Keep it subtle — this should read
   * as depth, not motion sickness.
   */
  speed?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps content in a layer that shifts vertically as the page scrolls,
 * based on the element's position relative to the viewport center. Disabled
 * automatically when the user has "prefers-reduced-motion" set.
 */
export default function ParallaxLayer({
  children,
  speed = 0.2,
  className,
  style,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reducedMotion = mql.matches;
    const onMotionChange = () => {
      reducedMotion = mql.matches;
      if (reducedMotion) setOffset(0);
    };
    mql.addEventListener("change", onMotionChange);

    let ticking = false;

    function update() {
      ticking = false;
      if (reducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      setOffset(distanceFromCenter * -speed);
    }

    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      mql.removeEventListener("change", onMotionChange);
    };
  }, [speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transform: `translate3d(0, ${offset}px, 0)`, willChange: "transform" }}
    >
      {children}
    </div>
  );
}
