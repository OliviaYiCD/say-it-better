import { NextResponse } from "next/server";

type ChatCompletion = {
  choices?: { message?: { content?: string } }[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = body?.prompt;
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

    if (!resp.ok) {
      const text = await resp.text();
      return new NextResponse(text || "Upstream error", { status: 500 });
    }

    const data = (await resp.json()) as ChatCompletion;
    const out = data.choices?.[0]?.message?.content?.trim?.() ?? "";
    return new NextResponse(out, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Server error";
    return new NextResponse(message, { status: 500 });
  }
}
