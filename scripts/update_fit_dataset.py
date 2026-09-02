#!/usr/bin/env python3
"""Merge cloud Garmin/Strava summaries into the dataset consumed by /fit.

The richer records already exported by the local Garmin collector always win.
This bridge only fills newer/missing dates and safe summary fields; it never
publishes GPS polylines or raw health samples.
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
DATASET = ROOT / "fit" / "garmin_dataset.json"
GARMIN = ROOT / "private" / "garmin_data.json"
STRAVA = ROOT / "private" / "strava_data.json"


def load(path, default):
    try:
        with path.open(encoding="utf-8") as handle:
            return json.load(handle)
    except (FileNotFoundError, json.JSONDecodeError):
        return default


def sport_key(value):
    value = (value or "other").lower().replace(" ", "_")
    aliases = {
        "run": "running", "trail_run": "running", "virtual_run": "running",
        "treadmill_running": "running", "indoor_running": "running",
        "ride": "cycling", "virtual_ride": "cycling", "bike": "cycling",
        "swim": "swimming", "weighttraining": "strength_training",
        "workout": "strength_training", "walk": "walking", "hike": "hiking",
        "stairstepper": "stair_stepper", "indoor_rowing": "rowing",
    }
    return aliases.get(value, value)


def activity_date(activity):
    return str(activity.get("startTime", ""))[:10]


def same_workout(left, right):
    if activity_date(left) != activity_date(right):
        return False
    if sport_key(left.get("sport")) != sport_key(right.get("sport")):
        return False
    ld, rd = float(left.get("distanceMeters") or 0), float(right.get("distanceMeters") or 0)
    lt, rt = float(left.get("durationSeconds") or 0), float(right.get("durationSeconds") or 0)
    distance_match = ld and rd and abs(ld - rd) <= max(250, min(ld, rd) * 0.04)
    duration_match = lt and rt and abs(lt - rt) <= max(180, min(lt, rt) * 0.08)
    return bool(distance_match or duration_match)


def stable_id(source, date, index, activity):
    signature = "|".join([
        source, date, str(index), sport_key(activity.get("sport") or activity.get("type")),
        str(activity.get("dist_mi") or activity.get("distance_mi") or 0),
        str(activity.get("duration_sec") or activity.get("duration_min") or 0),
    ])
    return f"{source}_{hashlib.sha256(signature.encode()).hexdigest()[:16]}"


def provenance(source, synced_at):
    return {
        "source": source,
        "sourceField": "activities_by_date",
        "importedAt": synced_at,
        "quality": "summary",
    }


def garmin_activity(date, index, item, synced_at):
    return {
        "id": stable_id("garmin_summary", date, index, item),
        "startTime": f"{date}T12:00:00Z",
        "timezone": "America/Los_Angeles",
        "sport": sport_key(item.get("type")),
        "name": item.get("name") or "Garmin workout",
        "durationSeconds": float(item.get("duration_min") or 0) * 60,
        "distanceMeters": float(item.get("distance_mi") or 0) * 1609.344,
        "calories": item.get("calories"),
        "provenance": provenance("garmin_summary", synced_at),
    }


def strava_activity(date, index, item, synced_at):
    result = {
        "id": f"strava_{item.get('strava_id')}" if item.get("strava_id") else stable_id("strava", date, index, item),
        "startTime": f"{date}T12:00:00Z",
        "timezone": "America/Los_Angeles",
        "sport": sport_key(item.get("sport")),
        "name": item.get("name") or "Strava workout",
        "durationSeconds": float(item.get("duration_sec") or 0),
        "distanceMeters": float(item.get("dist_mi") or 0) * 1609.344,
        "averageHeartRate": item.get("hr_avg"),
        "maxHeartRate": item.get("hr_max"),
        "elevationGainMeters": float(item.get("elev_ft") or 0) / 3.28084,
        "provenance": provenance("strava", synced_at),
    }
    return {key: value for key, value in result.items() if value is not None}


def merge_activity(existing, incoming):
    """Keep rich Garmin values, filling only fields they do not contain."""
    for field in ("calories", "averageHeartRate", "maxHeartRate", "elevationGainMeters"):
        if not existing.get(field) and incoming.get(field):
            existing[field] = incoming[field]


def merge_group(activities, grouped, converter, synced_at):
    added = 0
    for date, items in grouped.items():
        for index, item in enumerate(items):
            incoming = converter(date, index, item, synced_at)
            match = next((activity for activity in activities if same_workout(activity, incoming)), None)
            if match:
                merge_activity(match, incoming)
            else:
                activities.append(incoming)
                added += 1
    return added


def merge_daily_summaries(dataset, garmin):
    by_date = {item.get("date"): item for item in dataset.setdefault("dailySummaries", []) if item.get("date")}
    synced_at = garmin.get("fetched_at") or datetime.now(timezone.utc).isoformat()
    for date, value in garmin.get("steps_history", {}).items():
        steps = value.get("steps") if isinstance(value, dict) else value
        if date not in by_date:
            by_date[date] = {
                "date": date,
                "timezone": "America/Los_Angeles",
                "provenance": provenance("garmin_summary", synced_at),
            }
        if steps is not None:
            by_date[date]["steps"] = steps

    today = garmin.get("today")
    stats = garmin.get("stats", {})
    if today:
        row = by_date.setdefault(today, {
            "date": today, "timezone": "America/Los_Angeles",
            "provenance": provenance("garmin_summary", synced_at),
        })
        mapping = {"steps": "steps", "active_calories": "activeCalories", "resting_hr": "restingHeartRate"}
        for source, target in mapping.items():
            if stats.get(source) is not None:
                row[target] = stats[source]
    dataset["dailySummaries"] = sorted(by_date.values(), key=lambda item: item["date"])


def main():
    dataset = load(DATASET, {})
    garmin = load(GARMIN, {})
    strava = load(STRAVA, {})
    activities = dataset.setdefault("activities", [])

    merge_daily_summaries(dataset, garmin)
    garmin_added = merge_group(
        activities, garmin.get("activities_by_date", {}), garmin_activity,
        garmin.get("fetched_at") or datetime.now(timezone.utc).isoformat(),
    )
    strava_added = merge_group(
        activities, strava.get("activities_by_date", {}), strava_activity,
        strava.get("fetched_at") or datetime.now(timezone.utc).isoformat(),
    )
    dataset["activities"] = sorted(activities, key=lambda item: (activity_date(item), str(item.get("id"))))

    sync_times = [value for value in (dataset.get("syncedAt"), garmin.get("fetched_at"), strava.get("fetched_at")) if value]
    dataset["syncedAt"] = max(sync_times) if sync_times else datetime.now(timezone.utc).isoformat()
    DATASET.write_text(json.dumps(dataset, separators=(",", ":")) + "\n", encoding="utf-8")
    print(f"Updated {DATASET}: {garmin_added} Garmin and {strava_added} Strava activities added")


if __name__ == "__main__":
    main()
