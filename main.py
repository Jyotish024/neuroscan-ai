from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

import hashlib
with open("alzheimers_cnn_model.h5", "rb") as f:
    print(hashlib.sha256(f.read()).hexdigest())

# ----------------------------
# CONFIG (IDENTICAL TO STREAMLIT)
# ----------------------------
IMG_SIZE = 128

CLASS_NAMES = [
    "MildDemented",
    "ModerateDemented",
    "NonDemented",
    "VeryMildDemented"
]

MODEL_PATH = "alzheimers_cnn_model.h5"
model = None

# ----------------------------
# LOAD MODEL ON STARTUP
# ----------------------------
def load_model():
    global model

    if not os.path.exists(MODEL_PATH):
        raise RuntimeError(f"❌ Model file not found: {MODEL_PATH}")

    model = tf.keras.models.load_model(MODEL_PATH)
    print("✅ Model loaded successfully")
    print("TensorFlow version:", tf.__version__)
    print("Model input shape:", model.input_shape)


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


# ----------------------------
# APP INIT
# ----------------------------
app = FastAPI(title="Alzheimer MRI Detection API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# HEALTH CHECK
# ----------------------------
@app.get("/")
def health():
    return {"status": "API running"}


# ----------------------------
# PREDICTION ENDPOINT
# ----------------------------
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    global model

    try:
        # Read raw bytes
        contents = await file.read()

        # 🔥 SAVE RECEIVED IMAGE FOR COMPARISON
        with open("received_from_react.jpg", "wb") as f:
            f.write(contents)
        print("Saved received image as received_from_react.jpg")

        # EXACT SAME AS STREAMLIT
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        img = img.resize((IMG_SIZE, IMG_SIZE))

        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # 🔥 PRINT DEBUG VALUES
        print("Pixel sum:", np.sum(img_array))
        print("Image shape:", img_array.shape)

        predictions = model.predict(img_array)[0]

        print("Raw predictions:", predictions)

        predicted_index = int(np.argmax(predictions))
        confidence = float(predictions[predicted_index] * 100)

        result = {
            "stage": CLASS_NAMES[predicted_index],
            "confidence": round(confidence, 2),
            "probs": [
                {
                    "name": CLASS_NAMES[i],
                    "value": round(float(predictions[i] * 100), 2)
                }
                for i in range(len(CLASS_NAMES))
            ]
        }

        print("Final predicted stage:", result["stage"])
        print("Confidence:", result["confidence"])

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# RUN SERVER
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
