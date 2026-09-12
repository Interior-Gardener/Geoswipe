// client/src/utils/gestureClassifier.js
//
// Hand-pose classification, ported from gesture-control/detect.py.
//
// This used to run in a Python process on the server: the browser encoded every
// webcam frame as base64 JPEG and streamed it over a WebSocket (~3.2 GB/hour per
// user) so MediaPipe-Python could look at it. The same maths runs here against
// MediaPipe Tasks-Vision in the browser, so frames never leave the device.
//
// The geometry, thresholds and stabilisation constants are unchanged from the
// Python implementation on purpose - gestures should feel identical to users.

// MediaPipe hand landmark indices.
const WRIST = 0;
const THUMB_MCP = 2;
const THUMB_TIP = 4;
const INDEX_PIP = 6;
const INDEX_TIP = 8;
const MIDDLE_PIP = 10;
const MIDDLE_TIP = 12;
const RING_PIP = 14;
const RING_TIP = 16;
const PINKY_PIP = 18;
const PINKY_TIP = 20;

// Consecutive frames a pose must hold before it is emitted. Suppresses the
// flicker of transitional hand shapes on the way to the intended gesture.
export const STABLE_THRESHOLD = 5;

// Seconds between accepted click gestures.
export const CLICK_COOLDOWN_S = 1.0;

// Cap inference at 20 FPS. The camera runs faster, but hand poses do not change
// meaningfully between 50ms samples and this leaves the main thread free for
// the Three.js globe that is usually rendering at the same time.
export const MIN_FRAME_INTERVAL_S = 0.05;

