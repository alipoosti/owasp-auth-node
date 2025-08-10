import requests

BASE_URL = "http://localhost:3000"

# 🌀 Create a session to persist cookies across requests
session = requests.Session()

# STEP 1: Get CSRF token (and CSRF cookie)
csrf_res = session.get(f"{BASE_URL}/csrf-token")
print("[1] Raw CSRF response:", csrf_res.json())

csrf_token = csrf_res.json().get("csrfToken")
if not csrf_token:
    raise Exception("No CSRF token received")

print("[1] CSRF token:", csrf_token)

# STEP 2: Register a new user
headers = { "X-CSRF-Token": csrf_token }
register_payload = {
    "username": "john123",
    "password": "securePass1"
}
reg_res = session.post(f"{BASE_URL}/api/auth/register", json=register_payload, headers=headers)
print("[2] Register:", reg_res.status_code, reg_res.json())

# STEP 3: Get a new CSRF token for login (still same session)
csrf_token = session.get(f"{BASE_URL}/csrf-token").json()["csrfToken"]
headers = { "X-CSRF-Token": csrf_token }

# STEP 4: Login
login_payload = {
    "username": "john123",
    "password": "securePass1"
}
login_res = session.post(f"{BASE_URL}/api/auth/login", json=login_payload, headers=headers)
print("[3] Login:", login_res.status_code, login_res.json())

token = login_res.json().get("token")

# STEP 5: Use token to access protected /profile route
auth_headers = {
    "Authorization": f"Bearer {token}"
}
profile_res = session.get(f"{BASE_URL}/api/profile", headers=auth_headers)
print("[4] Profile:", profile_res.status_code, profile_res.json())

# --- OAuth 2.0 Google OAuth flow demonstration ---

import webbrowser
import time

print("\n[5] Starting OAuth 2.0 Google login flow demonstration...")

# Step 1: Open browser to start OAuth login (user interaction required)
oauth_login_url = f"{BASE_URL}/api/auth/oauth/google"
print(f"Open this URL in your browser to start OAuth login:\n{oauth_login_url}")

# Note: This script cannot automate the full OAuth flow due to browser interaction and redirects.
# You can manually complete the OAuth login in the browser, then use the callback to get the token.

print("After completing OAuth login in the browser, you should receive a JWT token from the callback endpoint.")
print("You can then use that token to access protected routes similarly to the traditional login flow.")

# Optionally, wait for user input to continue or exit
input("Press Enter to exit the test script...")
