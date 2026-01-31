# Audio Caption Generator Guide

## Quick Start

### 1. Install Dependencies (One-time setup)

```bash
# Install Python packages
pip install -r requirements-audio.txt

# Install FFmpeg (if not already installed)
# Windows: Download from https://ffmpeg.org/download.html
# Or use chocolatey:
choco install ffmpeg
```

### 2. Prepare Your Audio Files

Place your audio files in `client/public/audio/` with this naming:
- `sitename-ch1.mp3`
- `sitename-ch2.mp3`
- `sitename-ch3.mp3`
- `sitename-ch4.mp3`
- `sitename-ch5.mp3`

Example for Taj Mahal:
- `taj-mahal-ch1.mp3`
- `taj-mahal-ch2.mp3`
- etc.

### 3. Generate Captions Automatically

```bash
# For a complete site (generates full JSON file)
python audio-to-captions.py --site taj-mahal

# For a single audio file (test/preview)
python audio-to-captions.py client/public/audio/taj-mahal-ch1.mp3
```

## How It Works

The script uses **OpenAI Whisper** (free, runs locally) to:
1. Transcribe your audio
2. Generate word-level timestamps
3. Create caption segments with start/end times
4. Output JSON in the exact format needed for your app

## Output Format

The script generates JSON like this:

```json
{
  "title": "Chapter 1: About",
  "text": "Full transcribed text...",
  "image": {
    "url": "/images/sitename-ch1.jpg",
    "alt": "...",
    "caption": "...",
    "focalPoint": { "x": 0.5, "y": 0.5 },
    "fit": "cover",
    "kenBurns": { "enabled": true, "zoomStart": 1.0, "zoomEnd": 1.1, "durationMs": 10000 }
  },
  "audio": {
    "url": "/audio/sitename-ch1.mp3",
    "captions": [
      { "startMs": 0, "endMs": 7333, "text": "First sentence..." },
      { "startMs": 7333, "endMs": 14666, "text": "Second sentence..." }
    ]
  }
}
```

## Batch Processing Multiple Sites

To create chapters for 5 sites:

```bash
# Site 1
python audio-to-captions.py --site taj-mahal

# Site 2
python audio-to-captions.py --site red-fort

# Site 3
python audio-to-captions.py --site qutub-minar

# Site 4
python audio-to-captions.py --site gateway-of-india

# Site 5
python audio-to-captions.py --site charminar
```

## After Generation

1. ✓ JSON file created in `client/public/chapters/sitename.json`
2. ✏️ Edit chapter titles (they're marked with `[EDIT TITLE]`)
3. 🖼️ Add images: `sitename-ch1.jpg` to `ch5.jpg` in `client/public/images/`
4. 🔍 Review captions for accuracy (Whisper is very accurate but not perfect)

## Tips

- **Audio Quality**: Clear audio = better transcription
- **File Names**: Use lowercase and hyphens (e.g., `taj-mahal`, not `Taj Mahal`)
- **Language**: Default is English. Edit script line 35 to change language
- **Model Size**: Using "base" model (fast + accurate). Options: tiny, small, medium, large
- **Manual Edits**: You can always edit the generated JSON to perfect the captions

## Example Workflow

```bash
# 1. Record 5 audio files for Taj Mahal
# 2. Name them: taj-mahal-ch1.mp3 through taj-mahal-ch5.mp3
# 3. Place in client/public/audio/
# 4. Run:
python audio-to-captions.py --site taj-mahal

# 5. The script generates: client/public/chapters/taj-mahal.json
# 6. Add your images to client/public/images/
# 7. Edit chapter titles in the JSON
# 8. Done! The story mode works automatically.
```

## Troubleshooting

**"FFmpeg not found"**: Install FFmpeg (see installation section)

**"Model not found"**: First run downloads Whisper model (~150MB), wait for download

**Wrong transcription**: Try larger model: change `"base"` to `"small"` or `"medium"` in line 22

**Need different language**: Edit line 35: `language="en"` to your language code

## Need Help?

The script is fully automatic - just record audio, run the command, and it creates everything!
