'use client'

import GameComponent from '../components/GameComponent';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <GameComponent />
    </main>
  );
}