function dist2d(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fingerIsOpen(landmarks, tip, pip) {
  return landmarks[tip].y < landmarks[pip].y;
}

/**
 * Mirror landmarks horizontally.
 *
 * The Python worker ran `cv2.flip(frame, 1)` before inference so the user saw a
 * mirror image and moving a hand right moved the cursor right. Flipping the x
 * coordinates after detection is equivalent (distances are preserved, and every
 * left/right test below is a comparison between two flipped values) and avoids
 * copying each frame through a canvas just to reverse it.
 */
function mirrorLandmarks(landmarks) {
  return landmarks.map((point) => ({ x: 1 - point.x, y: point.y, z: point.z }));
}

/**
 * Classify a single hand pose.
 *
 * @param {Array<{x:number,y:number}>} landmarks 21 normalised hand landmarks
 * @returns {string} one of: click, thumbs_up, thumbs_down, pinch, zoom,
 *                   index_point, cursor_move, rotate_left, rotate_right, unknown
 */
export function classifyGesture(landmarks) {
  const wrist = landmarks[WRIST];
  const thumbTip = landmarks[THUMB_TIP];
  const thumbMcp = landmarks[THUMB_MCP];
  const indexTip = landmarks[INDEX_TIP];

  const fingers = [
    fingerIsOpen(landmarks, INDEX_TIP, INDEX_PIP),
    fingerIsOpen(landmarks, MIDDLE_TIP, MIDDLE_PIP),
    fingerIsOpen(landmarks, RING_TIP, RING_PIP),
    fingerIsOpen(landmarks, PINKY_TIP, PINKY_PIP)
  ];

  const thumbToWrist = dist2d(thumbTip, wrist);

  // Thumb counts as extended only when it is both away from its own knuckle and
  // far from the wrist - either test alone fires on a loosely curled hand.
  const thumbExtended = dist2d(thumbTip, thumbMcp) > 0.07 && thumbToWrist > 0.12;
  const fingersClosed = !fingers.some(Boolean);
  const othersClosed = !fingers.slice(1).some(Boolean);
  const thumbIndexDistance = dist2d(thumbTip, indexTip);

  // CLICK - "OK" sign: thumb and index form a circle, other three extended.
  // Checked first because it is the most specific pose and the most costly to
  // miss (it is the only way to activate a control).
  if (thumbIndexDistance < 0.05 && fingers[1] && fingers[2] && fingers[3]) {
    return 'click';
  }

  if (thumbExtended && fingersClosed && thumbTip.y < wrist.y - 0.08 && thumbToWrist > 0.12) {
    return 'thumbs_up';
  }

  if (thumbExtended && fingersClosed && thumbTip.y > wrist.y + 0.08 && thumbToWrist > 0.12) {
    return 'thumbs_down';
  }

  if (thumbIndexDistance < 0.04 && othersClosed) {
    return 'pinch';
  }

  // ZOOM - thumb and index both out and spread wide. Must be tested before
  // index_point, which is the same hand with the thumb tucked in.
  if (thumbExtended && fingers[0] && othersClosed && thumbIndexDistance > 0.13) {
    return 'zoom';
  }

  const thumbClearlyClosed = !thumbExtended && thumbToWrist < 0.10;
  if (fingers[0] && othersClosed && thumbClearlyClosed) {
    return 'index_point';
  }

  // CURSOR - open palm.
  const thumbClosed = thumbToWrist < 0.08;
  if (fingers.every(Boolean) && !thumbClosed) {
    return 'cursor_move';
  }

  // Two-finger "peace" sign, direction taken from where the index tip sits
  // relative to the wrist.
  const twoFingers = fingers[0] && fingers[1] && !fingers.slice(2).some(Boolean);
  if (twoFingers) {
    if (indexTip.x < wrist.x) return 'rotate_left';
    if (indexTip.x > wrist.x) return 'rotate_right';
  }

  return 'unknown';
}

/**
 * Stateful wrapper around classifyGesture: rate limiting, pose stabilisation and
 * click cooldown. One instance per camera pipeline.
 *
 * Mirrors the state machine in detect.py's process_frame_mediapipe().
 */
export function createGestureStabilizer() {
  let lastGesture = null;
  let gestureCount = 0;
  let lastClickAt = 0;
  let lastProcessedAt = 0;

  /**
   * @param {Array|null} rawLandmarks 21 landmarks for one hand, or null/empty
   *   when no hand is in frame.
   * @param {number} nowMs
   * @returns {{gesture: string|null, cursor: {x:number|null, y:number|null}|null, skipped?: boolean}}
   */
  function process(rawLandmarks, nowMs = Date.now()) {
    const nowS = nowMs / 1000;

    if (nowS - lastProcessedAt < MIN_FRAME_INTERVAL_S) {
      return { gesture: null, cursor: null, skipped: true };
    }
    lastProcessedAt = nowS;

    if (!rawLandmarks || rawLandmarks.length === 0) {
      // Hand left the frame: forget the in-progress pose and clear the cursor.
      lastGesture = null;
      gestureCount = 0;
      return { gesture: null, cursor: { x: null, y: null } };
    }

    const landmarks = mirrorLandmarks(rawLandmarks);
    const gesture = classifyGesture(landmarks);

    if (gesture === lastGesture) {
      gestureCount += 1;
    } else {
      gestureCount = 1;
      lastGesture = gesture;
    }

    const result = { gesture: null, cursor: null };

    if (gestureCount >= STABLE_THRESHOLD && gesture !== 'unknown') {
      if (gesture === 'click') {
        // Without this, holding the OK sign fires a button on every frame.
        if (nowS - lastClickAt >= CLICK_COOLDOWN_S) {
          result.gesture = gesture;
          lastClickAt = nowS;
        }
      } else {
        result.gesture = gesture;
      }
    }

    if (gesture === 'cursor_move') {
      // Middle fingertip, not index: it sits near the centre of an open palm,
      // so the cursor is steadier than tracking a finger at the edge.
      const middleTip = landmarks[MIDDLE_TIP];
      result.cursor = { x: middleTip.x, y: middleTip.y };
    }

    return result;
  }

  function reset() {
    lastGesture = null;
    gestureCount = 0;
    lastProcessedAt = 0;
  }

  return { process, reset };
}
