import { useState, useEffect } from 'react'
import { getMoodStats, getMoodHistory, getInnovationStatus } from '../api'
import axios from 'axios'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import EmotionBadge from '../components/EmotionBadge'

const api = axios.create({ baseURL: '/api' })

const EMOTION_COLORS = {
  happy:   '#22c55e',
  sad:     '#60a5fa',
  angry:   '#f87171',
  stress:  '#fb923c',
  anxiety: '#c084fc',
  lonely:  '#94a3b8',
  neutral: '#64748b',
}

const PATTERN_ICONS = {
  streak:      '🔁',
  time_of_day: '🕐',
  trigger_words: '⚡',
}

export default function DashboardPage() {
  const [userName] = useState(() => localStorage.getItem('manasitra_user') || 'Friend')
  const [stats,    setStats]    = useState(null)
  const [history,  setHistory]  = useState([])
  const [patterns, setPatterns] = useState([])
  const [memory,   setMemory]   = useState([])
  const [innovation, setInnovation] = useState(null)
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      getMoodStats(userName),
      getMoodHistory(userName, 30),
      api.get('/mood/patterns', { params: { user_name: userName } }),
      api.get('/mood/memory',   { params: { user_name: userName, limit: 8 } }),
      getInnovationStatus(),
    ])
      .then(([s, h, p, m, i]) => {
        setStats(s)
        setHistory(h.history)
        setPatterns(p.data.patterns || [])
        setMemory(m.data.weighted_memory || [])
        setInnovation(i)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [userName])

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-slate-400">
      Loading your mood data...
    </div>
  )

  if (!stats || stats.total_entries === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
      <span className="text-4xl">💭</span>
      <p>No mood data yet. Start chatting to track your emotions!</p>
    </div>
  )

  const pieData = Object.entries(stats.counts).map(([emotion, count]) => ({ name: emotion, value: count }))
  const barData = Object.entries(stats.percentages).map(([emotion, pct]) => ({ emotion, percentage: pct }))

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Mood Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Tracking <span className="text-manasitra-400">{userName}</span>
          {' '}· {stats.total_entries} entries
        </p>
      </div>

      {/* Dominant mood */}
      {innovation && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Technical Innovation Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(innovation.innovation_claims).map(([key, enabled]) => (
              <div key={key} className="flex items-center justify-between bg-slate-800/60 rounded-xl px-3 py-2">
                <span className="text-slate-300 text-sm capitalize">{key.replaceAll('_', ' ')}</span>
                <span className={`text-xs font-medium ${enabled ? 'text-green-300' : 'text-slate-500'}`}>
                  {enabled ? 'active' : 'off'}
                </span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs mt-3">
            Engine: {innovation.active_engine} · External API required: {String(innovation.external_api_required)}
          </p>
        </div>
      )}

      {stats.dominant_mood && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 flex items-center gap-4">
          <div className="text-4xl">
            {{'happy':'😊','sad':'😢','angry':'😠','stress':'😰','anxiety':'😟','lonely':'🥺','neutral':'😐'}[stats.dominant_mood]}
          </div>
          <div>
            <p className="text-slate-400 text-sm">Dominant mood recently</p>
            <EmotionBadge emotion={stats.dominant_mood} />
          </div>
        </div>
      )}

      {/* ── Feature 2: LMPE — Pattern Insights ── */}
      {patterns.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            🧠 <span>Detected Mood Patterns</span>
            <span className="text-xs text-manasitra-400 font-normal">(Longitudinal Pattern Engine)</span>
          </h2>
          <div className="space-y-2">
            {patterns.map((p, i) => (
              <div key={i} className="flex items-start gap-3 bg-slate-800/60 rounded-xl px-4 py-3">
                <span className="text-xl">{PATTERN_ICONS[p.type] || '📊'}</span>
                <div>
                  <p className="text-slate-200 text-sm">{p.data?.insight}</p>
                  <p className="text-slate-500 text-xs mt-0.5 capitalize">{p.type.replace('_', ' ')} · {new Date(p.detected_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Feature 1: EAMC — Weighted Memory ── */}
      {memory.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
            💾 <span>Emotional Memory</span>
            <span className="text-xs text-manasitra-400 font-normal">(Adaptive Memory — high distress retained longer)</span>
          </h2>
          <div className="space-y-2">
            {memory.map((m, i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-4 py-2.5">
                <EmotionBadge emotion={m.emotion} small />
                <p className="text-slate-300 text-sm flex-1 line-clamp-1">{m.message || '—'}</p>
                {/* Retention bar */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.round(m.live_retention * 100)}%`,
                        background: EMOTION_COLORS[m.emotion] || '#64748b',
                      }}
                    />
                  </div>
                  <span className="text-slate-500 text-xs w-8">{Math.round(m.live_retention * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-600 text-xs mt-2">Retention % = how strongly this memory is weighted in AI responses</p>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Emotion Distribution</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={EMOTION_COLORS[entry.name] || '#64748b'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2">
            {pieData.map((e) => (
              <span key={e.name} className="flex items-center gap-1 text-xs text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: EMOTION_COLORS[e.name] }} />
                {e.name}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Emotion Percentages</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} unit="%" />
              <YAxis type="category" dataKey="emotion" tick={{ fill: '#94a3b8', fontSize: 11 }} width={60} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 8 }} />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {barData.map((entry) => (
                  <Cell key={entry.emotion} fill={EMOTION_COLORS[entry.emotion] || '#64748b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent history */}
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">Recent Mood Log</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {history.slice(0, 20).map((entry, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-800 last:border-0">
              <EmotionBadge emotion={entry.emotion} small />
              <p className="text-slate-300 text-sm flex-1 line-clamp-1">{entry.message || '—'}</p>
              <span className="text-slate-500 text-xs whitespace-nowrap">
                {new Date(entry.recorded_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
