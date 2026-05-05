"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";

const S: React.CSSProperties = { fontFamily: "var(--font-mono)" };

interface Row {
  id: number;
  name: string;
  device: string;
  mt1: string;
  mt2: string;
  created_at: string;
}

// ── maths helpers ──────────────────────────────────────────────────────────
const ID1 = Math.log2(6);   // log2(1 + 300/60)
const ID2 = Math.log2(21);  // log2(1 + 300/15)
const fmt = (n: number, d = 4) => n.toFixed(d);

function computeStats(rows: Row[]) {
  const n = rows.length;
  if (n === 0) return null;
  const mt1s = rows.map((r) => parseFloat(r.mt1));
  const mt2s = rows.map((r) => parseFloat(r.mt2));
  const MT1 = mt1s.reduce((a, b) => a + b, 0) / n;
  const MT2 = mt2s.reduce((a, b) => a + b, 0) / n;
  const b = (MT2 - MT1) / (ID2 - ID1);
  const a = MT1 - b * ID1;
  const ID_pred = Math.log2(1 + 500 / 40);   // log2(13.5)
  const MT_pred = a + b * ID_pred;
  const ID_ratio = ID2 / ID1;
  const MT_ratio = MT2 / MT1;
  return { n, mt1s, mt2s, MT1, MT2, b, a, ID_pred, MT_pred, ID_ratio, MT_ratio };
}

