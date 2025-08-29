import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return new NextResponse("Missing prompt", { status: 400 });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return new NextResponse("Missing OPENAI_API_KEY", { status: 500 });

    const resp = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You improve user writing concisely and professionally." },
          { role: "user", content: prompt },
        ],
        temperature: 0.4,
      }),
    });

    if (!resp.ok) return new NextResponse(await resp.text(), { status: 500 });
    const data = await resp.json();
    const out = data.choices?.[0]?.message?.content?.trim?.() || "";
    return new NextResponse(out, { status: 200 });
  } catch (err: any) {
    return new NextResponse(err?.message || "Server error", { status: 500 });
  }
}
