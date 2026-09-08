import json
import os
from mutagen.mp3 import MP3

manifest_path = "public/audio/manifest.json"
with open(manifest_path, "r", encoding="utf-8") as f:
    segments = json.load(f)

total_dur = 0.0
for seg in segments:
    audio = MP3(seg["file"])
    seg["duration"] = round(audio.info.length, 3)
    seg["frames_30fps"] = int(round(audio.info.length * 30))
    total_dur += seg["duration"]
    print(f"{seg['id']}: {seg['duration']}s ({seg['frames_30fps']} frames) - \"{seg['text'][:40]}...\"")

print("---")
print(f"Total voiceover duration: {round(total_dur, 2)}s")

with open("public/audio/manifest.json", "w", encoding="utf-8") as f:
    json.dump(segments, f, indent=2)
