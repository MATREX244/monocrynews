// ═══════════════════════════════════════════════════════════════════
//  MONOCRY — Security Utilities
//  OWASP-aligned: XSS, IDOR, Broken Access, Information Disclosure
// ═══════════════════════════════════════════════════════════════════

// ── Input sanitization ─────────────────────────────────────────────
export function sanitizeText(input, maxLen = 1000) {
  if (input === null || input === undefined) return ''
  return String(input)
    .replace(/[<>"'`]/g, c => ({ '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#x27;', '`': '&#x60;' })[c])
    .trim()
    .slice(0, maxLen)
}

export function sanitizeUrl(url) {
  if (!url) return ''
  const s = String(url).trim()
  // Only allow http/https
  if (!/^https?:\/\//i.test(s)) return ''
  // Block javascript: and data: URIs even if prefixed
  if (/javascript:|data:|vbscript:/i.test(s)) return ''
  return s
}

export function sanitizeSlug(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80)
}

// ── HTML sanitizer for article content ────────────────────────────
// Strips all tags except safe ones
const SAFE_TAGS = new Set(['p', 'b', 'i', 'strong', 'em', 'u', 'br', 'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'blockquote', 'a', 'span'])
const SAFE_ATTRS = new Set(['href', 'target', 'rel', 'class'])

export function sanitizeHtml(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT)
  const toRemove = []
  let node = walker.nextNode()
  while (node) {
    const tag = node.tagName.toLowerCase()
    if (!SAFE_TAGS.has(tag)) {
      toRemove.push(node)
    } else {
      // Strip unsafe attributes
      Array.from(node.attributes).forEach(attr => {
        if (!SAFE_ATTRS.has(attr.name.toLowerCase())) {
          node.removeAttribute(attr.name)
        }
        // Force safe links
        if (attr.name === 'href') {
          if (!/^https?:\/\//i.test(attr.value) && !attr.value.startsWith('/')) {
            node.removeAttribute('href')
          }
        }
      })
      // Force noopener on external links
      if (tag === 'a') {
        node.setAttribute('rel', 'noopener noreferrer')
        node.setAttribute('target', '_blank')
      }
    }
    node = walker.nextNode()
  }
  toRemove.forEach(n => n.replaceWith(document.createTextNode(n.textContent || '')))
  return div.innerHTML
}

// ── Rate limiting (client-side, defence in depth) ──────────────────
const _rateLimits = new Map()

export function checkRateLimit(key, maxCalls, windowMs) {
  const now = Date.now()
  const entry = _rateLimits.get(key) || { calls: [], blocked: false }
  entry.calls = entry.calls.filter(t => now - t < windowMs)
  if (entry.calls.length >= maxCalls) {
    _rateLimits.set(key, entry)
    return false // blocked
  }
  entry.calls.push(now)
  _rateLimits.set(key, entry)
  return true // allowed
}

// ── CSRF-style nonce for form actions ─────────────────────────────
export function generateNonce() {
  const arr = new Uint8Array(16)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('')
}

// ── Detect obvious injection attempts ─────────────────────────────
const INJECTION_PATTERNS = [
  /<script/i, /javascript:/i, /on\w+\s*=/i,
  /union\s+select/i, /drop\s+table/i, /;\s*delete/i,
  /\bexec\b|\beval\b/i, /base64_decode/i, /\bxp_\w/i
]

export function detectInjection(input) {
  if (!input) return false
  const s = String(input)
  return INJECTION_PATTERNS.some(p => p.test(s))
}

// ── Validate Solana wallet address ─────────────────────────────────
export function isValidSolanaAddress(addr) {
  return typeof addr === 'string' && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr)
}

// ── Validate UUID ──────────────────────────────────────────────────
export function isValidUUID(id) {
  return typeof id === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)
}

// ── Strip PII from error messages before display ───────────────────
export function safeErrorMsg(err) {
  const msg = String(err?.message || err || 'An error occurred')
  // Remove anything that looks like credentials, addresses, tokens
  return msg
    .replace(/eyJ[A-Za-z0-9_-]+/g, '[TOKEN]')
    .replace(/[1-9A-HJ-NP-Za-km-z]{32,44}/g, '[ADDR]')
    .slice(0, 200)
}
