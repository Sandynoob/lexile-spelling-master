
import React, { useState } from 'react';
import { GameState, LexileRange, Word, ScoreData } from './types';
import { LEXILE_WORDS } from './constants';
import LexileSelector from './components/LexileSelector';
import SpellingGame from './components/SpellingGame';
import Results from './components/Results';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [currentWords, setCurrentWords] = useState<Word[]>([]);
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);

  const startTest = (range: LexileRange, count: number) => {
    const pool = LEXILE_WORDS[range];
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    // Use the count selected by the user
    const selected = shuffled.slice(0, count);
    
    setCurrentWords(selected);
    setGameState(GameState.PLAYING);
  };

  const handleFinish = (data: ScoreData) => {
    setScoreData(data);
    setGameState(GameState.FINISHED);
  };

  const resetGame = () => {
    setGameState(GameState.START);
    setScoreData(null);
    setCurrentWords([]);
  };

  return (
    <div className="min-h-[100dvh] h-[100dvh] flex flex-col p-4 md:p-6 selection:bg-indigo-100 transition-colors overflow-hidden relative bg-slate-50">
      
      {/* Header - Dynamically scales. Hidden/Reduced to maximize game area */}
      <header className={`flex-none w-full mx-auto transition-all duration-500 ease-in-out flex flex-col items-center justify-center z-20 
        ${gameState === GameState.PLAYING ? 'h-[8vh] mb-2' : 'h-[20vh] md:h-[25vh] mb-4'}`}>
        
        <div 
          className="flex flex-col items-center cursor-pointer group" 
          onClick={() => gameState !== GameState.PLAYING && resetGame()}
        >
          {/* Logo Badge - Adaptive sizing based on state and viewport */}
          <div className={`bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:rotate-6 transition-all duration-300
            ${gameState === GameState.PLAYING ? 'w-8 h-8 md:w-10 md:h-10 mb-1' : 'w-16 h-16 md:w-24 md:h-24 mb-3'}`}>
            <span className={`text-white font-kids leading-none transition-all
              ${gameState === GameState.PLAYING ? 'text-lg md:text-xl' : 'text-4xl md:text-6xl'}`}>
              L
            </span>
          </div>
          
          <div className="text-center">
            <h1 className={`font-kids text-indigo-900 leading-tight transition-all
              ${gameState === GameState.PLAYING ? 'text-sm md:text-lg' : 'text-2xl md:text-4xl'}`}>
              Lexile Master
            </h1>
            {gameState !== GameState.PLAYING && (
              <p className="text-slate-400 font-bold uppercase tracking-[0.2em] leading-none mt-1 text-[8px] md:text-xs">
                Spelling Assessment
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area - Strictly constrained to remaining space */}
      <main className="flex-1 w-full max-w-5xl mx-auto relative z-10 overflow-hidden flex flex-col bg-white/40 rounded-[2rem] shadow-inner border border-white/50">
        {gameState === GameState.START && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4">
            <LexileSelector onSelect={startTest} />
          </div>
        )}

        {gameState === GameState.PLAYING && currentWords.length > 0 && (
          <div className="flex-1 flex flex-col h-full overflow-hidden p-2 md:p-4">
            <SpellingGame 
              words={currentWords} 
              onFinish={handleFinish} 
              onBack={resetGame}
            />
          </div>
        )}

        {gameState === GameState.FINISHED && scoreData && (
          <div className="flex-1 overflow-y-auto no-scrollbar py-4">
            <Results 
              scoreData={scoreData} 
              onRestart={resetGame} 
            />
          </div>
        )}
      </main>

      {/* Footer - Minimalized to prevent push-out */}
      <footer className="flex-none h-[4vh] text-center z-20 flex items-center justify-center opacity-30 mt-2">
        <p className="text-[8px] md:text-[10px] text-slate-500 font-bold tracking-widest uppercase">
          Safe & Secure Assessment Environment
        </p>
      </footer>

      {/* Background Decor */}
      <div className="fixed -bottom-20 -left-20 w-48 h-48 bg-indigo-100/30 rounded-full blur-3xl -z-0 pointer-events-none"></div>
      <div className="fixed -top-20 -right-20 w-48 h-48 bg-blue-100/30 rounded-full blur-3xl -z-0 pointer-events-none"></div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default App;
