# Step 7 - Backend Setup

## Install FastAPI

```bash
pip install fastapi uvicorn
```

## Basic Backend

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def home():
    return {"message": "Manasitra AI Running"}
```

## Run Server

```bash
uvicorn main:app --reload
```
