import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { pipeline } = await request.json();

    if (!pipeline || !Array.isArray(pipeline)) {
      return NextResponse.json({ error: "Pipeline data is required" }, { status: 400 });
    }

    const pipelineText = pipeline
      .map((lead: { name: string; stage: string; interest: string; lastContact: string }) =>
        `- ${lead.name}: ${lead.stage} | ${lead.interest} | Last contact: ${lead.lastContact}`
      )
      .join("\n");

    const prompt = `Here is a real estate agent's current pipeline:

${pipelineText}

Provide a brief, actionable executive summary covering:
1. Overall pipeline health (2-3 sentences)
2. Hot leads that need immediate attention (name specific leads)
3. Top 3 recommended next actions for this week

Keep it concise, direct, and actionable. Return ONLY a JSON object:
{
  "summary": "Full summary text here with \\n for line breaks between sections"
}`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "You are a real estate sales coach who gives sharp, data-driven pipeline insights. Be specific, direct, and actionable. Always respond with valid JSON only.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const result = JSON.parse(content.text.trim());
    return NextResponse.json(result);
  } catch (error) {
    console.error("Pipeline summary API error:", error);
    return NextResponse.json({ error: "Failed to generate pipeline summary" }, { status: 500 });
  }
}
