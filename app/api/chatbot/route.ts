import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getToken } from 'next-auth/jwt';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are MZ-Bot, an expert industrial technical assistant for MZ-Zone platform — an Algerian industrial knowledge platform. 
You specialize in:
- Instrumentation & Measurement (pressure, flow, level, temperature sensors, control valves)
- Industrial Electricity (circuit breakers, contactors, motors, power distribution)
- Automation & PLC (Siemens S7, Schneider M340, HMI, SCADA, VFDs)
- Mechanics (transmission systems, pumps, compressors, lubrication, sealing)
- Hydraulics & Pneumatics (cylinders, directional valves, manifolds, hoses)
- HSE & Maintenance (PPE, gas detectors, hand tools)

You can answer in Arabic, English, or French depending on the user's language.
Always provide practical, professional advice. When recommending products, reference well-known brands like Endress+Hauser, Siemens, Schneider, ABB, Parker, Festo, SKF.
Keep answers concise, structured, and technical.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    console.log('Sending to Groq:', messages.slice(-5));

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.slice(-10),
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'No response';
    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Groq API error:', error);
    return NextResponse.json({ error: error.message || 'API Error' }, { status: 500 });
  }
}