// ── sub-components ─────────────────────────────────────────────────────────
function CB({ lines }: { lines: { t: "f" | "s" | "r"; v: string }[] }) {
  return (
    <div className="calc-block">
      {lines.map((l, i) => (
        <div
          key={i}
          className={l.t === "f" ? "calc-formula" : l.t === "s" ? "calc-sub" : "calc-result"}
          style={{ marginTop: i > 0 ? "4px" : 0 }}
        >
          {l.v}
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h3 style={{ ...S, fontSize: "0.8rem", fontWeight: 700, color: "#c8ff00",
        textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px",
        paddingBottom: "6px", borderBottom: "1px solid #252525" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ── Raw Data Tab ────────────────────────────────────────────────────────────
function RawTab({ rows, onDelete, onRefresh }: {
  rows: Row[];
  onDelete: (id: number) => void;
  onRefresh: () => void;
}) {
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const mt1s = rows.map((r) => parseFloat(r.mt1));
  const mt2s = rows.map((r) => parseFloat(r.mt2));
  const mean1 = mt1s.length ? mt1s.reduce((a, b) => a + b, 0) / mt1s.length : null;
  const mean2 = mt2s.length ? mt2s.reduce((a, b) => a + b, 0) / mt2s.length : null;

  return (
    <div>
      {rows.length === 0 ? (
        <p style={{ ...S, color: "#666666", fontSize: "0.875rem" }}>No submissions yet.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #252525" }}>
                {["#", "Participant Name", "Device", "Config 1 MT (s)", "Config 2 MT (s)", "Timestamp", ""].map((h, i) => (
                  <th key={i} style={{ padding: "8px 10px", color: "#666666", textAlign: "left",
                    fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.06em",
                    ...(i === 6 ? { className: "no-print" } : {}) }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <>
                  <tr key={row.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                    <td style={{ padding: "8px 10px", color: "#666666" }}>{idx + 1}</td>
                    <td style={{ padding: "8px 10px", color: "#e8e8e8" }}>{row.name}</td>
                    <td style={{ padding: "8px 10px", color: "#e8e8e8" }}>{row.device}</td>
                    <td style={{ padding: "8px 10px", color: "#c8ff00" }}>{parseFloat(row.mt1).toFixed(4)}</td>
                    <td style={{ padding: "8px 10px", color: "#c8ff00" }}>{parseFloat(row.mt2).toFixed(4)}</td>
                    <td style={{ padding: "8px 10px", color: "#444444", fontSize: "0.7rem" }}>
                      {new Date(row.created_at).toLocaleString()}
                    </td>
                    <td className="no-print" style={{ padding: "8px 10px" }}>
                      {confirmId === row.id ? (
                        <span>
                          <button
                            onClick={() => { onDelete(row.id); setConfirmId(null); }}
                            style={{ ...S, fontSize: "0.7rem", color: "#ff3b3b", background: "none",
                              border: "none", cursor: "pointer", marginRight: "6px" }}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            style={{ ...S, fontSize: "0.7rem", color: "#666666", background: "none",
                              border: "none", cursor: "pointer" }}
                          >
                            No
                          </button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmId(row.id)}
                          style={{ ...S, fontSize: "0.7rem", color: "#444444", background: "none",
                            border: "none", cursor: "pointer" }}
                          title="Delete row"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                  <tr className="print-sig">
                    <td colSpan={6} style={{ padding: "4px 10px 8px" }} />
                  </tr>
                </>
              ))}
              {mean1 !== null && (
                <tr style={{ borderTop: "1px solid #252525", background: "#0d0d0d" }}>
                  <td style={{ padding: "8px 10px", color: "#666666" }} />
                  <td style={{ padding: "8px 10px", color: "#00d4ff", fontWeight: 700 }}>Mean</td>
                  <td style={{ padding: "8px 10px" }} />
                  <td style={{ padding: "8px 10px", color: "#00d4ff", fontWeight: 700 }}>{mean1.toFixed(4)}</td>
                  <td style={{ padding: "8px 10px", color: "#00d4ff", fontWeight: 700 }}>{mean2!.toFixed(4)}</td>
                  <td colSpan={2} style={{ padding: "8px 10px", color: "#444444", fontSize: "0.7rem" }}>
                    n = {rows.length}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Calculations Tab ────────────────────────────────────────────────────────
function CalcTab({ rows }: { rows: Row[] }) {
  const stats = computeStats(rows);

  if (!stats) {
    return <p style={{ ...S, color: "#666666", fontSize: "0.875rem" }}>No data yet — submit some results first.</p>;
  }

  const { n, mt1s, mt2s, MT1, MT2, b, a, ID_pred, MT_pred, ID_ratio, MT_ratio } = stats;

  return (
    <div>
      {/* Q5(a) */}
      <Section title="Q5(a) — Index of Difficulty">
        <CB lines={[
          { t: "f", v: "ID = log₂(1 + D/W)" },
          { t: "s", v: "Config 1: ID₁ = log₂(1 + 300/60) = log₂(6)" },
          { t: "r", v: `Config 1: ID₁ = ${fmt(ID1)} bits` },
        ]} />
        <CB lines={[
          { t: "f", v: "ID = log₂(1 + D/W)" },
          { t: "s", v: "Config 2: ID₂ = log₂(1 + 300/15) = log₂(21)" },
          { t: "r", v: `Config 2: ID₂ = ${fmt(ID2)} bits` },
        ]} />
      </Section>

      {/* Q5(b) */}
      <Section title="Q5(b) — Mean Movement Time">
        <p style={{ fontSize: "0.8rem", color: "#666666", marginBottom: "12px", fontFamily: "var(--font-mono)" }}>
          Individual MT values ({n} participant{n !== 1 ? "s" : ""}):
        </p>
        <div className="mb-4" style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.8rem", minWidth: "100%" }}>
            <thead>
              <tr>
                {["Participant", "Config 1 MT (s)", "Config 2 MT (s)"].map((h) => (
                  <th key={h} style={{ padding: "6px 12px", color: "#666666", textAlign: "left",
                    fontSize: "0.7rem", textTransform: "uppercase", borderBottom: "1px solid #252525" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "6px 12px", color: "#e8e8e8" }}>{row.name}</td>
                  <td style={{ padding: "6px 12px", color: "#c8ff00" }}>{parseFloat(row.mt1).toFixed(4)}</td>
                  <td style={{ padding: "6px 12px", color: "#c8ff00" }}>{parseFloat(row.mt2).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <CB lines={[
          { t: "f", v: "MT̄₁ = (Σ MT₁ᵢ) / n" },
          { t: "s", v: `MT̄₁ = (${mt1s.map(v => fmt(v)).join(" + ")}) / ${n}` },
          { t: "r", v: `MT̄₁ = ${fmt(MT1)} s` },
        ]} />
        <CB lines={[
          { t: "f", v: "MT̄₂ = (Σ MT₂ᵢ) / n" },
          { t: "s", v: `MT̄₂ = (${mt2s.map(v => fmt(v)).join(" + ")}) / ${n}` },
          { t: "r", v: `MT̄₂ = ${fmt(MT2)} s` },
        ]} />
      </Section>

      {/* Q5(c) */}
      <Section title="Q5(c) — Fitts' Law Constants a and b">
        <p style={{ fontSize: "0.8rem", color: "#666666", marginBottom: "12px", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          Using 2-point fit: MT = a + b·ID at the two experimental conditions.
        </p>
        <CB lines={[
          { t: "f", v: "Eq1: MT̄₁ = a + b·ID₁" },
          { t: "s", v: `Eq1: ${fmt(MT1)} = a + b·${fmt(ID1)}` },
          { t: "f", v: "Eq2: MT̄₂ = a + b·ID₂" },
          { t: "s", v: `Eq2: ${fmt(MT2)} = a + b·${fmt(ID2)}` },
        ]} />
        <CB lines={[
          { t: "f", v: "Eq2 − Eq1: MT̄₂ − MT̄₁ = b·(ID₂ − ID₁)" },
          { t: "s", v: `${fmt(MT2)} − ${fmt(MT1)} = b·(${fmt(ID2)} − ${fmt(ID1)})` },
          { t: "s", v: `${fmt(MT2 - MT1)} = b·${fmt(ID2 - ID1)}` },
          { t: "r", v: `b = ${fmt(b)} s/bit` },
        ]} />
        <CB lines={[
          { t: "f", v: "a = MT̄₁ − b·ID₁" },
          { t: "s", v: `a = ${fmt(MT1)} − ${fmt(b)}·${fmt(ID1)}` },
          { t: "s", v: `a = ${fmt(MT1)} − ${fmt(b * ID1)}` },
          { t: "r", v: `a = ${fmt(a)} s` },
        ]} />
        {a < 0 && (
          <div className="p-4 mb-4" style={{ border: "1px solid rgba(255,170,0,0.4)", background: "rgba(255,170,0,0.07)" }}>
            <p style={{ ...S, fontSize: "0.8rem", color: "#ffaa00", lineHeight: 1.7 }}>
              ⚠ Note: a = {fmt(a)}s is negative. This is a known artefact of 2-point fitting (not full linear regression).
              With only two data points there are zero degrees of freedom; the line passes exactly through both means.
              A negative intercept is physically unrealistic (MT cannot be negative), but it can arise when data is collected
              under lab conditions without sufficient speed-accuracy trade-off range. Acknowledge this in your written answer
              and note that a proper regression with 6+ ID levels would likely yield a positive intercept.
            </p>
          </div>
        )}
      </Section>

      {/* Q5(d) */}
      <Section title="Q5(d) — Prediction for D = 500px, W = 40px">
        <CB lines={[
          { t: "f", v: "ID_pred = log₂(1 + D/W)" },
          { t: "s", v: "ID_pred = log₂(1 + 500/40) = log₂(13.5)" },
          { t: "r", v: `ID_pred = ${fmt(ID_pred)} bits` },
        ]} />
        <CB lines={[
          { t: "f", v: "MT_pred = a + b·ID_pred" },
          { t: "s", v: `MT_pred = ${fmt(a)} + ${fmt(b)}·${fmt(ID_pred)}` },
          { t: "s", v: `MT_pred = ${fmt(a)} + ${fmt(b * ID_pred)}` },
          { t: "r", v: `MT_pred = ${fmt(MT_pred)} s` },
        ]} />
        <div className="p-4" style={{ border: "1px solid #252525", background: "#111111" }}>
          <p style={{ ...S, fontSize: "0.8rem", color: "#666666", lineHeight: 1.7 }}>
            Reliability note: Only 2 ID levels were used in this experiment. Fitts&apos; Law regression
            requires 6+ ID levels for reliable parameter estimation. With exactly 2 points there are
            zero degrees of freedom — the line passes through both data points exactly. The prediction
            above should be treated as an interpolation, not a validated regression estimate.
          </p>
        </div>
      </Section>

      {/* Q5(e) */}
      <Section title="Q5(e) — TRAP Analysis">
        <p style={{ fontSize: "0.8rem", color: "#666666", marginBottom: "12px", fontFamily: "var(--font-mono)", lineHeight: 1.6 }}>
          The question claims that doubling MT follows from the target change. Evaluate this claim:
        </p>
        <CB lines={[
          { t: "f", v: "ID ratio = ID₂ / ID₁" },
          { t: "s", v: `ID ratio = ${fmt(ID2)} / ${fmt(ID1)}` },
          { t: "r", v: `ID ratio = ${fmt(ID_ratio, 4)} (≠ 2.0)` },
        ]} />
        <CB lines={[
          { t: "f", v: "MT ratio = MT̄₂ / MT̄₁" },
          { t: "s", v: `MT ratio = ${fmt(MT2)} / ${fmt(MT1)}` },
          { t: "r", v: `MT ratio = ${fmt(MT_ratio, 4)}` },
        ]} />
        <div className="p-4 mb-4" style={{ border: "1px solid rgba(255,59,59,0.35)", background: "rgba(255,59,59,0.06)" }}>
          <p style={{ ...S, fontSize: "0.8rem", color: "#ff3b3b", fontWeight: 700, marginBottom: "8px" }}>
            ERROR 1 — Incorrect ID ratio
          </p>
          <p style={{ fontSize: "0.8rem", color: "#e8e8e8", lineHeight: 1.7 }}>
            The question claims the ID ratio is 2.0. The actual ID ratio is{" "}
            <span style={{ color: "#c8ff00", fontWeight: 700 }}>{fmt(ID_ratio, 4)}</span>, not 2.0.
            Reducing W from 60px to 15px (a 4× reduction) does NOT double the index of difficulty.
            ID is a logarithmic measure: log₂(1 + 300/15) / log₂(1 + 300/60) = {fmt(ID2)}/{fmt(ID1)} ≈ {fmt(ID_ratio, 3)}.
          </p>
        </div>
        <div className="p-4" style={{ border: "1px solid rgba(255,59,59,0.35)", background: "rgba(255,59,59,0.06)" }}>
          <p style={{ ...S, fontSize: "0.8rem", color: "#ff3b3b", fontWeight: 700, marginBottom: "8px" }}>
            ERROR 2 — MT does not scale proportionally with ID
          </p>
          <p style={{ fontSize: "0.8rem", color: "#e8e8e8", lineHeight: 1.7 }}>
            Even if the ID ratio were exactly 2.0, MT₂/MT₁ would still not equal 2.0.
            Fitts&apos; Law is MT = a + b·ID — an affine (not proportional) relationship.
            MT would only double with ID if a = 0, which is physically impossible (there is always
            a non-zero reaction-time component). The correct prediction uses the full linear model:
            MT₂ = a + b·ID₂, not MT₂ = MT₁ × (ID₂/ID₁).
          </p>
          <p style={{ ...S, fontSize: "0.8rem", color: "#c8ff00", marginTop: "10px", fontWeight: 700 }}>
            Correct conclusion: The claim that MT doubles is wrong on two independent grounds —
            the ID ratio is {fmt(ID_ratio, 3)} (not 2.0), and even if it were 2.0, MT would not double
            because MT = a + b·ID contains a non-zero additive constant.
          </p>
        </div>
      </Section>
    </div>
  );
}

// ── CAT Answer Tab ──────────────────────────────────────────────────────────
function CatTab({ rows }: { rows: Row[] }) {
  const [copied, setCopied] = useState(false);
  const stats = computeStats(rows);

  if (!stats) {
    return <p style={{ ...S, color: "#666666", fontSize: "0.875rem" }}>No data yet — submit some results first.</p>;
  }

  const { n, mt1s, mt2s, MT1, MT2, b, a, ID_pred, MT_pred, ID_ratio, MT_ratio } = stats;
  const participantList = rows.map((r, i) =>
    `  Participant ${i + 1}: ${r.name.padEnd(30)} MT₁ = ${parseFloat(r.mt1).toFixed(4)}s   MT₂ = ${parseFloat(r.mt2).toFixed(4)}s`
  ).join("\n");

  const negNote = a < 0
    ? `\n  Note: The intercept a = ${fmt(a)}s is negative. This is a known artefact of 2-point\n  fitting with zero degrees of freedom. A proper multi-level regression would likely\n  yield a physically realistic (positive) intercept. This limitation is acknowledged.\n`
    : "";

  const answer = `Q5 — FITTS' LAW ANALYSIS
${"=".repeat(60)}
Data collected from ${n} participant${n !== 1 ? "s" : ""}:
${participantList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q5(a) — Index of Difficulty
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The Index of Difficulty is calculated using Fitts' formula:

  ID = log₂(1 + D/W)

Configuration 1 (D = 300 px, W = 60 px):
  ID₁ = log₂(1 + 300/60) = log₂(1 + 5) = log₂(6)
  ID₁ = ${fmt(ID1, 4)} bits

Configuration 2 (D = 300 px, W = 15 px):
  ID₂ = log₂(1 + 300/15) = log₂(1 + 20) = log₂(21)
  ID₂ = ${fmt(ID2, 4)} bits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q5(b) — Mean Movement Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mean MT for Configuration 1 (W = 60 px):
  MT̄₁ = (${mt1s.map(v => fmt(v)).join(" + ")}) / ${n}
  MT̄₁ = ${fmt(mt1s.reduce((a,b)=>a+b,0))} / ${n}
  MT̄₁ = ${fmt(MT1, 4)} s

Mean MT for Configuration 2 (W = 15 px):
  MT̄₂ = (${mt2s.map(v => fmt(v)).join(" + ")}) / ${n}
  MT̄₂ = ${fmt(mt2s.reduce((a,b)=>a+b,0))} / ${n}
  MT̄₂ = ${fmt(MT2, 4)} s

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q5(c) — Fitts' Law Constants a and b
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Using the linear model MT = a + b·ID at both experimental conditions:

  Eq 1: ${fmt(MT1, 4)} = a + b × ${fmt(ID1, 4)}   ...(Config 1)
  Eq 2: ${fmt(MT2, 4)} = a + b × ${fmt(ID2, 4)}   ...(Config 2)

Subtract Eq 1 from Eq 2 to eliminate a:
  ${fmt(MT2, 4)} − ${fmt(MT1, 4)} = b × (${fmt(ID2, 4)} − ${fmt(ID1, 4)})
  ${fmt(MT2 - MT1, 4)} = b × ${fmt(ID2 - ID1, 4)}
  b = ${fmt(MT2 - MT1, 4)} / ${fmt(ID2 - ID1, 4)}
  b = ${fmt(b, 4)} s/bit

Substitute b back into Eq 1 to find a:
  a = ${fmt(MT1, 4)} − ${fmt(b, 4)} × ${fmt(ID1, 4)}
  a = ${fmt(MT1, 4)} − ${fmt(b * ID1, 4)}
  a = ${fmt(a, 4)} s
${negNote}
Therefore, the Fitts' Law equation for this dataset is:
  MT = ${fmt(a, 4)} + ${fmt(b, 4)} × ID

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q5(d) — Prediction for D = 500 px, W = 40 px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1 — Calculate ID for the new condition:
  ID_pred = log₂(1 + D/W) = log₂(1 + 500/40) = log₂(13.5)
  ID_pred = ${fmt(ID_pred, 4)} bits

Step 2 — Predict MT using derived constants:
  MT_pred = a + b × ID_pred
  MT_pred = ${fmt(a, 4)} + ${fmt(b, 4)} × ${fmt(ID_pred, 4)}
  MT_pred = ${fmt(a, 4)} + ${fmt(b * ID_pred, 4)}
  MT_pred = ${fmt(MT_pred, 4)} s

Reliability note: This regression is based on only 2 ID levels (zero degrees of freedom).
A minimum of 6 ID levels is recommended for reliable regression estimates.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Q5(e) — TRAP Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Evaluating the claim that "MT doubles when W is reduced from 60px to 15px":

Actual ID ratio:
  ID₂ / ID₁ = ${fmt(ID2, 4)} / ${fmt(ID1, 4)} = ${fmt(ID_ratio, 4)}

Actual MT ratio (from experimental means):
  MT̄₂ / MT̄₁ = ${fmt(MT2, 4)} / ${fmt(MT1, 4)} = ${fmt(MT_ratio, 4)}

ERROR 1 — Incorrect ID ratio:
  The claimed ratio of 2.0 is incorrect. The actual ID ratio is ${fmt(ID_ratio, 4)},
  not 2.0. Reducing W by a factor of 4 does not double ID because ID is
  logarithmic: log₂(21) / log₂(6) ≈ ${fmt(ID_ratio, 4)}.

ERROR 2 — MT does not scale proportionally with ID:
  Fitts' Law is MT = a + b·ID (affine, not proportional). MT only scales
  proportionally with ID when a = 0. Since a = ${fmt(a, 4)} s ≠ 0, doubling
  ID does not double MT. The correct formula is MT₂ = a + b·ID₂, not
  MT₂ = MT₁ × (ID₂/ID₁).

Correct conclusion:
  The claim that MT doubles is wrong on two independent grounds:
  (1) The ID ratio is ${fmt(ID_ratio, 4)} ≠ 2.0.
  (2) Even if ID₂/ID₁ were 2.0, MT would not double because Fitts' Law
      has a non-zero additive intercept a = ${fmt(a, 4)} s.
  The actual MT ratio from group data is ${fmt(MT_ratio, 4)}.
`;

  function handleCopy() {
    navigator.clipboard.writeText(answer).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4 no-print">
        <p style={{ ...S, fontSize: "0.75rem", color: "#666666" }}>
          Copy this block and paste it into your CAT submission PDF.
        </p>
        <button
          onClick={handleCopy}
          style={{
            fontFamily: "var(--font-mono)", fontSize: "0.75rem",
            background: copied ? "#00e57a" : "#c8ff00", color: "#000",
            border: "none", padding: "6px 16px", cursor: "pointer", fontWeight: 700,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre
        style={{
          fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "#e8e8e8",
          background: "#111111", border: "1px solid #252525", padding: "20px",
          whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.7,
          overflowX: "auto",
        }}
      >
        {answer}
      </pre>
    </div>
  );
}

// ── Main Results Page ───────────────────────────────────────────────────────
export default function ResultsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"raw" | "calc" | "cat">("raw");
  const [error, setError] = useState("");

  const fetchRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/results");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fetch failed");
      setRows(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRows(); }, [fetchRows]);

  async function handleDelete(id: number) {
    try {
      await fetch(`/api/results/${id}`, { method: "DELETE" });
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch {
      alert("Delete failed");
    }
  }

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="no-print">
          <ProgressBar current={4} />
        </div>

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          <div>
            <h1 style={{ ...S, fontSize: "1.25rem", fontWeight: 700, color: "#c8ff00" }}>
              SCO307 — Q5 Group Results
            </h1>
            <p style={{ ...S, fontSize: "0.75rem", color: "#666666", marginTop: "2px" }}>
              Fitts&apos; Law Experiment · Kenyatta University
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={fetchRows}
              style={{ ...S, fontSize: "0.75rem", background: "transparent", color: "#e8e8e8",
                border: "1px solid #252525", padding: "6px 14px", cursor: "pointer" }}
            >
              Refresh
            </button>
            <button
              onClick={() => window.print()}
              style={{ ...S, fontSize: "0.75rem", background: "transparent", color: "#e8e8e8",
                border: "1px solid #252525", padding: "6px 14px", cursor: "pointer" }}
            >
              Print / Save PDF
            </button>
            <button
              onClick={() => router.push("/")}
              style={{ ...S, fontSize: "0.75rem", background: "#c8ff00", color: "#000",
                border: "none", padding: "6px 14px", cursor: "pointer", fontWeight: 700 }}
            >
              Run Experiment
            </button>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 mb-6 no-print" style={{ border: "1px solid #252525", background: "#111111" }}>
          <p style={{ ...S, fontSize: "0.8rem", color: "#666666", lineHeight: 1.6 }}>
            Share this URL with all group members. Data persists in the database — refresh to see new submissions.
            URL: <span style={{ color: "#c8ff00" }}>
              {typeof window !== "undefined" ? window.location.href : "/results"}
            </span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 mb-6 no-print" style={{ borderBottom: "1px solid #252525" }}>
          {(["raw", "calc", "cat"] as const).map((t) => {
            const labels = { raw: "Raw Data", calc: "Calculations", cat: "CAT Answer" };
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  ...S, fontSize: "0.8rem", padding: "10px 20px",
                  background: "transparent", border: "none",
                  borderBottom: tab === t ? "2px solid #c8ff00" : "2px solid transparent",
                  color: tab === t ? "#c8ff00" : "#666666",
                  cursor: "pointer", marginBottom: "-1px",
                }}
              >
                {labels[t]}
              </button>
            );
          })}
        </div>

        {loading && (
          <p style={{ ...S, color: "#666666", fontSize: "0.875rem" }}>Loading...</p>
        )}
        {error && (
          <p style={{ ...S, color: "#ff3b3b", fontSize: "0.875rem" }}>Error: {error}</p>
        )}
        {!loading && !error && (
          <>
            {tab === "raw" && <RawTab rows={rows} onDelete={handleDelete} onRefresh={fetchRows} />}
            {tab === "calc" && <CalcTab rows={rows} />}
            {tab === "cat" && <CatTab rows={rows} />}
          </>
        )}
      </div>
    </div>
  );
}
