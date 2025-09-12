// app/api/messages/route.ts
import { NextResponse } from "next/server";

const JSON_SERVER = "http://localhost:3001";

export async function GET() {
  console.log("GET /api/messages");
  const res = await fetch(`${JSON_SERVER}/messages`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const params = await req.formData();
  const payload = {
    content: String(params.get("content") ?? ""),
    due_date: String(params.get("due_date") ?? ""),
    is_complete: params.get("is_complete") === "on" || params.get("is_complete") === "true",
  };

  console.log("body", payload);
  const res = await fetch(`${JSON_SERVER}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: 201 });
}