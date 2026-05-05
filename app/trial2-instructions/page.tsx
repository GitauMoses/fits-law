"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import PhoneBlocker from "@/components/PhoneBlocker";

const S: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function Trial2InstructionsPage() {
  const router = useRouter();
  const [mt1, setMt1] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem("fitts_name")) { router.replace("/"); return; }
    const m = sessionStorage.getItem("fitts_mt1");
    if (!m) { router.replace("/trial1-instructions"); return; }
    setMt1(m);
  }, [router]);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      <PhoneBlocker />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar current={2} />

        <h1 style={{ ...S, fontSize: "1.25rem", fontWeight: 700, color: "#c8ff00", marginBottom: "4px" }}>
          Trial 2 of 2 — Narrow Target (Harder)
        </h1>
        <p style={{ ...S, fontSize: "0.75rem", color: "#666666", marginBottom: "24px" }}>
          Configuration 2
        </p>

        {/* Config info */}
        <div
          className="grid grid-cols-3 mb-6"
          style={{ border: "1px solid #252525", background: "#111111" }}
        >
          {[
            { label: "D", value: "300px" },
            { label: "W", value: "15px" },
            { label: "ID", value: "4.392 bits" },
          ].map(({ label, value }, i) => (
            <div
              key={i}
              className="p-4 text-center"
              style={{ borderRight: i < 2 ? "1px solid #252525" : undefined }}
            >
              <div style={{ ...S, fontSize: "0.7rem", color: "#666666", textTransform: "uppercase", marginBottom: "4px" }}>
                {label}
              </div>
              <div style={{ ...S, fontSize: "1.25rem", fontWeight: 700, color: "#00d4ff" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="p-5 mb-6" style={{ border: "1px solid #252525", background: "#111111" }}>
          <h2 style={{ ...S, fontSize: "0.7rem", color: "#666666", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: "16px" }}>
            Step-by-Step Instructions
          </h2>
          <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[
              'Click "Start Trial 2" below to open the arena.',
              "The YELLOW rectangle is your target. Click it.",
              "The other rectangle turns yellow — click that one.",
              "Keep alternating as fast as you can.",
              "After 10 clicks the trial ends and records your time.",
            ].map((step, i) => (
              <li key={i} className="flex gap-3 mb-2">
                <span style={{ ...S, color: "#c8ff00", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                <span style={{ fontSize: "0.875rem", lineHeight: 1.6 }}>{step}</span>
              </li>
            ))}
          </ol>
          <p style={{ fontSize: "0.875rem", color: "#666666", marginTop: "16px",
            paddingTop: "16px", borderTop: "1px solid #252525", lineHeight: 1.6 }}>
            Go as fast as possible. Clicking the wrong (grey) target does nothing — you must hit the yellow one.
          </p>
        </div>

        {/* Diagram */}
        <div className="p-5 mb-6" style={{ border: "1px solid #252525", background: "#111111" }}>
          <h2 style={{ ...S, fontSize: "0.7rem", color: "#666666", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: "16px" }}>
            Arena Layout
          </h2>
          <div className="flex justify-center">
            <div style={{ position: "relative", width: "300px", height: "60px", background: "#0d0d0d" }}>
              <div
                style={{ position: "absolute", left: 0, top: "4px", bottom: "4px", width: "15px",
                  border: "1px solid #00d4ff", display: "flex", alignItems: "center",
                  justifyContent: "center" }}
              />
              <div
                style={{ position: "absolute", right: 0, top: "4px", bottom: "4px", width: "15px",
                  border: "1px solid #00d4ff", display: "flex", alignItems: "center",
                  justifyContent: "center" }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center",
                justifyContent: "center" }}>
                <span style={{ ...S, fontSize: "0.65rem", color: "#444" }}>←— D = 300px —→</span>
              </div>
            </div>
          </div>
          <div
            className="flex justify-between mt-1"
            style={{ width: "300px", margin: "4px auto 0", fontFamily: "var(--font-mono)",
              fontSize: "0.65rem", color: "#666666" }}
          >
            <span style={{ width: "15px", textAlign: "center" }}>W</span>
            <span style={{ width: "15px", textAlign: "center" }}>W</span>
          </div>
          <p style={{ ...S, fontSize: "0.65rem", color: "#666", textAlign: "center", marginTop: "4px" }}>
            W = 15px (each)
          </p>
        </div>

        {/* Formula */}
        <div className="calc-block mb-6">
          <div className="calc-formula">ID = log₂(1 + D/W)</div>
          <div className="calc-sub mt-1">ID = log₂(1 + 300/15)</div>
          <div className="calc-sub mt-1">ID = log₂(21)</div>
          <div className="calc-result mt-1">ID = 4.392 bits</div>
        </div>

        {/* Warning box */}
        <div className="p-4 mb-4" style={{ border: "1px solid rgba(255,170,0,0.4)", background: "rgba(255,170,0,0.07)" }}>
          <p style={{ ...S, fontSize: "0.8rem", color: "#ffaa00", lineHeight: 1.6 }}>
            The target is now only 15px wide — aim carefully. Speed still matters but precision is critical.
          </p>
        </div>

        {/* Trial 1 result */}
        {mt1 && (
          <div className="p-4 mb-6" style={{ border: "1px solid #252525", background: "#111111" }}>
            <p style={{ ...S, fontSize: "0.8rem", color: "#666666" }}>
              Trial 1 recorded:{" "}
              <span style={{ color: "#00e57a", fontWeight: 700 }}>
                {parseFloat(mt1).toFixed(4)}s
              </span>{" "}
              — do not refresh the page before submitting.
            </p>
          </div>
        )}

        <button
          onClick={() => router.push("/trial2-arena")}
          style={{
            width: "100%", background: "#c8ff00", color: "#000",
            fontFamily: "var(--font-mono)", fontWeight: 700, padding: "12px",
            fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em",
            border: "none", cursor: "pointer",
          }}
        >
          Start Trial 2 →
        </button>
      </div>
    </div>
  );
}
