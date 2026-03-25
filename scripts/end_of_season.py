import os
import json
import collections

class EndOfSeasonJob:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(script_dir, "data")
        self.results_path = os.path.join(self.data_dir, "ffcResults.json")
        self.riders_path = os.path.join(self.data_dir, "ffcRiders.json")

    def run(self):
        # 1. Load Data
        if not os.path.exists(self.results_path) or not os.path.exists(self.riders_path):
            print("Data files not found.")
            return

        with open(self.results_path, "r", encoding="utf-8") as f:
            all_results = json.load(f)

        with open(self.riders_path, "r", encoding="utf-8") as f:
            riders_list = json.load(f)
            riders_dict = {r["id"]: r for r in riders_list}

        # 2. Accumulate Challenge Points per Rider matching their recorded category
        rider_challenge_points = collections.defaultdict(float)
        
        for res in all_results:
            rid = res["riderId"]
            cp = res.get("challengePoints", 0)
            rider_challenge_points[rid] += cp

        # 3. Build ranking per category
        category_rankings = collections.defaultdict(list)
        for rid, rider in riders_dict.items():
            cat = rider.get("category", "Access 1")
            pts = rider_challenge_points[rid]
            category_rankings[cat].append({
                "id": rid,
                "points": pts,
                "age": rider.get("age", 30) # Default age if not provided
            })

        # Sort rankings descending by challenge points
        for cat in category_rankings:
            category_rankings[cat].sort(key=lambda x: x["points"], reverse=True)

        # 4. Apply End of Season Rules (Top 15 logic with age boundaries)
        rules = [
            {"from": "Access 1", "to": "Open 3", "max_age": 39},
            {"from": "Access 2", "to": "Access 1", "max_age": 39},
            {"from": "Access 3", "to": "Access 2", "max_age": 49},
            {"from": "Access 4", "to": "Access 3", "max_age": 59},
        ]

        promotions = []
        for rule in rules:
            cat_from = rule["from"]
            cat_to = rule["to"]
            max_age = rule["max_age"]

            ranking = category_rankings[cat_from]
            # Take top 15
            top_15 = ranking[:15]
            
            for rank_item in top_15:
                # If they scored points at all and they meet age req
                if rank_item["points"] > 0 and rank_item["age"] <= max_age:
                    rid = rank_item["id"]
                    riders_dict[rid]["category"] = cat_to
                    promotions.append((rid, cat_from, cat_to))

        # 5. Save updated riders
        with open(self.riders_path, "w", encoding="utf-8") as f:
            json.dump(list(riders_dict.values()), f, ensure_ascii=False, indent=2)

        print(f"End of season job completed. {len(promotions)} riders promoted based on Challenge Ranking.")
        for rid, old_cat, new_cat in promotions:
            print(f"- {rid}: {old_cat} -> {new_cat}")

if __name__ == "__main__":
    job = EndOfSeasonJob()
    job.run()
