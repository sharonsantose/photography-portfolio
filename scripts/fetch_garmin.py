#!/usr/bin/env python3
"""
Fetch Garmin Connect data (steps, sleep, resting HR, activities)
and update private/garmin_data.json + habits in private/todo_data.json.
"""

import os
import sys
import json
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
OUT_FILE = os.path.join(os.path.dirname(__file__), "../private/garmin_data.json")
TODO_FILE = os.path.join(os.path.dirname(__file__), "../private/todo_data.json")
TOKEN_DIR = os.path.expanduser("~/.garminconnect")


def init_garmin():
    if not EMAIL or not PASSWORD:
        print("Error: GARMIN_EMAIL and GARMIN_PASSWORD environment variables are required.")
        sys.exit(1)

    os.makedirs(TOKEN_DIR, exist_ok=True)
    token_file = os.path.join(TOKEN_DIR, f"{EMAIL.replace('@', '_at_')}.json")

    garmin = Garmin(EMAIL, PASSWORD)

    # Try loading cached OAuth tokens first
    if os.path.exists(token_file):
        try:
            with open(token_file, "r") as f:
                token_data = json.load(f)
            garmin.login(token_data)
            print("Successfully logged into Garmin using cached tokens.")
            return garmin
        except Exception as e:
            print(f"Cached token login failed ({e}), doing full login...")

    try:
        garmin.login()
        # Save tokens for future logins
        tokens = garmin.garth.dump()
        with open(token_file, "w") as f:
            json.dump(tokens, f)
        print("Successfully logged into Garmin Connect & saved OAuth session.")
        return garmin
    except (GarminConnectAuthenticationError, GarminConnectTooManyRequestsError) as err:
        print(f"Garmin Authentication Error: {err}")
        sys.exit(1)
    except Exception as err:
        print(f"Garmin Login Exception: {err}")
        sys.exit(1)


def main():
    print("Connecting to Garmin Connect...")
    garmin = init_garmin()

    today_str = date.today().isoformat()
    print(f"Fetching Garmin stats for {today_str}...")

    # Fetch daily stats
    stats = {}
    try:
        user_summary = garmin.get_user_summary(today_str)
        stats["steps"] = user_summary.get("totalSteps", 0)
        stats["step_goal"] = user_summary.get("dailyStepGoal", 10000)
        stats["resting_hr"] = user_summary.get("restingHeartRate")
        stats["active_calories"] = user_summary.get("activeKilocalories")
    except Exception as e:
        print(f"Warning fetching summary: {e}")

    # Fetch sleep data
    try:
        sleep_data = garmin.get_sleep_data(today_str)
        daily_sleep = sleep_data.get("dailySleepDTO", {})
        sleep_sec = daily_sleep.get("sleepTimeSeconds", 0)
        stats["sleep_hours"] = round(sleep_sec / 3600, 1) if sleep_sec else 0
        stats["sleep_score"] = daily_sleep.get("sleepScores", {}).get("overall", {}).get("value")
    except Exception as e:
        print(f"Warning fetching sleep: {e}")

    # Fetch recent activities
    activities_by_date = {}
    try:
        recent_activities = garmin.get_activities(0, 20)
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

    # Save to garmin_data.json
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(output_data, f, indent=2)
    print(f"✅ Saved Garmin data → {OUT_FILE}")

    # Auto-fill habits grid in todo_data.json
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
