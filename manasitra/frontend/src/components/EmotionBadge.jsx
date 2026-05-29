const EMOTION_CONFIG = {
  happy:   { emoji: '😊', color: 'bg-green-900/50 text-green-300 border-green-700' },
  sad:     { emoji: '😢', color: 'bg-blue-900/50 text-blue-300 border-blue-700' },
  angry:   { emoji: '😠', color: 'bg-red-900/50 text-red-300 border-red-700' },
  stress:  { emoji: '😰', color: 'bg-orange-900/50 text-orange-300 border-orange-700' },
  anxiety: { emoji: '😟', color: 'bg-purple-900/50 text-purple-300 border-purple-700' },
  lonely:  { emoji: '🥺', color: 'bg-slate-800 text-slate-300 border-slate-600' },
  overwhelmed: { emoji: '😩', color: 'bg-rose-900/50 text-rose-300 border-rose-700' },
  grief:   { emoji: '💔', color: 'bg-blue-950/60 text-blue-200 border-blue-800' },
  neutral: { emoji: '😐', color: 'bg-slate-800 text-slate-400 border-slate-600' },
}

export default function EmotionBadge({ emotion, small = false }) {
  const config = EMOTION_CONFIG[emotion] || EMOTION_CONFIG.neutral
  return (
    <span
      className={`inline-flex items-center gap-1 border rounded-full font-medium capitalize
        ${config.color}
        ${small ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'}`}
    >
      <span>{config.emoji}</span>
      {emotion}
    </span>
  )
}
