"""
Manasitra Emotion Model Training
Trains a DistilBERT classifier on 7 emotions:
  happy, sad, angry, stress, anxiety, lonely, neutral
"""

import json
import os
import numpy as np
from datasets import Dataset, DatasetDict
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    TrainingArguments,
    Trainer,
    DataCollatorWithPadding,
)
from sklearn.metrics import accuracy_score, f1_score

# ── Label mapping ──────────────────────────────────────────────────────────────
LABELS = ["happy", "sad", "angry", "stress", "anxiety", "lonely", "neutral"]
LABEL2ID = {label: idx for idx, label in enumerate(LABELS)}
ID2LABEL = {idx: label for label, idx in LABEL2ID.items()}

MODEL_NAME = "distilbert-base-uncased"
OUTPUT_DIR = "./manasitra_emotion_model"
DATASET_DIR = os.path.join(os.path.dirname(__file__), "../../dataset")


# ── Load dataset ───────────────────────────────────────────────────────────────
def load_split(filename: str) -> list[dict]:
    path = os.path.join(DATASET_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    # Convert string labels to integer ids
    for item in data:
        item["label"] = LABEL2ID[item["emotion"]]
    return data


def build_dataset() -> DatasetDict:
    train_data = load_split("train.json")
    test_data = load_split("test.json")
    val_data = load_split("validation.json")

    return DatasetDict(
        {
            "train": Dataset.from_list(train_data),
            "test": Dataset.from_list(test_data),
            "validation": Dataset.from_list(val_data),
        }
    )


# ── Tokenise ───────────────────────────────────────────────────────────────────
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)


def tokenize(batch):
    return tokenizer(batch["text"], truncation=True, max_length=128)


# ── Metrics ────────────────────────────────────────────────────────────────────
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = np.argmax(logits, axis=-1)
    return {
        "accuracy": accuracy_score(labels, predictions),
        "f1": f1_score(labels, predictions, average="weighted"),
    }


# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    print("Loading dataset...")
    raw_ds = build_dataset()

    print("Tokenising...")
    tokenised_ds = raw_ds.map(tokenize, batched=True)
    tokenised_ds = tokenised_ds.remove_columns(["text", "emotion"])
    tokenised_ds.set_format("torch")

    print("Loading model...")
    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=len(LABELS),
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    training_args = TrainingArguments(
        output_dir=OUTPUT_DIR,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        per_device_train_batch_size=8,
        per_device_eval_batch_size=8,
        num_train_epochs=5,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        logging_dir="./logs",
        logging_steps=10,
        report_to="none",  # disable wandb / tensorboard by default
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=tokenised_ds["train"],
        eval_dataset=tokenised_ds["validation"],
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer),
        compute_metrics=compute_metrics,
    )

    print("Training...")
    trainer.train()

    print(f"Saving model to {OUTPUT_DIR}")
    model.save_pretrained(OUTPUT_DIR)
    tokenizer.save_pretrained(OUTPUT_DIR)
    print("Done! Model saved.")


if __name__ == "__main__":
    main()
