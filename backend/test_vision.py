import requests

# Example URL of the new vision endpoint
url = "http://localhost:8000/api/analyze-image"

# Path to the image you want to test
image_path = "test_image.jpg"

try:
    with open(image_path, "rb") as f:
        files = {"file": (image_path, f, "image/jpeg")}
        response = requests.post(url, files=files)
        
    print("Response Status:", response.status_code)
    print("Response JSON:")
    print(response.json())
except FileNotFoundError:
    print(f"Error: Please place an image named '{image_path}' in the same directory.")
except Exception as e:
    print(f"Error testing endpoint: {e}")
