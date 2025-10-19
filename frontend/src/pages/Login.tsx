import { useState } from 'react'
import { usePage, CurrentPage } from '../PageProvider'

function Instructions() {
  return (
      <div className="space-y-2 text-sm">
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
      <input 
        type="text" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button 
        className={`px-4 py-2 rounded text-white transition-all duration-150 active:scale-95 ${
          name.trim() 
            ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer hover:scale-105' 
            : 'bg-red-400 cursor-not-allowed'
        }`}
        onClick={handleLogin}
        disabled={!name.trim()}
      >
      </button>
    </div>
    
  );
}

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-5">
      </div>
    </div>
  )
}
