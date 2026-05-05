import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, device, mt1, mt2 } = await req.json();
    if (!name || !device || mt1 == null || mt2 == null) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const result = await pool.query(
      "INSERT INTO fitts_results (name, device, mt1, mt2) VALUES ($1, $2, $3, $4) RETURNING id",
      [name.trim(), device, parseFloat(mt1), parseFloat(mt2)]
    );
    return NextResponse.json({ id: result.rows[0].id });
  } catch (err) {
    console.error("POST /api/submit error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
