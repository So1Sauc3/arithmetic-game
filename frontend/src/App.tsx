import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import * as comm from './lib/comm.ts'

import Login from './pages/Login'
import Game from './pages/Game'
import Lobby from './pages/Lobby'

import ParticlesBackground from './components/ParticlesBackground'

export default function App() {
  (window as any).sockets = comm;

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
            <Route path="/lobby" element={<Lobby />} />
            <Route path="/game" element={<Game />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
