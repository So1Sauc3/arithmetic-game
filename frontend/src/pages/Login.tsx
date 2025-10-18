import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div style={{padding:20}}>
      <h1>Login</h1>
      <p>This is a blank login page to work on.</p>
      <p>
        <Link to="/game">Go to Game</Link>
      </p>
    </div>
  )
}
