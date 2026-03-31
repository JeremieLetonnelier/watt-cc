import os
import json
import time
from playwright.sync_api import sync_playwright

def scrape():
    url = "https://new.sportsnconnect.com/client/events?sports=4ppj42BKkWq61w7AfDpmeU"
    events_data = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        print(f"Loading {url}")
        page.goto(url)
        
        # Wait a bit for the page to load
        page.wait_for_timeout(5000)
        
        # Get all links that look like event detail pages
        # The URLs might be /client/events/[id]
        event_links = page.locator('a[href*="/client/events/"]').all()
        print(f"Found {len(event_links)} event elements")
        
        for link in event_links:
            text = link.inner_text().strip()
            href = link.get_attribute('href')
            if text and len(text.split('\n')) > 1:
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                # A typical card has Date, Title, Location, maybe distance
                events_data.append({
                    "raw_text": lines,
                    "link": f"https://new.sportsnconnect.com{href}" if href.startswith('/') else href
                })
        
        browser.close()

    output_dir = os.path.join(os.path.dirname(__file__), '..', 'lib', 'data')
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, 'cyclosportives_raw.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(events_data, f, ensure_ascii=False, indent=2)
        
    print(f"Saved {len(events_data)} raw events to {output_path}")

if __name__ == "__main__":
    scrape()
