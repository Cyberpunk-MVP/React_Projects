import React, { useState, useEffect, useRef, useCallback } from 'react';
// Removed: import * as Tone from 'https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.js';
// Tone.js is now expected to be loaded globally via a <script> tag in the HTML.

// Define different square types with their properties
const SQUARE_TYPES = [
  { id: 'small', size: 30, color: 'bg-purple-600', points: 3, speedFactor: 0.8 },
  { id: 'medium', size: 50, color: 'bg-purple-500', points: 2, speedFactor: 1 },
  { id: 'large', size: 70, color: 'bg-purple-400', points: 1, speedFactor: 1.2 },
];

// Initialize sound effects outside the component to prevent re-initialization
// Ensure Tone is available before trying to initialize synths
let clickSynth = null;
let startSynth = null;
let gameOverSynth = null;

// Function to initialize Tone.js synths
const initializeSynths = () => {
  if (window.Tone && !clickSynth) { // Check if Tone is available and synths not yet initialized
    clickSynth = new window.Tone.Synth().toDestination();
    startSynth = new window.Tone.PolySynth(window.Tone.Synth).toDestination();
    gameOverSynth = new window.Tone.PolySynth(window.Tone.Synth).toDestination();
  }
};

function App() {
  // Game state variables
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15); // Increased game time for more play
  const [gameStarted, setGameStarted] = useState(false);
  const [countdown, setCountdown] = useState(3); // Countdown before game starts
  const [squarePosition, setSquarePosition] = useState({ top: '50%', left: '50%' });
  const [currentSquareType, setCurrentSquareType] = useState(SQUARE_TYPES[1]); // Default to medium
  const [highScore, setHighScore] = useState(0);
  const [isClicked, setIsClicked] = useState(false); // For visual click feedback

  // Refs for intervals
  const gameTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);
  const squareMoveIntervalRef = useRef(null);
  const currentMoveSpeedRef = useRef(800); // Initial speed for square movement

  // Load high score from local storage on component mount
  useEffect(() => {
    const savedHighScore = localStorage.getItem('clickTheSquareHighScore');
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10));
    }
    initializeSynths(); // Initialize synths when component mounts
  }, []);

  // Function to play a sound
  const playSound = useCallback((synth, notes, duration) => {
    if (synth) { // Ensure synth is initialized before playing
      if (Array.isArray(notes)) {
        synth.triggerAttackRelease(notes, duration);
      } else {
        synth.triggerAttackRelease(notes, duration);
      }
    } else {
      console.warn("Sound synth not initialized. Cannot play sound.");
    }
  }, []);

  // Function to move the square to a random position
  const moveSquare = useCallback(() => {
    const gameArea = document.getElementById('game-area');
    if (gameArea) {
      const gameAreaWidth = gameArea.offsetWidth;
      const gameAreaHeight = gameArea.offsetHeight;
      const squareSize = currentSquareType.size;

      const randomTop = Math.random() * (gameAreaHeight - squareSize);
      const randomLeft = Math.random() * (gameAreaWidth - squareSize);

      setSquarePosition({
        top: `${randomTop}px`,
        left: `${randomLeft}px`,
      });

      // Randomly select next square type for the next move
      const randomIndex = Math.floor(Math.random() * SQUARE_TYPES.length);
      setCurrentSquareType(SQUARE_TYPES[randomIndex]);
    }
  }, [currentSquareType.size]); // Dependency on currentSquareType.size to recalculate bounds

  // Function to start the game
  const startGame = () => {
    setScore(0);
    setTimeLeft(15);
    setCountdown(3);
    setGameStarted(false); // Game not started until countdown finishes
    currentMoveSpeedRef.current = 800; // Reset speed for new game

    // Clear any existing intervals to prevent multiple timers running
    clearInterval(gameTimerRef.current);
    clearInterval(countdownTimerRef.current);
    clearInterval(squareMoveIntervalRef.current);

    // Play start sound
    playSound(startSynth, ['C4', 'E4', 'G4'], '8n');

    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prevCount) => {
        if (prevCount <= 1) {
          clearInterval(countdownTimerRef.current);
          setGameStarted(true); // Actual game starts
          moveSquare(); // Initial square position for the game
          // Start game timer
          gameTimerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
              if (prevTime <= 1) {
                clearInterval(gameTimerRef.current);
                clearInterval(squareMoveIntervalRef.current);
                setGameStarted(false); // End the game
                setCountdown(0); // Ensure countdown is 0 for game over screen
                // Update high score if current score is higher
                setHighScore((prevHighScore) => {
                  if (score > prevHighScore) {
                    localStorage.setItem('clickTheSquareHighScore', score.toString());
                    return score;
                  }
                  return prevHighScore;
                });
                playSound(gameOverSynth, ['C3', 'G2'], '2n'); // Game over sound
                return 0;
              }
              return prevTime - 1;
            });
          }, 1000);

          // Start moving the square with dynamic speed
          squareMoveIntervalRef.current = setInterval(() => {
            moveSquare();
            // Increase difficulty by making square move faster
            // Reduce interval by 50ms every 3 seconds, but not faster than 100ms
            if (timeLeft > 0 && timeLeft % 3 === 0 && currentMoveSpeedRef.current > 100) {
              currentMoveSpeedRef.current = Math.max(100, currentMoveSpeedRef.current - 50);
              clearInterval(squareMoveIntervalRef.current); // Clear old interval
              squareMoveIntervalRef.current = setInterval(moveSquare, currentMoveSpeedRef.current); // Start new interval
            }
          }, currentMoveSpeedRef.current);

          return 0; // End countdown
        }
        return prevCount - 1;
      });
    }, 1000);
  };

  // Function to handle square click
  const handleSquareClick = () => {
    if (gameStarted) {
      setScore((prevScore) => prevScore + currentSquareType.points); // Add points based on square type
      moveSquare(); // Move square immediately after click
      playSound(clickSynth, 'C5', '8n'); // Play click sound

      // Visual feedback: brief color change
      setIsClicked(true);
      setTimeout(() => {
        setIsClicked(false);
      }, 100); // Reset after 100ms
    }
  };

  // Cleanup intervals when component unmounts
  useEffect(() => {
    return () => {
      clearInterval(gameTimerRef.current);
      clearInterval(countdownTimerRef.current);
      clearInterval(squareMoveIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-gray-200 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-700 mb-6">
          Click the Square!
        </h1>

        <div className="flex justify-around items-center mb-6 text-xl font-semibold">
          <p>Score: <span className="text-green-600">{score}</span></p>
          <p>Time Left: <span className="text-red-600">{timeLeft}s</span></p>
          <p>High Score: <span className="text-blue-600">{highScore}</span></p>
        </div>

        {/* Game Overlay for Start/Game Over/Countdown */}
        {!gameStarted && (countdown > 0 || timeLeft === 0) && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center rounded-xl z-10">
            {countdown > 0 ? (
              <p className="text-6xl font-extrabold text-purple-700 animate-pulse">{countdown}</p>
            ) : (
              <>
                <p className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">Game Over!</p>
                <p className="text-2xl mb-6">Your final score: <span className="text-green-600 font-bold">{score}</span></p>
                {score > highScore && (
                  <p className="text-xl font-bold text-yellow-500 mb-4 animate-bounce">NEW HIGH SCORE!</p>
                )}
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105"
                >
                  Play Again
                </button>
              </>
            )}
          </div>
        )}

        {/* Game Area */}
        <div
          id="game-area"
          className="relative w-full h-80 bg-gray-100 border-2 border-purple-300 rounded-lg overflow-hidden cursor-crosshair"
          style={{
            backgroundImage: 'linear-gradient(45deg, #e0c3fc 25%, transparent 25%, transparent 75%, #e0c3fc 75%, #e0c3fc), linear-gradient(45deg, #e0c3fc 25%, transparent 25%, transparent 75%, #e0c3fc 75%, #e0c3fc)',
            backgroundSize: '40px 40px',
            backgroundPosition: '0 0, 20px 20px',
          }}
        >
          {gameStarted && (
            <div
              onClick={handleSquareClick}
              className={`absolute rounded-lg shadow-md cursor-pointer transition-all duration-100 ease-linear transform ${isClicked ? 'bg-yellow-400 scale-110' : `${currentSquareType.color} hover:scale-110`}`}
              style={{
                top: squarePosition.top,
                left: squarePosition.left,
                width: `${currentSquareType.size}px`,
                height: `${currentSquareType.size}px`,
              }}
            ></div>
          )}
        </div>

        {/* Start Game Button (only visible initially or after game over) */}
        {!gameStarted && countdown === 3 && timeLeft === 15 && (
          <div className="mt-6">
            <button
              onClick={startGame}
              className="px-8 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 ease-in-out transform hover:scale-105"
            >
              Start Game
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
