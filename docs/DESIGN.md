# Manasitra AI Pipeline — Architecture & Design Document

## 1. System Overview
The `mansitra-ai-` repository houses the machine learning models, datasets, and emotional inference pipelines powering the Manasitra mental wellness ecosystem. Its core objective is to deliver nuanced, culturally empathetic emotion recognition and dialogue generation tailored specifically to Indian student psychology.

---

## 2. Core Architecture Decisions

### 2.1 Dual-Tier Emotion Classification Architecture
- **Tier 1: High-Velocity Weighted Rule Engine (<1ms):**
  - Evaluates 9 target emotional axes: `happy`, `sad`, `angry`, `stress`, `anxiety`, `lonely`, `overwhelmed`, `neutral`, and `grief`.
  - Employs intensity-weighted dictionary matching with active compound emotion detection (e.g., $\text{Stress} \ge 0.5 \land \text{Sad} \ge 0.5 \implies \text{Overwhelmed}$).
  - Inverts valence via regex negation stripping (preventing phrases like *"not happy"* from triggering joyful responses).
  - Enforces an absolute safety override: if any severe distress keywords are present, positive emotion classifications are clamped to $0.0$.
- **Tier 2: Neural Dialogue Generation (LLaMA 3.2 3B Instruct):**
  - Executes fine-tuned conversational generation with injected student peer personas (*"Dost"*, *"Mitra"*).

### 2.2 Why On-Device & Micro-Inference?
- Deploying large multi-billion parameter models on cloud servers for simple sentiment classification incurs high recurring inference costs ($0.002 per request) and network latency.
- Tier 1 runs directly in memory with $O(N)$ string evaluation, reducing inference costs to zero for pre-screening.

---

## 3. Data Privacy and Governance
- Raw text prompts sent for emotion prediction are processed ephemerally in RAM.
- No student conversation records or emotion scores are written to persistent disk logs during automated inference.
