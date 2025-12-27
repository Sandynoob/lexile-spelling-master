
import React, { useState, useEffect, useCallback } from 'react';
import { Word, ScoreData } from '../types';
import { playAmericanPronunciation } from '../services/geminiService';

interface SpellingGameProps {
  words: Word[];
  onFinish: (scoreData: ScoreData) => void;
  onBack: () => void;
}

const SpellingGame: React.FC<SpellingGameProps> = ({ words, onFinish, onBack }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>([]);
  const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
  const [hasFailedThisWord, setHasFailedThisWord] = useState(false);
  const [correctFirstTryCount, setCorrectFirstTryCount] = useState(0);
  const [isWrong, setIsWrong] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentWord = words[currentIndex].word;

  const shuffleLetters = useCallback((word: string) => {
    return word.split('').sort(() => Math.random() - 0.5);
  }, []);

  const initWord = useCallback(() => {
    setScrambledLetters(shuffleLetters(currentWord));
    setSelectedLetters(new Array(currentWord.length).fill(null));
    setHasFailedThisWord(false);
    setIsWrong(false);
    playAmericanPronunciation(currentWord);
  }, [currentWord, shuffleLetters]);

  useEffect(() => {
    initWord();
  }, [currentIndex, initWord]);

  const handleLetterClick = (letter: string, indexInPool: number) => {
    if (isWrong) return;

    const firstEmptyIndex = selectedLetters.indexOf(null);
    if (firstEmptyIndex === -1) return;

    const newScrambled = [...scrambledLetters];
    newScrambled.splice(indexInPool, 1);
    setScrambledLetters(newScrambled);
    
    const newSelected = [...selectedLetters];
    newSelected[firstEmptyIndex] = letter;
    setSelectedLetters(newSelected);

    if (newSelected.filter(l => l !== null).length === currentWord.length) {
      const spelledWord = newSelected.join('');
      if (spelledWord === currentWord) {
        let newCorrectCount = correctFirstTryCount;
        if (!hasFailedThisWord) {
          newCorrectCount += 1;
          setCorrectFirstTryCount(newCorrectCount);
        }
        
        setTimeout(() => {
          if (currentIndex < words.length - 1) {
            setCurrentIndex(prev => prev + 1);
          } else {
            // Calculate final score based on 100 total
            const pointsPerWord = 100 / words.length;
            const finalScore = Math.round(newCorrectCount * pointsPerWord);
            
            onFinish({
              totalScore: finalScore, 
              correctFirstTry: newCorrectCount,
              totalWords: words.length
            });
          }
        }, 600);
      } else {
        setIsWrong(true);
        setHasFailedThisWord(true);
        setTimeout(() => {
          setSelectedLetters(new Array(currentWord.length).fill(null));
          setScrambledLetters(shuffleLetters(currentWord));
          setIsWrong(false);
        }, 800);
      }
    }
  };

  const undoLetter = (indexInSlot: number) => {
    if (isWrong || selectedLetters[indexInSlot] === null) return;
    
    const letter = selectedLetters[indexInSlot];
    const newSelected = [...selectedLetters];
    newSelected[indexInSlot] = null; 
    setSelectedLetters(newSelected);
    
    setScrambledLetters(prev => [...prev, letter!]);
  };

  const progress = ((currentIndex) / words.length) * 100;
  const wordLen = currentWord.length;

  return (
    <div className="flex-1 flex flex-col h-full animate-in slide-in-from-bottom-2 duration-500 overflow-hidden">
      {/* HUD - Progress info */}
      <div className="flex-none w-full px-2 mb-1">
        <div className="flex justify-between items-center mb-1">
          <button 
            onClick={() => setShowExitConfirm(true)}
            className="px-3 py-1 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all uppercase tracking-widest flex items-center gap-1 shadow-sm active:scale-90"
          >
            <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Exit
          </button>
          <div className="text-[10px] font-black text-indigo-500 tracking-widest bg-indigo-50/50 px-3 py-1 rounded-full border border-indigo-100/50">
            {currentIndex + 1} / {words.length}
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-indigo-500 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Container - Centered core content */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 overflow-hidden">
        <div className="w-full flex flex-col items-center gap-3 md:gap-5">
          
          {/* 1. Audio Section (Horn) - Enlarged by ~2 font size steps */}
          <div className="flex-none flex flex-col items-center gap-1">
            <button 
              onClick={() => playAmericanPronunciation(currentWord)}
              className="audio-button-main flex items-center justify-center bg-white rounded-full shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all ring-4 ring-indigo-50/50 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-[55%] h-[55%] text-indigo-600 group-hover:text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>

          {/* 2. Spelling Slots Area */}
          <div className="flex-none flex items-center justify-center w-full px-2">
            <div className="flex flex-wrap justify-center gap-1 md:gap-2.5 max-w-full">
              {selectedLetters.map((letter, i) => (
                <div 
                  key={`slot-${i}`}
                  onClick={() => undoLetter(i)}
                  className={`spelling-slot flex items-center justify-center font-black transition-all border-b-4 md:border-b-8
                    ${isWrong ? 'border-red-300 text-red-500 animate-shake' : 'border-slate-100 text-indigo-950'}
                    ${letter ? 'bg-white rounded-t-xl shadow-md border-b-indigo-500 translate-y-[-2px]' : 'bg-slate-50/50 rounded-t-lg'}
                  `}
                  style={{
                    width: `clamp(1.8rem, ${85 / wordLen}vw, ${wordLen > 8 ? '3.2rem' : '4.8rem'})`,
                    height: `clamp(2.8rem, 11vh, ${wordLen > 8 ? '4rem' : '6.5rem'})`,
                    fontSize: `clamp(1.1rem, ${45 / wordLen}vw, 3.2rem)`
                  }}
                >
                  {letter || ''}
                </div>
              ))}
            </div>
          </div>

          {/* 3. Candidate Letter Pool */}
          <div className="flex-none flex flex-wrap justify-center gap-1.5 md:gap-3 max-w-full px-4">
            {scrambledLetters.map((letter, i) => (
              <button
                key={`pool-${letter}-${i}`}
                onClick={() => handleLetterClick(letter, i)}
                className="pool-button bg-white rounded-xl md:rounded-2xl shadow-sm border border-slate-100 text-indigo-800 
                           font-black hover:bg-indigo-50 hover:translate-y-[-2px] hover:shadow-md active:scale-90 transition-all"
                style={{
                  width: `clamp(2.3rem, 10vw, 3.8rem)`,
                  height: `clamp(2.3rem, 10vw, 3.8rem)`,
                  fontSize: `clamp(1rem, 4.5vw, 1.8rem)`
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Exit Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-xs w-full shadow-2xl text-center border border-slate-100">
            <h3 className="text-xl font-kids text-slate-800 mb-2 font-black">Leave Game?</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">Your current progress and score for this challenge will be reset.</p>
            <div className="flex flex-col gap-2">
              <button onClick={onBack} className="w-full py-4 bg-red-500 text-white rounded-2xl font-black shadow-lg shadow-red-100 active:scale-95 transition-all">Confirm Exit</button>
              <button onClick={() => setShowExitConfirm(false)} className="w-full py-3 bg-white text-slate-400 rounded-xl font-bold active:scale-95 transition-all">Stay Here</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .audio-button-main {
          width: clamp(3.5rem, 12vh, 5.5rem);
          height: clamp(3.5rem, 12vh, 5.5rem);
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-4px); }
          40%, 80% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out infinite;
        }

        /* Landscape Orientation Adjustments */
        @media (orientation: landscape) and (max-height: 500px) {
          .audio-button-main { width: 2.8rem; height: 2.8rem; }
          .spelling-slot { height: 3.2rem; }
          .pool-button { width: 2rem; height: 2rem; }
        }
      `}</style>
    </div>
  );
};

export default SpellingGame;
