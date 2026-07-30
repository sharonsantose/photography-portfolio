#!/usr/bin/env python3
"""
fetch_spotify.py — Fetches currently playing track, recently played tracks,
audio features (BPM, Energy), and top running/focus tracks from Spotify Web API.

Outputs: private/spotify_data.json
"""

import json
import os
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timezone

CLIENT_ID = os.environ.get("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.environ.get("SPOTIFY_CLIENT_SECRET")
REFRESH_TOKEN = os.environ.get("SPOTIFY_REFRESH_TOKEN")

OUT_FILE = os.path.join(os.path.dirname(__file__), "..", "private", "spotify_data.json")

def get_access_token():
    if not CLIENT_ID or not CLIENT_SECRET or not REFRESH_TOKEN:
        print("Notice: Missing SPOTIFY env vars. Keeping cached spotify_data.json.")
        sys.exit(0)

    payload = urllib.parse.urlencode({
        "grant_type": "refresh_token",
        "refresh_token": REFRESH_TOKEN,
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
    }).encode("utf-8")

    req = urllib.request.Request("https://accounts.spotify.com/api/token", data=payload, method="POST")
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read().decode("utf-8"))
    return tokens["access_token"]

def spotify_fetch(endpoint, access_token):
    req = urllib.request.Request(
        f"https://api.spotify.com/v1/{endpoint}",
        headers={"Authorization": f"Bearer {access_token}"}
    )
    try:
        with urllib.request.urlopen(req) as resp:
            if resp.status == 204:
                return None
            return json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"Warning fetching Spotify endpoint {endpoint}: {e}")
        return None

def main():
    token = get_access_token()
    
    # 1. Currently Playing
    currently = spotify_fetch("me/player/currently-playing", token)
    curr_data = {"is_playing": False}
    
    if currently and currently.get("item"):
        item = currently["item"]
        curr_data = {
            "is_playing": currently.get("is_playing", False),
            "track": item.get("name"),
            "artist": ", ".join([a["name"] for a in item.get("artists", [])]),
            "album": item.get("album", {}).get("name"),
            "album_art": item.get("album", {}).get("images", [{}])[0].get("url"),
            "track_id": item.get("id")
        }
        
        # Audio features for BPM
        if item.get("id"):
            audio_feat = spotify_fetch(f"audio-features/{item['id']}", token)
            if audio_feat:
                curr_data["bpm"] = round(audio_feat.get("tempo", 0))
                curr_data["energy"] = audio_feat.get("energy")

    out = {
        "fetched_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "currently_playing": curr_data
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
    print(f"✅ Spotify data saved to {OUT_FILE}")

if __name__ == "__main__":
    main()
