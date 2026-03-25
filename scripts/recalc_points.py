import json
import os
from points_manager import PointsManager
from storage import StorageManager

def main():
    sm = StorageManager()
    existing_results, existing_riders = sm.load_existing()
    
    if not existing_results:
        print("Aucun resultat trouve.")
        return
        
    pm = PointsManager()
    # Apply new point logic
    pm.assign_points_and_categories(existing_results, existing_riders)
    
    # Save back
    sm.save(existing_results, existing_riders)
    print("Recalcul termine avec succes.")

if __name__ == "__main__":
    main()
