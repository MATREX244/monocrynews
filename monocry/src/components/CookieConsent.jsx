import { useState, useEffect } from 'react'

const COOKIE_KEY = 'monocry_cookie_consent'

export function getCookieConsent() {
  try {
    const raw = localStorage.getItem(COOKIE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function setCookieConsent(prefs) {
  localStorage.setItem(COOKIE_KEY, JSON.stringify({ ...prefs, ts: Date.now() }))
}

export default function CookieConsent() {
  const [show, setShow] = useState(false)
  const [showCustom, setShowCustom] = useState(false)
  const [prefs, setPrefs] = useState({
    essential: true,   // always on
    analytics: false,
    marketing: false,
    personalization: false,
  })

  useEffect(() => {
    const existing = getCookieConsent()
    if (!existing) setShow(true)
  }, [])

  const acceptAll = () => {
    const all = { essential: true, analytics: true, marketing: true, personalization: true }
    setCookieConsent(all)
    setShow(false)
  }

  const rejectAll = () => {
    const min = { essential: true, analytics: false, marketing: false, personalization: false }
    setCookieConsent(min)
    setShow(false)
  }

  const saveCustom = () => {
    setCookieConsent(prefs)
    setShow(false)
    setShowCustom(false)
  }

  if (!show) return null

  if (showCustom) return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Cookie preferences">
      <div className="modal-box max-w-lg">
        <h2 className="text-lg font-bold mb-1 text-white">Cookie Preferences</h2>
        <p className="text-sm text-gray-400 mb-4">Choose which cookies you allow. Essential cookies cannot be disabled.</p>
        <div className="space-y-3">
          {[
            { key: 'essential', label: 'Essential', desc: 'Required for the site to function. Cannot be disabled.', locked: true },
            { key: 'analytics', label: 'Analytics', desc: 'Helps us understand how visitors use the site (anonymous).' },
            { key: 'marketing', label: 'Marketing & Ads', desc: 'Used to show relevant advertisements.' },
            { key: 'personalization', label: 'Personalization', desc: 'Remembers your preferences and reading history.' },
          ].map(c => (
            <label key={c.key} className={`flex items-start gap-3 p-3 rounded-lg border ${c.locked ? 'border-gray-700 opacity-60' : 'border-gray-600 cursor-pointer hover:border-mono-accent'}`}>
              <input
                type="checkbox"
                className="mt-1 accent-mono-accent"
                checked={prefs[c.key]}
                disabled={c.locked}
                onChange={e => setPrefs(p => ({ ...p, [c.key]: e.target.checked }))}
              />
              <div>
                <div className="text-sm font-semibold text-white">{c.label} {c.locked && <span className="text-xs text-gray-500 ml-1">Always on</span>}</div>
                <div className="text-xs text-gray-400 mt-0.5">{c.desc}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={saveCustom} className="flex-1 bg-mono-accent hover:bg-mono-accent-hover text-white px-4 py-2 rounded-lg text-sm font-semibold">Save preferences</button>
          <button onClick={() => setShowCustom(false)} className="px-4 py-2 rounded-lg text-sm border border-gray-600 hover:border-gray-400 text-gray-300">Back</button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="cookie-banner" role="banner" aria-label="Cookie consent">
      <div className="flex-1 text-sm text-gray-300">
        <strong className="text-white">🍪 Cookie Policy</strong>{' '}
        We use cookies to improve your experience, analyze traffic, and serve relevant ads.
        <a href="/cookies" className="text-mono-accent underline ml-1">Learn more</a>
      </div>
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setShowCustom(true)} className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 transition-colors">
          Customize
        </button>
        <button onClick={rejectAll} className="px-3 py-2 text-xs font-semibold rounded-lg border border-gray-600 hover:border-gray-400 text-gray-300 transition-colors">
          Reject Non-Essential
        </button>
        <button onClick={acceptAll} className="px-3 py-2 text-xs font-semibold rounded-lg bg-mono-accent hover:bg-mono-accent-hover text-white transition-colors">
          Accept All
        </button>
      </div>
    </div>
  )
}
