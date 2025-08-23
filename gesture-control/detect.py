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
    
    # Calculate distance between thumb and index for gesture differentiation
    thumb_index_distance = np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([index_tip.x, index_tip.y]))

    # CLICK GESTURE: "OK" sign (thumb touches index tip, other fingers extended) - HIGHEST PRIORITY
    # OK sign: thumb and index close together (forming circle), middle/ring/pinky extended
    ok_sign_condition = (thumb_index_distance < 0.05 and  # Thumb and index very close (forming circle)
                        fingers[1] and fingers[2] and fingers[3])  # Middle, ring, pinky extended
    if ok_sign_condition:
        return "click"

    # Thumbs up: thumb extended, others closed, thumb tip well above wrist AND thumb extended far
    if (thumb_extended and fingers_closed and 
        (thumb_tip.y < wrist.y - 0.08) and  # More strict vertical separation
        np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) > 0.12):  # Thumb must be extended far
        return "thumbs_up"
    
    # Thumbs down: thumb extended, others closed, thumb tip well below wrist AND thumb extended far
    if (thumb_extended and fingers_closed and 
        (thumb_tip.y > wrist.y + 0.08) and  # More strict vertical separation
        np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) > 0.12):  # Thumb must be extended far
        return "thumbs_down"
    
    # Pinch: thumb and index close, others closed
    if thumb_index_distance < 0.04 and not any(fingers[1:]):
        return "pinch"
    
    # ZOOM GESTURE: Requires BOTH thumb extended AND index finger open with WIDE separation
    # This is the most specific gesture, so check it first among thumb+index combinations
    if (thumb_extended and fingers[0] and not any(fingers[1:]) and thumb_index_distance > 0.13):
        return "zoom"
    
    # INDEX POINT: Only index finger open, thumb clearly closed/not extended, others closed
    # Make thumb condition more strict to avoid conflicts with zoom
    thumb_clearly_closed = not thumb_extended and np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) < 0.10
    if fingers[0] and not any(fingers[1:]) and thumb_clearly_closed:
        return "index_point"
    
    # CURSOR CONTROL: Open palm (all fingers open, thumb not closed) - moves cursor
    thumb_closed = np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) < 0.08
    if all(fingers) and not thumb_closed:
        return "cursor_move"
    
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
            
            # Debug information for troubleshooting
            thumb_tip = hand_landmarks.landmark[4]
            index_tip = hand_landmarks.landmark[8]
            wrist = hand_landmarks.landmark[0]
            
            thumb_extended = (
                np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([hand_landmarks.landmark[2].x, hand_landmarks.landmark[2].y])) > 0.07 and
                np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([wrist.x, wrist.y])) > 0.12
            )
            thumb_index_distance = np.linalg.norm(np.array([thumb_tip.x, thumb_tip.y]) - np.array([index_tip.x, index_tip.y]))
            index_open = hand_landmarks.landmark[8].y < hand_landmarks.landmark[6].y
            
            # Display debug info on frame
            debug_text = f"Gesture: {gesture}"
            cv2.putText(frame, debug_text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            debug_text2 = f"Thumb: {'Extended' if thumb_extended else 'Closed'}, Index: {'Open' if index_open else 'Closed'}"
            cv2.putText(frame, debug_text2, (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            debug_text3 = f"Distance: {thumb_index_distance:.3f}"
            cv2.putText(frame, debug_text3, (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 0), 1)
            
            if gesture == last_gesture:
                gesture_count += 1
            else:
                gesture_count = 1
                last_gesture = gesture
            if connected and gesture_count >= STABLE_THRESHOLD and gesture != "unknown":
                print("Emitting gesture:", gesture)
                sio.emit('gesture', {'gesture': gesture})
            # Emit cursor position for browser cursor when moving cursor with open palm
            if connected and gesture == "cursor_move":
                # Use middle finger tip for more stable cursor control
                middle_tip = hand_landmarks.landmark[12]
                x_norm = middle_tip.x
                y_norm = middle_tip.y
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

