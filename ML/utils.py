import cv2
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
import os
from numpy.linalg import norm

# Initialize MTCNN and InceptionResnetV1
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=True, device=device)
inception_resnet = InceptionResnetV1(pretrained='vggface2').to(device).eval()

# Cosine similarity function
def cosine_similarity(embedding1, embedding2):
    embedding1 = embedding1 / norm(embedding1)
    embedding2 = embedding2 / norm(embedding2)
    return np.dot(embedding1, embedding2)

# Function to preprocess an image and generate embedding
def preprocess_and_generate_embedding(image):
    faces, probs = mtcnn.detect(image)
    if faces is not None and len(faces) > 0:
        largest_face_index = np.argmax([face[2] - face[0] for face in faces])  # Largest face
        x1, y1, x2, y2 = map(int, faces[largest_face_index])  # Bounding box
        cropped_face = image[y1:y2, x1:x2]

        # Resize the face for the model
        cropped_face = cv2.resize(cropped_face, (160, 160))
        cropped_face = (cropped_face - 127.5) / 128.0  # Normalize
        cropped_face = cropped_face.transpose(2, 0, 1)  # Convert to CHW
        cropped_face = torch.tensor(cropped_face, dtype=torch.float32).unsqueeze(0).to(device)

        # Generate embedding
        embedding = inception_resnet(cropped_face)
        return embedding.detach().cpu().numpy().flatten()
    return None

# Refined geometric median
def geometric_median(embeddings, max_iter=100, tol=1e-6):
    median = np.mean(embeddings, axis=0)
    for _ in range(max_iter):
        distances = np.linalg.norm(embeddings - median, axis=1)
        weights = 1 / (distances + 1e-8)
        new_median = np.average(embeddings, axis=0, weights=weights)
        if np.linalg.norm(new_median - median) < tol:
            break
        median = new_median
    return median

# Save geometric median embedding
def save_geometric_median_embedding(student_id, name, embeddings):
    save_dir = f'ML/embeddings/{student_id}_{name}'
    os.makedirs(save_dir, exist_ok=True)

    # Normalize embeddings and calculate geometric median
    embeddings = np.array([e / norm(e) for e in embeddings])
    median_embedding = geometric_median(embeddings)

    # Save geometric median embedding
    np.save(f"{save_dir}/{student_id}_median_embedding.npy", median_embedding)

# Load embeddings
def load_all_embeddings():
    all_embeddings = {}
    for dir_name in os.listdir('ML/embeddings'):
        dir_path = f'ML/embeddings/{dir_name}'
        if os.path.isdir(dir_path):
            student_id = dir_name.split('_')[0]
            name = "_".join(dir_name.split('_')[1:])
            file_path = os.path.join(dir_path, f"{student_id}_median_embedding.npy")
            if os.path.exists(file_path):
                embedding = np.load(file_path)
                all_embeddings[(student_id, name)] = embedding
    return all_embeddings

# Compare embeddings
def compare_embeddings(current_embedding, all_embeddings, threshold=0.9):
    best_match = None
    best_score = -1
    current_embedding = current_embedding / norm(current_embedding)

    for (student_id, name), embedding in all_embeddings.items():
        similarity_score = cosine_similarity(current_embedding, embedding)
        if similarity_score > best_score:
            best_score = similarity_score
            best_match = (student_id, name)

    if best_match and best_score >= threshold:
        return best_match, best_score
    else:
        return None, None
