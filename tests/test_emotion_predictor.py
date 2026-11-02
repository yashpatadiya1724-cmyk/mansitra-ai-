"""
Unit Tests for Manasitra Native Emotion Predictor Engine
"""

import sys
import os

# Fix Windows stdout encoding for emojis
if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')

# Add predictor module path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'manasitra', 'ai-engine', 'emotion_model')))

from predictor import predict_emotion, LABELS

def run_tests():
    print("==================================================")
    print("🧠 MANASITRA AI: EMOTION PREDICTOR UNIT TESTS")
    print("==================================================")

    # 1. Happy Test
    res_happy = predict_emotion("I passed all my semester exams with great marks and feel wonderful!")
    assert res_happy["emotion"] == "happy", f"Expected happy, got {res_happy['emotion']}"
    print(f"✅ Happy Emotion: {res_happy['emoji']} (Confidence: {res_happy['confidence']*100:.1f}%)")

    # 2. Lonely Test
    res_lonely = predict_emotion("I feel completely alone in this hostel and have no friends to talk to.")
    assert res_lonely["emotion"] == "lonely", f"Expected lonely, got {res_lonely['emotion']}"
    print(f"✅ Lonely Emotion: {res_lonely['emoji']} (Confidence: {res_lonely['confidence']*100:.1f}%)")

    # 3. Anxiety / Overthinking Test
    res_anxiety = predict_emotion("My mind won't stop racing with panic and what-if scenarios about placement.")
    assert res_anxiety["emotion"] == "anxiety", f"Expected anxiety, got {res_anxiety['emotion']}"
    print(f"✅ Anxiety Emotion: {res_anxiety['emoji']} (Confidence: {res_anxiety['confidence']*100:.1f}%)")

    # 4. Grief Test
    res_grief = predict_emotion("My grandfather passed away and I am grieving his loss.")
    assert res_grief["emotion"] == "grief", f"Expected grief, got {res_grief['emotion']}"
    print(f"✅ Grief Emotion: {res_grief['emoji']} (Confidence: {res_grief['confidence']*100:.1f}%)")

    # 5. Compound Emotion Test (Stress + Lonely -> Overwhelmed)
    res_compound = predict_emotion("Exams are piling up with too much pressure and I am feeling very alone.")
    assert res_compound["emotion"] == "overwhelmed", f"Expected overwhelmed, got {res_compound['emotion']}"
    print(f"✅ Compound Emotion (Stress + Lonely): {res_compound['emoji']} {res_compound['emotion']}")

    # 6. Negation Guard Test ("not happy" must not classify as happy)
    res_neg = predict_emotion("I am not happy with my grades, feeling heartbroken and crying.")
    assert res_neg["emotion"] != "happy", f"Negation failed, classified as {res_neg['emotion']}"
    assert res_neg["emotion"] in ["sad", "overwhelmed"], f"Expected sad/overwhelmed, got {res_neg['emotion']}"
    print(f"✅ Negation Handling Verified: 'not happy' correctly routed to {res_neg['emotion']}")

    # 7. Neutral Fallback Test
    res_neutral = predict_emotion("The weather is ordinary and I just had water.")
    assert res_neutral["emotion"] == "neutral", f"Expected neutral, got {res_neutral['emotion']}"
    print(f"✅ Neutral Fallback Verified: {res_neutral['emoji']} {res_neutral['emotion']}")

    print("==================================================")
    print("🏆 ALL EMOTION PREDICTOR TESTS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
