// import { Routes, Route, Navigate } from 'react-router-dom'
import { usePage, CurrentPage } from './PageProvider.tsx'
import './App.css'

import Login from './pages/Login'
import Game from './pages/Game'
import Lobby from './pages/Lobby'

import ParticlesBackground from './components/ParticlesBackground'
import SmoothFollower from './components/SmoothFollower'


export default function App() {
  // const [page, setPage] = useState<CurrentPage>(true)

  const { page } = usePage()

  return (
      <div className="app-root">
        {/* ParticlesBackground is rendered once and positioned behind everything */}
        <ParticlesBackground />
        <SmoothFollower />

        <div className="app-content">
          {/* <nav style={{borderBottom:'1px solid #ddd'}}>
            <Link to="/login" style={{marginRight:10}}>Login</Link>
            <Link to="/game">Game</Link>
          </nav> */}
          {/* <main> */}
          {/*   <Routes> */}
          {/*     <Route path="/login" element={<Login />} /> */}
          {/*     <Route path="/lobby" element={<Lobby />} /> */}
          {/*     <Route path="/game" element={<Game />} /> */}
          {/*     <Route path="/" element={<Navigate to="/login" replace />} /> */}
          {/*   </Routes> */}
          {/* </main> */}

          {page == CurrentPage.Login && <Login />}
          {page == CurrentPage.Lobby && <Lobby />}
          {page == CurrentPage.Game && <Game />}
        </div>
      </div>
  )
}
