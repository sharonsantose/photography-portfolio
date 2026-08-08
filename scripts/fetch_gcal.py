#!/usr/bin/env python3
"""
Standalone 100% Cloud Google Calendar Fetcher for Sharon Santos
Fetches all Google Calendar events across all calendars and saves to fit/gcal_imported_events.json
Runs via GitHub Actions on a schedule without requiring a local computer.
"""

import os
import sys
import json
import time
import urllib.parse
import urllib.request

def get_credentials():
    client_id = os.environ.get("GCAL_CLIENT_ID")
    client_secret = os.environ.get("GCAL_CLIENT_SECRET")
    refresh_token = os.environ.get("GCAL_REFRESH_TOKEN")

    # Local fallback if environment variables are not set
    if not (client_id and client_secret and refresh_token):
        local_dir = os.path.expanduser("~/gcal_integration")
        creds_file = os.path.join(local_dir, "credentials.json")
        tokens_file = os.path.join(local_dir, "gcal_tokens.json")

        if os.path.exists(creds_file) and os.path.exists(tokens_file):
            with open(creds_file, "r") as f:
                cdata = json.load(f)
                client_id = cdata.get("installed", {}).get("client_id") or cdata.get("client_id")
                client_secret = cdata.get("installed", {}).get("client_secret") or cdata.get("client_secret")
            with open(tokens_file, "r") as f:
                tdata = json.load(f)
                refresh_token = tdata.get("refresh_token")

    if not (client_id and client_secret and refresh_token):
        print("Error: Missing GCAL OAuth environment variables (GCAL_CLIENT_ID, GCAL_CLIENT_SECRET, GCAL_REFRESH_TOKEN).")
        sys.exit(1)

    return client_id, client_secret, refresh_token

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_FILE = os.path.join(REPO_ROOT, "fit", "gcal_imported_events.json")

def get_access_token(client_id, client_secret, refresh_token):
    payload = urllib.parse.urlencode({
        "client_id": client_id,
        "client_secret": client_secret,
        "grant_type": "refresh_token",
        "refresh_token": refresh_token
    }).encode("utf-8")

    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=payload, method="POST")
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["access_token"]
    except Exception as e:
        print(f"Error getting access token: {e}")
        sys.exit(1)

def fetch_events(token):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    time_min = "2026-08-01T00:00:00Z"
    time_max = "2026-09-30T23:59:59Z"

    c_url = "https://www.googleapis.com/calendar/v3/users/me/calendarList"
    all_events_by_date = {}

    try:
        with urllib.request.urlopen(urllib.request.Request(c_url, headers=headers)) as resp:
            c_list = json.loads(resp.read().decode("utf-8")).get("items", [])

        for c in c_list:
            cal_id = c.get("id")
            cal_name = c.get("summary")
            e_url = f"https://www.googleapis.com/calendar/v3/calendars/{urllib.parse.quote(cal_id)}/events?timeMin={urllib.parse.quote(time_min)}&timeMax={urllib.parse.quote(time_max)}&singleEvents=true&orderBy=startTime&maxResults=250"
            try:
                with urllib.request.urlopen(urllib.request.Request(e_url, headers=headers)) as resp:
                    items = json.loads(resp.read().decode("utf-8")).get("items", [])
                for item in items:
                    summary = item.get("summary", "")
                    if not summary or "Sharon Santos —" in summary:
                        continue
                    st = item.get("start", {})
                    dt = st.get("date") or (st.get("dateTime", "")[:10])
                    if dt:
                        if dt not in all_events_by_date:
                            all_events_by_date[dt] = []
                        if not any(e["title"] == summary for e in all_events_by_date[dt]):
                            all_events_by_date[dt].append({
                                "title": summary,
                                "cal": cal_name,
                                "detail": item.get("description", "")
                            })
            except Exception as ex:
                print(f"Notice fetching {cal_name}: {ex}")

        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
            json.dump(all_events_by_date, f, indent=2)

        print(f"Saved {sum(len(v) for v in all_events_by_date.values())} events across {len(all_events_by_date)} dates to {OUTPUT_FILE}")
    except Exception as ex:
        print(f"Error fetching Google Calendar events: {ex}")
        sys.exit(1)

def main():
    client_id, client_secret, refresh_token = get_credentials()
    token = get_access_token(client_id, client_secret, refresh_token)
    fetch_events(token)

if __name__ == "__main__":
    main()
