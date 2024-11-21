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

# Function to align face using landmarks
def align_face_using_landmarks(image, landmarks):
    if landmarks is None or len(landmarks) < 5:
        return image  # If no landmarks are found, return the original image

    left_eye = landmarks[0]
    right_eye = landmarks[1]
    nose = landmarks[2]
    left_mouth = landmarks[3]
    right_mouth = landmarks[4]

    # Calculate the center of the eyes
    eye_center = ((left_eye[0] + right_eye[0]) // 2, (left_eye[1] + right_eye[1]) // 2)

    # Calculate the angle between the eyes
    dx = right_eye[0] - left_eye[0]
    dy = right_eye[1] - left_eye[1]
    angle = np.degrees(np.arctan2(dy, dx))  # Rotation angle in degrees

    # Perform rotation
    rot_matrix = cv2.getRotationMatrix2D(eye_center, angle, scale=1.0)
    aligned_face = cv2.warpAffine(image, rot_matrix, (image.shape[1], image.shape[0]))

    return aligned_face

# Function to preprocess an image and generate embedding
def preprocess_and_generate_embedding(image):
    faces, probs = mtcnn.detect(image)
    if faces is not None and len(faces) > 0:
        # Select the largest face (most likely to be the main subject)
        largest_face_index = np.argmax([face[2] - face[0] for face in faces])  # Find the largest face
        x1, y1, x2, y2 = map(int, faces[largest_face_index])  # Bounding box of the largest face
        cropped_face = image[y1:y2, x1:x2]
        landmarks = mtcnn(image)[largest_face_index]  # Get landmarks for alignment

        # Align face using landmarks if available
        aligned_face = align_face_using_landmarks(image, landmarks)

        # Resize the aligned face to the size that the model expects (160x160)
        aligned_face = cv2.resize(aligned_face, (160, 160))
        aligned_face = (aligned_face - 127.5) / 128.0  # Normalize the image
        aligned_face = aligned_face.transpose(2, 0, 1)  # Convert from HWC to CHW format
        aligned_face = torch.tensor(aligned_face, dtype=torch.float32).unsqueeze(0).to(device)

        # Generate the embedding using the InceptionResnet model
        embedding = inception_resnet(aligned_face)
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

    # Calculate geometric median
    median_embedding = geometric_median(np.array(embeddings))

    # Save geometric median embedding
    np.save(f"{save_dir}/{student_id}_median_embedding.npy", median_embedding)

# Function to load all embeddings
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

# Compare embeddings with cosine similarity
def compare_embeddings(current_embedding, all_embeddings, threshold=0.9):
    best_match = None
    best_score = -1

    for (student_id, name), embedding in all_embeddings.items():
        similarity_score = cosine_similarity(current_embedding, embedding)
        if similarity_score > best_score:
            best_score = similarity_score
            best_match = (student_id, name)

    if best_match and best_score >= threshold:
        return best_match, best_score
    else:
        return None, None
