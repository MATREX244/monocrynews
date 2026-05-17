import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getFingerprint } from '../lib/fingerprint'
import { checkRateLimit, isValidUUID } from '../lib/security'
import CategoryBadge from '../components/CategoryBadge'
import AdUnit from '../components/AdUnit'

const PRED_CATEGORIES = ['All', 'MARKETS', 'POLICY', 'POLITICS', 'TECH']

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [voting, setVoting] = useState({}) // predictionId → 'yes'|'no'|null
  const [myVotes, setMyVotes] = useState({}) // predictionId → 'yes'|'no'

  useEffect(() => {
    loadPredictions()
    loadMyVotes()
  }, [filter])

  async function loadPredictions() {
    setLoading(true)
    try {
      let q = supabase
        .from('predictions')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (filter !== 'All') q = q.eq('category', filter)

      const { data, error } = await q
      if (error) throw error
      setPredictions(data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  async function loadMyVotes() {
    try {
      const fp = await getFingerprint()
      const { data } = await supabase
        .from('prediction_votes')
        .select('prediction_id, vote')
        .eq('fingerprint', fp)
      if (data) {
        const map = {}
        data.forEach(v => { map[v.prediction_id] = v.vote })
        setMyVotes(map)
      }
    } catch { /* ignore */ }
  }

  async function handleVote(predId, vote) {
    if (!isValidUUID(predId)) return
    if (myVotes[predId]) return // already voted
    if (voting[predId]) return  // in progress

    // Client rate limit: max 5 votes per minute
    if (!checkRateLimit('vote', 5, 60000)) {
      alert('Too many votes. Please wait a moment.')
      return
    }

    setVoting(v => ({ ...v, [predId]: vote }))
    try {
      const fp = await getFingerprint()
      const { data, error } = await supabase.rpc('cast_prediction_vote', {
        p_prediction_id: predId,
        p_fingerprint: fp,
        p_vote: vote
      })

      if (error) throw error
      if (data?.success) {
        setMyVotes(v => ({ ...v, [predId]: vote }))
        // Optimistically update counts
        setPredictions(preds => preds.map(p => {
          if (p.id !== predId) return p
          return { ...p, [`votes_${vote}`]: (p[`votes_${vote}`] || 0) + 1 }
        }))
      } else if (data?.error === 'already_voted') {
        setMyVotes(v => ({ ...v, [predId]: data.existing_vote }))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setVoting(v => ({ ...v, [predId]: null }))
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Predictions</h1>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 flex-wrap mb-6">
        {PRED_CATEGORIES.map(cat => (
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

      <AdUnit className="mb-6" />

      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner" /></div>
      ) : predictions.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <p className="text-4xl mb-3">🔮</p>
          <p>No predictions yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {predictions.map(pred => {
            const total = (pred.votes_yes || 0) + (pred.votes_no || 0)
            const yesP = total ? Math.round((pred.votes_yes / total) * 100) : 50
            const noP = 100 - yesP
            const myVote = myVotes[pred.id]
            const isVoting = !!voting[pred.id]
            const deadline = pred.deadline ? new Date(pred.deadline) : null
            const expired = deadline && deadline < new Date()

            return (
              <div key={pred.id} className="article-card p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <CategoryBadge category={pred.category} />
                  {deadline && (
                    <span className={`text-xs ${expired ? 'text-red-400' : 'text-gray-400'}`}>
                      {expired ? 'Ended' : `Ends ${deadline.toLocaleDateString()}`}
                    </span>
                  )}
                </div>

                {pred.image_url && (
                  <img src={pred.image_url} alt={pred.title} className="w-full h-36 object-cover rounded-lg mb-3" loading="lazy" />
                )}

                <h3 className="font-bold text-white text-sm mb-2 leading-snug">{pred.title}</h3>
                {pred.description && (
                  <p className="text-xs text-gray-400 mb-3 line-clamp-2">{pred.description}</p>
                )}

                {/* Vote bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Yes {yesP}%</span>
                    <span>No {noP}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-mono-border overflow-hidden flex">
                    <div className="pred-bar bg-green-500" style={{ width: `${yesP}%` }} />
                    <div className="pred-bar bg-red-500" style={{ width: `${noP}%` }} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-center">{total} votes</p>
                </div>

                {/* Vote buttons */}
                {pred.is_resolved ? (
                  <div className="text-xs text-center text-gray-400 bg-mono-surface rounded-lg px-3 py-2">
                    Resolved: <span className="font-bold text-white">{pred.resolution}</span>
                    {pred.resolution_note && <span className="ml-1 text-gray-500">— {pred.resolution_note}</span>}
                  </div>
                ) : expired ? (
                  <div className="text-xs text-center text-gray-500 italic">Voting closed</div>
                ) : myVote ? (
                  <div className="text-xs text-center text-mono-accent font-semibold">
                    ✓ You voted <span className="uppercase">{myVote}</span>
                  </div>
                ) : (
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleVote(pred.id, 'yes')}
                      disabled={isVoting}
                      className="flex-1 py-2 rounded-lg bg-green-900/40 hover:bg-green-800/60 border border-green-700 text-green-400 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {isVoting && voting[pred.id] === 'yes' ? '...' : '✓ Yes'}
                    </button>
                    <button
                      onClick={() => handleVote(pred.id, 'no')}
                      disabled={isVoting}
                      className="flex-1 py-2 rounded-lg bg-red-900/40 hover:bg-red-800/60 border border-red-700 text-red-400 text-sm font-bold transition-colors disabled:opacity-50"
                    >
                      {isVoting && voting[pred.id] === 'no' ? '...' : '✗ No'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
