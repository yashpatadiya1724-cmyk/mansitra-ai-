"""
Run this anytime to check training status + test current model quality.
Usage: python check_training.py
"""
import os, sys, json, torch
sys.path.insert(0, os.path.dirname(__file__))

SAVE_DIR   = os.path.join(os.path.dirname(__file__), "saved_model")
MODEL_PATH = os.path.join(SAVE_DIR, "manasitra_model.pt")
TOK_PATH   = os.path.join(SAVE_DIR, "tokenizer.json")

if not os.path.exists(MODEL_PATH):
    print("❌ Model not trained yet. Training is still running...")
    sys.exit(0)

ckpt = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)
print(f"✅ Model found!")
print(f"   Epoch    : {ckpt['epoch']}")
print(f"   Vocab    : {ckpt['vocab_size']}")
print(f"   Config   : {ckpt['config']}")

# Test inference
from inference import generate, is_model_trained

tests = [
    ("I feel so lonely, nobody talks to me",        "lonely"),
    ("I am so stressed about my exams",              "stress"),
    ("I feel happy today, I got good marks",         "happy"),
    ("I am so angry at my friend, they betrayed me", "angry"),
    ("I keep worrying about everything",             "anxiety"),
    ("I feel worthless and empty inside",            "sad"),
]

print(f"\n{'─'*60}")
print("  Inference Test")
print(f"{'─'*60}")
for text, emotion in tests:
    reply = generate(text, emotion, max_len=60, top_k=20)
    print(f"[{emotion:8s}] {text[:50]}")
    print(f"           → {reply}")
    print()
