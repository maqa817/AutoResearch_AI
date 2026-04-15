import requests

url = "http://127.0.0.1:8000/api/research"
payload = {
    "query": "What is the capital of France?",
    "use_full_orchestration": False,
    "use_web": True
}

try:
    print(f"Sending request to {url} with use_web=True...")
    response = requests.post(url, json=payload, timeout=30)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Request failed: {e}")
