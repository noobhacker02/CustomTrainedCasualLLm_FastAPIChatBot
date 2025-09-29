import os
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel  
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, GenerationConfig

# --- Configuration ---
# Fetch the model ID from an environment variable. If it's not set,
# default to the specified fine-tuned model. This makes the app more flexible.
MODEL_ID = os.environ.get("HF_MODEL_ID", "Noobhacker69/Causal_LLM_model-customfinetune_wiki")

# Determine the computation device: use NVIDIA CUDA GPU if available, otherwise CPU.
# Using a GPU will result in significantly faster inference.
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# --- FastAPI App Initialization ---
app = FastAPI(
    title="Causal LLM Custom Finetune - FastAPI",
    version="0.1",
    description="A simple API to serve a custom-finetuned causal language model from Hugging Face."
)

# --- CORS Middleware (FIXED) ---
# This middleware allows the frontend application to make requests to this backend.
# It's a security feature browsers enforce called the Same-Origin Policy.
# Using ["*"] for allow_origins is a simple way to get it working in a local dev environment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins, including your Vite app on http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all request headers
)

# --- Pydantic Models for Request and Response ---
# These models define the expected structure and data types for API requests and responses.
# FastAPI uses them for validation, serialization, and documentation.

class GenerateRequest(BaseModel):
    """Defines the structure of the JSON payload for a /generate request."""
    prompt: str
    max_new_tokens: Optional[int] = 100
    temperature: Optional[float] = 0.8
    top_p: Optional[float] = 0.95
    do_sample: Optional[bool] = True

class GenerateResponse(BaseModel):
    """Defines the structure of the JSON response for a /generate request."""
    generated_text: str
    model_id: str
    device: str

# --- Global Variables for Model and Tokenizer ---
# These will be loaded once at startup and reused for every request.
# This avoids the massive overhead of reloading the model each time.
tokenizer = None
model = None

# --- Application Events ---
@app.on_event("startup")
def load_model_and_tokenizer():
    """
    This function is executed once when the FastAPI application starts.
    It loads the Hugging Face model and tokenizer into memory.
    """
    global tokenizer, model
    print(f"--- Loading model '{MODEL_ID}' on device '{DEVICE}'... ---")
    try:
        # Load the tokenizer, which is responsible for converting text to numerical IDs.
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, use_fast=True)

        # Load the pre-trained causal language model.
        model = AutoModelForCausalLM.from_pretrained(MODEL_ID)

        # Move the model to the selected device (GPU or CPU).
        model.to(DEVICE)

        # Set the model to evaluation mode. This disables layers like dropout
        # that are only used during training.
        model.eval()
        print("--- Model loaded successfully! ---")
    except Exception as e:
        print(f"--- ERROR: Failed to load model. ---")
        print(f"Error details: {e}")
        # If the model fails to load, you might want to prevent the app from starting
        # or handle it gracefully. For now, it will just print an error.

# --- API Endpoints ---
@app.get("/")
def get_root():
    """
    Root endpoint to provide a simple health check and info message.
    """
    return {"message": f"Causal LLM API is running. Using model '{MODEL_ID}' on {DEVICE}."}

@app.post("/generate", response_model=GenerateResponse)
def post_generate(req: GenerateRequest):
    """
    The main endpoint for generating text. It takes a prompt and generation
    parameters, and returns the model's output.
    """
    if not model or not tokenizer:
        raise HTTPException(status_code=503, detail="Model is not loaded. Please check server logs.")

    # 1. Tokenize the input prompt
    # The tokenizer converts the text prompt into a format the model understands (input_ids).
    inputs = tokenizer(req.prompt, return_tensors="pt", truncation=True, max_length=512)

    # Move the tokenized inputs to the same device as the model.
    input_ids = inputs["input_ids"].to(DEVICE)
    attention_mask = inputs.get("attention_mask", torch.ones_like(input_ids)).to(DEVICE)

    # 2. Configure Generation
    # Create a generation configuration object with parameters from the request.
    generation_config = GenerationConfig(
        temperature=req.temperature,
        top_p=req.top_p,
        do_sample=req.do_sample,
        max_new_tokens=req.max_new_tokens,
        pad_token_id=tokenizer.eos_token_id  # Set pad_token_id to eos_token_id for open-ended generation
    )

    # 3. Generate Text
    # `torch.no_grad()` is a context manager that disables gradient calculations,
    # which is crucial for inference as it reduces memory usage and speeds up computation.
    with torch.no_grad():
        outputs = model.generate(
            input_ids=input_ids,
            attention_mask=attention_mask,
            generation_config=generation_config
        )

    # 4. Decode the output
    # The tokenizer converts the generated token IDs back into human-readable text.
    # `skip_special_tokens=True` removes tokens like [CLS], [SEP], etc.
    decoded_text = tokenizer.decode(outputs[0], skip_special_tokens=True)

    # 5. Post-process the text
    # Strip the original prompt from the beginning of the generated text to return only the new part.
    if decoded_text.startswith(req.prompt):
        generated_part = decoded_text[len(req.prompt):].strip()
    else:
        # Fallback in case the model's output doesn't start with the prompt
        generated_part = decoded_text.strip()

    # 6. Return the response
    return GenerateResponse(
        generated_text=generated_part,
        model_id=MODEL_ID,
        device=DEVICE
    )

