# Manasitra Technical Disclosure Draft

This document is a patent-attorney handoff draft, not legal advice and not a guarantee of patentability.

## Proposed Technical Invention

Manasitra combines a local emotional-AI pipeline with five technical components:

1. Hybrid emotion architecture: keyword intensity scoring, compound emotion rules, distress overrides, emoji-safe output mapping, and transition-aware context.
2. Emotion-Adaptive Memory Compression: distress memories decay slower than neutral memories and are ranked by live retention.
3. Longitudinal Mood Pattern Engine: detects streaks, recurring time-of-day moods, and repeated distress triggers.
4. Emotion State Machine: tracks abrupt, concerning, improving, and natural emotional transitions across turns.
5. Privacy-preserving local pipeline: redacts common PII before persistence/context use, marks requests as local-only, and emits audit metadata.

## Technical Problem

Generic chatbots often misclassify mixed student distress, hallucinate user facts, produce diagnosis-like responses, and require external APIs that can expose private mental-health text.

## Technical Solution

The system processes each user message through:

`privacy_filter -> hybrid emotion predictor -> state/memory update -> local response engine -> response safety gate -> technical proof metadata`

The output includes emotion, confidence, transition evidence, local-only privacy proof, response latency, memory usage count, and pattern usage count.

## Implemented Evidence

- Backend endpoint: `/innovation/status`
- Privacy module: `ai-engine/privacy_engine/privacy.py`
- Benchmark script: `ai-engine/benchmarks/measure_pipeline.py`
- Runtime metadata: `technical_proof` in `/chat` and `/chat/stream`
- UI proof label: chat messages show local engine latency

## Claim Drafting Notes For Attorney

Potential claim focus:

- A method for generating emotionally constrained responses using a compound emotion classifier, emotion transition state, and memory retention score.
- A privacy-preserving local mental wellness response pipeline that redacts PII before storage and model context generation.
- A memory compression method where retention decay is emotion-dependent and affects response context selection.
- A safety gate that rejects generated responses containing unsupported assumptions, diagnosis language, unsolicited professional escalation, or emotion-incongruent emoji.

Avoid claiming only a chatbot, app idea, therapy method, or generic AI model.

