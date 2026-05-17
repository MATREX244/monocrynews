import { Link } from 'react-router-dom'
import CategoryBadge from './CategoryBadge'

export default function ArticleCard({ article, featured = false }) {
  if (!article) return null

  const {
    id, slug, title, excerpt, category, image_url,
    author_name, published_at, created_at, views
  } = article

  const href = `/news/${slug || id}`
  const date = published_at || created_at
  const dateStr = date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''

  return (
    <Link
      to={href}
      className="article-card block no-underline"
      style={{ color: 'inherit' }}
    >
      {image_url && (
        <div className={`w-full overflow-hidden ${featured ? 'h-52' : 'h-40'}`}>
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        </div>
      )}
      <div className="p-4">
        {/* Category badge — inline, fit-content */}
        <div className="mb-2">
          <CategoryBadge category={category} />
        </div>
        <h3 className={`font-bold text-white leading-snug mb-2 ${featured ? 'text-lg' : 'text-sm'}`}>
          {title}
        </h3>
        {excerpt && (
          <p className="text-xs text-gray-400 line-clamp-2 mb-3">{excerpt}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{author_name || 'MONOCRY Staff'}</span>
          <div className="flex items-center gap-2">
            {views > 0 && <span>{views} views</span>}
            <span>{dateStr}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
