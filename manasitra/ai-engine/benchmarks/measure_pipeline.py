"""
Measure Manasitra's local emotion pipeline.

This creates evidence for technical improvement claims: emotion classification,
privacy redaction, and response fallback latency without external APIs.
"""

import json
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from emotion_model.predictor import predict_emotion
from privacy_engine.privacy import privacy_filter
from response_engine.conversation_brain import _safe_fallback


SAMPLES = [
    ("I feel happy today, I got good marks", "happy"),
    ("College pressure and seeing everyone move ahead makes me tired and alone", "overwhelmed"),
    ("Nobody talks to me and I feel invisible", "lonely"),
    ("My exams are tomorrow and I am panicking", "anxiety"),
    ("I keep worrying about worst case scenarios", "anxiety"),
    ("I cried all night and feel empty", "sad"),
]


def main() -> None:
    latencies = []
    correct = 0
    rows = []

    for text, expected in SAMPLES:
        started = time.perf_counter()
        privacy = privacy_filter(text)
        result = predict_emotion(privacy.redacted_text)
        reply = _safe_fallback(result["emotion"])
        latency_ms = (time.perf_counter() - started) * 1000
        latencies.append(latency_ms)
        correct += int(result["emotion"] == expected)
        rows.append({
            "text": text,
            "expected": expected,
            "predicted": result["emotion"],
            "confidence": result["confidence"],
            "latency_ms": round(latency_ms, 2),
            "local_only": True,
            "reply_sample": reply,
        })

    report = {
        "sample_count": len(SAMPLES),
        "accuracy": round(correct / len(SAMPLES), 4),
        "avg_latency_ms": round(statistics.mean(latencies), 2),
        "p95_latency_ms": round(sorted(latencies)[int(len(latencies) * 0.95) - 1], 2),
        "external_api_used": False,
        "rows": rows,
    }

    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
