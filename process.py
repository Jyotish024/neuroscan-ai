import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from sklearn.model_selection import train_test_split
from transformers import ConvNextImageProcessor, ConvNextForImageClassification
from tqdm import tqdm

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 5
NUM_WORKERS = 2


class AlzheimerDataset(Dataset):

    def __init__(self, dataframe, processor):
        self.df = dataframe.reset_index(drop=True)
        self.processor = processor

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx):
        row = self.df.iloc[idx]

        image = Image.open(row["image_path"]).convert("RGB")

        encoding = self.processor(images=image, return_tensors="pt")

        pixel_values = encoding["pixel_values"].squeeze()

        label = torch.tensor(row["label_id"])

        return pixel_values, label


def main():
    df = pd.read_csv("alzheimers_data.csv")

    df["image_path"] = df["image_path"].str.replace("\\", "/", regex=False)
    df["label"] = df["label"].str.strip().str.lower()

    labels = sorted(df["label"].unique())

    label2id = {label: i for i, label in enumerate(labels)}
    id2label = {i: label for label, i in label2id.items()}

    df["label_id"] = df["label"].map(label2id)

    train_df, val_df = train_test_split(
        df,
        test_size=0.2,
        stratify=df["label_id"],
        random_state=42
    )

    processor = ConvNextImageProcessor.from_pretrained(
        "facebook/convnext-tiny-224"
    )

    train_dataset = AlzheimerDataset(train_df, processor)
    val_dataset = AlzheimerDataset(val_df, processor)

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        num_workers=NUM_WORKERS
    )

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print("Device:", device)

    model = ConvNextForImageClassification.from_pretrained(
        "facebook/convnext-tiny-224",
        num_labels=len(labels),
        id2label=id2label,
        label2id=label2id,
        ignore_mismatched_sizes=True
    )

    model.to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=3e-5)

    criterion = torch.nn.CrossEntropyLoss()

    for epoch in range(EPOCHS):

        print("\nEpoch", epoch + 1, "/", EPOCHS)

        model.train()

        train_correct = 0
        train_total = 0

        for images, labels in tqdm(train_loader):
            images = images.to(device)
            labels = labels.to(device)

            outputs = model(pixel_values=images).logits

            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            preds = torch.argmax(outputs, dim=1)

            train_correct += (preds == labels).sum().item()
            train_total += labels.size(0)

        train_acc = train_correct / train_total

        model.eval()

        val_correct = 0
        val_total = 0

        with torch.no_grad():

            for images, labels in val_loader:
                images = images.to(device)
                labels = labels.to(device)

                outputs = model(pixel_values=images).logits

                preds = torch.argmax(outputs, dim=1)

                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_acc = val_correct / val_total

        print("Train Accuracy:", train_acc)
        print("Validation Accuracy:", val_acc)

    torch.save(model.state_dict(), "alzheimers_convnext.pth")

    print("\nModel saved")


if __name__ == "__main__":
    main()