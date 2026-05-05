"use client";

import { useEffect, useState } from "react";

export default function PhoneBlocker() {
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const check = () => setBlocked(window.innerWidth < 820);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!blocked) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-center"
      style={{ background: "#0a0a0a" }}
    >
      <div
        className="text-5xl mb-6 font-mono font-bold"
        style={{ color: "#ff3b3b" }}
      >
        ✕
      </div>
      <h1
        className="text-2xl font-bold mb-4"
        style={{ fontFamily: "var(--font-mono)", color: "#ff3b3b" }}
      >
        LAPTOP / DESKTOP REQUIRED
      </h1>
      <p
        className="max-w-md leading-relaxed mb-6"
        style={{ color: "#e8e8e8" }}
      >
        This experiment must be completed on a laptop or desktop computer with a
        mouse or trackpad. Phone and tablet results are physically invalid
        (touchscreen ≠ mouse) and will be caught during oral defence.
      </p>
      <p
        className="text-sm"
        style={{ fontFamily: "var(--font-mono)", color: "#666666" }}
      >
        Please reopen this URL on a laptop or desktop.
      </p>
    </div>
  );
}
