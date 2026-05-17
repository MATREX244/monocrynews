import { useState, useEffect } from 'react'

export default function MarketsPage() {
  const [globalData, setGlobalData] = useState(null)
  const [trending, setTrending] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      const [globalRes, trendRes] = await Promise.all([
        fetch('https://api.coingecko.com/api/v3/global'),
        fetch('https://api.coingecko.com/api/v3/search/trending')
      ])
      const [globalJson, trendJson] = await Promise.all([globalRes.json(), trendRes.json()])
      setGlobalData(globalJson.data)
      setTrending(trendJson.coins?.slice(0, 7) || [])
    } catch { /* use empty state */ }
    setLoading(false)
  }

  const fmt = (n, dec = 2) => n != null ? n.toFixed(dec) : 'N/A'
  const fmtLarge = (n) => {
    if (!n) return 'N/A'
    if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
    if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B'
    return '$' + n.toLocaleString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Markets Overview</h1>

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : (
        <>
          {/* Global stats */}
          {globalData && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Market Cap', value: fmtLarge(globalData.total_market_cap?.usd) },
                { label: '24h Volume', value: fmtLarge(globalData.total_volume?.usd) },
                { label: 'BTC Dominance', value: fmt(globalData.market_cap_percentage?.btc) + '%' },
                { label: 'Active Coins', value: globalData.active_cryptocurrencies?.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} className="p-4 rounded-xl bg-mono-surface border border-mono-border">
                  <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Trending */}
          {trending.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-white mb-4">🔥 Trending</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {trending.map(({ item }) => (
                  <div key={item.id} className="p-4 rounded-xl bg-mono-surface border border-mono-border flex items-center gap-3 hover:border-mono-accent transition-colors">
                    <img src={item.thumb} alt={item.name} width="36" height="36" className="rounded-full" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 uppercase">{item.symbol}</p>
                    </div>
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-400">Rank</p>
                      <p className="text-sm font-bold text-white">#{item.market_cap_rank || '?'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
