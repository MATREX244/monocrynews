// CategoryBadge — displays inline at fit-content width (not full-width)
export default function CategoryBadge({ category, className = '' }) {
  if (!category) return null
  const slug = category.toLowerCase().replace(/\s+/g, '-')
  return (
    <span className={`category-badge ${slug} ${className}`}>
      {category}
    </span>
  )
}
