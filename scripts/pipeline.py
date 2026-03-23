import re
from datetime import datetime
from pdf_url_scraper import CIFUrlScraper
from extractor import PdfExtractor
from transformer import DataTransformer
from storage import StorageManager
from points_manager import PointsManager

class ImportPipeline:
    def __init__(self):
        self.scraper = CIFUrlScraper()
        self.extractor = PdfExtractor()
        self.transformer = DataTransformer()
        self.storage = StorageManager()
        self.points_manager = PointsManager()

    def run_automated(self):
        print("[Pipeline] Démarrage de la détection de PDF automatique...")
        pdf_urls = self.scraper.get_pdf_urls()
        
        if not pdf_urls:
            print("[Pipeline] Aucun PDF trouvé ou impossible de joindre la source.")
            return
            
        print(f"[Pipeline] {len(pdf_urls)} documents PDF à traiter.")
        
        all_raw_data = []
        for idx, url in enumerate(pdf_urls, start=1):
            print(f"[{idx}/{len(pdf_urls)}] Processing: {url}")
            
            filename = url.split('/')[-1]
            race_name = filename.replace('.pdf', '')
            
            match_date = re.search(r'(20\d{2})(\d{2})(\d{2})', filename)
            if match_date:
                year, month, day = match_date.groups()
                race_date = f"{year}-{month}-{day}"
            else:
                race_date = datetime.now().strftime("%Y-%m-%d")

            raw_data = self.extractor.extract_from_url(url, race_name=race_name, race_date=race_date)
            all_raw_data.extend(raw_data)
            
        self._process_raw_data(all_raw_data)

    def run_single_pdf(self, url: str, race_name: str, race_date: str):
        print(f"[Pipeline] Traitement d'un PDF unique : {url}")
        raw_data = self.extractor.extract_from_url(url, race_name, race_date)
        
        if raw_data:
            self._process_raw_data(raw_data)
        else:
            print("[Pipeline] Aucune donnée extraite de ce PDF.")

    def _process_raw_data(self, all_raw_data: list[dict]):
        if not all_raw_data:
            print("[Pipeline] Pas de nouvelles données à traiter.")
            return

        new_results, new_riders = self.transformer.transform(all_raw_data)
        
        existing_results, existing_riders = self.storage.load_existing()
        
        existing_results_dict = {r["id"]: r for r in existing_results}
        for r in new_results:
            existing_results_dict[r["id"]] = r
        all_results = list(existing_results_dict.values())

        for rider in new_riders:
            if rider["id"] not in existing_riders:
                existing_riders[rider["id"]] = rider

        self.points_manager.assign_points_and_categories(all_results, existing_riders)
        self.storage.save(all_results, existing_riders)
