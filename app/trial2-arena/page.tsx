"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/ProgressBar";
import PhoneBlocker from "@/components/PhoneBlocker";
import TrialArena from "@/components/TrialArena";

export default function Trial2ArenaPage() {
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const n = sessionStorage.getItem("fitts_name");
    if (!n) { router.replace("/"); return; }
    if (!sessionStorage.getItem("fitts_mt1")) { router.replace("/trial2-instructions"); return; }
    setName(n);
  }, [router]);

  function handleComplete(mt: number) {
    sessionStorage.setItem("fitts_mt2", String(mt));
    router.push("/submit");
  }

  if (!name) return null;

  return (
    <div className="min-h-screen" style={{ background: "#0a0a0a", color: "#e8e8e8" }}>
      <PhoneBlocker />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <ProgressBar current={2} />
        <h1
          style={{
            fontFamily: "var(--font-mono)", fontSize: "1rem", fontWeight: 700,
            color: "#c8ff00", marginBottom: "24px",
          }}
        >
          Trial 2 Arena — Config 2 (W = 15px)
        </h1>
        <TrialArena
          config={2}
          W={15}
          participantName={name}
          onComplete={handleComplete}
          onCancel={() => router.push("/trial2-instructions")}
        />
      </div>
    </div>
  );
}
