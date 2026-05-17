// Known crypto symbols and names → CoinGecko IDs
export const COIN_MAP = {
  BTC: { name: 'Bitcoin', id: 'bitcoin', symbol: 'BTC' },
  ETH: { name: 'Ethereum', id: 'ethereum', symbol: 'ETH' },
  SOL: { name: 'Solana', id: 'solana', symbol: 'SOL' },
  BNB: { name: 'BNB', id: 'binancecoin', symbol: 'BNB' },
  XRP: { name: 'XRP', id: 'ripple', symbol: 'XRP' },
  ADA: { name: 'Cardano', id: 'cardano', symbol: 'ADA' },
  DOGE: { name: 'Dogecoin', id: 'dogecoin', symbol: 'DOGE' },
  SHIB: { name: 'Shiba Inu', id: 'shiba-inu', symbol: 'SHIB' },
  AVAX: { name: 'Avalanche', id: 'avalanche-2', symbol: 'AVAX' },
  DOT: { name: 'Polkadot', id: 'polkadot', symbol: 'DOT' },
  MATIC: { name: 'Polygon', id: 'matic-network', symbol: 'MATIC' },
  LINK: { name: 'Chainlink', id: 'chainlink', symbol: 'LINK' },
  UNI: { name: 'Uniswap', id: 'uniswap', symbol: 'UNI' },
  LTC: { name: 'Litecoin', id: 'litecoin', symbol: 'LTC' },
  ATOM: { name: 'Cosmos', id: 'cosmos', symbol: 'ATOM' },
  NEAR: { name: 'NEAR Protocol', id: 'near', symbol: 'NEAR' },
  APT: { name: 'Aptos', id: 'aptos', symbol: 'APT' },
  ARB: { name: 'Arbitrum', id: 'arbitrum', symbol: 'ARB' },
  OP: { name: 'Optimism', id: 'optimism', symbol: 'OP' },
  SUI: { name: 'Sui', id: 'sui', symbol: 'SUI' },
  TON: { name: 'Toncoin', id: 'the-open-network', symbol: 'TON' },
  TIA: { name: 'Celestia', id: 'celestia', symbol: 'TIA' },
  SEI: { name: 'Sei', id: 'sei-network', symbol: 'SEI' },
  WIF: { name: 'dogwifhat', id: 'dogwifcoin', symbol: 'WIF' },
  PEPE: { name: 'Pepe', id: 'pepe', symbol: 'PEPE' },
  FLOKI: { name: 'Floki', id: 'floki', symbol: 'FLOKI' },
  INJ: { name: 'Injective', id: 'injective-protocol', symbol: 'INJ' },
  JUP: { name: 'Jupiter', id: 'jupiter-exchange-solana', symbol: 'JUP' },
  BONK: { name: 'Bonk', id: 'bonk', symbol: 'BONK' },
  W: { name: 'Wormhole', id: 'wormhole', symbol: 'W' },
  PYTH: { name: 'Pyth Network', id: 'pyth-network', symbol: 'PYTH' },
  JTO: { name: 'Jito', id: 'jito-governance-token', symbol: 'JTO' },
  RENDER: { name: 'Render', id: 'render-token', symbol: 'RENDER' },
  HNT: { name: 'Helium', id: 'helium', symbol: 'HNT' },
  XMR: { name: 'Monero', id: 'monero', symbol: 'XMR' },
  BCH: { name: 'Bitcoin Cash', id: 'bitcoin-cash', symbol: 'BCH' },
  ICP: { name: 'Internet Computer', id: 'internet-computer', symbol: 'ICP' },
  FIL: { name: 'Filecoin', id: 'filecoin', symbol: 'FIL' },
  HBAR: { name: 'Hedera', id: 'hedera-hashgraph', symbol: 'HBAR' },
  VET: { name: 'VeChain', id: 'vechain', symbol: 'VET' },
  ALGO: { name: 'Algorand', id: 'algorand', symbol: 'ALGO' },
  EGLD: { name: 'MultiversX', id: 'elrond-erd-2', symbol: 'EGLD' },
  GRT: { name: 'The Graph', id: 'the-graph', symbol: 'GRT' },
  AAVE: { name: 'Aave', id: 'aave', symbol: 'AAVE' },
  MKR: { name: 'Maker', id: 'maker', symbol: 'MKR' },
  SNX: { name: 'Synthetix', id: 'havven', symbol: 'SNX' },
  CRV: { name: 'Curve DAO', id: 'curve-dao-token', symbol: 'CRV' },
  LDO: { name: 'Lido DAO', id: 'lido-dao', symbol: 'LDO' },
  MANA: { name: 'Decentraland', id: 'decentraland', symbol: 'MANA' },
  SAND: { name: 'The Sandbox', id: 'the-sandbox', symbol: 'SAND' },
  AXS: { name: 'Axie Infinity', id: 'axie-infinity', symbol: 'AXS' },
  NFT: { name: 'NFT', id: null, symbol: 'NFT' },
  USDT: { name: 'Tether', id: 'tether', symbol: 'USDT' },
  USDC: { name: 'USD Coin', id: 'usd-coin', symbol: 'USDC' },
  DAI: { name: 'Dai', id: 'dai', symbol: 'DAI' },
  BUSD: { name: 'BUSD', id: 'binance-usd', symbol: 'BUSD' },
}

