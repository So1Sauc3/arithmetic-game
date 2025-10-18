import { Routes, Route, Link, Navigate } from 'react-router-dom'
import './App.css'

import Login from './pages/Login'
import Game from './pages/Game'
import ParticlesBackground from './components/ui/ParticlesBackground'

export default function App() {
  return (
    <div className="app-root">
      {/* ParticlesBackground is rendered once and positioned behind everything */}
      <ParticlesBackground />

      <div className="app-content">
        {/* <nav style={{borderBottom:'1px solid #ddd'}}>
          <Link to="/login" style={{marginRight:10}}>Login</Link>
          <Link to="/game">Game</Link>
        </nav> */}
        <main>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/game" element={<Game />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
