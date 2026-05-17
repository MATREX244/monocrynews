import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/', label: 'News' },
  { to: '/predictions', label: 'Predictions' },
  { to: '/markets', label: 'Markets' },
  { to: '/prices', label: 'Prices' },
  { to: '/directory', label: 'Directory' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b" style={{ background: '#0e0e0e', borderColor: '#1f1f1f' }}>
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo — use full 192px logo scaled down for crisp display */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img
            src="/logo-192.png"
            alt="Monocry"
            width="36"
            height="36"
            style={{ borderRadius: '6px', imageRendering: 'crisp-edges' }}
          />
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            MONOCRY
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.to
                  ? 'bg-mono-accent text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Hamburger (mobile) */}
        <button
          className="md:hidden text-gray-400 hover:text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            {menuOpen
              ? <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
              : <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
            }
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ borderColor: '#1f1f1f', background: '#0e0e0e' }}>
          {NAV_LINKS.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === l.to ? 'bg-mono-accent text-white' : 'text-gray-400'
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
