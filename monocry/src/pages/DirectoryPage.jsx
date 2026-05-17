import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { sanitizeUrl } from '../lib/security'

export default function DirectoryPage() {
  const [listings, setListings] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [{ data: dirs }, { data: cats }] = await Promise.all([
      supabase.from('directory_listings').select('*').order('is_featured', { ascending: false }).order('name'),
      supabase.from('categories').select('*').eq('is_active', true)
    ])
    setListings(dirs || [])
    // Extract unique directory categories
    const dirCats = [...new Set((dirs || []).map(d => d.category).filter(Boolean))]
    setCategories(dirCats)
    setLoading(false)
  }

  const filtered = filter === 'All' ? listings : listings.filter(l => l.category === filter)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">Directory</h1>
      <p className="text-gray-400 text-sm mb-6">Curated crypto tools, exchanges, and services.</p>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {['All', ...categories].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              filter === cat ? 'bg-mono-accent text-white' : 'text-gray-400 border border-gray-700 hover:border-gray-500'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No listings yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="article-card p-4 cursor-pointer" onClick={() => setSelected(item)}>
              <div className="flex items-center gap-3 mb-2">
                {item.logo_url ? (
                  <img src={item.logo_url} alt={item.name} width="40" height="40" className="rounded-lg object-contain bg-white/5 p-1" loading="lazy" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-mono-accent/20 flex items-center justify-center text-mono-accent font-bold">
                    {item.name[0]}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                    {item.is_featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">Featured</span>}
                  </div>
                  <p className="text-xs text-mono-accent">{item.category}</p>
                </div>
              </div>
              {item.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{item.description}</p>
              )}
              <p className="text-xs text-mono-accent mt-2 hover:underline">View details →</p>
            </div>
          ))}
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="flex items-start gap-4 mb-4">
              {selected.logo_url ? (
                <img src={selected.logo_url} alt={selected.name} width="56" height="56" className="rounded-xl object-contain bg-white/5 p-1.5 flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-mono-accent/20 flex items-center justify-center text-mono-accent text-xl font-bold flex-shrink-0">
                  {selected.name[0]}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-bold text-white">{selected.name}</h3>
                  {selected.is_featured && <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">⭐ Featured</span>}
                </div>
                <span className="text-sm text-mono-accent">{selected.category}</span>
              </div>
            </div>
            {selected.description && (
              <p className="text-gray-300 text-sm mb-5 leading-relaxed">{selected.description}</p>
            )}
            <div className="flex gap-3">
              <a
                href={sanitizeUrl(selected.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-center py-2.5 rounded-lg bg-mono-accent hover:bg-mono-accent-hover text-white font-semibold text-sm transition-colors"
              >
                Visit →
              </a>
              <button onClick={() => setSelected(null)} className="px-4 py-2.5 rounded-lg border border-mono-border hover:border-gray-500 text-gray-400 text-sm">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
