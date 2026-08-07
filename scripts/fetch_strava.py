#!/usr/bin/env python3
"""
fetch_strava.py — run by GitHub Actions daily.

Reads STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN
from environment variables (GitHub Secrets).

Outputs: private/strava_data.json
"""

import json
import os
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone

# ── Config ───────────────────────────────────────────────────────────────────
CLIENT_ID     = os.environ.get("STRAVA_CLIENT_ID")
CLIENT_SECRET = os.environ.get("STRAVA_CLIENT_SECRET")
REFRESH_TOKEN = os.environ.get("STRAVA_REFRESH_TOKEN")

TRAINING_START_TS = int(datetime(2026, 7, 1, 0, 0, 0, tzinfo=timezone.utc).timestamp())

OUT_FILE = os.path.join(os.path.dirname(__file__), "..", "private", "strava_data.json")

# ── Token refresh ─────────────────────────────────────────────────────────────
def refresh_access_token():
    if not CLIENT_ID or not CLIENT_SECRET or not REFRESH_TOKEN:
        print("Notice: Missing STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, or STRAVA_REFRESH_TOKEN env vars. Skipping live sync.")
        return None

    payload = urllib.parse.urlencode({
        "client_id":     CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "grant_type":    "refresh_token",
        "refresh_token": REFRESH_TOKEN,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://www.strava.com/api/v3/oauth/token",
        data=payload, method="POST"
    )
    with urllib.request.urlopen(req) as resp:
        tokens = json.loads(resp.read().decode("utf-8"))

    # Write new refresh token back to GitHub output so caller can update secret
    new_refresh = tokens.get("refresh_token", REFRESH_TOKEN)
    if new_refresh != REFRESH_TOKEN:
        # Write to a file for the Action to capture and update the secret
        with open("new_refresh_token.txt", "w") as f:
            f.write(new_refresh)
        print(f"New refresh token written to new_refresh_token.txt")

    print(f"Access token obtained, expires at {tokens['expires_at']}")
    return tokens["access_token"]


# ── Fetch activities ──────────────────────────────────────────────────────────
def fetch_activities(access_token):
    print(f"Fetching activities since {datetime.utcfromtimestamp(TRAINING_START_TS).strftime('%Y-%m-%d')}...")
    page = 1
    per_page = 200
    all_acts = []

    while True:
        url = (
            f"https://www.strava.com/api/v3/athlete/activities"
            f"?after={TRAINING_START_TS}&page={page}&per_page={per_page}"
        )
        req = urllib.request.Request(
            url, headers={"Authorization": f"Bearer {access_token}"}
        )
        try:
            with urllib.request.urlopen(req) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                if not data:
                    break
                all_acts.extend(data)
                print(f"  Page {page}: {len(data)} activities")
                if len(data) < per_page:
                    break
                page += 1
        except Exception as e:
            print(f"  Error fetching page {page}: {e}")
            break

    print(f"Total fetched: {len(all_acts)} activities")
    return all_acts


# ── Format for website ────────────────────────────────────────────────────────
EMOJI = {
    "Run":            "🏃",
    "Swim":           "🏊",
    "Ride":           "🚴",
    "WeightTraining": "🏋",
    "Workout":        "💪",
    "Walk":           "🚶",
    "Hike":           "🌲",
    "StairStepper":   "🧗",
    "Yoga":           "🧘",
    "Elliptical":     "⚡",
}

def meters_to_miles(m):
    return m / 1609.34

def format_pace(moving_sec, dist_m):
    if dist_m < 100:
        return None
    dist_mi = meters_to_miles(dist_m)
    pace_min = (moving_sec / 60) / dist_mi
    mins = int(pace_min)
    secs = int((pace_min % 1) * 60)
    return f"{mins}:{secs:02d}/mi"

def format_duration(seconds):
    h = seconds // 3600
    m = (seconds % 3600) // 60
    if h:
        return f"{h}h {m:02d}m"
    return f"{m}m"

def build_summary(act):
    sport   = act.get("sport_type") or act.get("type", "Workout")
    dist_m  = act.get("distance", 0)
    move_s  = act.get("moving_time", 0)
    elev    = act.get("total_elevation_gain", 0)
    hr_avg  = act.get("average_heartrate")
    hr_max  = act.get("max_heartrate")
    name    = act.get("name", "Workout")
    cadence = act.get("average_cadence")

    emoji = EMOJI.get(sport, "⚡")
    dist_mi = meters_to_miles(dist_m) if dist_m else 0
    pace    = format_pace(move_s, dist_m) if dist_m and sport in ("Run", "Walk", "Hike") else None
    speed_mph = round(dist_mi / (move_s / 3600), 1) if dist_m and move_s and sport == "Ride" else None

    parts = []
    if dist_m and dist_mi >= 0.1:
        parts.append(f"{dist_mi:.2f} mi")
    if move_s:
        parts.append(format_duration(move_s))
    if pace:
        parts.append(f"@ {pace}")
    if speed_mph and sport == "Ride":
        parts.append(f"@ {speed_mph} mph")
    if hr_avg:
        parts.append(f"❤️ {int(hr_avg)} bpm")
    if elev and elev > 5:
        parts.append(f"↑ {int(elev)}ft")
    if cadence and sport == "Run":
        parts.append(f"cadence {int(cadence*2)} spm")

    return {
        "emoji":   emoji,
        "sport":   sport,
        "name":    name,
        "detail":  " · ".join(parts),
        "dist_mi": round(dist_mi, 2),
        "duration_sec": move_s,
        "pace":    pace,
        "hr_avg":  int(hr_avg) if hr_avg else None,
        "hr_max":  int(hr_max) if hr_max else None,
        "elev_ft": int(elev * 3.28084) if elev else 0,
        "strava_id": act.get("id"),
        "map_polyline": act.get("map", {}).get("summary_polyline"),
    }

def group_by_date(activities):
    """Group activities by local date (YYYY-MM-DD), multi-activity days aggregated."""
    by_date = {}
    for act in activities:
        date_str = act.get("start_date_local", "")[:10]
        if not date_str:
            continue
        summary = build_summary(act)
        if date_str not in by_date:
            by_date[date_str] = []
        by_date[date_str].append(summary)
    return by_date


# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    access_token = refresh_access_token()
    if not access_token:
        print("⚠️ Skipping Strava sync due to missing credentials.")
        sys.exit(0)
    raw_activities = fetch_activities(access_token)
    by_date = group_by_date(raw_activities)

    output = {
        "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "athlete_id": 197020850,
        "activities_by_date": by_date,
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Wrote {len(by_date)} dates → {OUT_FILE}")

    # Also update private/todo_data.json habits grid with Strava workout dates
    todo_file = os.path.join(os.path.dirname(__file__), "../private/todo_data.json")
    if os.path.exists(todo_file):
        try:
            with open(todo_file, "r", encoding="utf-8") as tf:
                todo_content = json.load(tf)
            habits = todo_content.get("habits", {})
            for d in by_date.keys():
                if d not in habits:
                    habits[d] = {}
                habits[d]["strava"] = True
            todo_content["habits"] = habits
            with open(todo_file, "w", encoding="utf-8") as tf:
                json.dump(todo_content, tf, indent=2)
            print(f"✅ Updated habits grid in {todo_file}")
        except Exception as e:
            print(f"  Warning updating todo_data.json: {e}")

    for d in sorted(by_date):
        acts = by_date[d]
        for a in acts:
            print(f"  {d}: {a['emoji']} {a['sport']} — {a['detail']}")
