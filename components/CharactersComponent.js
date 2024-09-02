'use client'

import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function CharactersComponent(props) {
  const [generatedCharacters, setGeneratedCharacters] = useState([]);
  const [characters, setCharacters] = useState([]);
  const { sessionId } = props;

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  console.log(data);

  const generateTeam = async () => {
    const response = await fetch(`/api/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    const data = await response.json();
    console.log(data);
  }

  return (
    <button onClick={() => generateTeam()}>Generate Your Team</button>
  );
}