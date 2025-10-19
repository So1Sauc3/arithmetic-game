import { useState } from 'react'
import { usePage, CurrentPage } from '../PageProvider'

function Instructions() {
  return (
    <div className="p-5 bg-blue-100/20 border-2 border-blue-200 my-2">
      <h2 className="text-xl font-bold text-blue-200 mb-4">Instructions</h2>
      <div className="space-y-2 text-sm">
        <p className="font-semibold text-gray-200">⏱️ This is a 5 MINUTE multiplayer math game</p>
        <p className="text-gray-100">👥 There are up to 30 players in the Lobby</p>
        <p className="text-gray-100">📈 Difficulty multiplier 1-10, every 5 questions increase by 1</p>
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
    <div className="flex flex-col p-5 bg-blue-100/20 border-2 my-2">
      <input 
        type="text" 
        placeholder="Display Name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 mb-5 mr-2 px-3 py-1 border border-gray-300 text-white"
      />
      <button 
<<<<<<< HEAD
        className={`px-4 py-2 rounded text-white transition-all duration-150 active:scale-95 ${
          name.trim() 
            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer hover:scale-105' 
            : 'bg-red-400 cursor-not-allowed'
        }`}
=======
        className="border-1 max-w-30 px-4 py-2 text-white transition-all duration-150 active:scale-95"
>>>>>>> f5e773a809c5ddcf09427f137cbe3af9648cc2c0
        onClick={handleLogin}
        disabled={!name.trim()}
      >
        Connect
      </button>
    </div>
    
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      {/* <h1 className="text-2xl font-bold mb-8 text-white">Login</h1> */}
      <div className="gap-4 max-w-4xl w-full content-center">
        <NameEntry />
        <Instructions />
      </div>
    </div>
  )
}
