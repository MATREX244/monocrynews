import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { sanitizeHtml } from '../lib/security'
import { highlightCoins, detectCoins } from '../lib/coinDetector'
import { SITE_URL } from '../lib/supabase'
import CategoryBadge from '../components/CategoryBadge'
import ShareButtons from '../components/ShareButtons'
import AdUnit from '../components/AdUnit'

export default function ArticlePage() {
  const { slugOrId } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState([])

  useEffect(() => {
    if (slugOrId) loadArticle()
  }, [slugOrId])

  async function loadArticle() {
    setLoading(true)
    try {
      // Try by slug first, then by ID
      const isUUID = /^[0-9a-f-]{36}$/i.test(slugOrId)
      const field = isUUID ? 'id' : 'slug'
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq(field, slugOrId)
        .eq('is_published', true)
        .maybeSingle()

      if (error || !data) { setArticle(null); setLoading(false); return }
      setArticle(data)

      // Increment views
      supabase.rpc('increment_article_views', { article_id: data.id }).catch(() => {})

      // Load related articles
      const { data: rel } = await supabase
        .from('articles')
        .select('id, slug, title, category, image_url, published_at')
        .eq('is_published', true)
        .eq('category', data.category)
        .neq('id', data.id)
        .limit(4)
      setRelated(rel || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[50vh]">
      <div className="spinner" />
    </div>
  )

  if (!article) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <p className="text-5xl mb-4">📭</p>
      <h2 className="text-xl font-bold text-white mb-2">Article not found</h2>
      <Link to="/" className="text-mono-accent hover:underline">← Back to news</Link>
    </div>
  )

  const { title, content, excerpt, category, image_url, author_name, published_at, created_at, tags, coin_mentions } = article
  const date = published_at || created_at
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : ''
  const articleUrl = `${SITE_URL}/news/${article.slug || article.id}`

  // Sanitize + highlight coins in content
  const safeContent = content ? sanitizeHtml(content) : ''
  const highlightedContent = safeContent ? highlightCoins(safeContent, SITE_URL) : ''

  // Detect coins mentioned
  const coinsMentioned = detectCoins((content || '') + ' ' + (title || ''), 6)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main article */}
        <article className="lg:col-span-2">
          <Link to="/" className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-4">
            ← All news
          </Link>

          {/* Category + date */}
          <div className="flex items-center gap-3 mb-3">
            <CategoryBadge category={category} />
            <span className="text-xs text-gray-500">{dateStr}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-4">{title}</h1>
          {excerpt && <p className="text-gray-400 mb-5 text-base leading-relaxed">{excerpt}</p>}

          {/* Author */}
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-mono-border">
            <div className="w-8 h-8 rounded-full bg-mono-accent flex items-center justify-center text-xs font-bold text-white">
              {(author_name || 'M')[0]}
            </div>
            <span className="text-sm text-gray-300">{author_name || 'MONOCRY Staff'}</span>
          </div>

          {/* Hero image */}
          {image_url && (
            <img src={image_url} alt={title} className="w-full rounded-xl mb-6 object-cover max-h-96" loading="lazy" />
          )}

          {/* Article content with coin highlights */}
          <div
            className="prose-custom"
            dangerouslySetInnerHTML={{ __html: highlightedContent }}
            style={{
              lineHeight: 1.7,
              fontSize: '1rem',
              color: '#d4d4d4',
            }}
          />

          {/* Coins mentioned chips */}
          {coinsMentioned.length > 0 && (
            <div className="mt-6 p-4 rounded-xl border border-mono-border bg-mono-surface">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Coins mentioned</p>
              <div className="flex flex-wrap gap-2">
                {coinsMentioned.map(coin => (
                  <Link
                    key={coin.symbol}
                    to={coin.id ? `/prices?coin=${coin.id}` : '#'}
                    className="px-2 py-1 rounded-lg text-xs font-bold border border-mono-border hover:border-mono-accent text-gray-300"
                  >
                    {coin.symbol} · {coin.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 text-xs rounded bg-mono-surface border border-mono-border text-gray-400">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Share buttons */}
          <div className="mt-8 p-4 rounded-xl border border-mono-border bg-mono-surface">
            <p className="text-sm font-bold text-white mb-3">Share this article</p>
            <ShareButtons title={title} url={articleUrl} />
          </div>

          {/* Ad unit */}
          <AdUnit className="mt-6" />
        </article>

        {/* Sidebar */}
        <aside className="space-y-4">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Related</h3>
          {related.map(r => (
            <Link key={r.id} to={`/news/${r.slug || r.id}`} className="flex gap-3 group no-underline">
              {r.image_url && (
                <img src={r.image_url} alt={r.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" loading="lazy" />
              )}
              <div>
                <CategoryBadge category={r.category} />
                <p className="text-sm text-white group-hover:text-mono-accent mt-1 leading-snug line-clamp-2">{r.title}</p>
              </div>
            </Link>
          ))}
        </aside>
      </div>
    </div>
  )
}
