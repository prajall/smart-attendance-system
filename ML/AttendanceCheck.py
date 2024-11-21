import cv2
from utils import preprocess_and_generate_embedding, load_all_embeddings, compare_embeddings

def real_time_attendance():
    cap = cv2.VideoCapture(0)
    cv2.namedWindow('Real-time Attendance', cv2.WINDOW_NORMAL)
    cv2.resizeWindow('Real-time Attendance', 800, 600)

    all_embeddings = load_all_embeddings()
    if not all_embeddings:
        print("No embeddings found. Register students first.")
        return

    print("Real-time attendance started. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab frame.")
            break

        current_embedding = preprocess_and_generate_embedding(frame)
        if current_embedding is not None:
            best_match, similarity_score = compare_embeddings(current_embedding, all_embeddings)
            if best_match:
                student_id, name = best_match
                cv2.putText(frame, f"ID: {student_id}, Name: {name}, Score: {similarity_score:.2f}",
                            (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            else:
                cv2.putText(frame, "No match found", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
        else:
            cv2.putText(frame, "No face detected", (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

        cv2.imshow('Real-time Attendance', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    real_time_attendance()
