import { NextResponse } from "next/server";
import pkg from "../../../../package.json";

export async function GET() {
  return NextResponse.json({
    ok: true,
    status: "healthy",
    version: pkg.version,
    timestamp: new Date().toISOString(),
  });
}

