import os
import json
import wave
import subprocess

def get_audio_info(filepath):
    # Using python to read mp3 duration or estimate
    try:
        import mutagen
        from mutagen.mp3 import MP3
        audio = MP3(filepath)
        return audio.info.length
    except ImportError:
        pass
    
    # Fallback: estimate using file size or ffprobe if available
    size = os.path.getsize(filepath)
    # Edge-tts mp3 typically 48kbps or 128kbps (16000 B/s approx at 128kbps or 6000 B/s at 48k)
    # Let's write a python snippet using edge_tts or simple probe
    return size

# Let's inspect files in public/audio
files = os.listdir("public/audio")
print("Audio files:", files)
