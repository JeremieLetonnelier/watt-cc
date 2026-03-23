import re
from io import BytesIO
import requests
from pypdf import PdfReader

class PdfExtractor:
    def __init__(self):
        self.line_regex = re.compile(
            r"^(\d+)\s+(\d+)\s+(?:\d{9,15}\s+)?([A-Z\s-]+?)\s+([A-Z][a-z\xA0-\xFF-]+(?:\s+[A-Z][a-z\xA0-\xFF-]+)*)\s*(.*?)\s*(Elite|Open \d|Access \d)\s*.*?(H|F)\s+([\d:\'\"\.]*)$"
        )
        self.preprocessing_regex = re.compile(r'([a-z\xA0-\xFF])([A-Z])')

    def extract_from_url(self, url: str, race_name: str, race_date: str) -> list[dict]:
        print(f"[Extractor] Téléchargement : {url}")
        
        try:
            response = requests.get(url, timeout=30)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"[Extractor] Erreur de téléchargement : {e}")
            return []

        pdf = PdfReader(BytesIO(response.content))
        raw_data = []

        for page in pdf.pages:
            self._parse_page(page.extract_text(), race_name, race_date, raw_data)

        print(f"[Extractor] {len(raw_data)} coureurs extraits depuis le PDF.")
        return raw_data
        
    def _parse_page(self, text: str, race_name: str, race_date: str, raw_data: list[dict]):
        for line in text.split("\n"):
            line = line.strip()
            if not line:
                continue
                
            line = self.preprocessing_regex.sub(r'\1 \2', line)
            match = self.line_regex.match(line)
            
            if match:
                raw_data.append({
                    "raceName": race_name,
                    "date": race_date,
                    "position": int(match.group(1)),
                    "riderName": f"{match.group(4).strip()} {match.group(3).strip()}",
                    "club": match.group(5).strip(),
                    "category": match.group(6).strip(),
                    "gender": match.group(7).strip(),
                })
