import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function GameInfo() {
    const [currentTip, setCurrentTip] = useState(0);
    
    const tips = [
        {
            icon: "🎮",
            title: "Game Duration",
            description: "This is a 5 minute multiplayer math game"
        },
        {
            icon: "👥",
            title: "Player Count",
            description: "There are up to 30 players in the Lobby"
        },
        {
            icon: "📈",
            title: "Difficulty",
            description: "Difficulty multiplier 1-10, increases every 5 questions"
        },
        {
            icon: "⚡",
            title: "Speed",
            description: "Answer quickly! Faster responses earn more points"
        },
        {
            icon: "🏆",
            title: "Scoring",
            description: "Correct answers give points, wrong answers deduct time"
        },
        {
            icon: "🎯",
            title: "Strategy",
            description: "Focus on accuracy first, then speed up as you get comfortable"
        }
    ];

    // Auto-advance tips every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [tips.length]);

    const nextTip = () => {
        setCurrentTip((prev) => (prev + 1) % tips.length);
    };

    const prevTip = () => {
        setCurrentTip((prev) => (prev - 1 + tips.length) % tips.length);
    };

    return (
        <div className="p-5 bg-gray-100 border-2 border-blue-500 rounded-lg my-2">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Game Tips</h2>
            
            <div className="bg-white rounded-lg p-4 mb-4 h-[160px] flex flex-col justify-center">
                <div className="text-center">
                    <div className="text-3xl mb-2">{tips[currentTip].icon}</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2">{tips[currentTip].title}</h3>
                    <p className="text-gray-700 leading-tight">{tips[currentTip].description}</p>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button 
                    onClick={prevTip}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm transition-colors text-white"
                >
                    ← Previous
                </button>
                
                <div className="flex space-x-1">
                    {tips.map((_, index) => (
                        <div
                            key={index}
                            className={`w-2 h-2 rounded-full ${
                                index === currentTip ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        />
                    ))}
                </div>
                
                <button 
                    onClick={nextTip}
                    className="px-3 py-1 bg-gray-300 hover:bg-gray-400 rounded text-sm transition-colors text-white"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}

function PlayerList() {
  return (
    <div className="p-5 bg-gray-100 border-2 border-blue-500 rounded-lg my-2">
        <h2 className="text-xl font-bold text-blue-600 mb-4">Players</h2>
        <div className="space-y-2 text-sm">
            
        </div>
    </div>
  );
}

export default function Lobby() {
  const navigate = useNavigate();

  const handleLeaveLobby = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <div className="flex justify-between items-center w-full max-w-4xl mb-8">
        <h1 className="text-2xl font-bold text-white">Lobby</h1>
        <button 
          onClick={handleLeaveLobby}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Leave Lobby
        </button>
      </div>
      <div className="flex gap-4 max-w-4xl w-full">
        <div className="flex-1">
          <PlayerList />
        </div>
        <div className="flex-1">
          <GameInfo />
        </div>
      </div>
    </div>
  )
}