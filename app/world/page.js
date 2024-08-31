'use client'

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page({ world }) {
  const [isLoading, setIsLoading] = useState(false);
  const [worldData, setWorldData] = useState(null);
  const [showWorld, setShowWorld] = useState(false);

  const generateWorld = async () => {
    setIsLoading(true);
    setShowWorld(false);

    try {
      const response = await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log(data);
      setWorldData(data);
      setShowWorld(true);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const saveAndContinue = async () => {
    const gameSessionId = localStorage.getItem('gameSessionId');
    if (!gameSessionId || !worldData) {
      console.error('No game session ID found or no world data.');
      return;
    }
    const { data, error } = await supabase
        .from('game_sessions')
        .update({ 
          technews: worldData.tech_news, 
          megacorps: worldData.megacorps, 
          vc_funds: worldData.vc_funds, 
          town: worldData.town 
        })
        .eq('id', gameSessionId);
    if (error) {
        console.error('Error saving game state:', error);
    } else {
        console.log('Game state saved.');
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 mt-8">World Builder</h1>
      {!showWorld ? (
        <p className="text-center">Click the button below to generate a new world!</p>
      ) : worldData && (
        <div className='space-y-6 mb-8'>
          <div className='border p-8 rounded-md shadow-md'>
            <h2 className="text-2xl font-bold mb-4">{worldData.town.name}</h2>
            <p className="mb-4">{worldData.town.description}</p>
          </div>
          <div className='border p-8 rounded-md shadow-md'>
            <h3 className="text-2xl font-bold mb-2">Megacorps</h3>
            <ul className="mb-4">
              {worldData.megacorps.map((corp, index) => (
                <li className="mb-2" key={index}>{corp.name}: {corp.description}</li>
              ))}
            </ul>
          </div>
          <div className='border p-8 rounded-md shadow-md'>
            <h3 className="text-xl font-bold mb-2">VC Funds</h3>
            <ul className="mb-4">
              {worldData.vc_funds.map((fund, index) => (
                <li className="mb-2" key={index}>{fund.name}: {fund.description}</li>
              ))}
            </ul>
          </div>
          <div className='border p-8 rounded-md shadow-md'>
            <h3 className="text-xl font-bold mb-2">Tech News</h3>
            <ul className="mb-4">
              {worldData.tech_news.map((news, index) => (
                <li className="mb-2" key={index}>{news.name}: {news.description}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={generateWorld}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Create New World'}
        </button>
        {showWorld && worldData && (
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={saveAndContinue}
          >
            Play Game
          </button>
        )}
      </div>
    </div>
  );
}