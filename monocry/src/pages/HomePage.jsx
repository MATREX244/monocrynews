import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import ArticleCard from '../components/ArticleCard'
import TitleAnimator from '../components/TitleAnimator'
import AdUnit from '../components/AdUnit'
import CategoryBadge from '../components/CategoryBadge'
import { Link } from 'react-router-dom'

const CATEGORIES = ['All', 'NEWS', 'OPINION', 'INTERVIEWS', 'FOLLOW-UP', 'LEARN', 'PARTNER']

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(0)
  const PER_PAGE = 12

  useEffect(() => {
    loadArticles()
  }, [filter, page])

  async function loadArticles() {
    setLoading(true)
    try {
      let q = supabase
        .from('articles')
        .select('id, slug, title, excerpt, category, image_url, author_name, published_at, created_at, views')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .range(page * PER_PAGE, (page + 1) * PER_PAGE - 1)

      if (filter !== 'All') q = q.eq('category', filter)

      const { data, error } = await q
      if (error) throw error
      setArticles(data || [])
    } catch (e) {
      console.error('Error loading articles:', e)
    } finally {
      setLoading(false)
    }
  }

  const headlines = articles.slice(0, 8).map(a => a.title)

  return (
    <>
      <TitleAnimator headlines={headlines} />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Featured hero (first article) */}
        {articles[0] && (
          <div className="mb-8">
            <ArticleCard article={articles[0]} featured />
          </div>
        )}

        {/* Category filter pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); setPage(0) }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                filter === cat
                  ? 'bg-mono-accent text-white'
                  : 'text-gray-400 border border-gray-700 hover:border-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Ad unit mid-page */}
        <AdUnit className="mb-6" />

        {/* Article grid */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="spinner" /></div>
        ) : articles.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">📰</p>
            <p>No articles yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {articles.slice(1).map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center gap-3 mt-8">
          {page > 0 && (
            <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-mono-surface border border-mono-border text-sm hover:border-mono-accent">
              ← Previous
            </button>
          )}
          {articles.length === PER_PAGE && (
            <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-mono-surface border border-mono-border text-sm hover:border-mono-accent">
              Next →
            </button>
          )}
        </div>
      </div>
    </>
  )
}
