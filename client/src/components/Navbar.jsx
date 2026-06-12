import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()

  return (
    <header className="no-print sticky top-0 z-40 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">
        <Link to="/app" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-white font-bold text-lg shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
            R
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            ResumeBuilder
          </span>
        </Link>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
            <span className="text-sm font-semibold text-slate-700">
              Hi, {user?.name || 'User'}
            </span>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 hover:text-orange-600 hover:border-orange-200 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  )
}

export default Navbar