import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    await pool.query("DELETE FROM fitts_results WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/results/[id] error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
