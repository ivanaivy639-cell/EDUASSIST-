import urllib.request
import urllib.error
import re
import json

url = 'https://eduassist-api-0jq8.onrender.com/'

try:
    urllib.request.urlopen(url)
    print("SUCCESS: 200 OK")
except urllib.error.HTTPError as e:
    html = e.read().decode('utf-8', errors='ignore')
    print(f"HTTP ERROR: {e.code}")
    
    # Search for json objects in HTML script tags
    matches = re.findall(r'window\.ignite\s*=\s*(\{.*?\});', html, re.DOTALL)
    if not matches:
        matches = re.findall(r'(\{"[a-zA-Z0-9_]+":.*?\})', html)
        
    for m in matches:
        if 'message' in m:
            print("FOUND MATCH:", m[:300])

    # Search for title tag or heading
    titles = re.findall(r'<title>(.*?)</title>', html)
    print("TITLES:", titles)
    
    # Save html to file for inspection
    with open('scratch/ignition.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Saved HTML to scratch/ignition.html")
