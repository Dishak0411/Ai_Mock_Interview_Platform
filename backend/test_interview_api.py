import requests
import json

def test_create_interview():
    url = "http://localhost:8000/api/v1/interviews/"
    payload = {
        "role": "Data Scientist",
        "difficulty": "Medium"
    }
    # No headers (Guest Mode)
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(json.dumps(response.json(), indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_create_interview()
