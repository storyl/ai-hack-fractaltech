'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { AiFillMuted, AiFillSound } from "react-icons/ai";
import { createClient } from '@supabase/supabase-js';
// import { useWebSocket } from '../context/WebSocketContext'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const stages = [
  "Inception: Your 'groundbreaking' idea",
  "Development: Building crap while dodging lawsuits",
  "Growth: Herding cats and chasing unicorns",
  "Adaptation: Pivoting like a drunk ballerina",
  "Expansion: Growing pains and ethical gymnastics",
  "Launch: Praying your house of cards doesn't collapse"
];

export default function Page({ params }) {
  const { sessionId } = params;
  const [currentStage, setCurrentStage] = useState(0);
  const [input, setInput] = useState('');
  const [latestResponse, setLatestResponse] = useState('');
  const [fullGameText, setFullGameText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingMove, setIsProcessingMove] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  const loadGameState = useCallback(async () => {
    if (!sessionId) return;

    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (error) {
      console.error('Error loading game state:', error);
      return;
    }

    if (data) {
      setCurrentStage(data.current_stage || 0);
      setFullGameText(data.game_text || '');
      const parts = data.game_text.split('\n\n');
      setLatestResponse(parts[parts.length - 1] || '');
    }
    setIsLoading(false);
  }, [sessionId]);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    loadGameState();

    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [loadGameState]);

  const saveGameState = async () => {
    if (!sessionId) return;

    const { error } = await supabase
      .from('game_sessions')
      .upsert({
        id: sessionId,
        current_stage: currentStage,
        game_text: fullGameText,
        updated_at: new Date()
      });

    if (error) {
      console.error('Error saving game state:', error);
    }
  };

  const speakText = (text) => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingMove(true);

    const context = `
      The player is in the "${stages[currentStage]}" stage of their startup journey.
      Previous game text: ${fullGameText}
      Player input: ${input}
      Respond with a humorous, slightly toxic continuation of the story based on the player's input.
      Keep it around 150 or less words. Don't use quotation marks in your response.
    `;

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context })
      });
      const data = await response.json();
      const newText = data.text;
      setLatestResponse(newText);
      setFullGameText(prevText => prevText + "\n\n" + newText);
      setInput('');
      speakText(newText);

      if (currentStage < stages.length - 1) {
        setCurrentStage(prevStage => prevStage + 1);
      } else {
        const finalText = "\n\nCongratulations, you've somehow made it to the end without going bankrupt or ending up in jail. Time to cash out and do it all over again!";
        setLatestResponse(finalText);
        setFullGameText(prevText => prevText + finalText);
        speakText(finalText);
      }

      await saveGameState();
    } catch (error) {
      console.error('Error:', error);
      const errorText = "Oops! Looks like our AI is as reliable as your startup's revenue projections. Try again, hotshot!";
      setLatestResponse(errorText);
      setFullGameText(prevText => prevText + "\n\n" + errorText);
      speakText(errorText);
    } finally {
      setIsProcessingMove(false);
    }
  };

  if (isLoading) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-extrabold mt-6 mb-6 text-center">🌈 The Startup Journey <br/> From Vision to Reality 🦄</h1>
      <p className="text-xl mb-4 font-bold">{stages[currentStage]}</p>
      <div className="bg-gray-100 border p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        <p className="whitespace-pre-wrap">{fullGameText}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your next brilliant move, genius?"
          className="w-full border px-3 py-2 text-gray-700 bg-gray-100 rounded focus:outline-none focus:bg-white"
          disabled={isProcessingMove}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-black hover:bg-black/80 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
          disabled={isProcessingMove}
        >
          {isProcessingMove ? 'Processing move...' : 'Make Your Move'}
        </button>
      </form>
      <button
        onClick={() => speakText(latestResponse)}
        className="mt-4 w-full px-4 py-2 text-black text-center flex flex-row items-center justify-center rounded"
        disabled={isSpeaking}
      >
        {isSpeaking ? <AiFillSound size={24} /> : <span className='flex flex-row items-center space-x-1'><span>Play Audio:</span> <AiFillMuted size={24} /></span>}
      </button>

      <h2 className="text-sm text-center font-bold mb-4 text-gray-300 mt-4">Session ID: {sessionId}</h2>

    </div>
  );
}