import json
import os

class StorageManager:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(script_dir, "data")
        os.makedirs(self.data_dir, exist_ok=True)
        
        self.results_path = os.path.join(self.data_dir, "ffcResults.json")
        self.riders_path = os.path.join(self.data_dir, "ffcRiders.json")

    def load_existing(self) -> tuple[list[dict], dict[str, dict]]:
        existing_results = []
        existing_riders = {}

        if os.path.exists(self.results_path):
            with open(self.results_path, "r", encoding="utf-8") as f:
                try:
                    existing_results = json.load(f)
                except json.JSONDecodeError:
                    existing_results = []

        if os.path.exists(self.riders_path):
            with open(self.riders_path, "r", encoding="utf-8") as f:
                try:
                    existing_riders = {r["id"]: r for r in json.load(f)}
                except json.JSONDecodeError:
                    existing_riders = {}
                
        return existing_results, existing_riders

    def save(self, all_results: list[dict], all_riders: dict[str, dict]) -> None:
        with open(self.results_path, "w", encoding="utf-8") as f:
            json.dump(all_results, f, ensure_ascii=False, indent=2)

        with open(self.riders_path, "w", encoding="utf-8") as f:
            json.dump(list(all_riders.values()), f, ensure_ascii=False, indent=2)

        print(f"[Storage] Sauvegarde terminée : {len(all_results)} résultats originaux | {len(all_riders)} coureurs au total.")
