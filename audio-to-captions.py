"""
Audio to Captions Generator using OpenAI Whisper
Automatically generates timestamped captions for heritage site audio files
"""

import whisper
import json
import sys
import os
from pathlib import Path

# Add FFmpeg to PATH if not already there
def setup_ffmpeg():
    """Ensure FFmpeg is in PATH for Whisper to use"""
    # Common FFmpeg locations on Windows
    ffmpeg_paths = [
        r"C:\Users\Bhavana\AppData\Local\Microsoft\WinGet\Links",
        os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\WinGet\Links"),
        r"C:\ffmpeg\bin",
        r"C:\Program Files\ffmpeg\bin",
    ]
    
    for path in ffmpeg_paths:
        if os.path.exists(path) and path not in os.environ.get("PATH", ""):
            os.environ["PATH"] = path + os.pathsep + os.environ.get("PATH", "")
            print(f"✓ Added FFmpeg to PATH: {path}")
            break

setup_ffmpeg()

def generate_captions_from_audio(audio_path, output_json_path=None):
    """
    Transcribe audio file and generate captions with timestamps
    
    Args:
        audio_path: Path to audio file (mp3, wav, etc.)
        output_json_path: Optional path to save JSON output
    """
    print(f"Loading Whisper model... (this may take a moment on first run)")
    
    # Load Whisper model (base is good balance of speed/accuracy)
    # Options: tiny, base, small, medium, large
    model = whisper.load_model("base")
    
    print(f"Transcribing: {audio_path}")
    
    # Transcribe with word-level timestamps
    result = model.transcribe(
        audio_path,
        word_timestamps=True,
        language="en"  # Change if needed
    )
    
    # Convert to caption format
    captions = []
    
    for segment in result["segments"]:
        caption = {
            "startMs": int(segment["start"] * 1000),
            "endMs": int(segment["end"] * 1000),
            "text": segment["text"].strip()
        }
        captions.append(caption)
    
    # Print results
    print("\n" + "="*60)
    print("GENERATED CAPTIONS:")
    print("="*60)
    print(json.dumps(captions, indent=2))
    print("="*60)
    
    # Save to file if requested
    if output_json_path:
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(captions, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Saved to: {output_json_path}")
    
    return captions


def generate_chapter_template(site_name, chapter_number, audio_path):
    """
    Generate complete chapter JSON template with auto-generated captions
    
    Args:
        site_name: Name of heritage site (e.g., "taj-mahal")
        chapter_number: Chapter number (1-5)
        audio_path: Path to audio file
    """
    captions = generate_captions_from_audio(audio_path)
    
    # Combine all caption text for the chapter text field
    full_text = " ".join([cap["text"] for cap in captions])
    
    chapter = {
        "title": f"Chapter {chapter_number}: [EDIT TITLE]",
        "text": full_text,
        "image": {
            "url": f"/images/{site_name}-ch{chapter_number}.jpg",
            "alt": f"{site_name} chapter {chapter_number}",
            "caption": f"[Edit caption for {site_name}]",
            "focalPoint": {"x": 0.5, "y": 0.5},
            "fit": "cover",
            "kenBurns": {
                "enabled": True,
                "zoomStart": 1.0,
                "zoomEnd": 1.1,
                "durationMs": 10000
            }
        },
        "audio": {
            "url": f"/audio/{site_name}-ch{chapter_number}.mp3",
            "captions": captions
        }
    }
    
    return chapter


def batch_generate_site_chapters(site_name, audio_folder):
    """
    Generate complete JSON file for a site with 5 chapters
    
    Args:
        site_name: Name of heritage site (e.g., "taj-mahal")
        audio_folder: Folder containing audio files (ch1.mp3 to ch5.mp3)
    """
    chapters = []
    audio_folder = Path(audio_folder)
    
    print(f"\n{'='*60}")
    print(f"GENERATING CHAPTERS FOR: {site_name}")
    print(f"{'='*60}\n")
    
    for i in range(1, 6):
        audio_file = audio_folder / f"{site_name}-ch{i}.mp3"
        
        if not audio_file.exists():
            print(f"⚠ Warning: {audio_file} not found, skipping...")
            continue
        
        print(f"\n--- Processing Chapter {i} ---")
        chapter = generate_chapter_template(site_name, i, str(audio_file))
        chapters.append(chapter)
    
    # Save complete chapters JSON
    output_path = f"client/public/chapters/{site_name}.json"
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(chapters, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"✓ SUCCESS! Generated: {output_path}")
    print(f"{'='*60}\n")
    print("Next steps:")
    print(f"1. Edit chapter titles in {output_path}")
    print(f"2. Place images: {site_name}-ch1.jpg to ch5.jpg in client/public/images/")
    print(f"3. Review and adjust captions if needed")


if __name__ == "__main__":
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║     Audio to Captions Generator for Heritage Sites       ║
    ║                Powered by OpenAI Whisper                  ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    if len(sys.argv) < 2:
        print("Usage options:\n")
        print("1. Generate single audio captions:")
        print("   python audio-to-captions.py path/to/audio.mp3\n")
        print("2. Generate complete site chapters:")
        print("   python audio-to-captions.py --site taj-mahal --audio-folder client/public/audio\n")
        print("3. Quick batch (if audio files already in client/public/audio):")
        print("   python audio-to-captions.py --site taj-mahal\n")
        sys.exit(1)
    
    # Mode 1: Site batch generation
    if "--site" in sys.argv:
        site_idx = sys.argv.index("--site") + 1
        site_name = sys.argv[site_idx]
        
        if "--audio-folder" in sys.argv:
            folder_idx = sys.argv.index("--audio-folder") + 1
            audio_folder = sys.argv[folder_idx]
        else:
            audio_folder = "client/public/audio"
        
        batch_generate_site_chapters(site_name, audio_folder)
    
    # Mode 2: Single audio file
    else:
        audio_path = sys.argv[1]
        output_path = sys.argv[2] if len(sys.argv) > 2 else None
        generate_captions_from_audio(audio_path, output_path)
