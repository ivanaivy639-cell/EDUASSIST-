# Script to start Expo without displaying env messages
param(
    [switch]$Web,
    [string]$Port = "8082",
    [string[]]$ExtraArgs
)

$env:EXPO_PUBLIC_FIREBASE_API_KEY = "AIzaSyC_ApMIi3V_CklOmiRb9kZOenh0kW1vxL0"
$env:EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN = "eduassist-prod.firebaseapp.com"
$env:EXPO_PUBLIC_FIREBASE_PROJECT_ID = "eduassist-prod"
$env:EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET = "eduassist-prod.appspot.com"
$env:EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = "123456789012"
$env:EXPO_PUBLIC_FIREBASE_APP_ID = "1:123456789012:web:abcdef1234567890"
$env:EXPO_PUBLIC_API_URL = "http://192.168.9.112:8000"
$env:EXPO_PUBLIC_WEB_API_URL = "http://localhost:8000"
$env:EXPO_PUBLIC_GOOGLE_REDIRECT_URI = "http://localhost:8082"

# Launch Expo without displaying env messages
if ($Web) {
    & npx expo start --web --port $Port @ExtraArgs
} else {
    & npx expo start @ExtraArgs
}
