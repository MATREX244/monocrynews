// Lightweight fingerprinting — used for rate-limiting and ban enforcement
// NOT used for tracking across unrelated sites

async function hashStr(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16)
}

export async function getFingerprint() {
  const cached = sessionStorage.getItem('_mono_fp')
  if (cached) return cached

  const parts = [
    navigator.language || '',
    (navigator.languages || []).join(','),
    screen.width + 'x' + screen.height,
    screen.colorDepth,
    Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    navigator.platform || '',
    navigator.hardwareConcurrency || 0,
    navigator.maxTouchPoints || 0,
  ]

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillText('Monocry🔐', 2, 2)
    parts.push(canvas.toDataURL().slice(-50))
  } catch { /* ignore */ }

  const fp = await hashStr(parts.join('|'))
  sessionStorage.setItem('_mono_fp', fp)
  return fp
}

export function getSessionData() {
  return {
    user_agent: navigator.userAgent.slice(0, 200),
    screen_res: screen.width + 'x' + screen.height,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    platform: navigator.platform
  }
}
