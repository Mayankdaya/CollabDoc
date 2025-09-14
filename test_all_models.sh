#!/bin/bash

API_KEY="AIzaSyD7U1bJDvB_gwgy4F38Q67hoNXr1kuVznU"
BASE_URL="https://generativelanguage.googleapis.com/v1beta/models"

# List of available Gemini models to test
MODELS=(
    "gemini-pro"
    "gemini-pro-vision"
    "gemini-ultra"
    "gemini-1.0-pro"
    "gemini-1.5-pro"
    "gemini-1.0-pro-vision"
    "models/gemini-pro"
    "models/gemini-pro-vision"
)

echo "Testing Gemini API with key: ${API_KEY:0:10}..."
echo "=============================================="

for model in "${MODELS[@]}"; do
    echo -e "\nTesting model: $model"
    echo "------------------------"
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" -X POST \
      -H "Content-Type: application/json" \
      -d '{
        "contents": [{
          "parts": [{
            "text": "Hello! Please respond with a short greeting and tell me which model you are."
          }]
        }]
      }' \
      "${BASE_URL}/${model}:generateContent?key=$API_KEY")
    
    # Extract HTTP status and body
    http_status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
    body=$(echo "$response" | sed -e 's/HTTP_STATUS:.*//')
    
    if [ "$http_status" = "200" ]; then
        echo "✅ SUCCESS: Model $model is accessible"
        # Extract and display the response text
        echo "$body" | grep -o '"text":"[^"]*"' | head -1 | sed 's/"text":"//' | sed 's/"$//'
    else
        echo "❌ FAILED: Model $model (HTTP: $http_status)"
        # Show error message if available
        echo "$body" | grep -o '"message":"[^"]*"' | head -1 | sed 's/"message":"//' | sed 's/"$//' || echo "No error message"
    fi
    
    sleep 1 # Rate limiting
done

# Test model listing
echo -e "\nTesting model listing..."
echo "------------------------"
list_response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
  "${BASE_URL}?key=$API_KEY")

list_http_status=$(echo "$list_response" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')
list_body=$(echo "$list_response" | sed -e 's/HTTP_STATUS:.*//')

if [ "$list_http_status" = "200" ]; then
    echo "✅ Model listing successful"
    echo "$list_body" | grep -o '"name":"[^"]*"' | head -5
else
    echo "❌ Model listing failed (HTTP: $list_http_status)"
fi
