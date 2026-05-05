"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Props {
  config: 1 | 2;
  W: number;
  participantName: string;
  onComplete: (mt: number) => void;
  onCancel: () => void;
}

type Phase = "ready" | "running" | "done";

const ARENA_WIDTH = 900;
const ARENA_HEIGHT = 200;
const TARGET_HEIGHT = 130;
const TARGET_TOP = (ARENA_HEIGHT - TARGET_HEIGHT) / 2; // 35
const LEFT_CENTER = 300;
const RIGHT_CENTER = 600;
const TOTAL_CLICKS = 10;

export default function TrialArena({ config, W, participantName, onComplete, onCancel }: Props) {
  const [phase, setPhase] = useState<Phase>("ready");
  const [activeTarget, setActiveTarget] = useState<"left" | "right">("left");
  const [clickCount, setClickCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [flashRed, setFlashRed] = useState<"left" | "right" | null>(null);
  const [finalMt, setFinalMt] = useState(0);
  const [dots, setDots] = useState<boolean[]>(Array(TOTAL_CLICKS).fill(false));

  // Refs to avoid stale closures in click handler
  const phaseRef = useRef<Phase>("ready");
  const activeTargetRef = useRef<"left" | "right">("left");
  const clickCountRef = useRef(0);
  const startTimeRef = useRef(0);
  const rafRef = useRef(0);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const leftEdge = LEFT_CENTER - W / 2;
  const rightEdge = RIGHT_CENTER - W / 2;

  // RAF timer loop
  useEffect(() => {
    if (phase === "running") {
      const tick = () => {
        setElapsed((performance.now() - startTimeRef.current) / 1000);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [phase]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const handleTargetClick = useCallback(
    (target: "left" | "right") => {
      if (phaseRef.current === "done") return;

      // Wrong target — flash red and ignore
      if (target !== activeTargetRef.current) {
        setFlashRed(target);
        if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
        flashTimerRef.current = setTimeout(() => setFlashRed(null), 300);
        return;
      }

      // Correct target
      if (phaseRef.current === "ready") {
        startTimeRef.current = performance.now();
        phaseRef.current = "running";
        setPhase("running");
      }

      clickCountRef.current += 1;
      const newCount = clickCountRef.current;

      setDots((prev) => {
        const next = [...prev];
        next[newCount - 1] = true;
        return next;
      });

      if (newCount >= TOTAL_CLICKS) {
        cancelAnimationFrame(rafRef.current);
        const mt = (performance.now() - startTimeRef.current) / 1000;
        phaseRef.current = "done";
        setFinalMt(mt);
        setElapsed(mt);
        setPhase("done");
        setClickCount(TOTAL_CLICKS);
      } else {
        const next: "left" | "right" = target === "left" ? "right" : "left";
        activeTargetRef.current = next;
        setActiveTarget(next);
        setClickCount(newCount);
      }
    },
    [] // stable — all state via refs
  );

  function targetStyle(side: "left" | "right"): React.CSSProperties {
    const isActive = side === activeTargetRef.current && phaseRef.current !== "done";
    const isFlashing = flashRed === side;
    const left = side === "left" ? leftEdge : rightEdge;

    let bg = "#1e1e1e";
    let border = "1px solid #333333";
    let color = "#666666";

    if (isFlashing) {
      bg = "#ff3b3b";
      border = "1px solid #ff3b3b";
      color = "#ffffff";
    } else if (isActive) {
      bg = "#c8ff00";
      border = "1px solid #c8ff00";
      color = "#000000";
    }

    return {
      position: "absolute",
      left: `${left}px`,
      top: `${TARGET_TOP}px`,
      width: `${W}px`,
      height: `${TARGET_HEIGHT}px`,
      background: bg,
      border,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: phase === "done" ? "default" : "pointer",
      userSelect: "none",
      WebkitUserSelect: "none",
      transition: "background 0.05s",
      writingMode: W < 20 ? "vertical-rl" : undefined,
    };
  }

  function targetLabel(side: "left" | "right"): string {
    if (phase === "done") return "";
    if (flashRed === side) return "✕";
    return side === activeTargetRef.current ? "CLICK" : "NEXT";
  }

  function targetLabelColor(side: "left" | "right"): string {
    if (flashRed === side) return "#ffffff";
    if (side === activeTargetRef.current && phase !== "done") return "#000000";
    return "#444444";
  }

  const clicksRemaining = TOTAL_CLICKS - clickCount;

  return (
    <div>
      {/* Status bar */}
      <div
        className="grid grid-cols-4 mb-4"
        style={{
          border: "1px solid #252525",
          background: "#111111",
          fontFamily: "var(--font-mono)",
          fontSize: "0.75rem",
        }}
      >
        {[
          { label: "Participant", value: participantName },
          { label: "Config", value: `Config ${config}` },
          {
            label: "Clicks Remaining",
            value: phase === "done" ? "Done!" : String(clicksRemaining),
          },
          {
            label: "Elapsed",
            value: `${elapsed.toFixed(3)}s`,
          },
        ].map(({ label, value }, i) => (
          <div
            key={i}
            className="p-3"
            style={{
              borderRight: i < 3 ? "1px solid #252525" : undefined,
            }}
          >
            <div style={{ color: "#666666", marginBottom: "2px", textTransform: "uppercase" }}>
              {label}
            </div>
            <div
              style={{
                color: label === "Config" || label === "Elapsed" ? "#c8ff00" : "#e8e8e8",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Arena wrapper — horizontal scroll, never scale */}
      <div style={{ overflowX: "auto" }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "relative",
            width: `${ARENA_WIDTH}px`,
            height: `${ARENA_HEIGHT}px`,
            background: "#0d0d0d",
            flexShrink: 0,
          }}
        >
          {/* READY overlay — pointer-events:none so clicks reach targets */}
          {phase === "ready" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.65)",
                zIndex: 5,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  color: "#c8ff00",
                  fontSize: "0.875rem",
                  letterSpacing: "0.05em",
                }}
              >
                READY — Click the yellow target to start timing
              </span>
            </div>
          )}

          {/* Left target */}
          <div style={targetStyle("left")} onClick={() => handleTargetClick("left")}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: W < 20 ? "0.6rem" : "0.75rem",
                fontWeight: 700,
                color: targetLabelColor("left"),
                writingMode: W < 20 ? "vertical-rl" : undefined,
              }}
            >
              {targetLabel("left")}
            </span>
          </div>

          {/* Right target */}
          <div style={targetStyle("right")} onClick={() => handleTargetClick("right")}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: W < 20 ? "0.6rem" : "0.75rem",
                fontWeight: 700,
                color: targetLabelColor("right"),
                writingMode: W < 20 ? "vertical-rl" : undefined,
              }}
            >
              {targetLabel("right")}
            </span>
          </div>
        </div>
      </div>

      {/* Large timer */}
      <div className="text-center mt-6 mb-2">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "3rem",
            fontWeight: 700,
            color: phase === "done" ? "#00e57a" : "#c8ff00",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          {elapsed.toFixed(3)}s
        </div>
        {phase === "done" && (
          <div
            className="mt-2"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.875rem",
              color: "#00e57a",
            }}
          >
            Trial {config} complete! Your MT = {finalMt.toFixed(4)}s
          </div>
        )}
      </div>

      {/* Click progress dots */}
      <div className="flex justify-center gap-2 mt-4 mb-6">
        {dots.map((filled, i) => (
          <div
            key={i}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: filled ? "#c8ff00" : "#1a1a1a",
              border: `1px solid ${filled ? "#c8ff00" : "#333333"}`,
              transition: "background 0.1s, border-color 0.1s",
            }}
          />
        ))}
      </div>

      {/* Continue / Cancel */}
      {phase === "done" && (
        <button
          onClick={() => onComplete(finalMt)}
          style={{
            width: "100%",
            background: "#c8ff00",
            color: "#000",
            fontFamily: "var(--font-mono)",
            fontWeight: 700,
            padding: "0.75rem",
            fontSize: "0.875rem",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            border: "none",
            cursor: "pointer",
            marginBottom: "0.75rem",
          }}
        >
          {config === 1 ? "Continue to Trial 2 →" : "Review & Submit Results →"}
        </button>
      )}

      <button
        onClick={onCancel}
        style={{
          width: "100%",
          background: "transparent",
          color: "#666666",
          fontFamily: "var(--font-mono)",
          fontSize: "0.875rem",
          padding: "0.5rem",
          border: "1px solid #252525",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = "#ff3b3b";
          (e.target as HTMLButtonElement).style.color = "#ff3b3b";
        }}
        onMouseLeave={(e) => {
          (e.target as HTMLButtonElement).style.borderColor = "#252525";
          (e.target as HTMLButtonElement).style.color = "#666666";
        }}
      >
        Cancel
      </button>
    </div>
  );
}
