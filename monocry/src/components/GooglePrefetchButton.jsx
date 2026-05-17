import { useState } from 'react'
import { SITE_URL } from '../lib/supabase'

export default function GooglePrefetchButton({ className = '' }) {
  const [status, setStatus] = useState('idle') // idle | done | unsupported

  const handleSetDefault = () => {
    // The "Add to Chrome" / prefetch hint
    // This opens Chrome's "Set as default search" page or adds a search engine
    const searchUrl = `${SITE_URL}/?q=%s`
    
    // Try to add as OpenSearch / default search engine
    if (window.external && typeof window.external.AddSearchProvider === 'function') {
      window.external.AddSearchProvider(`${SITE_URL}/opensearch.xml`)
      setStatus('done')
    } else {
      // Fallback: copy search URL to clipboard and guide user
      navigator.clipboard?.writeText(searchUrl).catch(() => {})
      setStatus('done')
      // Open Google Chrome's search engine settings
      window.open('chrome://settings/searchEngines', '_blank')
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={SITE_URL}
        target="_self"
        className="gpf-btn"
        title="Go to Monocry homepage"
        aria-label="Monocry — Set as your crypto news source"
        rel="prefetch"
        onClick={(e) => {
          // Preload the homepage
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({ type: 'PREFETCH', url: SITE_URL })
          }
        }}
      >
        {/* Site logo icon (not Google's) */}
        <img
          src="/logo-192.png"
          alt="Monocry"
          width="18"
          height="18"
          style={{ borderRadius: '4px' }}
        />
        <span>monocrynews.pages.dev</span>
      </a>
      {status === 'done' && (
        <span className="text-xs text-green-400">✓ Done! Set Monocry as your default.</span>
      )}
    </div>
  )
}
