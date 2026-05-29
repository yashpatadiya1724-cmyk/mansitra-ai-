import { useState, useRef, useEffect } from 'react'
import { sendMessageStream, getOllamaStatus } from '../api'
import EmotionBadge from '../components/EmotionBadge'
import VoiceButton from '../components/VoiceButton'

export default function ChatPage() {
  const [userName, setUserName] = useState(
    () => localStorage.getItem('manasitra_user') || 'Friend'
  )
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Manasitra, your emotional AI companion. How are you feeling today? 💙",
      emotion: null,
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastEmotion, setLastEmotion] = useState(null)
  const [ollamaStatus, setOllamaStatus] = useState(null)
  const bottomRef = useRef(null)

  // Check Ollama on mount
  useEffect(() => {
    getOllamaStatus()
      .then(setOllamaStatus)
      .catch(() => setOllamaStatus({ ready: false, model: null }))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setInput('')
    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: msg, emotion: null }])
    setLoading(true)

    // Add empty assistant message that we'll stream into
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', emotion: null, streaming: true },
    ])

    try {
      await sendMessageStream(
        userName,
        msg,
        // onToken — append each token to the last message
        (token) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = { ...updated[updated.length - 1] }
            last.content += token
            updated[updated.length - 1] = last
            return updated
          })
        },
        // onDone — attach emotion metadata
        (meta) => {
          setLastEmotion(meta.emotion)
          setMessages((prev) => {
            const updated = [...prev]
            const last = { ...updated[updated.length - 1] }
            last.emotion = meta.emotion
            last.technicalProof = meta.technical_proof
            last.streaming = false
            updated[updated.length - 1] = last
            return updated
          })
        }
      )
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        const last = { ...updated[updated.length - 1] }
        last.content = "I'm having trouble connecting right now. Please check the backend is running."
        last.streaming = false
        updated[updated.length - 1] = last
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNameChange = (e) => {
    const name = e.target.value
    setUserName(name)
    localStorage.setItem('manasitra_user', name)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)]">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-manasitra-600 flex items-center justify-center text-lg select-none">
          🧠
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">Manasitra</p>
          <p className="text-xs text-slate-400">Emotional AI Companion</p>
        </div>

        <div className="ml-auto flex items-center gap-2 flex-wrap justify-end">
          {/* Ollama status pill */}
          {ollamaStatus && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                ollamaStatus.active_engine === 'custom'
                  ? 'bg-manasitra-900/40 text-manasitra-300 border-manasitra-700'
                  : ollamaStatus.ready
                  ? 'bg-green-900/40 text-green-300 border-green-700'
                  : 'bg-red-900/40 text-red-300 border-red-700'
              }`}
            >
              {ollamaStatus.active_engine === 'custom'
                ? `🧠 Custom Model`
                : ollamaStatus.ready
                ? `🟢 ${ollamaStatus.model}`
                : '🔴 Ollama offline'}
              {ollamaStatus.custom_epoch > 0 && ollamaStatus.active_engine !== 'custom' && (
                <span className="ml-1 opacity-60">
                  (training {ollamaStatus.training_progress})
                </span>
              )}
            </span>
          )}

          {lastEmotion && <EmotionBadge emotion={lastEmotion} />}

          <input
            value={userName}
            onChange={handleNameChange}
            placeholder="Your name"
            className="bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-1.5 border border-slate-700 focus:outline-none focus:border-manasitra-500 w-28"
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-manasitra-600 text-white rounded-br-sm'
                  : 'bg-slate-800 text-slate-100 rounded-bl-sm'
              }`}
            >
              {msg.content}
              {/* Streaming cursor */}
              {msg.streaming && (
                <span className="inline-block w-1.5 h-4 bg-slate-400 ml-0.5 animate-pulse align-middle" />
              )}
              {/* Emotion badge on assistant messages */}
              {msg.emotion && msg.role === 'assistant' && !msg.streaming && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <EmotionBadge emotion={msg.emotion} small />
                  {msg.technicalProof && (
                    <span className="text-[11px] text-slate-400 border border-slate-700 rounded-full px-2 py-0.5">
                      local private engine · {Math.round(msg.technicalProof.latency_ms)}ms
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Thinking dots — only show before streaming starts */}
        {loading && messages[messages.length - 1]?.content === '' && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-slate-900 border-t border-slate-800 px-4 py-3 flex items-center gap-2">
        <VoiceButton onResult={(t) => setInput(t)} />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="How are you feeling today?"
          disabled={loading}
          className="flex-1 bg-slate-800 text-slate-100 rounded-xl px-4 py-2.5 text-sm border border-slate-700 focus:outline-none focus:border-manasitra-500 placeholder-slate-500 disabled:opacity-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="bg-manasitra-600 hover:bg-manasitra-500 disabled:opacity-40 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  )
}
