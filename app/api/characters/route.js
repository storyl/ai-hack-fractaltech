import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function POST(request) {
  const body = await request.json();
  const { sessionId } = body;
  const system = `
  You are a character generator for a multiplayer game that takes place in the early 2000s Silicon Valley but set in an 80s, retro theme. 
  Include a colorful backstory explaining any characters, places and their personalities. 
  For each character first generate a backstory informed by the world building response, then generate a list of character traits.
  Return the format with the following JSON format {'characters': [{name: '..', backstory: '..', character_traits: [{name: '..', description: '..'}, {name: '..', description: '..'}], skills: ['..', '..']}]}.
  Skills must be selected from the following list: [mobile, AI, hardware, backend, frontend, devops, business]
  Include only the JSON content such that it can be directly implemented in Python, otherwise the game will crash and you will die with it.
`;
  const { data, error } = await supabase
  .from('game_sessions')
  .select('*')
  .eq('id', sessionId)
  .single();

  const megacorps = data.megacorps;
  const vcFunds = data.vc_funds;
  const town = data.town;
  const techNews = data.technews;

  const contentString = `${megacorps.map(megacorp => megacorp.description).join('\n')}\n${vcFunds.map(vcFund => vcFund.description).join('\n')}\n${town.description}\n${techNews.map(news => news.description).join('\n')}`;

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      system,
      messages: [
        { "role": "user", "content": "Populate this world with two competing megacorps, three VC funds and a tech news website will cover the happenings in the town." },
        { "role": "assistant", "content": contentString },
        { "role": "user", "content": "Generate six characters for the game with one to two skills each. Ensure each has at least one toxic personality trait." }
      ],
      max_tokens: 2048,
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