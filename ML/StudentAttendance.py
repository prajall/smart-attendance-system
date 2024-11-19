import cv2
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import os

# Initialize MTCNN and InceptionResnetV1
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=False, device=device, post_process=False, thresholds=[0.6, 0.7, 0.7])  # Adjust thresholds
inception_resnet = InceptionResnetV1(pretrained='vggface2').to(device).eval()

# Preprocess and align face
def preprocess_and_generate_embedding(image):
    faces, probs = mtcnn.detect(image)
    if faces is not None and probs[0] > 0.9:  # Confidence threshold
        x1, y1, x2, y2 = faces[0].astype(int)
        aligned_face = image[y1:y2, x1:x2]
        aligned_face = cv2.resize(aligned_face, (160, 160))
        aligned_face = (aligned_face - 127.5) / 128.0  # Normalize
        aligned_face = aligned_face.transpose(2, 0, 1)  # HWC to CHW
        aligned_face = torch.tensor(aligned_face, dtype=torch.float32).unsqueeze(0).to(device)

        # Generate the face embedding
        embedding = inception_resnet(aligned_face)
        return embedding.detach().cpu().numpy().flatten()
    return None

# Save the embedding for the student
def save_embedding(embedding, student_id, image_id):
    save_dir = 'embeddings'
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    np.save(f"{save_dir}/{student_id}_embedding_{image_id}.npy", embedding)
    print(f"Embedding saved for student {student_id}, image {image_id}")

# Augmentation for variability
def augment_image(image):
    augmented_images = []
    # Flip
    augmented_images.append(cv2.flip(image, 1))
    # Brightness/contrast adjustment
    alpha = np.random.uniform(0.8, 1.2)  # Brightness factor
    beta = np.random.randint(-20, 20)    # Contrast adjustment
    augmented_images.append(cv2.convertScaleAbs(image, alpha=alpha, beta=beta))
    # Rotation
    rows, cols, _ = image.shape
    angle = np.random.uniform(-15, 15)
    M = cv2.getRotationMatrix2D((cols / 2, rows / 2), angle, 1)
    augmented_images.append(cv2.warpAffine(image, M, (cols, rows)))

    return augmented_images

# Capture and generate multiple embeddings for student
def capture_and_save_multiple_embeddings():
    cap = cv2.VideoCapture(0)
    student_id = input("Enter student ID: ")

    num_images = 25  # Capture 25 images for storing multiple embeddings
    print(f"Capturing {num_images} images for enrollment...")

    captured = 0
    retries = 0

    while captured < num_images:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame.")
            continue

        # Augment and extract embeddings
        embeddings = []
        augmentations = [frame] + augment_image(frame)

        for aug_image in augmentations:
            embedding = preprocess_and_generate_embedding(aug_image)
            if embedding is not None:
                embeddings.append(embedding)

        if embeddings:
            save_embedding(np.mean(embeddings, axis=0), student_id, captured + 1)
            print(f"Captured and saved image {captured + 1}/{num_images} for student {student_id}")
            captured += 1
        else:
            print("Face not detected, retrying...")
            retries += 1

        if retries > 10:  # Avoid infinite loops if conditions are poor
            print("Too many retries, please adjust lighting or position.")
            break

    cap.release()
    cv2.destroyAllWindows()

# Run the function to capture and save multiple embeddings
capture_and_save_multiple_embeddings()
