import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "Meta Campaign Manager Frontend",
    version: "1.0.0",
  });
}
