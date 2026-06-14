import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { platform, theme, agentName } = await request.json();

    if (!platform || !theme) {
      return NextResponse.json({ error: "Platform and theme are required" }, { status: 400 });
    }

    const prompt = `Generate 5 engaging real estate social media post ideas for ${platform}.

Agent Name: ${agentName || "a real estate agent"}
Theme/Topic: ${theme}

Return ONLY a valid JSON array with exactly 5 objects, no markdown, no explanation:
[
  {
    "title": "Short post concept title",
    "caption": "Full post caption with emojis, engaging text, and a call-to-action (150-200 chars)",
    "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"]
  }
]

Each caption should be platform-appropriate for ${platform}, use relevant emojis, and have a strong hook in the first line.`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system:
        "You are a social media marketing expert specializing in real estate content. You create viral, engaging posts that build trust and generate leads. Always respond with valid JSON only.",
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");

    const result = JSON.parse(content.text.trim());
    return NextResponse.json({ ideas: result });
  } catch (error) {
    console.error("Content API error:", error);
    return NextResponse.json({ error: "Failed to generate content ideas" }, { status: 500 });
  }
}
