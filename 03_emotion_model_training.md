# Step 3 - Emotion Model Training

## Install Requirements

```bash
pip install torch transformers datasets scikit-learn
```

## Training Code

```python
from datasets import load_dataset
from transformers import AutoTokenizer
from transformers import AutoModelForSequenceClassification
from transformers import TrainingArguments
from transformers import Trainer

dataset = load_dataset("dair-ai/emotion")

model_name = "distilbert-base-uncased"

tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize(batch):
    return tokenizer(batch["text"], padding=True, truncation=True)

dataset = dataset.map(tokenize, batched=True)

model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=6
)

training_args = TrainingArguments(
    output_dir="./emotion_model",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    num_train_epochs=3
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=dataset["train"]
)

trainer.train()
```

## Save Model

```python
model.save_pretrained("./manasitra_emotion")
tokenizer.save_pretrained("./manasitra_emotion")
```
