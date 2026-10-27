import { NextResponse } from "next/server";

export function corsHeaders(origin?: string | null): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Allow-Credentials": "true",
  };
}

export function handleCorsOptions() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
