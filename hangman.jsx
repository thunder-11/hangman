import React, { useState, useEffect } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const HangmanPreview = () => {
  const wordCategories = {
    'Technology': [
      { word: 'COMPUTER', hint: 'Electronic device for processing data' },
      { word: 'GRAPHICS', hint: 'Visual images or designs' },
      { word: 'KEYBOARD', hint: 'Input device with keys' },
      { word: 'ALGORITHM', hint: 'Step-by-step problem-solving procedure' },
      { word: 'DATABASE', hint: 'Organized collection of data' }
    ],
    'Animals': [
      { word: 'ELEPHANT', hint: 'Largest land mammal' },
      { word: 'PENGUIN', hint: 'Flightless bird that swims' },
      { word: 'DOLPHIN', hint: 'Intelligent marine mammal' },
      { word: 'BUTTERFLY', hint: 'Insect with colorful wings' },
      { word: 'KANGAROO', hint: 'Australian hopping marsupial' }
    ],
    'Countries': [
      { word: 'AUSTRALIA', hint: 'Land down under' },
      { word: 'CANADA', hint: 'Home of maple syrup' },
      { word: 'EGYPT', hint: 'Land of pyramids' },
      { word: 'BRAZIL', hint: 'Largest South American country' },
      { word: 'JAPAN', hint: 'Land of the rising sun' }
    ]
  };
  
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [category, setCategory] = useState('');
  const [guessedLetters, setGuessedLetters] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintRevealed, setHintRevealed] = useState(false);
  const [score, setScore] = useState(0);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [difficulty, setDifficulty] = useState('medium');
  const [showStats, setShowStats] = useState(false);
  const [usedWords, setUsedWords] = useState(new Set());
  const maxWrongGuesses = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 6 : 4;

  const getLevelRequirements = (level) => {
    const requirements = {
      1: { name: 'Beginner', scoreNeeded: 0, lives: 8, timeBonus: false },
      2: { name: 'Novice', scoreNeeded: 200, lives: 7, timeBonus: false },
      3: { name: 'Apprentice', scoreNeeded: 500, lives: 6, timeBonus: true },
      4: { name: 'Skilled', scoreNeeded: 900, lives: 6, timeBonus: true },
      5: { name: 'Expert', scoreNeeded: 1400, lives: 5, timeBonus: true },
      6: { name: 'Master', scoreNeeded: 2000, lives: 5, timeBonus: true },
      7: { name: 'Grandmaster', scoreNeeded: 2700, lives: 4, timeBonus: true },
      8: { name: 'Legend', scoreNeeded: 3500, lives: 4, timeBonus: true },
      9: { name: 'Mythic', scoreNeeded: 4500, lives: 3, timeBonus: true },
      10: { name: 'Divine', scoreNeeded: 6000, lives: 3, timeBonus: true }
    };
    return requirements[level] || requirements[10];
  };

  const getNextLevelScore = () => {
    const nextLevel = currentLevel + 1;
    if (nextLevel > 10) return null;
    return getLevelRequirements(nextLevel).scoreNeeded;
  };

  useEffect(() => {
    startNewGame();
  }, []);

  useEffect(() => {
    // Level up based on score
    const nextLevelScore = getNextLevelScore();
    if (nextLevelScore && score >= nextLevelScore && currentLevel < 10) {
      setCurrentLevel(currentLevel + 1);
    }
  }, [score]);

  const startNewGame = () => {
    const categories = Object.keys(wordCategories);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const categoryWords = wordCategories[randomCategory];
    
    // Filter out used words
    const availableWords = categoryWords.filter(w => !usedWords.has(w.word));
    
    // If all words used, reset
    if (availableWords.length === 0) {
      setUsedWords(new Set());
      const randomWordObj = categoryWords[Math.floor(Math.random() * categoryWords.length)];
      setWord(randomWordObj.word);
      setHint(randomWordObj.hint);
      setUsedWords(new Set([randomWordObj.word]));
    } else {
      const randomWordObj = availableWords[Math.floor(Math.random() * availableWords.length)];
      setWord(randomWordObj.word);
      setHint(randomWordObj.hint);
      setUsedWords(new Set([...usedWords, randomWordObj.word]));
    }
    
    setCategory(randomCategory);
    setGuessedLetters(new Set());
    
    // Set lives based on current level
    const levelInfo = getLevelRequirements(currentLevel);
    setWrongGuesses(0);
    
    setGameStatus('playing');
    setHintRevealed(false);
  };

  const nextLevel = () => {
    startNewGame();
  };

  const revealHint = () => {
    if (!hintRevealed && gameStatus === 'playing') {
      setHintRevealed(true);
      setHintsUsed(hintsUsed + 1);
    }
  };

  const revealLetter = () => {
    if (gameStatus !== 'playing') return;
    
    const unguessedLetters = word.split('').filter(letter => !guessedLetters.has(letter));
    if (unguessedLetters.length > 0) {
      const randomLetter = unguessedLetters[Math.floor(Math.random() * unguessedLetters.length)];
      handleLetterClick(randomLetter, true);
    }
  };

  const handleLetterClick = (letter, isFreeReveal = false) => {
    if (gameStatus !== 'playing' || guessedLetters.has(letter)) return;

    const newGuessed = new Set(guessedLetters);
    newGuessed.add(letter);
    setGuessedLetters(newGuessed);

    const levelInfo = getLevelRequirements(currentLevel);
    const maxLives = levelInfo.lives;

    if (!word.includes(letter) && !isFreeReveal) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= maxLives) {
        setGameStatus('lost');
        setGamesPlayed(gamesPlayed + 1);
      }
    } else {
      const allLettersGuessed = word.split('').every(l => newGuessed.has(l));
      if (allLettersGuessed) {
        setGameStatus('won');
        const bonusPoints = (maxLives - wrongGuesses) * 10;
        const hintPenalty = hintsUsed * 5;
        const levelBonus = currentLevel * 20;
        const finalScore = Math.max(0, 100 + bonusPoints + levelBonus - hintPenalty);
        setScore(score + finalScore);
        setGamesPlayed(gamesPlayed + 1);
      }
    }
  };

  const getDisplayWord = () => {
    return word.split('').map(letter => 
      guessedLetters.has(letter) ? letter : '_'
    ).join(' ');
  };

  const drawHangman = () => {
    const levelInfo = getLevelRequirements(currentLevel);
    const maxLives = levelInfo.lives;
    const wrongGuessesForDisplay = Math.floor((wrongGuesses / maxLives) * 6);
    
    return (
      <svg width="200" height="250" className="mx-auto">
        {/* Gallows */}
        <line x1="20" y1="230" x2="180" y2="230" stroke="#8B4513" strokeWidth="4" />
        <line x1="50" y1="230" x2="50" y2="20" stroke="#8B4513" strokeWidth="4" />
        <line x1="50" y1="20" x2="130" y2="20" stroke="#8B4513" strokeWidth="4" />
        <line x1="130" y1="20" x2="130" y2="50" stroke="#8B4513" strokeWidth="4" />
        
        {/* Head */}
        {wrongGuessesForDisplay >= 1 && (
          <circle cx="130" cy="70" r="20" stroke="#000" strokeWidth="3" fill="none" />
        )}
        
        {/* Body */}
        {wrongGuessesForDisplay >= 2 && (
          <line x1="130" y1="90" x2="130" y2="150" stroke="#000" strokeWidth="3" />
        )}
        
        {/* Left Arm */}
        {wrongGuessesForDisplay >= 3 && (
          <line x1="130" y1="110" x2="100" y2="130" stroke="#000" strokeWidth="3" />
        )}
        
        {/* Right Arm */}
        {wrongGuessesForDisplay >= 4 && (
          <line x1="130" y1="110" x2="160" y2="130" stroke="#000" strokeWidth="3" />
        )}
        
        {/* Left Leg */}
        {wrongGuessesForDisplay >= 5 && (
          <line x1="130" y1="150" x2="110" y2="190" stroke="#000" strokeWidth="3" />
        )}
        
        {/* Right Leg */}
        {wrongGuessesForDisplay >= 6 && (
          <line x1="130" y1="150" x2="150" y2="190" stroke="#000" strokeWidth="3" />
        )}
      </svg>
    );
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">LEXICON PROTOCOL</h1>
          <p className="text-blue-200 text-lg">Advanced Hangman System</p>
          
          {/* Level Display */}
          <div className="mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg p-4 inline-block">
            <div className="text-white">
              <p className="text-sm font-semibold">LEVEL {currentLevel} - {getLevelRequirements(currentLevel).name.toUpperCase()}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="bg-white/30 rounded-full h-3 flex-1 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-500"
                    style={{ 
                      width: `${getNextLevelScore() ? ((score - getLevelRequirements(currentLevel).scoreNeeded) / (getNextLevelScore() - getLevelRequirements(currentLevel).scoreNeeded)) * 100 : 100}%` 
                    }}
                  />
                </div>
                <p className="text-sm font-bold whitespace-nowrap">
                  {getNextLevelScore() ? `${score} / ${getNextLevelScore()}` : 'MAX LEVEL'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex justify-center gap-6 mt-4 text-white flex-wrap">
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-bold">Score: </span>{score}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-bold">Games: </span>{gamesPlayed}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-bold">Lives: </span>{getLevelRequirements(currentLevel).lives}
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-lg">
              <span className="font-bold">Category: </span>{category}
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Hangman Drawing */}
          <div className="bg-white/90 rounded-xl p-6 mb-6">
            {drawHangman()}
            <div className="text-center mt-4">
              <p className="text-lg font-semibold text-gray-700">
                Wrong Guesses: {wrongGuesses} / {getLevelRequirements(currentLevel).lives}
              </p>
              <div className="flex justify-center gap-1 mt-2">
                {Array.from({ length: getLevelRequirements(currentLevel).lives }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i < wrongGuesses ? 'bg-red-500' : 'bg-green-500'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Word Display */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-8 mb-6 text-center">
            <p className="text-4xl font-mono font-bold text-white tracking-widest">
              {getDisplayWord()}
            </p>
            
            {/* Hint Section */}
            <div className="mt-6 space-y-3">
              {!hintRevealed && gameStatus === 'playing' && (
                <button
                  onClick={revealHint}
                  className="bg-yellow-400 text-purple-900 px-6 py-2 rounded-lg font-bold hover:bg-yellow-300 transition-all"
                >
                  💡 Show Hint (-5 points)
                </button>
              )}
              
              {hintRevealed && (
                <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                  <p className="text-yellow-300 font-bold text-sm mb-1">HINT:</p>
                  <p className="text-white text-lg">{hint}</p>
                </div>
              )}
              
              {gameStatus === 'playing' && (
                <button
                  onClick={revealLetter}
                  className="bg-green-400 text-purple-900 px-6 py-2 rounded-lg font-bold hover:bg-green-300 transition-all ml-2"
                >
                  🎁 Reveal Letter (Free)
                </button>
              )}
            </div>
          </div>

          {/* Game Status */}
          {gameStatus !== 'playing' && (
            <div className={`rounded-xl p-6 mb-6 text-center ${
              gameStatus === 'won' 
                ? 'bg-green-500/20 border-2 border-green-400' 
                : 'bg-red-500/20 border-2 border-red-400'
            }`}>
              <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${
                gameStatus === 'won' ? 'text-green-400' : 'text-red-400'
              }`} />
              <h2 className={`text-3xl font-bold mb-2 ${
                gameStatus === 'won' ? 'text-green-400' : 'text-red-400'
              }`}>
                {gameStatus === 'won' ? 'LEVEL COMPLETE! 🎉' : 'LEVEL FAILED! 💀'}
              </h2>
              <p className="text-white text-xl mb-2">
                The word was: <span className="font-bold">{word}</span>
              </p>
              {gameStatus === 'won' && (
                <div className="space-y-2 mb-4">
                  <p className="text-yellow-300 text-lg font-bold">
                    +{Math.max(0, 100 + (getLevelRequirements(currentLevel).lives - wrongGuesses) * 10 + currentLevel * 20 - hintsUsed * 5)} points!
                  </p>
                  <div className="text-sm text-blue-200">
                    <p>Base: 100 | Lives Bonus: +{(getLevelRequirements(currentLevel).lives - wrongGuesses) * 10}</p>
                    <p>Level Bonus: +{currentLevel * 20} | Hints: -{hintsUsed * 5}</p>
                  </div>
                  {currentLevel < 10 && score >= getNextLevelScore() && (
                    <p className="text-yellow-400 text-lg font-bold animate-pulse mt-2">
                      🎊 LEVEL UP! Now Level {currentLevel + 1}!
                    </p>
                  )}
                </div>
              )}
              <p className="text-blue-200 mb-4">
                Hint: {hint}
              </p>
              <button
                onClick={nextLevel}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-8 py-4 rounded-lg font-bold hover:from-green-600 hover:to-blue-600 transition-all flex items-center gap-2 mx-auto text-lg shadow-lg"
              >
                {gameStatus === 'won' ? '➡️ Next Challenge' : '🔄 Try Again'}
              </button>
            </div>
          )}

          {/* Keyboard */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {alphabet.map(letter => {
              const isGuessed = guessedLetters.has(letter);
              const isCorrect = isGuessed && word.includes(letter);
              const isWrong = isGuessed && !word.includes(letter);
              
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={gameStatus !== 'playing' || isGuessed}
                  className={`
                    h-12 rounded-lg font-bold text-lg transition-all transform hover:scale-105
                    ${isCorrect ? 'bg-green-500 text-white' : ''}
                    ${isWrong ? 'bg-red-500 text-white' : ''}
                    ${!isGuessed && gameStatus === 'playing' ? 'bg-white/90 text-purple-900 hover:bg-purple-200' : ''}
                    ${isGuessed || gameStatus !== 'playing' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>

          {/* Info Panel */}
          <div className="bg-white/10 rounded-lg p-4 text-white">
            <h3 className="font-bold text-lg mb-2 text-yellow-300">📝 Game Progression:</h3>
            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              {Array.from({ length: 10 }).map((_, i) => {
                const level = i + 1;
                const levelInfo = getLevelRequirements(level);
                const isUnlocked = score >= levelInfo.scoreNeeded;
                const isCurrent = level === currentLevel;
                return (
                  <div 
                    key={level}
                    className={`p-2 rounded ${
                      isCurrent 
                        ? 'bg-yellow-500/30 border border-yellow-400' 
                        : isUnlocked 
                        ? 'bg-green-500/20' 
                        : 'bg-gray-500/20'
                    }`}
                  >
                    <p className="font-bold">Lv{level}: {levelInfo.name}</p>
                    <p className="text-xs">{levelInfo.lives} lives | {levelInfo.scoreNeeded} pts</p>
                  </div>
                );
              })}
            </div>
            
            <h3 className="font-bold text-lg mb-2 text-yellow-300 mt-4">📖 How to Play:</h3>
            <ul className="text-sm space-y-1 text-blue-100">
              <li>• Click letters to guess the hidden word</li>
              <li>• Use hints to get clues (-5 points)</li>
              <li>• Reveal random correct letters for free</li>
              <li>• Progress through 10 levels with increasing difficulty</li>
              <li>• Higher levels = fewer lives but more bonus points!</li>
            </ul>
            
            <div className="mt-4 pt-4 border-t border-white/20">
              <h4 className="font-bold text-yellow-300 mb-2">🏆 Scoring System:</h4>
              <ul className="text-sm space-y-1 text-blue-100">
                <li>• Base score: 100 points per win</li>
                <li>• Lives bonus: +10 points per remaining life</li>
                <li>• Level bonus: +{currentLevel * 20} points at your level</li>
                <li>• Hint penalty: -5 points per hint used</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/70 text-sm">
          <p>💻 Lexicon Protocol - 10 Level Progressive Hangman System</p>
          <p>Original graphics.h implementation uses: initgraph(), circle(), line(), outtextxy(), kbhit(), getch()</p>
        </div>
      </div>
    </div>
  );
};

export default HangmanPreview;