// Name aliases → symbol
const NAME_ALIASES = {
  bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE',
  ripple: 'XRP', cardano: 'ADA', polkadot: 'DOT', avalanche: 'AVAX',
  polygon: 'MATIC', chainlink: 'LINK', litecoin: 'LTC', cosmos: 'ATOM',
  toncoin: 'TON', celestia: 'TIA', injective: 'INJ', jupiter: 'JUP',
  pepe: 'PEPE', monero: 'XMR', hedera: 'HBAR', algorand: 'ALGO',
  'shiba inu': 'SHIB', 'internet computer': 'ICP',
}

/**
 * Detect up to `maxCoins` unique coin mentions in text.
 * Returns array of { symbol, name, id, index } sorted by first occurrence.
 */
export function detectCoins(text, maxCoins = 10) {
  if (!text) return []
  const found = new Map()

  // Check symbols (all caps, word boundaries, 2-6 chars)
  const symbolRegex = /\b([A-Z]{2,6})\b/g
  let m
  while ((m = symbolRegex.exec(text)) !== null) {
    const sym = m[1]
    if (COIN_MAP[sym] && !found.has(sym)) {
      found.set(sym, { ...COIN_MAP[sym], index: m.index })
    }
    if (found.size >= maxCoins) break
  }

  // Check name aliases (case-insensitive)
  for (const [alias, sym] of Object.entries(NAME_ALIASES)) {
    if (found.has(sym)) continue
    const idx = text.toLowerCase().indexOf(alias)
    if (idx !== -1) {
      found.set(sym, { ...COIN_MAP[sym], index: idx })
    }
    if (found.size >= maxCoins) break
  }

  return Array.from(found.values()).sort((a, b) => a.index - b.index)
}

/**
 * Highlight top 3 coin mentions in HTML string.
 * Returns HTML with <mark> tags around coin symbols.
 */
export function highlightCoins(html, siteUrl = '') {
  const coins = detectCoins(html.replace(/<[^>]*>/g, ' '))
  const top3 = coins.slice(0, 3)

  let result = html
  for (const coin of top3) {
    if (!coin.id) continue
    const href = `${siteUrl}/prices?coin=${coin.id}`
    // Replace \bSYMBOL\b with linked mark
    const regex = new RegExp(`\\b(${coin.symbol})\\b`, 'g')
    result = result.replace(
      regex,
      `<a href="${href}" class="coin-mention" title="${coin.name}" target="_blank" rel="noopener noreferrer"><mark class="coin-mark">$1</mark></a>`
    )
  }
  return result
}
