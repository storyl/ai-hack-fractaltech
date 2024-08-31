'use client'

import { useState } from 'react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const context = `
      The player is in the "${stages[currentStage]}" stage of their startup journey.
      Previous game text: ${gameText}
      Player input: ${input}
      Respond with a humorous, slightly toxic continuation of the story based on the player's input.
      Keep it under 150 words. Don't use quotation marks in your response.
    `;

    try {
      const response = await fetch('/api/claude', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, context })
      });
      const data = await response.json();
      setGameText(data.text);
      setInput('');
      
      if (currentStage < stages.length - 1) {
        setCurrentStage(currentStage + 1);
      } else {
        setGameText(data.text + "\n\nCongratulations, you've somehow made it to the end without going bankrupt or ending up in jail. Time to cash out and do it all over again!");
      }
    } catch (error) {
      console.error('Error:', error);
      setGameText("Oops! Looks like our AI is as reliable as your startup's revenue projections. Try again, hotshot!");
    }

    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="text-4xl font-extrabold mb-6 text-center">Startup Hell: Where Dreams Go to Die</h1>
      <p className="text-xl mb-4">{stages[currentStage]}</p>
      <div className="bg-gray-100 p-4 rounded-lg mb-4 h-64 overflow-y-auto">
        <p className="whitespace-pre-wrap">{gameText}</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What's your next brilliant move, genius?"
          className="w-full px-3 py-2 text-gray-700 bg-gray-100 rounded focus:outline-none focus:bg-white"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="w-full px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Make Your Move'}
        </button>
      </form>
    </div>
  );
}
