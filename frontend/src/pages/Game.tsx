import { Link } from 'react-router-dom'

export default function Game() {
  return (
    <div style={{padding:20}}>
      <h1>Game</h1>
      <p>This is a blank game page to work on.</p>
      <p>
        <Link to="/login">Go to Login</Link>
      </p>
    </div>
  )
}
