import collections
from datetime import datetime

class PointsManager:
    def __init__(self):
        self.challenge_points_system = {
            1: 50, 2: 25, 3: 22, 4: 19, 5: 17, 6: 15, 7: 14, 8: 13, 
            9: 12, 10: 11, 11: 10, 12: 9, 13: 8, 14: 7, 15: 6, 
            16: 5, 17: 4, 18: 3, 19: 2, 20: 1
        }
        
        self.promotion_points_system = {
            1: 6, 2: 4, 3: 3, 4: 2, 5: 1
        }
        
        self.category_levels = {
            "Access 4": 1,
            "Access 3": 2,
            "Access 2": 3,
            "Access 1": 4,
            "Open 3": 5,
            "Open 2": 6,
            "Open 1": 7
        }

    def check_upgrade_victory(self, rider_cat: str, race_cat: str) -> bool:
        rider_level = self.category_levels.get(rider_cat, 0)
        
        race_levels = []
        for cat in self.category_levels:
            if cat in race_cat:
                race_levels.append(self.category_levels[cat])
                
        if not race_levels:
            return False
            
        race_level = max(race_levels)
        return rider_level < race_level

    def get_next_category(self, current_cat: str) -> str:
        # Simple mapping for promotion
        mapping = {
            "Access 4": "Access 3",
            "Access 3": "Access 2",
            "Access 2": "Access 1",
            "Access 1": "Open 3",
            "Open 3": "Open 2",
            "Open 2": "Open 1"
        }
        return mapping.get(current_cat, current_cat)

    def assign_points_and_categories(self, all_results: list[dict], existing_riders: dict[str, dict]) -> None:
        # We must process chronologically for mid-season promotions
        
        # 1. Group results by race for Starters/Ex-aequo logic
        # And sort the races by date
        races_by_date = collections.defaultdict(list)
        for res in all_results:
            # Assumes date format is sortable YYYY-MM-DD
            races_by_date[res.get("date", "1970-01-01")].append(res)
            
        sorted_dates = sorted(races_by_date.keys())
        
        # Track promotion state
        rider_promotion_points = collections.defaultdict(int)
        rider_promotion_wins = collections.defaultdict(int)
        
        for date in sorted_dates:
            results_on_date = races_by_date[date]
            
            # Sub-group by actual race within the same date
            races = collections.defaultdict(list)
            for res in results_on_date:
                races[res.get("raceName", "")].append(res)
                
            for race_name, race_results in races.items():
                total_starters = next((r["totalStarters"] for r in race_results if r.get("totalStarters")), len(race_results))
                is_regional_championship = any(r.get("isRegionalChampionship") for r in race_results)
                
                # To handle separate classifications (like Access 1 vs Access 2) without accidentally merging their 1st places:
                # We sub-group the rankings by category for ex-aequo logic
                rankings_by_category = collections.defaultdict(list)
                for r in race_results:
                    rankings_by_category[r.get("category", "Access 1")].append(r)
                
                for cat_name, cat_results in rankings_by_category.items():
                    pos_dict = collections.defaultdict(list)
                    for r in cat_results:
                        pos = r.get("position", 999)
                        pos_dict[pos].append(r)
                        
                    for pos, tied_results in pos_dict.items():
                        num_tied = len(tied_results)
                        # Challenge points Ex-Aequo Average
                        total_cp = sum(self.challenge_points_system.get(pos + i, 0) for i in range(num_tied))
                        avg_cp = (total_cp / num_tied) if num_tied else 0
                        if total_starters < 31:
                            avg_cp /= 2.0
                            
                        # Promotion Base point (No average)
                        base_pp = self.promotion_points_system.get(pos, 0)
                        if total_starters <= 10:
                            base_pp = 0
                            
                        for r in tied_results:
                            r["challengePoints"] = avg_cp if not is_regional_championship else 0
                            r["promotionPoints"] = base_pp if not is_regional_championship else 0
                            r["points"] = r["challengePoints"] # Backward compat
                            r["isWin"] = (pos == 1)
                            
                            rid = r["riderId"]
                            # Get current real-time state of the rider
                            rider_obj = existing_riders.get(rid, {})
                            current_cat = r.get("category", rider_obj.get("category", "Access 1"))
                            
                            r["isUpgradeVictory"] = False
                            race_cat_str = r.get("raceName", "") + " " + r.get("category", "")
                            
                            if r["isWin"] and self.check_upgrade_victory(current_cat, race_cat_str):
                                r["isUpgradeVictory"] = True
                            
                        # Apply to accumulators
                        if not is_regional_championship:
                            rider_promotion_points[rid] += base_pp
                            if r["isWin"]:
                                rider_promotion_wins[rid] += 1
                                
                        # Check promotion triggers
                        age = rider_obj.get("age", 30) # Default to 30
                        is_u19 = (17 <= age <= 18)
                        has_benefited = rider_obj.get("hasBenefitedFromRelegation", False)
                        
                        points_target = 25
                        wins_target = 2
                        
                        if is_u19 or has_benefited:
                            points_target = 25
                            wins_target = 1
                            
                        # Conditions for immediate upgrade
                        should_upgrade = False
                        if r["isUpgradeVictory"]:
                            should_upgrade = True
                        elif rider_promotion_points[rid] >= points_target:
                            should_upgrade = True
                        elif rider_promotion_wins[rid] >= wins_target:
                            should_upgrade = True
                            
                        if should_upgrade and current_cat != "Open 1":
                            next_cat = self.get_next_category(current_cat)
                            
                            # Promote explicitly for the rest of the season
                            if rid in existing_riders:
                                existing_riders[rid]["category"] = next_cat
                                
                            # Reset accumulators
                            rider_promotion_points[rid] = 0
                            rider_promotion_wins[rid] = 0
