import cv2
import numpy as np
from utils import preprocess_and_generate_embedding, save_embedding, geometric_median

def register_student():
    student_id = input("Enter the student ID for registration: ")
    cap = cv2.VideoCapture(0)
    
    if not cap.isOpened():
        print("Error: Unable to access the camera.")
        return
    
    num_images = 25
    print(f"Capturing {num_images} images for student {student_id}...")

    captured = 0
    retries = 0
    embeddings = []

    while captured < num_images:
        ret, frame = cap.read()
        if not ret:
            print("Failed to capture frame.")
            continue
        
        embedding = preprocess_and_generate_embedding(frame)
        if embedding is not None:
            embeddings.append(embedding)
            print(f"Generated embedding {captured + 1}/{num_images}: {embedding[:10]}...")  # Show first 10 values for brevity
            captured += 1
        else:
            print("Face not detected. Please adjust your position.")
            retries += 1

        if retries > 100:
            print("Too many retries. Registration aborted.")
            break

    # Calculate geometric median after capturing all embeddings
    if len(embeddings) == num_images:
        final_embedding = geometric_median(embeddings)
        print(f"Final Geometric Median Embedding: {final_embedding[:10]}...")  # Show first 10 values for brevity
        save_embedding(final_embedding, student_id, 'final')
        print(f"Registration completed for student {student_id}.")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    register_student()
