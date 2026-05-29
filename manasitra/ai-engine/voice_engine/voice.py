"""
Manasitra Voice Engine
- Speech-to-Text: OpenAI Whisper (local)
- Text-to-Speech: Coqui TTS (local)
"""

import os
import tempfile
from typing import Optional
import sounddevice as sd
import soundfile as sf
import numpy as np

# ── Speech-to-Text (Whisper) ───────────────────────────────────────────────────

def transcribe_audio(audio_path: str, model_size: str = "base") -> str:
    """
    Transcribe an audio file to text using Whisper.
    model_size: tiny | base | small | medium | large
    """
    try:
        import whisper
        model = whisper.load_model(model_size)
        result = model.transcribe(audio_path)
        return result["text"].strip()
    except ImportError:
        raise RuntimeError(
            "Whisper not installed. Run: pip install openai-whisper"
        )


def record_audio(duration: int = 5, sample_rate: int = 16000) -> str:
    """
    Record audio from microphone for `duration` seconds.
    Returns path to the saved WAV file.
    """
    print(f"🎙️  Recording for {duration} seconds...")
    audio = sd.rec(
        int(duration * sample_rate),
        samplerate=sample_rate,
        channels=1,
        dtype="float32",
    )
    sd.wait()
    print("✅ Recording complete.")

    tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
    sf.write(tmp.name, audio, sample_rate)
    return tmp.name


# ── Text-to-Speech (Coqui TTS) ────────────────────────────────────────────────

# Emotion → TTS speed / pitch adjustments (descriptive, applied via speaker settings)
EMOTION_VOICE_STYLE = {
    "happy":   {"speed": 1.1},
    "sad":     {"speed": 0.85},
    "angry":   {"speed": 1.0},
    "stress":  {"speed": 0.9},
    "anxiety": {"speed": 0.85},
    "lonely":  {"speed": 0.88},
    "neutral": {"speed": 1.0},
}


def speak(text: str, emotion: str = "neutral", output_path: Optional[str] = None) -> str:
    """
    Convert text to speech with emotion-aware style.
    Returns path to the generated audio file.
    """
    try:
        from TTS.api import TTS
    except ImportError:
        raise RuntimeError("Coqui TTS not installed. Run: pip install TTS")

    style = EMOTION_VOICE_STYLE.get(emotion, EMOTION_VOICE_STYLE["neutral"])

    tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False)

    if output_path is None:
        tmp = tempfile.NamedTemporaryFile(suffix=".wav", delete=False)
        output_path = tmp.name

    tts.tts_to_file(text=text, file_path=output_path, speed=style["speed"])
    return output_path


def play_audio(file_path: str):
    """Play a WAV file through the speakers."""
    data, samplerate = sf.read(file_path)
    sd.play(data, samplerate)
    sd.wait()
