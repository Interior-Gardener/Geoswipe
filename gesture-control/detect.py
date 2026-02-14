# gesture-control/detect.py
import cv2
import mediapipe as mp
import socketio
import time
import numpy as np
import os
import sys
from dotenv import load_dotenv
import base64
import io
from PIL import Image

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    
# Load environment variables
load_dotenv()

# Connect to Node.js Socket.IO server
sio = socketio.Client()

connected = False

@sio.event
def connect():
    global connected
    connected = True
    print("Connected to server.")

@sio.event
def process_frame(data):
    """Handle incoming frames from browser via Node.js server"""
    global connected, frame_count, last_frame_log_time

    if not data or 'frame' not in data:
        print(" Invalid frame data received")
        return

    # Debug: Log frame reception periodically (every 30 frames = ~1 second at 30fps)
    frame_count += 1
    current_time = time.time()
    if frame_count % 30 == 0:
        elapsed = current_time - last_frame_log_time
        actual_fps = 30 / elapsed if elapsed > 0 else 0
        print(f"📸 Processing frame #{frame_count} | FPS: {actual_fps:.1f}")
        last_frame_log_time = current_time

    result = process_frame_from_base64(data['frame'])

    if result and connected:
        # Emit gesture if detected
        if result['gesture']:
            print(f" Gesture detected: {result['gesture']}")
            sio.emit('gesture', {'gesture': result['gesture']})

        # Always emit cursor position (even if None to clear cursor)
        if result['cursor']:
            sio.emit('cursor', result['cursor'])

# Get server URL from environment variable
SOCKET_SERVER_URL = os.getenv('SOCKET_SERVER_URL', 'http://localhost:3000')
sio.connect(SOCKET_SERVER_URL)

# MediaPipe setup
MIN_DETECTION_CONFIDENCE = float(os.getenv('MIN_DETECTION_CONFIDENCE', '0.7'))
MIN_TRACKING_CONFIDENCE = float(os.getenv('MIN_TRACKING_CONFIDENCE', '0.7'))
CAMERA_MODE = os.getenv('CAMERA_MODE', 'browser')  # 'local' or 'browser'

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    min_detection_confidence=MIN_DETECTION_CONFIDENCE, 
    min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
    static_image_mode=False,  # Video stream mode
    max_num_hands=1  # Only track one hand for better performance
)
mp_draw = mp.solutions.drawing_utils

# Frame timing for MediaPipe timestamp management
last_processed_time = 0
MIN_FRAME_INTERVAL = 0.05  # Minimum 50ms between frames (20 FPS max)

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

