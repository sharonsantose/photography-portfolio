#!/usr/bin/env python3
"""
Local helper script to authenticate with Garmin Connect ONCE from your Mac,
save session tokens, and output base64 encoded token for GitHub Secrets.
"""

import os
import sys
import json
import base64
import getpass

try:
    from garminconnect import Garmin
except ImportError:
    print("Installing garminconnect...")
    os.system("python3 -m pip install --break-system-packages garminconnect")
    from garminconnect import Garmin

def main():
    print("=== Garmin Connect Session Token Generator ===")
    email = os.environ.get("GARMIN_EMAIL") or input("Enter Garmin Email: ").strip()
    password = os.environ.get("GARMIN_PASSWORD") or getpass.getpass("Enter Garmin Password: ").strip()

    if not email or not password:
        print("Email and password are required.")
        return

    print(f"\nLogging into Garmin Connect as {email}...")
    try:
        token_dir = os.path.expanduser("~/.garminconnect")
        os.makedirs(token_dir, exist_ok=True)
        garmin = Garmin(email, password)
        garmin.login()
        print("✅ Login Successful!")

        # Save session tokens locally
        tokens = garmin.garth.dump()
        token_file = os.path.join(token_dir, "tokens.json")
        with open(token_file, "w", encoding="utf-8") as f:
            json.dump(tokens, f)

        # Output base64 for GitHub Secrets
        b64_tokens = base64.b64encode(json.dumps(tokens).encode()).decode()

        print("\n=======================================================")
        print("Copy the text below and save it as GARMIN_TOKENS in GitHub Secrets:")
        print("=======================================================\n")
        print(b64_tokens)
        print("\n=======================================================")

    except Exception as e:
        print(f"❌ Login failed: {e}")

if __name__ == "__main__":
    main()
