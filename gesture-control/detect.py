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
from flask import Flask, jsonify
import threading
import gc

# Fix Windows console encoding for emoji support
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')
    
# Load environment variables
load_dotenv()

# Flask app for health check (so Render detects open port)
app = Flask(__name__)

# Connect to Node.js Socket.IO server
sio = socketio.Client()

connected = False
gesture_service_status = {
    'running': False,
    'connected': False,
    'frames_processed': 0,
    'hands_detected': 0,
    'last_gesture': None,
    'started_at': None
}

@app.route('/')
def home():
    """Health check endpoint for Render"""
    return jsonify({
        'status': 'ok',
        'service': 'GeoSwipe Gesture Detection',
        'version': '1.0',
        'socket_server': os.getenv('SOCKET_SERVER_URL', 'http://localhost:3000')
    })

@app.route('/health')
def health():
    """Detailed health status"""
    return jsonify({
        'status': 'healthy' if gesture_service_status['connected'] else 'connecting',
        'gesture_detection': gesture_service_status
    })

@app.route('/status')
def status():
    """Service status"""
    return jsonify(gesture_service_status)

@sio.event
def connect():
    global connected
    connected = True
    gesture_service_status['connected'] = True
    gesture_service_status['started_at'] = time.time()
    print("✅ Connected to server.")

    # Identify as gesture service to the backend
    try:
        sio.emit('identify', {'type': 'gesture_service', 'version': '1.0'})
        print("📤 Sent identification to backend")
    except Exception as e:
        print(f"⚠️ Failed to send identification: {e}")

@sio.event
def disconnect():
    global connected
    connected = False
    gesture_service_status['connected'] = False
    print("⚠️ Disconnected from server. Will attempt to reconnect...")

@sio.event
def process_frame(data):
    """Handle incoming frames from browser via Node.js server"""
    global connected, frame_count, last_frame_log_time

    if not data or 'frame' not in data:
        print(" Invalid frame data received")
        return

    # Update status
    gesture_service_status['frames_processed'] += 1

    # Frame skipping for performance - process every 2nd frame (was 3rd)
    # With reduced client FPS, this gives us better responsiveness
    frame_count += 1
    if frame_count % 2 != 0:
        return  # Skip this frame

    # Debug: Log frame reception periodically (every 30 frames = ~1 second at 30fps)
    current_time = time.time()
    if frame_count % 30 == 0:
        elapsed = current_time - last_frame_log_time
        actual_fps = 30 / elapsed if elapsed > 0 else 0
        print(f"📸 Processing frame #{frame_count} | FPS: {actual_fps:.1f}")
        last_frame_log_time = current_time

        # Garbage collection every 30 frames to free memory
        gc.collect()

    result = process_frame_from_base64(data['frame'])

    if result and connected:
        # Emit gesture if detected
        if result['gesture']:
            print(f" Gesture detected: {result['gesture']}")
            gesture_service_status['last_gesture'] = result['gesture']
            sio.emit('gesture', {'gesture': result['gesture']})

        # Always emit cursor position (even if None to clear cursor)
        if result['cursor']:
            sio.emit('cursor', result['cursor'])

# Get server URL from environment variable
SOCKET_SERVER_URL = os.getenv('SOCKET_SERVER_URL', 'http://localhost:3000')

# MediaPipe setup - Lower confidence for faster processing
MIN_DETECTION_CONFIDENCE = float(os.getenv('MIN_DETECTION_CONFIDENCE', '0.5'))
MIN_TRACKING_CONFIDENCE = float(os.getenv('MIN_TRACKING_CONFIDENCE', '0.5'))
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
        gesture_service_status['hands_detected'] = hands_detected_count

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

        # Resize frame for memory optimization (max 320x240)
        height, width = frame.shape[:2]
        max_width = 320
        max_height = 240

        if width > max_width or height > max_height:
            # Calculate scaling factor
            scale = min(max_width / width, max_height / height)
            new_width = int(width * scale)
            new_height = int(height * scale)

            # Resize using PIL for better quality
            img_resized = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
            frame = np.array(img_resized)

            # Log resize on first frame
            if frame_count == 1:
                print(f" Frame resized: {width}x{height} → {new_width}x{new_height} for memory optimization")

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

def run_gesture_detection():
    """Run gesture detection service in background thread"""
    global connected, gesture_service_status

    gesture_service_status['running'] = True

    # Connect to Socket.IO server
    try:
        print("=" * 60)
        print(" GESTURE DETECTION SERVICE STARTING")
        print("=" * 60)
        print(f" Connecting to {SOCKET_SERVER_URL}...")

        sio.connect(SOCKET_SERVER_URL)

        print(" Connected successfully!")
        print(" Waiting for camera frames from browser...")
        print(" Status updates every ~30 frames (~1 second)")
        print("=" * 60)

        # Keep the connection alive and wait for process_frame events
        sio.wait()

    except KeyboardInterrupt:
        print("\n" + "=" * 60)
        print(" Shutting down gesture detection...")
        print("=" * 60)
        hands.close()
        sio.disconnect()
        print(" Disconnected from server")
    except Exception as e:
        print(f" Error in gesture detection service: {e}")
        gesture_service_status['running'] = False
        gesture_service_status['connected'] = False

# Main execution logic based on CAMERA_MODE
if CAMERA_MODE == 'browser':
    # Browser-based mode: Run Flask on main thread, Socket.IO in background
    print("=" * 60)
    print(" GEOSWIPE GESTURE DETECTION SERVICE")
    print("=" * 60)
    print(" Mode: Browser Camera")
    print(f" Socket.IO Server: {SOCKET_SERVER_URL}")

    # Get PORT from environment (Render provides this)
    PORT = int(os.getenv('PORT', 5000))
    print(f" HTTP Health Check Port: {PORT}")
    print("=" * 60)

    # Start gesture detection in background thread
    detection_thread = threading.Thread(target=run_gesture_detection, daemon=True)
    detection_thread.start()

    # Run Flask on main thread (this blocks)
    print(f" Starting Flask server on port {PORT}...")
    app.run(host='0.0.0.0', port=PORT, debug=False)

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

