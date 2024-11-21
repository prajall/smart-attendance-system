import cv2
import numpy as np
from utils import preprocess_and_generate_embedding, load_all_embeddings, compare_embeddings

# Function to start real-time attendance
def real_time_attendance():
    cap = cv2.VideoCapture(0)  # Use the default camera
    cv2.namedWindow('Real-time Attendance', cv2.WINDOW_NORMAL)  # Allow resizing the window
    cv2.resizeWindow('Real-time Attendance', 800, 600)  # Resize the window to 800x600

    all_embeddings = load_all_embeddings()  # Load all reference embeddings

    if not all_embeddings:
        print("No student embeddings found. Please ensure students are registered first.")
        cap.release()
        cv2.destroyAllWindows()
        return

    print("Real-time attendance started. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame. Exiting...")
            break

        # Generate embedding for the captured face
        current_embedding = preprocess_and_generate_embedding(frame)

        if current_embedding is not None:
            # Compare the embeddings with all loaded student embeddings
            best_match, similarity_score = compare_embeddings(current_embedding, all_embeddings)

            if best_match:
                cv2.putText(frame, f"Match Found: ID {best_match} - Similarity: {similarity_score:.2f}",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2, cv2.LINE_AA)
            else:
                cv2.putText(frame, "No Match Found", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2, cv2.LINE_AA)

        # Show the frame with match information
        cv2.imshow('Real-time Attendance', frame)

        # Press 'q' to quit
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

# Start real-time attendance
if __name__ == "__main__":
    real_time_attendance()

