# gesture-control/detect.py
import cv2
import mediapipe as mp
import socketio
import time

# Connect to Node.js Socket.IO server
sio = socketio.Client()
sio.connect('http://localhost:3000')

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# Gesture classification using landmarks
def distance(a, b):
    return ((a.x - b.x)**2 + (a.y - b.y)**2) ** 0.5

def classify_gesture(landmarks):
    thumb_tip = landmarks[4]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]
    wrist = landmarks[0]

    if distance(thumb_tip, index_tip) < 0.05:
        return "pinch"
    if all(landmarks[i].y < landmarks[i - 2].y for i in [8, 12, 16, 20]):
        return "open_palm"
    if all(distance(landmarks[i], wrist) < 0.1 for i in [8, 12, 16, 20]):
        return "fist"
    if (landmarks[8].y < landmarks[6].y and
        all(landmarks[i].y > landmarks[i - 2].y for i in [12, 16, 20])):
        return "pointing"
    return "unknown"

# Start webcam
cap = cv2.VideoCapture(0)

while True:
    success, frame = cap.read()
    frame = cv2.flip(frame, 1)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = hands.process(rgb)

    if result.multi_hand_landmarks:
        for hand_landmarks in result.multi_hand_landmarks:
            mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)
            gesture = classify_gesture(hand_landmarks.landmark)
            cv2.putText(frame, gesture, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            sio.emit('gesture', {'gesture': gesture})

    cv2.imshow("Hand Gesture", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
