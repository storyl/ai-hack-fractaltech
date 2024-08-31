import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const body = await request.json();
  const { input, context } = body;

  try {
    const completion = await anthropic.completions.create({
      model: "claude-2", 
      prompt: `${context}\n\nHuman: ${input}\n\nAssistant:`,
      max_tokens_to_sample: 150,
      temperature: 0.8,
    });

    return NextResponse.json({ text: completion.completion });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}