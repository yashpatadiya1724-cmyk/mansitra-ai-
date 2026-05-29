# Step 4 - Memory Engine

## Purpose
Store user emotions, preferences, mood history, and conversations.

## Example Data

```json
{
  "name": "Yash",
  "mood_history": ["sad", "happy"],
  "stress_trigger": "exams"
}
```

## Recommended Database
- PostgreSQL
- MongoDB
- SQLite

## Memory Flow

```text
User Message
    ↓
Store Emotion
    ↓
Save Conversation
    ↓
Fetch Previous Memory
```
