import unicodedata

class DataTransformer:
    @staticmethod
    def slugify(text: str) -> str:
        text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
        return text.lower().replace(" ", "-")

    @staticmethod
    def normalize_category(cat: str) -> str:
        cat_lower = str(cat).lower()
        if "acc" in cat_lower:
            if "1" in cat_lower: return "Access 1"
            if "2" in cat_lower: return "Access 2"
            if "3" in cat_lower: return "Access 3"
            if "4" in cat_lower: return "Access 4"
            return "Access 1"
        if "open" in cat_lower:
            if "1" in cat_lower: return "Open 1"
            if "2" in cat_lower: return "Open 2"
            if "3" in cat_lower: return "Open 3"
            return "Open 1"
        return "Access 1"

    def transform(self, raw_data: list[dict]) -> tuple[list[dict], list[dict]]:
        results_list = []
        riders_dict = {}

        for row in raw_data:
            rider_name = str(row.get("riderName", "")).strip().title()
            if not rider_name or rider_name.lower() == "nan":
                continue

            rider_id = self.slugify(rider_name)
            race_id = f"{self.slugify(row['raceName'])}-{row['date']}-{rider_id}"
            cat = self.normalize_category(row.get("category", ""))
            
            results_list.append({
                "id": race_id,
                "raceName": row["raceName"],
                "date": row["date"],
                "riderId": rider_id,
                "position": int(row["position"]),
                "category": cat
            })

            if rider_id not in riders_dict:
                riders_dict[rider_id] = {
                    "id": rider_id,
                    "name": rider_name,
                    "club": str(row.get("club", "Indépendant")).strip().upper(),
                    "category": cat
                }

        return results_list, list(riders_dict.values())
