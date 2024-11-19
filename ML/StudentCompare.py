import cv2
import numpy as np
from facenet_pytorch import MTCNN, InceptionResnetV1
import torch
from sklearn.metrics.pairwise import cosine_similarity
from scipy.optimize import minimize
import os

# Initialize MTCNN and InceptionResnetV1
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
mtcnn = MTCNN(keep_all=True, device=device)
inception_resnet = InceptionResnetV1(pretrained='vggface2').to(device).eval()

# Preprocess and generate face embeddings
def preprocess_and_generate_embedding(image):
    faces, _ = mtcnn.detect(image)
    if faces is not None:
        aligned_face = image[int(faces[0][1]):int(faces[0][3]), int(faces[0][0]):int(faces[0][2])]
        aligned_face = cv2.resize(aligned_face, (160, 160))
        aligned_face = (aligned_face - 127.5) / 128.0  # Normalize
        aligned_face = aligned_face.transpose(2, 0, 1)  # HWC to CHW
        aligned_face = torch.tensor(aligned_face, dtype=torch.float32).unsqueeze(0).to(device)

        # Generate the face embedding
        embedding = inception_resnet(aligned_face)
        return embedding.detach().cpu().numpy().flatten()
    return None

# Geometric Median Method
def geometric_median(embeddings):
    if len(embeddings) == 0:
        return None

    def aggregate_distance(x, points):
        return np.sum(np.linalg.norm(points - x, axis=1))

    initial_guess = np.mean(embeddings, axis=0)
    result = minimize(aggregate_distance, initial_guess, args=(np.vstack(embeddings)), method='L-BFGS-B')
    return result.x

# Consensus Average Method
def consensus_average(embeddings, threshold=0.8):
    if len(embeddings) == 0:
        return None

    embeddings_array = np.vstack(embeddings)
    similarity_matrix = cosine_similarity(embeddings_array)

    avg_similarities = np.mean(similarity_matrix, axis=1)
    consensus_embeddings = embeddings_array[avg_similarities >= threshold]

    if len(consensus_embeddings) == 0:
        return np.mean(embeddings_array, axis=0)  # Fallback to mean

    return np.mean(consensus_embeddings, axis=0)

# Augmentation-Based Embedding Generation
def augment_and_average(image):
    augmented_embeddings = []
    for _ in range(5):  # Generate 5 augmentations
        augmented_image = image.copy()

        if np.random.rand() > 0.5:  # Flip
            augmented_image = cv2.flip(augmented_image, 1)
        
        # Add random brightness variation
        hsv_image = cv2.cvtColor(augmented_image, cv2.COLOR_BGR2HSV)
        hsv_image[..., 2] = cv2.normalize(hsv_image[..., 2], None, 0, 255, cv2.NORM_MINMAX)
        augmented_image = cv2.cvtColor(hsv_image, cv2.COLOR_HSV2BGR)

        embedding = preprocess_and_generate_embedding(augmented_image)
        if embedding is not None:
            augmented_embeddings.append(embedding)

    return np.mean(augmented_embeddings, axis=0) if augmented_embeddings else None

# Load multiple embeddings for a student
def load_reference_embeddings(student_id):
    embeddings = []
    for i in range(1, 6):  # Assuming 5 images have been captured and saved as 1-5
        try:
            embedding = np.load(f'embeddings/{student_id}_embedding_{i}.npy')
            embeddings.append(embedding)
        except FileNotFoundError:
            print(f"Embedding {i} not found for student {student_id}")
            continue
    return embeddings

# Compare embeddings using cosine similarity
def compare_embeddings(reference_embedding, current_embedding, threshold=0.8):
    similarity = cosine_similarity([reference_embedding], [current_embedding])
    if similarity[0][0] >= threshold:
        return True, similarity[0][0]
    return False, similarity[0][0]

# Real-time attendance function
def real_time_attendance(aggregation_method="geometric_median"):
    cap = cv2.VideoCapture(0)
    student_id = input("Enter student ID to check attendance: ")

    # Load the embeddings for the student
    reference_embeddings = load_reference_embeddings(student_id)
    if len(reference_embeddings) == 0:
        print(f"No embeddings found for student {student_id}")
        return

    # Choose the embedding aggregation method
    if aggregation_method == "geometric_median":
        reference_embedding = geometric_median(reference_embeddings)
    elif aggregation_method == "consensus_average":
        reference_embedding = consensus_average(reference_embeddings)
    else:
        print(f"Unknown aggregation method: {aggregation_method}")
        return

    if reference_embedding is None:
        print(f"Failed to aggregate embeddings for student {student_id}")
        return

    print(f"Using {aggregation_method} embedding for student {student_id}")

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Generate embedding from current frame
        current_embedding = preprocess_and_generate_embedding(frame)

        if current_embedding is not None:
            # Compare with the aggregated reference embedding
            is_match, similarity_score = compare_embeddings(reference_embedding, current_embedding)

            # Display similarity score
            cv2.putText(frame, f"Similarity: {similarity_score:.2f}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)

            # Display match result
            if is_match:
                cv2.putText(frame, "MATCH FOUND!", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 0, 255), 2)
            else:
                cv2.putText(frame, "No Match", (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        cv2.imshow("Real-Time Attendance", frame)

        # Quit with 'q' key
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Run the function for real-time attendance
real_time_attendance(aggregation_method="geometric_median")
