# gesture-control/detect.py
import cv2
import mediapipe as mp
import socketio
import time
import numpy as np

# Connect to Node.js Socket.IO server
sio = socketio.Client()

connected = False

@sio.event
def connect():
    global connected
    connected = True
    print("Connected to server.")

sio.connect('http://localhost:3000')

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(min_detection_confidence=0.7, min_tracking_confidence=0.7)
mp_draw = mp.solutions.drawing_utils

# Gesture classification using landmarks
def distance(a, b):
    return ((a.x - b.x)**2 + (a.y - b.y)**2) ** 0.5

def finger_is_open(landmarks, tip, pip):
    return landmarks[tip].y < landmarks[pip].y

def classify_gesture(landmarks):
    wrist = landmarks[0]
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    thumb_mcp = landmarks[2]
    index_tip = landmarks[8]
    middle_tip = landmarks[12]
    ring_tip = landmarks[16]
    pinky_tip = landmarks[20]

    fingers = [
        finger_is_open(landmarks, 8, 6),   # Index
        finger_is_open(landmarks, 12, 10), # Middle
        finger_is_open(landmarks, 16, 14), # Ring
        finger_is_open(landmarks, 20, 18)  # Pinky
    ]

    # Thumb is open if tip is far from mcp and wrist
    thumb_extended = (
        np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([thumb_mcp.x, thumb_mcp.y])) > 0.07 and
        np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) > 0.12
    )
    # All other fingers closed
    fingers_closed = not any(fingers)

    # Thumbs up: thumb extended, others closed, thumb tip well above wrist
    if thumb_extended and fingers_closed and (thumb_tip.y < wrist.y - 0.05):
        return "thumbs_up"
    # Thumbs down: thumb extended, others closed, thumb tip well below wrist
    if thumb_extended and fingers_closed and (thumb_tip.y > wrist.y + 0.05):
        return "thumbs_down"
    # Pinch: thumb and index close, others closed
    if np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([index_tip.x, index_tip.y])) < 0.04 and not any(fingers[1:]):
        return "pinch"
    # Index finger pointing: only index finger open, others closed, thumb NOT extended (PRIORITIZED)
    if fingers[0] and not any(fingers[1:]) and not thumb_extended:
        return "index_point"
    # Zoom: thumb extended AND index finger open, others closed, thumb and index far apart, BOTH clearly extended
    if (thumb_extended and fingers[0] and not any(fingers[1:]) and 
        np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([index_tip.x, index_tip.y])) > 0.15 and
        thumb_tip.y < index_tip.y):  # Additional constraint: thumb should be higher than index for zoom
        return "zoom"
    # Open palm: all fingers open, thumb not closed
    thumb_closed = np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) < 0.08
    if all(fingers) and not thumb_closed:
        return "open_palm"
    # Rotate left: index and middle open, hand tilted left
    if fingers[0] and fingers[1] and not any(fingers[2:]) and (index_tip.x < wrist.x):
        return "rotate_left"
    # Rotate right: index and middle open, hand tilted right
    if fingers[0] and fingers[1] and not any(fingers[2:]) and (index_tip.x > wrist.x):
        return "rotate_right"
    return "unknown"

STABLE_THRESHOLD = 7  # Increase for more strictness

# Initialize webcam capture
cap = cv2.VideoCapture(0)

last_gesture = None
gesture_count = 0

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
            if gesture == last_gesture:
                gesture_count += 1
            else:
                gesture_count = 1
                last_gesture = gesture
            if connected and gesture_count >= STABLE_THRESHOLD and gesture != "unknown":
                print("Emitting gesture:", gesture)
                sio.emit('gesture', {'gesture': gesture})
            # Emit index finger position for browser cursor ONLY when pointing
            if connected and gesture == "index_point":
                index_tip = hand_landmarks.landmark[8]
                x_norm = index_tip.x
                y_norm = index_tip.y
                sio.emit('cursor', {'x': x_norm, 'y': y_norm})
    else:
        last_gesture = None
        gesture_count = 0
        # Clear cursor when no hand is detected
        if connected:
            sio.emit('cursor', {'x': None, 'y': None})

    cv2.imshow("Hand Gesture", frame)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()

