import cv2
from utils import preprocess_and_generate_embedding, save_geometric_median_embedding

def register_student():
    student_id = input("Enter the student ID for registration: ")
    name = input("Enter the student's name: ")

    # Define the distances and number of images per distance
    distances = ["near", "medium", "far"]
    num_images = 50
    all_embeddings = []

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Unable to access the camera.")
        return

    for distance in distances:
        print(f"Please adjust your position to the {distance} distance.")
        input(f"Press Enter when ready to start capturing for {distance} distance...")

        print(f"Capturing {num_images} images for {distance} distance...")

        captured = 0
        retries = 0
        embeddings = []

        while captured < num_images:
            ret, frame = cap.read()
            if not ret:
                print("Failed to capture frame.")
                continue

            # Generate embeddings for the frame
            embedding = preprocess_and_generate_embedding(frame)
            if embedding is not None:
                embeddings.append(embedding)
                print(f"Captured embedding {captured + 1}/{num_images} for {distance} distance.")
                captured += 1
            else:
                print("Face not detected. Please adjust your position.")
                retries += 1

            if retries > 100:
                print("Too many retries. Registration aborted.")
                break

        # Check if enough embeddings were captured for this distance
        if len(embeddings) == num_images:
            print(f"Successfully captured embeddings for {distance} distance.")
            all_embeddings.extend(embeddings)
        else:
            print(f"Failed to capture enough embeddings for {distance} distance. Registration aborted.")
            cap.release()
            cv2.destroyAllWindows()
            return

    # Save geometric median embedding after capturing all distances
    save_geometric_median_embedding(student_id, name, all_embeddings)
    print(f"Registration completed for student {student_id} ({name}).")

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    register_student()