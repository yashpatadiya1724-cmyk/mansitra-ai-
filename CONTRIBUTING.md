# Contributing to Manasitra AI Engine

We welcome contributions to the Manasitra emotion taxonomy, NLP scoring heuristics, model training runbooks, and inference pipelines.

## Contribution Guidelines
1. **Safety First**: Never suppress distress keywords or weaken negation handling in the emotion scoring pipeline.
2. **Deterministic Triage**: Emotional valence calculations must remain fast (<1ms) and deterministic.
3. **No Secrets**: Never commit Hugging Face write tokens, model checkpoints with proprietary weights, or unanonymized training conversations.
4. **Testing**: Run all unit tests before opening a pull request:
   ```bash
   python tests/test_emotion_predictor.py
   ```
5. **Branching**: Submit changes from feature branches (e.g. `feature/hinglish-negation-rules`), never directly to `main`.
