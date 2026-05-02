import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()

  return (
    <nav>
      <Link to="/" className="logo">Project Portfolio</Link>
      <div className="nav-links">
        <Link to="/">Dashboard</Link>
        <Link to="/projects">Projects</Link>
        <span style={{ color: 'white', fontSize: '13px', marginLeft: '18px' }}>
          Hi, {user?.name}
          <span className={`badge badge-${user?.role}`} style={{ marginLeft: '6px' }}>{user?.role}</span>
        </span>
        <button onClick={logout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
