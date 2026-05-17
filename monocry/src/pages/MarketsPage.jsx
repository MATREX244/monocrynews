import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'

const COINS_PER_PAGE = 50

export default function MarketsPage() {
  const [globalData, setGlobalData] = useState(null)
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  useEffect(() => { loadData() }, [page])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [globalRes, coinsRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/global'),
        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COINS_PER_PAGE}&page=${page}&sparkline=false&price_change_percentage=24h`)
      ])
      const [globalJson, coinsJson] = await Promise.all([globalRes.json(), coinsRes.json()])
      setGlobalData(globalJson.data)
      setCoins(Array.isArray(coinsJson) ? coinsJson : [])
    } catch {
      // fallback: just coins
      try {
        const res = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${COINS_PER_PAGE}&page=1&sparkline=false`)
        const data = await res.json()
        setCoins(Array.isArray(data) ? data : [])
      } catch { setCoins([]) }
    } finally {
      setLoading(false)
    }
  }, [page])

  const fmt = (n) => n != null
    ? '$' + (n < 0.01 ? n.toPrecision(4) : n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    : 'N/A'

  const fmtLarge = (n) => {
    if (!n) return 'N/A'
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9)  return '$' + (n / 1e9).toFixed(2) + 'B'
    if (n >= 1e6)  return '$' + (n / 1e6).toFixed(2) + 'M'
    return '$' + n.toLocaleString()
  }

  const filtered = search
    ? coins.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.symbol.toLowerCase().includes(search.toLowerCase())
      )
    : coins

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Crypto Prices</h1>

      {/* Global stats */}
      {globalData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Market Cap', value: fmtLarge(globalData.total_market_cap?.usd) },
            { label: '24h Volume',       value: fmtLarge(globalData.total_volume?.usd) },
            { label: 'BTC Dominance',    value: (globalData.market_cap_percentage?.btc ?? 0).toFixed(1) + '%' },
            { label: 'Active Coins',     value: globalData.active_cryptocurrencies?.toLocaleString() ?? 'N/A' },
          ].map(stat => (
            <div key={stat.label} className="p-4 rounded-xl bg-mono-surface border border-mono-border">
              <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <span className="text-sm text-gray-400">Top cryptocurrencies by market cap</span>
        <input
          type="search"
          placeholder="Search coin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 rounded-lg bg-mono-surface border border-mono-border text-white text-sm w-48 focus:outline-none focus:border-mono-accent"
        />
      </div>

      {/* Price table */}
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
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-500">No coins found</td></tr>
            ) : filtered.map((coin, i) => {
              const change = coin.price_change_percentage_24h
              const isUp = change >= 0
              return (
                <tr
                  key={coin.id}
                  className="border-b border-mono-border hover:bg-mono-surface transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500">{(page - 1) * COINS_PER_PAGE + i + 1}</td>
                  <td className="px-4 py-3">
                    <Link to={`/prices?coin=${coin.id}`} className="flex items-center gap-2 no-underline">
                      <img src={coin.image} alt={coin.name} width="24" height="24" className="rounded-full flex-shrink-0" loading="lazy" />
                      <div>
                        <span className="font-semibold text-white">{coin.name}</span>
                        <span className="ml-2 text-xs text-gray-500 uppercase">{coin.symbol}</span>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white">{fmt(coin.current_price)}</td>
                  <td className={`px-4 py-3 text-right font-mono font-semibold ${isUp ? 'text-green-400' : 'text-red-400'}`}>
                    {change != null ? (isUp ? '+' : '') + change.toFixed(2) + '%' : 'N/A'}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden md:table-cell">{fmtLarge(coin.market_cap)}</td>
                  <td className="px-4 py-3 text-right text-gray-400 hidden lg:table-cell">{fmtLarge(coin.total_volume)}</td>
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
        {filtered.length === COINS_PER_PAGE && !search && (
          <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-lg bg-mono-surface border border-mono-border text-sm hover:border-mono-accent">
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
