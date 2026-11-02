# Engineering Challenges & Technical Learnings
### Repository: mansitra-ai-

## 1. Challenge: Context Negation & False Positives in Distress
- **Problem:** When students typed *"I am not feeling happy today, my heart is crying"*, standard bag-of-words tokenizers scored *happy* with high weight and misclassified the student as joyful.
- **Solution:** Designed a pre-classification regex cleaner that strips phrases following negation markers (`not`, `never`, `can't`, `doesn't`). Additionally added an asymmetric distress safety override: if explicit distress tokens are present anywhere in the text, `happy` is automatically zeroed out.

---

## 2. Challenge: Identifying Compound Psychological Overwhelm
- **Problem:** Students rarely experience single, isolated emotions. A student facing exam deadlines alongside hostel loneliness isn't just "stressed" or "lonely" — they are experiencing acute mental overwhelm.
- **Solution:** Implemented mathematical compound emotion rules:
  $$\text{if } \{\text{stress}, \text{sad}\} \subseteq \text{ActiveEmotions} \implies \text{Overwhelmed}_{\text{boost}} = 0.8 \cdot \sum \text{Scores}$$
  This accurately flags students reaching cognitive limits before emotional crises emerge.

---

## 3. Challenge: Resource-Efficient Model Deployment
- **Problem:** Running full 70B parameter models for every emotional classification is impractical on budget infrastructure.
- **Solution:** Separated emotion detection (handled by the lightweight native Python engine in <1ms) from conversational text completion (handled via quantized LLaMA 3.2 3B Instruct or Groq LPU acceleration).
