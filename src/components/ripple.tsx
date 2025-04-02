"use client";

import React, { MouseEvent, useEffect, useRef, useState } from "react";

interface Props {
  color?: string;
  className?: string;
}

const RIPPLES_CLEAR_TIMEOUT_MS = 600;

const Ripple: React.FC<Props> = ({ color = "rgba(0, 0, 0, 0.3)", className = "" }) => {
  const [ripples, setRipples] = useState<{ x: number; y: number; size: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const addRipple = (event: MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple = { x, y, size };
    setRipples((prevRipples) => [...prevRipples, newRipple]);
  };

  useEffect(() => {
    if (ripples.length) {
      const timer = setTimeout(() => {
        setRipples([]);
      }, RIPPLES_CLEAR_TIMEOUT_MS);

      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <div
      className={`absolute inset-0 overflow-hidden ${className}`}
      ref={containerRef}
      onMouseDown={addRipple}
      onPointerDown={addRipple}
    >
      {ripples.map((ripple, index) => (
        <div
          key={index}
          style={{
            backgroundColor: color,
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          className="absolute scale-0 animate-rippleEffect rounded-[50%] opacity-75"
        ></div>
      ))}
    </div>
  );
};

export default Ripple;
