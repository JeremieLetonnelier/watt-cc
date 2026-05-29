import re
from io import BytesIO
import requests
from pypdf import PdfReader

class PdfExtractor:
    def __init__(self):
        UPPER = r"A-Z\u00C0-\u00DD\u0152"
        LOWER = r"a-z\u00E0-\u00FD\u0153"

        self.preprocessing_regex1 = re.compile(f'([{LOWER}])([{UPPER}])')
        self.preprocessing_regex2 = re.compile(f'([{UPPER}])([{UPPER}][{LOWER}])')
        self.preprocessing_regex3 = re.compile(r'(\d)([' + UPPER + r'])')
        self.preprocessing_regex4 = re.compile(r'([' + UPPER + r'])(\d)')
        self.leading_time_regex = re.compile(r"^\d{1,2}:\d{2}(?::\d{2})?\s+")

        self.line_regex = re.compile(
            r"^(\d+)\s+(\d+)\s+(?:\d{9,15}\s+)?([" + UPPER + r"\s-]+?)\s+([{" + UPPER + r"}][{" + LOWER + r"}-]+(?:\s+[{" + UPPER + r"}][{" + LOWER + r"}-]+)*)\s*(.*?)\s*(Elite|Open\s*\d?|Access\s*\d?)\s*.*?(H|F|M)?(?:\s+([\d:\'\"\.,]*))?$"
        )
        self.fallback_regex = re.compile(
            r"^(\d+)\s+(\d+)\s+(?:\d{9,15}\s+)?([" + UPPER + r"\s-]+?)\s{2,}([" + UPPER + LOWER + r"\s-]+?)\s+(.*?)\s*(Elite|Open\s*\d?|Access\s*\d?)\s*.*?(H|F|M)?(?:\s+([\d:\'\"\.,]*))?$"
        )

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
                
            line = self.preprocessing_regex1.sub(r'\1 \2', line)
            line = self.preprocessing_regex2.sub(r'\1 \2', line)
            line = self.preprocessing_regex3.sub(r'\1 \2', line)
            line = self.preprocessing_regex4.sub(r'\1 \2', line)
            line = self.leading_time_regex.sub('', line)
            
            match = self.line_regex.match(line) or self.fallback_regex.match(line)
            
            if match:
                club = match.group(5).strip()
                club = re.sub(r'\s+\d{9,15}$', '', club) # Strip trailing licence number
                
                gender = match.group(7).strip() if match.group(7) else "H" # Default gender to H if not found
                
                raw_data.append({
                    "raceName": race_name,
                    "date": race_date,
                    "position": int(match.group(1)),
                    "riderName": f"{match.group(4).strip()} {match.group(3).strip()}",
                    "club": club,
                    "category": match.group(6).strip(),
                    "gender": gender,
                })
