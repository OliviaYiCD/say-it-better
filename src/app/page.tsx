"use client";
import { useMemo, useRef, useState } from "react";

export default function SayItBetterPage() {
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");
  const [audience, setAudience] = useState("General");
  const [goals, setGoals] = useState<string[]>(["Be clear", "Be polite"]);
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const goalsString = useMemo(() => goals.join(", "), [goals]);

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  }

  function buildPrompt() {
    return `You are a world-class writing assistant.
Rewrite the user's message to improve clarity, tone, and impact.

Constraints:
- Tone: ${tone}
- Target audience: ${audience}
- Desired length: ${length}
- Goals: ${goalsString}
- Preserve meaning; fix grammar; keep it natural.
- Offer exactly one improved version.

User text:
\"\"\"${input.trim()}\"\"\"`;
  }

  async function onRewrite() {
    setError(null);
    setOutput("");
    if (!input.trim()) {
      setError("Type a scenario first.");
      return;
    }
    setIsLoading(true);
    try {
      controllerRef.current = new AbortController();
      const res = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
        signal: controllerRef.current.signal,
      });
      if (!res.ok) throw new Error(await res.text());
      const text = await res.text();
      setOutput(text.trim());
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
      controllerRef.current = null;
    }
  }

  return (
    <main className="min-h-screen w-full bg-white text-gray-900 flex flex-col items-center p-6">
      <div className="w-full max-w-4xl">
        <header className="mb-6">
          <h1 className="text-3xl font-semibold">Say it better</h1>
          <p className="text-gray-600 mt-2">
            Type what you want to say. Choose tone, audience, and length. Get a cleaner version.
          </p>
        </header>

        <section className="mb-4">
          <label className="block text-sm font-medium mb-2">Your scenario</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Tell a client we need 2 more days (polite, confident)."
            className="w-full h-40 p-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </section>

        <section className="grid md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Tone</label>
            <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full p-2 rounded-lg border">
              {["Professional", "Friendly", "Empathetic", "Concise", "Persuasive", "Direct but polite"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full p-2 rounded-lg border">
              {["Short", "Medium", "Long"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Audience</label>
            <input
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="General, customer, exec, teacher, friend…"
              className="w-full p-2 rounded-lg border"
            />
          </div>
        </section>

        <section className="mb-6">
          <label className="block text-sm font-medium mb-2">Goals</label>
          <div className="flex flex-wrap">
            {["Be clear", "Be polite", "Be confident", "Reduce jargon", "Soften refusal", "Ask for decision", "Keep it brief"].map(
              (g) => (
                <button
                  key={g}
                  onClick={() => toggleGoal(g)}
                  className={`text-sm px-3 py-1 rounded-full border mr-2 mb-2 ${
                    goals.includes(g) ? "bg-gray-900 text-white" : "hover:bg-gray-50"
                  }`}
                >
                  {g}
                </button>
              ),
            )}
          </div>
        </section>

        <div className="flex items-center gap-3 mb-6">
          {!isLoading ? (
            <button onClick={onRewrite} className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90">
              Say it better
            </button>
          ) : (
            <button onClick={() => controllerRef.current?.abort()} className="px-4 py-2 rounded-xl bg-gray-200">
              Cancel
            </button>
          )}
          <span className="text-sm text-gray-500">or try: “Decline a meeting—propose async update.”</span>
        </div>

        {error && <div className="mb-4 text-red-700 bg-red-50 border border-red-200 p-3 rounded-lg">{error}</div>}

        <section className="mb-20">
          <label className="block text-sm font-medium mb-2">Improved version</label>
          <div className="rounded-xl border p-3 min-h-[120px] bg-gray-50 whitespace-pre-wrap leading-relaxed">
            {isLoading ? "Rewriting…" : output || "Output will appear here."}
          </div>
        </section>
      </div>
    </main>
  );
}
