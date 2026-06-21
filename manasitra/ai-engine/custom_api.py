import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Manasitra Custom AI Engine")

# CORS setup so Next.js can call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading AI Model into memory... (This might take a few minutes)")
# We use a base model here. Later, you will replace this with your fine-tuned model path.
MODEL_NAME = "meta-llama/Llama-3.2-3B-Instruct" 

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16, # Use float16 to save memory
    device_map="auto" # Automatically puts it on GPU if available, else CPU
)
print("Model loaded successfully!")

class ChatRequest(BaseModel):
    message: str

# This replaces the Ollama "Modelfile". We inject the persona directly into the AI's brain.
SYSTEM_PROMPT = """You are Manasitra — a warm, empathetic, and professional psychologist/therapist for students.
- Reply in the EXACT language the user speaks (English, Hindi, Hinglish, etc.).
- Maximum 3-4 sentences per response.
- Maintain a professional yet deeply caring clinical tone.
- ALWAYS end with one gentle follow-up question unless the user is in crisis.
- Never say "As an AI" or "I am a language model".
"""

@app.get("/")
def read_root():
    return {"status": "Proper Custom AI Engine is running!"}

@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        # 1. Format the prompt with our System Persona and User Message
        prompt = f"<|system|>\n{SYSTEM_PROMPT}\n<|user|>\n{request.message}\n<|assistant|>\n"
        
        # 2. Convert text to tokens
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        # 3. Generate response from the AI
        outputs = model.generate(
            **inputs,
            max_new_tokens=250,
            temperature=0.75,
            top_p=0.90,
            do_sample=True,
            pad_token_id=tokenizer.eos_token_id
        )
        
        # 4. Decode the response back to text
        response_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        # Extract only the assistant's reply (remove the prompt part)
        reply = response_text.split("<|assistant|>")[-1].strip()

        return {"reply": reply, "model": "custom-manasitra"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Run the custom engine
    uvicorn.run(app, host="0.0.0.0", port=8000)
