#!/usr/bin/env python3
"""
Fetch Garmin Connect data (steps, sleep, resting HR, activities)
using cached GARMIN_TOKENS (or fallback to email/password)
and update private/garmin_data.json + habits in private/todo_data.json.
"""

import os
import sys
import json
import base64
from datetime import datetime, date

try:
    from garminconnect import (
        Garmin,
        GarminConnectAuthenticationError,
        GarminConnectTooManyRequestsError,
    )
except ImportError:
    print("Error: garminconnect library not installed. Install with: pip install garminconnect")
    sys.exit(1)


EMAIL = os.environ.get("GARMIN_EMAIL")
PASSWORD = os.environ.get("GARMIN_PASSWORD")
TOKENS_B64 = os.environ.get("GARMIN_TOKENS")

OUT_FILE = os.path.join(os.path.dirname(__file__), "../private/garmin_data.json")
TODO_FILE = os.path.join(os.path.dirname(__file__), "../private/todo_data.json")


def init_garmin():
    garmin = Garmin()

    # 1. Try restoring from GARMIN_TOKENS environment variable (GitHub Secrets)
    if TOKENS_B64:
        try:
            token_json = base64.b64decode(TOKENS_B64.strip()).decode("utf-8")
            token_data = json.loads(token_json)
            garmin.garth.load(token_data)
            print("✅ Successfully restored Garmin session from GARMIN_TOKENS environment secret.")
            return garmin
        except Exception as e:
            print(f"Warning: Failed to restore session from GARMIN_TOKENS secret ({e}). Trying fallback...")

    # 2. Fallback to Email + Password
    if EMAIL and PASSWORD:
        try:
            garmin = Garmin(EMAIL, PASSWORD)
            garmin.login()
            print("✅ Successfully logged into Garmin using EMAIL and PASSWORD.")
            return garmin
        except Exception as err:
            print(f"Garmin Email/Password Login Error: {err}")
            sys.exit(1)

    print("Error: Neither GARMIN_TOKENS nor GARMIN_EMAIL/GARMIN_PASSWORD set.")
    sys.exit(1)


def main():
    print("Connecting to Garmin Connect...")
    garmin = init_garmin()

    today_str = date.today().isoformat()
    print(f"Fetching Garmin stats for {today_str}...")

    stats = {}
    try:
        user_summary = garmin.get_user_summary(today_str)
        stats["steps"] = user_summary.get("totalSteps", 0)
        stats["step_goal"] = user_summary.get("dailyStepGoal", 10000)
        stats["resting_hr"] = user_summary.get("restingHeartRate")
        stats["active_calories"] = user_summary.get("activeKilocalories")
    except Exception as e:
        print(f"Warning fetching summary: {e}")

    try:
        sleep_data = garmin.get_sleep_data(today_str)
        daily_sleep = sleep_data.get("dailySleepDTO", {})
        sleep_sec = daily_sleep.get("sleepTimeSeconds", 0)
        stats["sleep_hours"] = round(sleep_sec / 3600, 1) if sleep_sec else 0
        stats["sleep_score"] = daily_sleep.get("sleepScores", {}).get("overall", {}).get("value")
    except Exception as e:
        print(f"Warning fetching sleep: {e}")

    activities_by_date = {}
    try:
        recent_activities = garmin.get_activities(0, 25)
        for act in recent_activities:
            start_time = act.get("startTimeLocal", "")
            if start_time:
                act_date = start_time.split(" ")[0]
                if act_date not in activities_by_date:
                    activities_by_date[act_date] = []
                activities_by_date[act_date].append({
                    "name": act.get("activityName"),
                    "type": act.get("activityType", {}).get("typeKey"),
                    "distance_mi": round(act.get("distance", 0) / 1609.34, 2),
                    "duration_min": round(act.get("duration", 0) / 60, 1),
                    "calories": act.get("calories")
                })
    except Exception as e:
        print(f"Warning fetching activities: {e}")

    output_data = {
        "fetched_at": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        "today": today_str,
        "stats": stats,
        "activities_by_date": activities_by_date
    }

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
    print(f"✅ Saved Garmin data → {OUT_FILE}")

    if os.path.exists(TODO_FILE):
        try:
            with open(TODO_FILE, "r", encoding="utf-8") as tf:
                todo_data = json.load(tf)
            habits = todo_data.get("habits", {})
            for act_date in activities_by_date.keys():
                if act_date not in habits:
                    habits[act_date] = {}
                habits[act_date]["strava"] = True
            todo_data["habits"] = habits
            with open(TODO_FILE, "w", encoding="utf-8") as tf:
                json.dump(todo_data, tf, indent=2)
            print(f"✅ Updated Garmin/Strava habit completion in {TODO_FILE}")
        except Exception as e:
            print(f"Warning updating todo_data.json: {e}")


if __name__ == "__main__":
    main()