def process_frame_mediapipe(rgb_frame):
    """
    Process RGB frame through MediaPipe and return gesture/cursor data.
    Extracted from main loop for reusability in both local and browser modes.

    Args:
        rgb_frame: RGB color image (numpy array)

    Returns:
        dict: {'gesture': str or None, 'cursor': dict or None}
    """
    global last_gesture, gesture_count, last_click_time, hands_detected_count, no_hands_count
    global last_processed_time, hands

    # Frame rate limiting to prevent timestamp issues
    current_time = time.time()
    time_since_last = current_time - last_processed_time
    
    if time_since_last < MIN_FRAME_INTERVAL:
        # Skip this frame - too soon since last processing
        return {'gesture': None, 'cursor': None}
    
    last_processed_time = current_time

    try:
        result = hands.process(rgb_frame)
    except Exception as e:
        # If MediaPipe encounters a timestamp error, recreate the hands object
        if "timestamp mismatch" in str(e).lower() or "Graph has errors" in str(e):
            print(" MediaPipe timestamp error detected - resetting graph...")
            hands.close()
            hands = mp_hands.Hands(
                min_detection_confidence=MIN_DETECTION_CONFIDENCE,
                min_tracking_confidence=MIN_TRACKING_CONFIDENCE,
                static_image_mode=False,
                max_num_hands=1
            )
            # Try processing again with fresh graph
            try:
                result = hands.process(rgb_frame)
            except:
                return {'gesture': None, 'cursor': None}
        else:
            print(f" MediaPipe processing error: {e}")
            return {'gesture': None, 'cursor': None}

    gesture_data = {'gesture': None, 'cursor': None}

    if result.multi_hand_landmarks:
        hands_detected_count += 1
        no_hands_count = 0  # Reset no-hands counter

        # Log first successful hand detection
        if hands_detected_count == 1:
            print(" HAND DETECTED! MediaPipe is working!")
            print(f"   - Number of hands: {len(result.multi_hand_landmarks)}")
            print(f"   - Gesture stabilization threshold: {STABLE_THRESHOLD} frames")

        # Log every 100 successful detections
        if hands_detected_count % 100 == 0:
            print(f" Hands detected {hands_detected_count} times")

        for hand_landmarks in result.multi_hand_landmarks:
            gesture = classify_gesture(hand_landmarks.landmark)

            # Debug: Log gesture classification (first 10 times or when gesture changes)
            if hands_detected_count <= 10 or gesture != last_gesture:
                print(f"🔍 Gesture classified: '{gesture}' (count: {gesture_count}/{STABLE_THRESHOLD})")

            # Gesture stabilization logic
            if gesture == last_gesture:
                gesture_count += 1
            else:
                gesture_count = 1
                last_gesture = gesture

            # Only emit stable gestures
            if gesture_count >= STABLE_THRESHOLD and gesture != "unknown":
                # Special handling for click gesture to prevent rapid firing
                if gesture == "click":
                    current_time = time.time()
                    if current_time - last_click_time >= CLICK_COOLDOWN:
                        gesture_data['gesture'] = gesture
                        last_click_time = current_time
                        print(f" STABLE GESTURE EMITTED: {gesture}")
                    else:
                        print(f"⏱ Click ignored - cooldown active ({current_time - last_click_time:.1f}s)")
                else:
                    gesture_data['gesture'] = gesture
                    print(f" STABLE GESTURE EMITTED: {gesture}")

            # Cursor position for cursor_move gesture
            if gesture == "cursor_move":
                # Use middle finger tip for more stable cursor control
                middle_tip = hand_landmarks.landmark[12]
                gesture_data['cursor'] = {
                    'x': middle_tip.x,
                    'y': middle_tip.y
                }
    else:
        # No hand detected - reset
        no_hands_count += 1

        # Log if no hands for extended period
        if no_hands_count == 1:
            print(" No hands detected in frame")
        elif no_hands_count == 100:
            print(" Still no hands after 100 frames. Check:")
            print("   - Is your hand clearly visible in the camera preview?")
            print("   - Is the lighting adequate?")
            print("   - Is the camera focused?")

        last_gesture = None
        gesture_count = 0
        gesture_data['cursor'] = {'x': None, 'y': None}

    return gesture_data

def process_frame_from_base64(base64_data):
    """
    Decode base64 image data and process it through MediaPipe.

    Args:
        base64_data: Base64 encoded JPEG image, with or without data URL prefix

    Returns:
        dict: {'gesture': str or None, 'cursor': dict or None} or None on error
    """
    global frame_count, debug_frame_saved

    try:
        # Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
        if ',' in base64_data:
            base64_data = base64_data.split(',')[1]

        # Decode base64 to bytes
        img_bytes = base64.b64decode(base64_data)

        # Open image with PIL (JPEG images are RGB)
        img = Image.open(io.BytesIO(img_bytes))

        # Convert to numpy array (PIL gives RGB format)
        frame = np.array(img)

        # Validate frame dimensions
        if frame.size == 0:
            raise ValueError("Empty frame received")

        # Validate color channels (should be RGB from PIL/JPEG)
        if len(frame.shape) != 3 or frame.shape[2] != 3:
            raise ValueError(f"Invalid frame shape: {frame.shape}, expected (H, W, 3)")

        # Debug: Log frame info on first successful decode
        if frame_count == 1:
            print(f" Frame decoded successfully!")
            print(f"   - Resolution: {frame.shape[1]}x{frame.shape[0]}")
            print(f"   - Color format: RGB (from PIL)")
            print(f"   - Data type: {frame.dtype}")
            print(f"   - Value range: [{frame.min()}, {frame.max()}]")

        # Save debug frame (first frame only for verification)
        if not debug_frame_saved and frame_count == 1:
            try:
                debug_path = os.path.join(os.path.dirname(__file__), 'debug_frame_received.jpg')
                cv2.imwrite(debug_path, cv2.cvtColor(frame, cv2.COLOR_RGB2BGR))
                print(f" Debug frame saved to: {debug_path}")
                debug_frame_saved = True
            except Exception as save_err:
                print(f" Could not save debug frame: {save_err}")

        # Check if resolution is adequate for gesture detection
        height, width = frame.shape[:2]
        if width < 320 or height < 240:
            print(f" Warning: Low resolution {width}x{height} may affect detection quality")

        # Flip horizontally for mirror effect (like webcam)
        # PIL gives RGB, MediaPipe expects RGB, so just flip without color conversion
        rgb_frame = cv2.flip(frame, 1)

        # Process through MediaPipe
        return process_frame_mediapipe(rgb_frame)

    except base64.binascii.Error as e:
        print(f" Base64 decode error: {e}")
        return None
    except ValueError as e:
        # Suppress repetitive MediaPipe timestamp errors
        error_msg = str(e)
        if "timestamp mismatch" not in error_msg.lower() and "Graph has errors" not in error_msg:
            print(f" Frame validation error: {e}")
        return None
    except Exception as e:
        # Suppress repetitive MediaPipe timestamp errors
        error_msg = str(e)
        if "timestamp mismatch" not in error_msg.lower() and "Graph has errors" not in error_msg:
            print(f" Unexpected error processing frame: {e}")
            import traceback
            traceback.print_exc()
        return None

