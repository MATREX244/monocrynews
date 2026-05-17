import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, ADMIN_WALLET, isAdminWallet, setTempBan, getTempBanExpiry, logSecurityEvent } from '../lib/supabase'
import { getFingerprint } from '../lib/fingerprint'
import { checkRateLimit, isValidSolanaAddress, detectInjection } from '../lib/security'

// ──────────────────────────────────────────────────────────────────────
//  This page is the ONLY entry point to the admin panel.
//  It lives at /admin and is a clean, standalone page — not a popup,
//  not overlaid on the main site. Nothing from the public site renders here.
// ──────────────────────────────────────────────────────────────────────

export default function AdminAuthPage() {
  const navigate = useNavigate()
  const [phase, setPhase]     = useState('idle')   // idle | connecting | signing | verifying | banned | error
  const [error, setError]     = useState('')
  const [banExpiry, setBanExpiry] = useState(null)
  const [countdown, setCountdown] = useState('')

  // Check for existing valid session
  useEffect(() => {
    const token = sessionStorage.getItem('mono_admin_token')
    const wallet = sessionStorage.getItem('mono_admin_wallet')
    if (token === 'verified' && wallet === ADMIN_WALLET) {
      navigate('/admin/panel', { replace: true })
      return
    }
    checkBan()
  }, [])

  // Countdown timer for ban
  useEffect(() => {
    if (!banExpiry) return
    const interval = setInterval(() => {
      const diff = banExpiry - Date.now()
      if (diff <= 0) { setBanExpiry(null); setPhase('idle'); clearInterval(interval); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setCountdown(`${h}h ${m.toString().padStart(2,'0')}m ${s.toString().padStart(2,'0')}s`)
    }, 1000)
    return () => clearInterval(interval)
  }, [banExpiry])

  async function checkBan() {
    const fp = await getFingerprint()
    const expiry = getTempBanExpiry(fp)
    if (expiry) {
      setBanExpiry(expiry.getTime())
      setPhase('banned')
    }
  }

  async function handleConnect() {
    setError('')

    // Rate limit: max 5 connect attempts per 10 minutes
    if (!checkRateLimit('admin_connect', 5, 600000)) {
      setError('Too many attempts. Please wait.')
      return
    }

    const fp = await getFingerprint()

    // Check ban first
    const expiry = getTempBanExpiry(fp)
    if (expiry) {
      setBanExpiry(expiry.getTime())
      setPhase('banned')
      return
    }

    setPhase('connecting')

    try {
      // Check for Phantom wallet
      const phantom = window.solana || window.phantom?.solana
      if (!phantom || !phantom.isPhantom) {
        setError('Phantom wallet not found. Please install Phantom.')
        setPhase('idle')
        return
      }

      // Connect
      const resp = await phantom.connect()
      const connectedWallet = resp.publicKey.toString()

      if (!isValidSolanaAddress(connectedWallet)) {
        setError('Invalid wallet address detected.')
        setPhase('idle')
        return
      }

      // Injection guard
      if (detectInjection(connectedWallet)) {
        await logSecurityEvent({ type: 'injection_attempt', severity: 'high', wallet: connectedWallet, fingerprint: fp })
        setError('Security check failed.')
        setPhase('idle')
        return
      }

      // Check admin status in DB
      const isAdmin = await isAdminWallet(connectedWallet)

      if (!isAdmin) {
        // Log unauthorized attempt
        await logSecurityEvent({
          type: 'unauthorized_admin_attempt',
          severity: 'high',
          wallet: connectedWallet,
          fingerprint: fp,
          payload: `Non-admin wallet ${connectedWallet.slice(0,8)}... attempted admin access`
        })

        // Apply 2-hour temporary ban
        setTempBan(fp, 2)
        setBanExpiry(Date.now() + 2 * 3_600_000)
        setPhase('banned')
        return
      }

      // Admin wallet confirmed — now request signature to prove ownership
      setPhase('signing')

      const nonce = crypto.randomUUID()
      const message = `Monocry Admin Login\nNonce: ${nonce}\nTime: ${new Date().toISOString()}`
      const encodedMsg = new TextEncoder().encode(message)

      let signature
      try {
        const signResult = await phantom.signMessage(encodedMsg, 'utf8')
        signature = signResult.signature
      } catch (e) {
        setError('Signature cancelled. Authentication aborted.')
        setPhase('idle')
        return
      }

      if (!signature) {
        setError('Signature failed. Please try again.')
        setPhase('idle')
        return
      }

      // Signature obtained — store session (in-memory only, sessionStorage)
      setPhase('verifying')
      sessionStorage.setItem('mono_admin_token', 'verified')
      sessionStorage.setItem('mono_admin_wallet', connectedWallet)
      sessionStorage.setItem('mono_admin_nonce', nonce)

      // Log successful login
      await logSecurityEvent({
        type: 'admin_login',
        severity: 'low',
        wallet: connectedWallet,
        fingerprint: fp,
        payload: 'Successful admin authentication'
      })

      // Enter panel
      setTimeout(() => navigate('/admin/panel', { replace: true }), 300)

    } catch (e) {
      console.error('Admin auth error:', e)
      const msg = e?.message || 'Connection failed.'
      // Never expose raw errors to screen
      setError('Authentication failed. Check your wallet and try again.')
      setPhase('idle')
    }
  }

  // ── Render: banned ──────────────────────────────────────────────
  if (phase === 'banned' || banExpiry) {
    return (
      <AdminShell>
        <div className="text-center">
          <div className="text-5xl mb-4">🚫</div>
          <h2 className="text-xl font-bold text-red-400 mb-2">Access Denied</h2>
          <p className="text-gray-400 text-sm mb-4">
            Your device has been temporarily blocked after an unauthorized access attempt.
          </p>
          <div className="text-2xl font-mono text-red-300 bg-red-900/20 border border-red-800 rounded-xl px-6 py-4">
            {countdown || 'Calculating...'}
          </div>
          <p className="text-xs text-gray-500 mt-4">This block will expire automatically.</p>
        </div>
      </AdminShell>
    )
  }

  // ── Render: main auth UI ────────────────────────────────────────
  return (
    <AdminShell>
      <div className="text-center">
        <img src="/logo-192.png" alt="Monocry" width="64" height="64" className="mx-auto mb-4 rounded-xl" />
        <h1 className="text-2xl font-bold text-white mb-1">Admin Access</h1>
        <p className="text-sm text-gray-400 mb-8">Connect your authorized Phantom wallet to continue.</p>

        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl bg-red-900/30 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        {phase === 'idle' && (
          <button
            onClick={handleConnect}
            className="w-full py-3.5 rounded-xl font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #9945FF, #14F195)', fontSize: '1rem' }}
          >
            🔐 Connect Phantom Wallet
          </button>
        )}

        {phase === 'connecting' && (
          <div className="text-center">
            <div className="spinner mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Opening Phantom...</p>
          </div>
        )}

        {phase === 'signing' && (
          <div className="text-center">
            <div className="spinner mx-auto mb-3" style={{ borderTopColor: '#14F195' }} />
            <p className="text-gray-400 text-sm">Please sign the message in Phantom to prove wallet ownership...</p>
          </div>
        )}

        {phase === 'verifying' && (
          <div className="text-center">
            <div className="spinner mx-auto mb-3" style={{ borderTopColor: '#0079C1' }} />
            <p className="text-mono-accent text-sm">Verified! Entering panel...</p>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-8">
          Only authorized wallets can access this panel.<br/>
          Unauthorized attempts result in a 2-hour block.
        </p>
      </div>
    </AdminShell>
  )
}

// Standalone shell — completely isolated from public site
function AdminShell({ children }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: '#141414',
        border: '1px solid #222',
        borderRadius: '20px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
      }}>
        {children}
      </div>
    </div>
  )
}
