import { useState, useRef } from 'react'
import { transcribeAudio } from '../api'

export default function VoiceButton({ onResult }) {
  const [recording, setRecording] = useState(false)
  const [uploading, setUploading] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/wav' })
        stream.getTracks().forEach((t) => t.stop())
        setUploading(true)
        try {
          const text = await transcribeAudio(blob)
          onResult(text)
        } catch {
          alert('Voice transcription failed. Make sure the backend is running with Whisper.')
        } finally {
          setUploading(false)
        }
      }

      recorder.start()
      mediaRef.current = recorder
      setRecording(true)
    } catch {
      alert('Microphone access denied.')
    }
  }

  const stopRecording = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  const toggle = () => (recording ? stopRecording() : startRecording())

  return (
    <button
      onClick={toggle}
      disabled={uploading}
      title={recording ? 'Stop recording' : 'Start voice input'}
      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors
        ${recording
          ? 'bg-red-600 hover:bg-red-500 animate-pulse'
          : 'bg-slate-700 hover:bg-slate-600'
        }
        disabled:opacity-40`}
    >
      {uploading ? (
        <span className="text-xs text-slate-300">...</span>
      ) : (
        <span className="text-lg">{recording ? '⏹' : '🎙️'}</span>
      )}
    </button>
  )
}
