'use client'

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default function Page({ world }) {
  const [isLoading, setIsLoading] = useState(false);
  const [megacorps, setMegacorps] = useState([]);
  const [vcFunds, setVcFunds] = useState([]);
  const [techNews, setTechNews] = useState([]);
  const [town, setTown] = useState({});

  const generateWorld = async (e) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/world', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      console.log(data);
      setMegacorps(data.megacorps);
      setVcFunds(data.vc_funds);
      setTechNews(data.tech_news);
      setTown(data.town);
    } catch (error) {
      console.error('Error:', error);
    }
    setIsLoading(false);
  };

  const saveAndContinue = async (e) => {
    const gameSessionId = localStorage.getItem('gameSessionId');
    if (!gameSessionId) {
      console.error('No game session ID found.');
      return;
    }
    const { data, error } = await supabase
        .from('game_sessions')
        .update({ technews: techNews, megacorps: megacorps, vc_funds: vcFunds, town: town })
        .eq('id', gameSessionId);
    if (error) {
        console.error('Error saving game state:', error);
    } else {
        console.log('Game state saved.');
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8">World Builder</h1>
      {(() => {
        if (!town) {
          return (
            <p className="text-center">Click the button below to generate a new world!</p>
          );
        } else {
          return (
            <div>
              <h2 className="text-2xl font-bold mb-4">{town.name}</h2>
              <p className="mb-4">{town.description}</p>
              <h3 className="text-xl font-bold mb-2">Megacorps</h3>
              <ul className="mb-4">
                {megacorps.map((corp, index) => (
                  <li className="mb-2" key={index}>{corp.name}: {corp.description}</li>
                ))}
              </ul>
              <h3 className="text-xl font-bold mb-2">VC Funds</h3>
              <ul className="mb-4">
                {vcFunds.map((fund, index) => (
                  <li className="mb-2" key={index}>{fund.name}: {fund.description}</li>
                ))}
              </ul>
              <h3 className="text-xl font-bold mb-2">Tech News</h3>
              <ul className="mb-4">
                {techNews.map((news, index) => (
                  <li className="mb-2" key={index}>{news.name}: {news.description}</li>
                ))}
              </ul>
            </div>
          );
        }
      })()}
      <div className="flex flex-col items-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
          onClick={() => generateWorld()}
        >
          Create New World
        </button>
        {(() => {
          if (town != {}) {
            return (
              <button 
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => saveAndContinue()}
                >
                Play Game
              </button>
            );
          }
        })()}
      </div>
    </div>
  );
}
