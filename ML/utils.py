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
    return np.dot(embedding1, embedding2) / (norm(embedding1) * norm(embedding2))

# Function to preprocess an image and generate embedding
def preprocess_and_generate_embedding(image):
    faces, probs = mtcnn.detect(image)  # Detect faces and get probabilities
    if faces is not None:
        x1, y1, x2, y2 = map(int, faces[0])  # Get the first face's coordinates
        aligned_face = image[y1:y2, x1:x2]

        # Get landmarks from MTCNN's detect method
        landmarks = mtcnn(image)[0]  # Landmark coordinates for the first face

        if landmarks is not None:
            # Optional: Detect and align the face using the landmarks if necessary
            aligned_face = align_face_using_landmarks(image, landmarks)

        aligned_face = cv2.resize(aligned_face, (160, 160))
        aligned_face = (aligned_face - 127.5) / 128.0  # Normalize
        aligned_face = aligned_face.transpose(2, 0, 1)  # HWC to CHW
        aligned_face = torch.tensor(aligned_face, dtype=torch.float32).unsqueeze(0).to(device)

        # Generate face embedding
        embedding = inception_resnet(aligned_face)
        return embedding.detach().cpu().numpy().flatten()
    return None

# Align face using landmarks (optional step for better accuracy)
def align_face_using_landmarks(image, landmarks):
    # Implement a method to align face based on landmarks (using OpenCV or similar library)
    # For example, align face to a frontal position using the eyes or nose as keypoints.
    return image  # Return aligned face (for simplicity, this is a placeholder)

# Function to save embeddings
def save_embedding(embedding, student_id, image_id):
    save_dir = f'ML/embeddings/{student_id}'
    os.makedirs(save_dir, exist_ok=True)
    np.save(f"{save_dir}/{student_id}_embedding_{image_id}.npy", embedding)

# Function to load embeddings for all students
def load_all_embeddings():
    all_embeddings = {}
    for student_id in os.listdir('ML/embeddings'):
        student_dir = f'ML/embeddings/{student_id}'
        student_embeddings = []
        for file in os.listdir(student_dir):
            if file.endswith('.npy'):
                embedding = np.load(os.path.join(student_dir, file))
                student_embeddings.append(embedding)
        if student_embeddings:
            all_embeddings[student_id] = student_embeddings
    return all_embeddings

# Improved geometric median function with better convergence
def geometric_median(embeddings, max_iter=10, tol=1e-8):
    median = np.mean(embeddings, axis=0)  # Start with the mean as the initial guess
    for _ in range(max_iter):  # Iterate for a few steps
        distances = np.linalg.norm(embeddings - median, axis=1)
        weights = 1 / (distances + 1e-8)  # Avoid division by zero

        # Calculate the weighted average of embeddings to compute the new median
        weighted_mean = np.average(embeddings, axis=0, weights=weights)
        new_median = weighted_mean

        # Check for convergence
        if np.linalg.norm(new_median - median) < tol:
            break

        median = new_median
    return median

# Function to compare embeddings and find the best match using cosine similarity
def compare_embeddings(current_embedding, all_embeddings, threshold=0.6):
    best_match = None
    best_score = -1  # Cosine similarity range is from -1 to 1

    for student_id, embeddings in all_embeddings.items():
        geometric_median_embedding = embeddings[0]  # The first one is the geometric median

        # Calculate cosine similarity
        similarity_score = cosine_similarity(current_embedding, geometric_median_embedding)

        # Update best match if the similarity score is higher than the previous best
        if similarity_score > best_score:
            best_score = similarity_score
            best_match = student_id

    if best_match and best_score >= threshold:  # Use threshold for cosine similarity
        return best_match, best_score
    else:
        return None, None
