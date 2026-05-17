import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import { getFingerprint, getSessionData } from './lib/fingerprint'

import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import CookieConsent from './components/CookieConsent'

import HomePage from './pages/HomePage'
import ArticlePage from './pages/ArticlePage'
import PredictionsPage from './pages/PredictionsPage'
import PricePage from './pages/PricePage'
import MarketsPage from './pages/MarketsPage'
import DirectoryPage from './pages/DirectoryPage'
import AdminAuthPage from './pages/AdminAuthPage'
import AdminPanel from './pages/AdminPanel'

// Lazy-loaded static pages
import { lazy, Suspense } from 'react'
const StaticPage = lazy(() => import('./pages/StaticPage'))

// ── Public layout (with navbar + footer) ──────────────────────────
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#111111' }}>
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}

// ── Session tracking (fires once on load) ─────────────────────────
async function initSession() {
  try {
    const fp = await getFingerprint()
    const sessionKey = `mono_session_${fp}`

    // Restore session from localStorage if logged in before
    const savedSession = localStorage.getItem(sessionKey)
    let sessionId = savedSession ? JSON.parse(savedSession).session_id : null

    if (!sessionId) {
      // Create new session in Supabase
      const sessionData = {
        fingerprint: fp,
        ...getSessionData(),
        pages_visited: [window.location.pathname],
      }
      const { data } = await supabase.from('user_sessions').insert(sessionData).select('session_id').maybeSingle()
      if (data?.session_id) {
        sessionId = data.session_id
        localStorage.setItem(sessionKey, JSON.stringify({ session_id: sessionId, created: Date.now() }))
      }
    }

    // Track page visits
    if (sessionId) {
      await supabase.from('user_sessions').update({
        pages_visited: [window.location.pathname],
        updated_at: new Date().toISOString()
      }).eq('session_id', sessionId)
    }
  } catch { /* session tracking is non-critical */ }
}

// ── Admin guard ────────────────────────────────────────────────────
function AdminGuard({ children }) {
  const token = sessionStorage.getItem('mono_admin_token')
  const wallet = sessionStorage.getItem('mono_admin_wallet')
  if (token !== 'verified' || !wallet) return <Navigate to="/admin" replace />
  return children
}

export default function App() {
  useEffect(() => {
    initSession()
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/news/:slugOrId" element={<PublicLayout><ArticlePage /></PublicLayout>} />
        <Route path="/predictions" element={<PublicLayout><PredictionsPage /></PublicLayout>} />
        <Route path="/markets" element={<PublicLayout><MarketsPage /></PublicLayout>} />
        <Route path="/prices" element={<PublicLayout><PricePage /></PublicLayout>} />
        <Route path="/directory" element={<PublicLayout><DirectoryPage /></PublicLayout>} />

        {/* Static pages */}
        <Route path="/about"     element={<PublicLayout><Suspense fallback={null}><StaticPage page="about" /></Suspense></PublicLayout>} />
        <Route path="/contact"   element={<PublicLayout><Suspense fallback={null}><StaticPage page="contact" /></Suspense></PublicLayout>} />
        <Route path="/privacy"   element={<PublicLayout><Suspense fallback={null}><StaticPage page="privacy" /></Suspense></PublicLayout>} />
        <Route path="/terms"     element={<PublicLayout><Suspense fallback={null}><StaticPage page="terms" /></Suspense></PublicLayout>} />
        <Route path="/cookies"   element={<PublicLayout><Suspense fallback={null}><StaticPage page="cookies" /></Suspense></PublicLayout>} />
        <Route path="/advertise" element={<PublicLayout><Suspense fallback={null}><StaticPage page="advertise" /></Suspense></PublicLayout>} />
        <Route path="/careers"   element={<PublicLayout><Suspense fallback={null}><StaticPage page="careers" /></Suspense></PublicLayout>} />

        {/* Admin — completely isolated, no public layout */}
        <Route path="/admin"       element={<AdminAuthPage />} />
        <Route path="/admin/panel" element={<AdminGuard><AdminPanel /></AdminGuard>} />

        {/* Catch-all → home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
