"use client";

const STEPS = ["Setup", "Trial 1", "Trial 2", "Submit", "Results"];

export default function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex items-start mb-8">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className="w-7 h-7 flex items-center justify-center text-xs font-bold"
                style={{
                  background: done ? "#c8ff00" : active ? "transparent" : "transparent",
                  border: done
                    ? "1px solid #c8ff00"
                    : active
                    ? "1px solid #c8ff00"
                    : "1px solid #252525",
                  color: done ? "#000" : active ? "#c8ff00" : "#666666",
                  fontFamily: "var(--font-mono)",
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              <span
                className="text-xs mt-1 whitespace-nowrap"
                style={{
                  fontFamily: "var(--font-mono)",
                  color: active ? "#c8ff00" : done ? "#c8ff00" : "#666666",
                  opacity: done ? 0.7 : 1,
                }}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 mx-1 mt-[-14px]"
                style={{
                  height: "1px",
                  background: done ? "#c8ff00" : "#252525",
                  opacity: done ? 0.6 : 1,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
