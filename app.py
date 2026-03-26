
import streamlit as st
import torch
import numpy as np
import cv2
from PIL import Image

from transformers import ConvNextImageProcessor, ConvNextForImageClassification

import chromadb
import ollama
from groq import Groq


CLASS_NAMES = [
    "MildDemented",
    "ModerateDemented",
    "NonDemented",
    "VeryMildDemented"
]

GROQ_API_KEY ="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"


@st.cache_resource
def load_model():

    processor = ConvNextImageProcessor.from_pretrained(
        "facebook/convnext-tiny-224"
    )

    model = ConvNextForImageClassification.from_pretrained(
        "facebook/convnext-tiny-224",
        num_labels=4,
        ignore_mismatched_sizes=True
    )

    model.load_state_dict(
        torch.load("alzheimers_convnext.pth", map_location="cpu")
    )

    model.eval()

    return processor, model


processor, model = load_model()


def generate_layercam(image):

    inputs = processor(images=image, return_tensors="pt")
    pixel_values = inputs["pixel_values"]

    feature_maps = []
    gradients = []

    def forward_hook(module, input, output):
        feature_maps.append(output)

    def backward_hook(module, grad_in, grad_out):
        gradients.append(grad_out[0])

    target_layer = model.convnext.encoder.stages[-1]

    handle_f = target_layer.register_forward_hook(forward_hook)
    handle_b = target_layer.register_backward_hook(backward_hook)

    outputs = model(pixel_values=pixel_values)

    pred_class = torch.argmax(outputs.logits)

    score = outputs.logits[:, pred_class]

    model.zero_grad()

    score.backward()

    fmap = feature_maps[0]
    grad = gradients[0]

    cam = torch.relu(grad * fmap)

    cam = torch.sum(cam, dim=1).squeeze()

    cam = cam.detach().numpy()

    cam = cv2.resize(cam, (224, 224))

    cam = cam - cam.min()

    cam = cam / cam.max()

    handle_f.remove()
    handle_b.remove()

    return cam


def overlay_heatmap(image, cam):

    image = np.array(image.resize((224,224)))

    heatmap = cv2.applyColorMap(
        np.uint8(255 * cam),
        cv2.COLORMAP_JET
    )

    overlay = heatmap * 0.4 + image * 0.6

    return overlay.astype(np.uint8)


@st.cache_resource
def setup_vectorstore():

    with open("Alzheimers.txt","r",encoding="utf-8") as f:
        text = f.read()

    chunk_size = 1000

    chunks = [
        text[i:i+chunk_size]
        for i in range(0,len(text),chunk_size)
    ]

    client = chromadb.Client()

    collection = client.create_collection(
        name="alzheimers"
    )

    embeddings = []

    for chunk in chunks:

        response = ollama.embeddings(
            model="gemma:2b",
            prompt=chunk
        )

        embeddings.append(
            response["embedding"]
        )

    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[str(i) for i in range(len(chunks))]
    )

    return collection


collection = setup_vectorstore()


groq_client = Groq(api_key=GROQ_API_KEY)


def ask_alzheimer_bot(question):

    query_embedding = ollama.embeddings(
        model="gemma:2b",
        prompt=question
    )["embedding"]

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=3
    )

    context = "\n\n".join(results["documents"][0])

    prompt = f"""
You are a medical assistant specialized in Alzheimer’s disease.

Use ONLY the context below to answer.

Context:
{context}

Question:
{question}

Provide a structured medical explanation.
"""

    response = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role":"user","content":prompt}],
        temperature=0
    )

    return response.choices[0].message.content


st.set_page_config(page_title="Alzheimer AI System")

st.title("🧠 Alzheimer MRI Detection + AI Assistant")


uploaded = st.file_uploader(
    "Upload Brain MRI",
    type=["jpg","jpeg","png"]
)

if uploaded:

    img = Image.open(uploaded).convert("RGB")

    st.image(img)

    if st.button("Predict Stage"):

        inputs = processor(
            images=img,
            return_tensors="pt"
        )

        with torch.no_grad():

            outputs = model(**inputs)

            probs = torch.softmax(
                outputs.logits,
                dim=1
            )

        idx = torch.argmax(probs).item()

        confidence = probs[0][idx].item()*100

        stage = CLASS_NAMES[idx]

        st.success(f"Predicted Stage: {stage}")

        st.info(f"Confidence: {confidence:.2f}%")

        cam = generate_layercam(img)

        heatmap = overlay_heatmap(img,cam)

        st.subheader("Layer-CAM Brain Attention")

        st.image(heatmap)

        explanation = ask_alzheimer_bot(
            f"Explain the stage {stage} including symptoms and treatment."
        )

        st.subheader("Medical Explanation")

        st.write(explanation)


query = st.text_input(
    "Ask about Alzheimer symptoms, treatment..."
)

if query:

    answer = ask_alzheimer_bot(query)

    st.write(answer)