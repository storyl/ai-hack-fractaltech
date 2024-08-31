'use client'

import { useState, useEffect, useRef } from 'react';
import { AiFillMuted } from "react-icons/ai";
import { AiFillSound } from "react-icons/ai";


const stages = [
  "Inception: Your 'groundbreaking' idea",
  "Development: Building crap while dodging lawsuits",
  "Growth: Herding cats and chasing unicorns",
  "Adaptation: Pivoting like a drunk ballerina",
  "Expansion: Growing pains and ethical gymnastics",
  "Launch: Praying your house of cards doesn't collapse"
];

export default function GameComponent() {
  const [currentStage, setCurrentStage] = useState(0);
  const [input, setInput] = useState('');
  const [gameText, setGameText] = useState(
    "Welcome to 'Startup Hell: Where Dreams Go to Die'! Ready to lose your sanity and maybe make a quick buck? Let's dive in!\n\nYou're sitting in your parents' basement, thinking you're the next Steve Jobs. What's your 'revolutionary' idea?"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechSynthesisRef = useRef(null);

  useEffect(() => {
    speechSynthesisRef.current = window.speechSynthesis;
    return () => {
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, []);

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
    setIsLoading(true);

    const context = `
      The player is in the "${stages[currentStage]}" stage of their startup journey.
      Previous game text: ${gameText}
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
      setGameText(prevText => prevText + "\n\n" + newText);
      setInput('');
      speakText(newText);

      if (currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1);
      } else {
        const finalText = "\n\nCongratulations, you've somehow made it to the end without going bankrupt or ending up in jail. Time to cash out and do it all over again!";
        setGameText(prevText => prevText + finalText);
        speakText(finalText);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorText = "Oops! Looks like our AI is as reliable as your startup's revenue projections. Try again, hotshot!";
      setGameText(prevText => prevText + "\n\n" + errorText);
      speakText(errorText);
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-[28px] font-extrabold mb-6 text-center">🌈 The Startup Journey: From Vision to Reality 🦄</h1>
      <p className="text-xl mb-4">{stages[currentStage]}</p>
      <div className="bg-gray-100 border p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        <p className="whitespace-pre-wrap">{gameText}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your next brilliant move, genius?"
          className="w-full border px-3 py-2 text-gray-700 bg-gray-100 rounded focus:outline-none focus:bg-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-black hover:bg-black/80 transition-all duration-200 rounded focus:outline-none focus:ring-2 focus:ring-opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Make Your Move'}
        </button>
      </form>
      <button
        onClick={() => speakText(gameText)}
        className="mt-4 w-full px-4 py-2 text-black text-center flex flex-row items-center justify-center rounded"
        disabled={isSpeaking}
      >
        {isSpeaking ? <AiFillSound size={24} /> : <span className='flex flex-row items-center space-x-1'><span>Play Audio:</span> <AiFillMuted size={24} /></span> }
      </button>
    </div>
  );
}