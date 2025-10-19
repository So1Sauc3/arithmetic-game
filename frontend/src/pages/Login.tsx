import { useState } from 'react'
import { usePage, CurrentPage } from '../PageProvider'
import Plate from '@/components/Plate';

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
  const { setPage, connectSocket } = usePage();

  const handleEnterLogin = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key == "Enter") {
      await handleLogin()
    }
  }

  const handleLogin = async () => {
    console.log('Login button clicked');
    console.log('User entered name:', name);
    await connectSocket(name);
    setPage(CurrentPage.Lobby)
  }

  return (
    <div className="flex flex-col p-5 bg-blue-100/20 border-2 my-2">
      <input 
        type="text" 
        placeholder="Display Name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleEnterLogin} 
        className="h-12 mb-5 mr-2 px-3 py-1 border border-gray-300 text-white"
      />
      <button 
        className="border-1 max-w-30 px-4 py-2 text-white transition-all duration-150 active:scale-95"
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
    <div className="w-screen h-screen flex flex-col items-center justify-center p-4">
      <div className="w-[800px]">
        <h4 className="w-full text-8xl font-parismatch text-[#E8D8A1] mb-8">Multi-Mac</h4>
        <div className="gap-4 w-full content-center px-4 md:px-8 lg:px-16 pointer-events-auto">
          <NameEntry />
          <Instructions />
        </div>
      </div>
    </div>
  )
}
