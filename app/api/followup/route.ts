import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, propertyInterest, lastContact, notes } = body;

    if (!name || !propertyInterest) {
      return NextResponse.json(
        { error: "Name and property interest are required" },
        { status: 400 }
      );
    }

    const prompt = `Generate a warm, professional real estate follow-up email for this lead:

Lead Name: ${name}
Property Interest: ${propertyInterest}
Last Contact: ${lastContact || "Not specified"}
Notes: ${notes || "None"}

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "subject": "Email subject line here",
  "body": "Full email body here with proper line breaks using \\n"
}

The email should:
- Start with a personalized greeting
- Reference their specific property interest
- Be warm, conversational, and professional
- Include a clear call-to-action
- Be 150-200 words
- Sign off as "Your Real Estate Agent"`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system:
        "You are an expert real estate agent assistant who specializes in client communication. You write warm, professional, personalized follow-up emails that convert leads into clients. Always respond with valid JSON only, no additional text.",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    // Parse JSON from response
    const jsonText = content.text.trim();
    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Follow-up API error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to generate follow-up email" },
      { status: 500 }
    );
  }
}
