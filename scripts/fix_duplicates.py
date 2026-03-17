import json
import os
import re

def slugify(text):
    return text.lower().replace(' ', '-')

def fix_ffc_results():
    results_path = "/Users/jeremieletonnelier/Documents/Git/watt-cc/scripts/data/ffcResults.json"
    
    if not os.path.exists(results_path):
        print(f"File not found: {results_path}")
        return

    with open(results_path, "r", encoding="utf-8") as f:
        results = json.load(f)

    print(f"Initial results: {len(results)}")
    
    # Target Fontainebleau races with incorrect dates
    correct_date = "2026-03-08"
    bad_dates = ["2026-03-13", "2026-03-16"]
    
    count_fixed = 0
    cleaned_results = {} # Use dict to deduplicate by ID

    for res in results:
        # Check if it's a Fontainebleau race with one of the bad dates
        is_fontainebleau = "fontainebleau" in res["raceName"].lower() or "fontaine" in res["raceName"].lower()
        if is_fontainebleau and res["date"] in bad_dates:
            # Fix date
            res["date"] = correct_date
            # Regenerate ID: nom-course-YYYY-MM-DD-id-coureur
            new_id = f"{slugify(res['raceName'])}-{res['date']}-{res['riderId']}"
            res["id"] = new_id
            count_fixed += 1
        
        # Add to dict for deduplication
        # If ID already exists, we keep the one we just processed (or the first one encountered)
        if res["id"] not in cleaned_results:
            cleaned_results[res["id"]] = res

    final_results = list(cleaned_results.values())
    print(f"Fixed {count_fixed} entries.")
    print(f"Final results (after deduplication): {len(final_results)}")
    print(f"Removed {len(results) - len(final_results)} duplicates.")

    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(final_results, f, ensure_ascii=False, indent=2)
    
    print("Cleanup complete!")

if __name__ == "__main__":
    fix_ffc_results()
