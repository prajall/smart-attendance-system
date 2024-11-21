import cv2
from utils import preprocess_and_generate_embedding, save_geometric_median_embedding

def register_student():
    student_id = input("Enter the student ID for registration: ")
    name = input("Enter the student's name: ")
    cap = cv2.VideoCapture(0)

    if not cap.isOpened():
        print("Error: Unable to access the camera.")
        return

    num_images = 50
    print(f"Capturing {num_images} images for student {student_id} ({name})...")

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
            print(f"Captured embedding {captured + 1}/{num_images}.")
            captured += 1
        else:
            print("Face not detected. Please adjust your position.")
            retries += 1

        if retries > 100:
            print("Too many retries. Registration aborted.")
            break

    # Save geometric median embedding
    if len(embeddings) == num_images:
        save_geometric_median_embedding(student_id, name, embeddings)
        print(f"Registration completed for student {student_id} ({name}).")
    else:
        print("Failed to capture enough valid embeddings.")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    register_student()
