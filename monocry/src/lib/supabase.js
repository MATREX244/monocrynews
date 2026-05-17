import { createClient } from '@supabase/supabase-js'

// ── All secrets come from environment variables — NEVER hardcoded ──
// Set these in Cloudflare Pages → Settings → Environment Variables
// For local dev, create a .env file (never commit it — it's in .gitignore)
const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const ADMIN_WALLET = import.meta.env.VITE_ADMIN_WALLET
export const SITE_URL     = import.meta.env.VITE_SITE_URL || 'https://monocrynews.pages.dev'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[Monocry] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables.')
}
if (!ADMIN_WALLET) {
  console.error('[Monocry] Missing VITE_ADMIN_WALLET environment variable.')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
  global: {
    headers: { 'x-client-info': 'monocry/1.0' }
  }
})

// ── Helper: check if a wallet is admin ─────────────────────────────────────
export async function isAdminWallet(wallet) {
  if (!wallet || typeof wallet !== 'string') return false
  // Validate Solana address format (base58, 32-44 chars)
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(wallet)) return false
  const { data } = await supabase
    .from('admin_config')
    .select('owner_wallet')
    .eq('owner_wallet', wallet)
    .maybeSingle()
  return !!data
}

// ── Helper: log a security event ───────────────────────────────────────────
export async function logSecurityEvent(event) {
  try {
    await supabase.from('security_events').insert({
      event_type: event.type || 'unknown',
      severity: event.severity || 'low',
      ip_address: event.ip || null,
      fingerprint: event.fingerprint || null,
      wallet_address: event.wallet || null,
      payload: event.payload ? String(event.payload).slice(0, 500) : null,
      path: window.location.pathname
    })
  } catch { /* silent fail — never break the user flow */ }
}

// ── Helper: check temp ban ─────────────────────────────────────────────────
export async function checkTempBan(fingerprint) {
  const key = `monocry_ban_${fingerprint}`
  const stored = localStorage.getItem(key)
  if (!stored) return false
  const until = parseInt(stored, 10)
  if (Date.now() < until) return true
  localStorage.removeItem(key)
  return false
}

export function setTempBan(fingerprint, hours = 2) {
  const key = `monocry_ban_${fingerprint}`
  const until = Date.now() + hours * 3_600_000
  localStorage.setItem(key, String(until))
}

export function getTempBanExpiry(fingerprint) {
  const key = `monocry_ban_${fingerprint}`
  const stored = localStorage.getItem(key)
  if (!stored) return null
  const until = parseInt(stored, 10)
  return Date.now() < until ? new Date(until) : null
}
