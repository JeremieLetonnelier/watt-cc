class PointsManager:
    def __init__(self):
        self.points_system = {
            1: 50, 2: 25, 3: 22, 4: 19, 5: 17, 6: 15, 7: 14, 8: 13, 
            9: 12, 10: 11, 11: 10, 12: 9, 13: 8, 14: 7, 15: 6, 
            16: 5, 17: 4, 18: 3, 19: 2, 20: 1, 21: 0
        }

    def assign_points_and_categories(self, all_results: list[dict], existing_riders: dict[str, dict]) -> None:
        rider_latest_date = {}
        rider_current_cat = {}
        
        # 1. Determine current category per rider
        for res in all_results:
            rid = res["riderId"]
            r_date = res["date"]
            r_cat = res.get("category", existing_riders.get(rid, {}).get("category", "Access 1"))
            
            if rid not in rider_latest_date or r_date > rider_latest_date[rid]:
                rider_latest_date[rid] = r_date
                rider_current_cat[rid] = r_cat

        # 2. Update existing riders with their current category
        for rid, cat in rider_current_cat.items():
            if rid in existing_riders:
                existing_riders[rid]["category"] = cat
                
        # 3. Count participants per race location and category
        race_counts = {}
        for res in all_results:
            race_key = (res.get("raceName", ""), res["date"], res.get("category", "Access 1"))
            race_counts[race_key] = race_counts.get(race_key, 0) + 1

        # 4. Assign points conditionally
        for res in all_results:
            rid = res["riderId"]
            pos = res.get("position", 999)
            
            current_cat = rider_current_cat.get(rid, existing_riders.get(rid, {}).get("category", "Access 1"))
            res_cat = res.get("category", current_cat)
            
            if res_cat == current_cat:
                base_points = self.points_system.get(pos, 0)
                race_key = (res.get("raceName", ""), res["date"], res_cat)
                
                # Diviser par 2 si moins de 31 partants (classés)
                if race_counts.get(race_key, 0) < 31:
                    res["points"] = base_points / 2.0
                else:
                    res["points"] = base_points
            else:
                res["points"] = 0
                
            res["isWin"] = (pos == 1)
