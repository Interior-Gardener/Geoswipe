# Gesture Control Instructions

## Current Gesture System

### Cursor Control
- **Open Palm** (all fingers extended) = Move cursor (blue dot)
- The blue cursor dot is always visible and moves with your hand

### Interactions
- **"OK" Sign** (thumb touches index fingertip, other fingers extended) = Click at cursor position
- **Thumbs Up** (thumb extended upward, all fingers closed) = Rotate globe up (toward Arctic)
- **Thumbs Down** (thumb extended downward, all fingers closed) = Rotate globe down (toward Antarctic)
- **Thumb + Index Extended** (wide separation) = Zoom In
- **Thumb + Index Close** (pinch gesture) = Zoom Out
- **Index + Middle Fingers** = Rotate Left/Right (depends on hand tilt)

### Tips for Better Gesture Recognition
- **For "OK" Sign**: Touch thumb tip to index fingertip (forming circle), keep other 3 fingers extended
- **For Thumbs Up/Down**: Extend your thumb far from your palm in clear up/down direction
- **Keep other fingers clearly closed** when doing thumbs up/down
- **Make gestures deliberately** - avoid ambiguous hand positions

### Notes
- The blue cursor dot is always visible and follows your open palm
- Use closed fist to click on countries at the cursor position
- Zoom limits: 0.3x to 3.0x scale
- All gestures work in real-time through your webcam

### Usage
1. Run `python detect.py` in the gesture-control folder
2. Start the React app in the client folder
3. Open your browser and show your hand to the camera
4. Use open palm to move the blue cursor
5. Make a fist to click on countries
