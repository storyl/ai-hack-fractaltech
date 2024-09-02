'use client'

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import GameComponent from './GameComponent';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LobbyComponent() {
  const [gameSessionId, setGameSessionId] = useState(null);
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isResumingGame, setIsResumingGame] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const [inputSessionId, setInputSessionId] = useState('');
  const [showGame, setShowGame] = useState(false);
  const router = useRouter();
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (gameSessionId) {
      console.log('Current Session ID:', gameSessionId);
    }
  }, [gameSessionId]);

  const createNewGame = async (e) => {
    e.preventDefault();
    console.log('Creating new game...');
    setIsCreatingGame(true);
    setError(null);
    const initialGameText = "Welcome to 'Startup Hell: Where Dreams Go to Die'! Ready to lose your sanity and maybe make a quick buck? Let's dive in!\n\nYou're sitting in your parents' basement, thinking you're the next Steve Jobs. What's your 'revolutionary' idea?";
    
    try {
      const worldBuildResponse = await fetch('/api/world', {
        method: 'POST'
      });
      if (!worldBuildResponse.ok) {
        throw new Error('Failed to fetch world build');
      }
      const worldBuildData = await worldBuildResponse.json();
      const { megacorps, tech_news, vc_funds } = worldBuildData;
      console.log('World build data:', worldBuildData);
      const { data, error } = await supabase
        .from('game_sessions')
        .insert([
          { 
            current_stage: 0,
            game_text: initialGameText,
            megacorps,
            tech_news,
            vc_funds
          }
        ])
        .select();

      if (error) throw error;

      const newSessionId = data[0].id;
      console.log('New game created with session ID:', newSessionId);
      setGameSessionId(newSessionId);
      localStorage.setItem('gameSessionId', newSessionId);
      router.push(`/world/${newSessionId}`);

    //   setShowGame(true);
    } catch (error) {
      console.error('Error creating new game:', error);
      setError('Failed to create a new game. Please try again.');
    } finally {
      setIsCreatingGame(false);
    }
  };

  const resumeGame = async (e) => {
    e.preventDefault();
    console.log('Resuming game...');
    if (!inputSessionId) {
      setError('Please enter a session ID');
      return;
    }
    setIsResumingGame(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', inputSessionId)
        .single();

      if (error) throw error;

      console.log('Game resumed with session ID:', inputSessionId);
      setGameSessionId(inputSessionId);
      localStorage.setItem('gameSessionId', inputSessionId);
      router.push(`/world/${inputSessionId}`);
    //   setShowGame(true);
    } catch (error) {
      console.error('Error loading game:', error);
      setError('Failed to load the game. Please check the session ID and try again.');
    } finally {
      setIsResumingGame(false);
    }
  };

  if (showGame && gameSessionId) {
    return <GameComponent sessionId={gameSessionId} />;
  }

  const saveUsername = (e) => {
    e.preventDefault();
    setIsUpdatingUsername(true);
    localStorage.setItem('username', username);
    setTimeout(() => setIsUpdatingUsername(false), 1000); // Reset button after 1 second
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="p-8 bg-white rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Startup Hell</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={saveUsername} className="mb-4">
          <input
            type="text"
            placeholder="Enter your name to begin"
            className="w-full px-3 py-2 border rounded mb-2"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
            disabled={isCreatingGame || isResumingGame || isUpdatingUsername}
          >
            {isUpdatingUsername ? 'Updating...' : (username ? 'Update' : 'Save')}
          </button>
        </form>
        <div className="space-y-6 pt-4">
          <div>
            <button
              className="w-full px-4 py-2 text-white bg-black rounded hover:bg-black/90 transitiona-all duration-200 transition-colors"
              onClick={createNewGame}
              disabled={isCreatingGame || isResumingGame}
            >
              {isCreatingGame ? 'Creating...' : 'Start New Game 🦄'}
            </button>
          </div>
          
          <form onSubmit={resumeGame} className="space-y-2">
            <p className="text-center font-semibold">- OR -</p>
            <input
              type="text"
              placeholder="Enter session ID to resume"
              className="w-full px-3 py-2 border rounded"
              value={inputSessionId}
              onChange={(e) => setInputSessionId(e.target.value)}
              disabled={isCreatingGame || isResumingGame}
            />
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
              disabled={isCreatingGame || isResumingGame}
            >
              {isResumingGame ? 'Resuming...' : 'Resume Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}