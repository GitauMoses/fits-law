"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import PhoneBlocker from "@/components/PhoneBlocker";

const S: React.CSSProperties = { fontFamily: "var(--font-mono)" };

export default function SubmitPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [device, setDevice] = useState("");
  const [mt1, setMt1] = useState(0);
  const [mt2, setMt2] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submittedId, setSubmittedId] = useState<number | null>(null);
  const [localFallback, setLocalFallback] = useState(false);

  useEffect(() => {
    const n = sessionStorage.getItem("fitts_name");
    const d = sessionStorage.getItem("fitts_device");
    const m1 = sessionStorage.getItem("fitts_mt1");
    const m2 = sessionStorage.getItem("fitts_mt2");
    if (!n || !d || !m1 || !m2) { router.replace("/"); return; }
    setName(n);
    setDevice(d);
    setMt1(parseFloat(m1));
    setMt2(parseFloat(m2));
  }, [router]);

  async function handleSubmit() {
    setStatus("loading");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, device, mt1, mt2 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setSubmittedId(data.id);
      setStatus("success");
    } catch {
      // Fallback: save to localStorage
      const existing = JSON.parse(localStorage.getItem("fitts_local_results") || "[]");
      existing.push({ name, device, mt1, mt2, saved_at: new Date().toISOString() });
      localStorage.setItem("fitts_local_results", JSON.stringify(existing));
      setLocalFallback(true);
      setStatus("error");
    }
  }

  function handleNewParticipant() {
    sessionStorage.clear();
    router.push("/");
  }

  if (!name) return null;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      <PhoneBlocker />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <ProgressBar current={3} />

        <h1 style={{ ...S, fontSize: "1.25rem", fontWeight: 700, color: "#c8ff00", marginBottom: "24px" }}>
          Both Trials Complete
        </h1>

        {/* Summary */}
        <div className="p-5 mb-6" style={{ border: "1px solid #252525", background: "#111111" }}>
          <h2 style={{ ...S, fontSize: "0.7rem", color: "#666666", textTransform: "uppercase",
            letterSpacing: "0.08em", marginBottom: "16px" }}>
            Your Results Summary
          </h2>
          {[
            { label: "Participant", value: name },
            { label: "Device", value: device },
            { label: "Trial 1 MT (W = 60px)", value: `${mt1.toFixed(4)}s` },
            { label: "Trial 2 MT (W = 15px)", value: `${mt2.toFixed(4)}s` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between py-2"
              style={{ borderBottom: "1px solid #1a1a1a" }}
            >
              <span style={{ ...S, fontSize: "0.8rem", color: "#666666" }}>{label}</span>
              <span style={{ ...S, fontSize: "0.8rem", color: "#e8e8e8", fontWeight: 600 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Submit prompt */}
        {status === "idle" && (
          <>
            <div className="p-4 mb-6" style={{ border: "1px solid rgba(0,229,122,0.3)", background: "rgba(0,229,122,0.07)" }}>
              <p style={{ ...S, fontSize: "0.8rem", color: "#00e57a", lineHeight: 1.6 }}>
                Your results are ready. Submit them to the group database so your data is included in the Q5 answer.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              style={{
                width: "100%", background: "#c8ff00", color: "#000",
                fontFamily: "var(--font-mono)", fontWeight: 700, padding: "12px",
                fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em",
                border: "none", cursor: "pointer",
              }}
            >
              Submit Results
            </button>
          </>
        )}

        {status === "loading" && (
          <div className="text-center p-8" style={{ ...S, color: "#666666" }}>
            Submitting...
          </div>
        )}

        {status === "success" && (
          <div>
            <div className="p-5 mb-6" style={{ border: "1px solid rgba(0,229,122,0.4)", background: "rgba(0,229,122,0.07)" }}>
              <p style={{ ...S, fontSize: "0.8rem", color: "#00e57a", fontWeight: 700, marginBottom: "8px" }}>
                ✓ Submitted successfully! (ID #{submittedId})
              </p>
              <p style={{ fontSize: "0.875rem", color: "#e8e8e8", marginBottom: "12px" }}>
                Results page (share with all group members):
              </p>
              <a
                href="/results"
                style={{ ...S, fontSize: "0.875rem", color: "#c8ff00", textDecoration: "underline",
                  display: "block", wordBreak: "break-all" }}
              >
                {typeof window !== "undefined" ? window.location.origin : ""}/results
              </a>
            </div>
            <button
              onClick={handleNewParticipant}
              style={{
                width: "100%", background: "#c8ff00", color: "#000",
                fontFamily: "var(--font-mono)", fontWeight: 700, padding: "12px",
                fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em",
                border: "none", cursor: "pointer",
              }}
            >
              New Participant →
            </button>
          </div>
        )}

        {status === "error" && (
          <div>
            <div className="p-5 mb-6" style={{ border: "1px solid rgba(255,170,0,0.4)", background: "rgba(255,170,0,0.07)" }}>
              <p style={{ ...S, fontSize: "0.8rem", color: "#ffaa00", fontWeight: 700, marginBottom: "8px" }}>
                ⚠ Could not reach the database.
              </p>
              {localFallback && (
                <p style={{ fontSize: "0.8rem", color: "#e8e8e8" }}>
                  Your results have been saved locally in this browser. Please note them down manually and
                  enter them on the results page when connectivity is restored.
                </p>
              )}
              <div className="mt-3 p-3" style={{ background: "#0a0a0a", border: "1px solid #252525" }}>
                <p style={{ ...S, fontSize: "0.75rem", color: "#666666" }}>Manual record:</p>
                <p style={{ ...S, fontSize: "0.8rem", color: "#e8e8e8", marginTop: "4px" }}>
                  {name} | {device} | MT1 = {mt1.toFixed(4)}s | MT2 = {mt2.toFixed(4)}s
                </p>
              </div>
            </div>
            <button
              onClick={handleNewParticipant}
              style={{
                width: "100%", background: "transparent", color: "#666666",
                fontFamily: "var(--font-mono)", padding: "12px",
                fontSize: "0.875rem", border: "1px solid #252525", cursor: "pointer",
              }}
            >
              New Participant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
