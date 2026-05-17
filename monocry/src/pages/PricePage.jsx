import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

const COINS_PER_PAGE = 100

export default function PricePage() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchParams] = useSearchParams()
  const highlightCoin = searchParams.get('coin')

  useEffect(() => {
    loadCoins()
  }, [page])

  const loadCoins = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COINS_PER_PAGE}&page=${page}&sparkline=false&price_change_percentage=24h`
      )
      if (!res.ok) throw new Error('API error')
      const data = await res.json()
      setCoins(data)
    } catch {
      // Fallback: try without page param
      try {
        const res = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false')
        const data = await res.json()
        setCoins(Array.isArray(data) ? data : [])
      } catch { setCoins([]) }
    } finally {
      setLoading(false)
    }
  }, [page])

  const filtered = search
    ? coins.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
      )
    : coins

  const fmt = (n) => n != null ? '$' + (n < 0.01 ? n.toPrecision(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })) : 'N/A'
  const fmtMcap = (n) => {
    if (!n) return 'N/A'
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M'
    return '$' + n.toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Crypto Prices</h1>
        <input
          type="search"
          placeholder="Search coin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-mono-surface border border-mono-border text-white text-sm w-48 focus:outline-none focus:border-mono-accent"
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-mono-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mono-border bg-mono-surface text-gray-400 text-xs uppercase">
              <th className="px-4 py-3 text-left">#</th>
              <th className="px-4 py-3 text-left">Coin</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">24h %</th>
              <th className="px-4 py-3 text-right hidden md:table-cell">Market Cap</th>
              <th className="px-4 py-3 text-right hidden lg:table-cell">Volume 24h</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="text-center py-16"><div className="spinner mx-auto" /></td></tr>
            ) : filtered.map((coin, i) => {
              const change = coin.price_change_percentage_24h
              const isUp = change >= 0
              const highlight = highlightCoin === coin.id
              return (
                <tr
                  key={coin.id}
                  className={`border-b border-mono-border hover:bg-mono-surface transition-colors ${highlight ? 'ring-1 ring-mono-accent bg-mono-accent/5' : ''}`}
                >
                  <td className="px-4 py-3 text-gray-500">{(page - 1) * COINS_PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {/* Coin icon next to name */}
                      <img src={coin.image} alt={coin.name} width="24" height="24" className="rounded-full flex-shrink-0" loading="lazy" />
                      <div>
                        <span className="font-semibold text-white">{coin.name}</span>
                        <span className="ml-2 text-xs text-gray-500 uppercase">{coin.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Icon + price side by side */}
                      <img src={coin.image} alt="" width="14" height="14" className="rounded-full opacity-60" loading="lazy" />
                      {fmt(coin.current_price)}
                    </div>
                  </td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {change != null ? (isUp ? '+' : '') + change.toFixed(2) + '%' : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">{fmtMcap(coin.market_cap)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden lg:table-cell">{fmtMcap(coin.total_volume)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-3 mt-6">
        {page > 1 && (
          <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-lg bg-mono-surface border border-mono-border text-sm hover:border-mono-accent">
            ← Previous
          </button>
        )}
        <span className="px-4 py-2 text-sm text-gray-400">Page {page}</span>
        {filtered.length === COINS_PER_PAGE && (
          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-mono-surface border border-mono-border text-sm hover:border-mono-accent">
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