STABLE_THRESHOLD = 5  # Reduced for faster response (was 7)

# Click gesture stabilization
last_click_time = 0
CLICK_COOLDOWN = 1.0  # 1 second cooldown between clicks

# Initialize gesture tracking state
last_gesture = None
gesture_count = 0

# Frame debugging and statistics
frame_count = 0
last_frame_log_time = time.time()
debug_frame_saved = False

# Hand detection statistics
hands_detected_count = 0
no_hands_count = 0

# Main execution logic based on CAMERA_MODE
if CAMERA_MODE == 'browser':
    # Browser-based mode: listen for frames from server
    print("=" * 60)
    print(" BROWSER CAMERA MODE - Gesture Detection Active")
    print("=" * 60)
    print(f" Connected to {SOCKET_SERVER_URL}")
    print(" Waiting for camera frames from browser...")
    print(" Status updates will appear every ~30 frames (~1 second)")
    print("=" * 60)

    try:
        # Keep the connection alive and wait for process_frame events
        sio.wait()
    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print(" Shutting down gesture detection...")
        print("=" * 60)
        hands.close()  # Clean up MediaPipe resources
        sio.disconnect()
        print(" Disconnected from server")
        if debug_frame_saved:
            print(f" Debug frame available at: gesture-control/debug_frame_received.jpg")

else:
    # Local webcam mode (original implementation with refactored processing)
    print(" Local webcam mode")
    print(f" Connected to {SOCKET_SERVER_URL}")
    print(" Press 'q' to quit")

    cap = cv2.VideoCapture(0)

    try:
        while True:
            success, frame = cap.read()
            if not success:
                print(" Failed to read frame from webcam")
                break

            # Flip and convert for MediaPipe
            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

            # Process frame through MediaPipe
            result = process_frame_mediapipe(rgb)

            # Emit gestures and cursor to server
            if result and connected:
                if result['gesture']:
                    print("Emitting gesture:", result['gesture'])
                    sio.emit('gesture', {'gesture': result['gesture']})

                if result['cursor']:
                    sio.emit('cursor', result['cursor'])

            # Display window with hand tracking visualization (local mode only)
            # Draw landmarks if hands detected
            mp_result = hands.process(rgb)
            if mp_result.multi_hand_landmarks:
                for hand_landmarks in mp_result.multi_hand_landmarks:
                    mp_draw.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Display frame
            cv2.imshow("Hand Gesture - Local Mode", frame)

            # Check for quit key
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n Quit key pressed...")
                break

    except KeyboardInterrupt:
        print("\n Shutting down gesture detection...")
    finally:
        hands.close()  # Clean up MediaPipe resources
        cap.release()
        cv2.destroyAllWindows()
        sio.disconnect()
        print(" Cleanup complete")

