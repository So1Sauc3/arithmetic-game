import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

function Instructions() {
  return (
    <div style={{padding:20, backgroundColor: '#f0f0f0'}}>
      <h2>Instructions</h2>
    </div>
  );
}

function NameEntry() {
  const [name, setName] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    console.log('Login button clicked');
    console.log('User entered name:', name);
    navigate('/game')
  }

  return (
    <div style={{padding:20, backgroundColor: '#f0f0f0'}}>
      <input 
        type="text" 
        placeholder="Enter your name" 
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button 
        style={{
          backgroundColor: name.trim() ? '#007bff' : '#ccc',
          color: 'white', 
          padding: '8px 16px', 
          border: 'none', 
          borderRadius: '4px',
          cursor: name.trim() ? 'pointer' : 'not-allowed'
        }}
        onClick={handleLogin}
        disabled={!name.trim()}
      >
        Login
      </button>
    </div>
    
  );
}

export default function Login() {
  return (
    <div style={{padding:20}}>
      <h1>Login</h1>
        <NameEntry />
    </div>
  )
}
