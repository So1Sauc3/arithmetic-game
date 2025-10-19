import { useState } from 'react'
import { usePage, CurrentPage } from '../PageProvider'

function Instructions() {
  return (
    <div className="p-5 bg-gray-100 border-2 border-blue-500 rounded-lg my-2">
      <h2 className="text-xl font-bold text-blue-600 mb-4">Instructions</h2>
      <div className="space-y-2 text-sm">
        <p className="font-semibold text-gray-800">⏱️ This is a 5 MINUTE multiplayer math game</p>
        <p className="text-gray-700">👥 There are up to 30 players in the Lobby</p>
        <p className="text-gray-700">📈 Difficulty multiplier 1-10, every 5 questions increase by 1</p>
      </div>
    </div>
  );
}

function NameEntry() {
  const [name, setName] = useState('')
  const { setPage } = usePage();

  const handleLogin = () => {
    console.log('Login button clicked');
    console.log('User entered name:', name);
    setPage(CurrentPage.Lobby)
  }

  return (
    <div className="p-5 bg-gray-100 border-2 border-green-500 rounded-lg my-2">
      <input 
        type="text" 
        placeholder="Enter your name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mr-2 px-3 py-1 border border-gray-300 rounded"
      />
      <button 
        className={`px-4 py-2 rounded text-white transition-all duration-150 active:scale-95 ${
          name.trim() 
            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer hover:scale-105' 
            : 'bg-gray-400 cursor-not-allowed'
        }`}
        onClick={handleLogin}
        disabled={!name.trim()}
      >
        Enter Lobby
      </button>
    </div>
    
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      <h1 className="text-2xl font-bold mb-8 text-white">Login</h1>
      <div className="flex gap-4 max-w-4xl w-full">
        <div className="flex-1">
          <NameEntry />
        </div>
        <div className="flex-1">
          <Instructions />
        </div>
      </div>
    </div>
  )
}
