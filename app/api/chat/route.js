import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Incoming chat body:", body);

    const text = body.text || body.message || body.prompt || "";
    const filters = body.filters || {};

    if (!text.trim()) {
      return new Response(JSON.stringify({ error: "Missing text" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const filterContext = Object.keys(filters).length
      ? `\nThe user has applied the following filters: ${JSON.stringify(filters)}.`
      : "";

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini", // change if needed
      messages: [
        { role: "system", content: "You are a helpful assistant inside a filter-aware chat popup." },
        { role: "user", content: text + filterContext },
      ],
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content ?? null;
    console.log("OpenAI reply:", completion.choices?.[0]?.message?.content);

    if (!reply) {
      return new Response(JSON.stringify({ error: "No reply generated" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
    JSON.stringify({ success: true, message: reply }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );

  } catch (err) {
    console.error("Chat API error:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch completion" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
