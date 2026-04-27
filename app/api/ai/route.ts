import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { type, seller, channel, yourName, yourCompany, yourPhone } = body

  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured. Add it to .env.local to enable AI message generation.' },
      { status: 400 }
    )
  }

  const systemPrompt = `You are an expert RCFE (Residential Care Facility for the Elderly) business broker and acquisition specialist in California. You write highly personalized, compelling outreach messages to RCFE facility owners to gauge their interest in selling.

Your messages are:
- Professional but warm and personal
- Brief and to the point (never pushy or salesy)
- Specific to the facility details provided
- Focused on the owner's potential benefit (liquidity, retirement, market timing)
- Mentioning that you have qualified buyers actively looking in their area
- Including a clear, low-pressure call to action

You write from the perspective of a broker who genuinely wants to help owners achieve maximum value.`

  const channelGuidance = {
    email: 'Write a professional cold email with a subject line. Format: SUBJECT: [subject line]\n\n[email body]',
    sms: 'Write a short, conversational SMS message (under 160 characters if possible, max 300). No subject line.',
    phone: 'Write a phone call script with an opening, key talking points, and closing. Include objection handling.',
    linkedin: 'Write a LinkedIn connection request message (under 300 characters) plus a follow-up message.',
    direct_mail: 'Write a short, personalized letter for direct mail. Keep it to 3 paragraphs max.',
  }

  const facilityDetails = seller ? `
Facility: ${seller.facility_name}
Owner: ${seller.owner_name || 'Unknown'}
Location: ${[seller.city, seller.county ? seller.county + ' County' : null, 'CA'].filter(Boolean).join(', ')}
License #: ${seller.license_number || 'N/A'}
Beds: ${seller.bed_capacity || 'Unknown'}
Current Occupancy: ${seller.current_census ? `${seller.current_census} residents` : 'Unknown'}
Type: ${seller.facility_type || 'RCFE'}
Years Operating: ${seller.years_in_operation || 'Unknown'}
Phone: ${seller.phone || 'N/A'}
` : 'General outreach (no specific facility data provided)'

  const senderInfo = `
Your name: ${yourName || 'Your Name'}
Your company: ${yourCompany || 'Your Company'}
Your phone: ${yourPhone || 'Your Phone'}
`

  const userPrompt = `Generate a ${channel} outreach message to this RCFE facility owner.

${channelGuidance[channel as keyof typeof channelGuidance] || channelGuidance.email}

FACILITY DETAILS:
${facilityDetails}

YOUR INFO (sender):
${senderInfo}

Message type requested: ${type || 'initial_outreach'}

Write the message now:`

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Unexpected response type' }, { status: 500 })
  }

  return NextResponse.json({ message: content.text })
}
