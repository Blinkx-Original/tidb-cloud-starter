import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/sync/auth";
import { getDashboardData } from "@/lib/sync/dashboard";
import { getTiDBConfigStatus } from "@/lib/sync/tidb";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  const tidbStatus = getTiDBConfigStatus();
  if (!tidbStatus.ok) {
    return NextResponse.json({
      ok: false,
      summary: { algolia: null },
      logs: [],
      tidbStatus,
    });
  }

  try {
    const data = await getDashboardData();
    return NextResponse.json({
      ok: true,
      summary: data.summary,
      logs: data.logs,
      tidbStatus,
    });
  } catch (error) {
    console.error("Failed to load dashboard data", error);
    const message =
      error instanceof Error
        ? error.message
        : "No se pudo cargar la información.";
    return NextResponse.json(
      {
        ok: false,
        error: message,
        summary: { algolia: null },
        logs: [],
        tidbStatus,
      },
      { status: 500 },
    );
  }
}
