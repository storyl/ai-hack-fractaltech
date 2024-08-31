import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request) {
  const body = await request.json();
  const { input, context } = body;

}

export async function GET() {
  const system = `
  You are a story generator for a multiplayer game that takes place in the early 2000s Silicon Valley but set in an 80s, retro theme. 
  Include a colorful backstory explaining any characters, places and their personalities. 
  Return the format with the following JSON format {'megacorps': [{'name': '...', 'description': '...' }], 'vc_funds': [{'name': '...', 'description': '...' }], 'tech_news': [{'name': '...', 'description': '...' }], 'town': {name: '...', description: '...'}}.
  Include only the JSON content such that it can be directly implemented in Python, otherwise the game will crash and you will die with it.
`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      system,
      messages: [
        {"role": "user", "content": "Populate this world with two competing megacorps, three VC funds and a tech news website will cover the happenings in the town."}
      ],
      max_tokens: 1024,
      temperature: 0.8,
    });
    console.log(message.content)
    console.log(message.content[0])
    console.log(message.content[0].text)
    return NextResponse.json(JSON.parse(message.content[0].text));
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}