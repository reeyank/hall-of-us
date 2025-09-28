import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  const logFile = path.resolve("./server.log");

  try {
    const { message } = await req.json();

    fs.appendFileSync(logFile, `Received message: ${message}\n`);

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }]
    });

    fs.appendFileSync(logFile, `OpenAI response: ${JSON.stringify(completion)}\n`);

    return NextResponse.json({ success: true, completion });
  } catch (err) {
    fs.appendFileSync(logFile, `Error: ${err}\n`);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
