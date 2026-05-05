import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(
      "SELECT id, name, device, mt1, mt2, created_at FROM fitts_results ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error("GET /api/results error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
