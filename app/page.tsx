"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import PhoneBlocker from "@/components/PhoneBlocker";

const S: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [device, setDevice] = useState("");
  const [error, setError] = useState("");

  function handleBegin() {
    if (!name.trim()) { setError("Please enter your full name."); return; }
    if (!device) { setError("Please select your device."); return; }
    sessionStorage.setItem("fitts_name", name.trim());
    sessionStorage.setItem("fitts_device", device);
    sessionStorage.removeItem("fitts_mt1");
    sessionStorage.removeItem("fitts_mt2");
    router.push("/trial1-instructions");
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      <PhoneBlocker />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar current={0} />

        <header className="mb-8">
          <h1 style={{ ...S, fontSize: "1.5rem", fontWeight: 700, color: "#c8ff00" }}>
            SCO307 — Fitts&apos; Law Experiment
          </h1>
          <p style={{ ...S, fontSize: "0.8rem", color: "#666666", marginTop: "4px" }}>
            Question 5 · Group Data Collection
          </p>
        </header>

        {/* Warning */}
        <div
          className="flex gap-3 p-4 mb-6"
          style={{ border: "1px solid #ff3b3b", background: "rgba(255,59,59,0.07)" }}
        >
          <span style={{ color: "#ff3b3b", fontWeight: 700, fontSize: "1.1rem", flexShrink: 0 }}>⚠</span>
          <p style={{ ...S, fontSize: "0.8rem", color: "#ff3b3b", lineHeight: 1.6 }}>
            LAPTOP / DESKTOP ONLY. You must use a mouse or trackpad on a laptop or desktop.
            Do NOT use a phone or tablet. Phone results are physically invalid (touchscreen ≠ mouse)
            and will be caught during oral defence.
          </p>
        </div>

        {/* Explanation */}
        <div className="p-5 mb-8" style={{ border: "1px solid #252525", background: "#111111" }}>
          <h2
            style={{ ...S, fontSize: "0.7rem", color: "#c8ff00", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}
          >
            What You Will Do
          </h2>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "12px" }}>
            You will complete two short clicking trials (about 30 seconds each). In each trial,
            two rectangles appear on screen. The bright yellow one is your target — click it,
            then click the next yellow one. Keep going until the trial ends automatically after
            10 clicks. The timer runs from your first click to your tenth.
          </p>
          <p style={{ fontSize: "0.875rem", lineHeight: 1.7 }}>
            Trial 1 uses a wider target (easier). Trial 2 uses a narrower target (harder).
            Your movement time (MT) for each trial is the total time for all 10 clicks in seconds.
          </p>
        </div>

        {/* Form */}
        <div className="p-5 mb-6" style={{ border: "1px solid #252525", background: "#111111" }}>
          <div className="mb-5">
            <label
              style={{ ...S, display: "block", fontSize: "0.7rem", color: "#666666",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}
            >
              Your Full Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(""); }}
              placeholder="e.g. Jane Wanjiku Kamau"
              style={{
                width: "100%", background: "#0a0a0a", border: "1px solid #252525",
                color: "#e8e8e8", padding: "8px 12px", fontSize: "0.875rem",
                outline: "none", fontFamily: "var(--font-mono)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#c8ff00")}
              onBlur={(e) => (e.target.style.borderColor = "#252525")}
            />
          </div>
          <div>
            <label
              style={{ ...S, display: "block", fontSize: "0.7rem", color: "#666666",
                textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}
            >
              Device You Are Using *
            </label>
            <select
              value={device}
              onChange={(e) => { setDevice(e.target.value); setError(""); }}
              style={{
                width: "100%", background: "#0a0a0a", border: "1px solid #252525",
                color: device ? "#e8e8e8" : "#666666", padding: "8px 12px",
                fontSize: "0.875rem", outline: "none", fontFamily: "var(--font-mono)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#c8ff00")}
              onBlur={(e) => (e.target.style.borderColor = "#252525")}
            >
              <option value="">Select device...</option>
              <option value="Laptop + Mouse">Laptop + Mouse</option>
              <option value="Laptop Trackpad">Laptop Trackpad</option>
              <option value="Desktop + Mouse">Desktop + Mouse</option>
            </select>
          </div>
          {error && (
            <p style={{ ...S, color: "#ff3b3b", fontSize: "0.75rem", marginTop: "12px" }}>{error}</p>
          )}
        </div>

        <button
          onClick={handleBegin}
          style={{
            width: "100%", background: "#c8ff00", color: "#000",
            fontFamily: "var(--font-mono)", fontWeight: 700, padding: "12px",
            fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em",
            border: "none", cursor: "pointer",
          }}
        >
          Begin Experiment →
        </button>
      </div>
    </div>
  );
}
