import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import List

MONTH_MAPPING = {
    "janvier": "01", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12"
}

class CIFUrlScraper:
    """
    Service responsible for finding and extracting all PDF result URLs 
    and race metadata from the main CIF FFC results page.
    """
    
    # Base URL where the HTML table of results is located
    SOURCE_PAGE_URL = "https://cif-ffc.fr/menuCif/resultats/eprdateresultroute1.php"

    def get_pdf_urls(self) -> List[dict]:
        """
        Scrapes the results page to find all links pointing to PDF files
        along with their corresponding official dates and race names from the HTML table.
        """
        try:
            response = requests.get(self.SOURCE_PAGE_URL, timeout=15)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to fetch the results page: {e}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        results = []
        seen_urls = set()

        table = soup.find("table", class_="tableau")
        if not table:
            return results

        # Find all rows in tbody
        for tr in table.find_all("tr"):
            cols = tr.find_all("td")
            if len(cols) >= 5:
                date_text = cols[1].text.strip()
                lieu = cols[2].text.strip()
                categorie = cols[3].text.strip()
                result_link = cols[4].find("a")
                
                if result_link and result_link.get("href"):
                    href = result_link["href"]
                    if href.lower().endswith(".pdf"):
                        absolute_url = urljoin(self.SOURCE_PAGE_URL, href)
                        
                        if absolute_url not in seen_urls:
                            seen_urls.add(absolute_url)
                            parsed_date = self._parse_french_date(date_text, href)
                            race_name = f"{lieu} - {categorie}".strip()
                            
                            results.append({
                                "url": absolute_url,
                                "date": parsed_date,
                                "name": race_name
                            })

        return results

    def _parse_french_date(self, date_str: str, url: str) -> str:
        """Convert '22 Mars' to '2026-03-22' using year from URL."""
        import re
        from datetime import datetime
        year = str(datetime.now().year)

        # Try to parse the year out of the url: '.../2026/0308...pdf'
        match_year = re.search(r'/(20\d{2})/', url)
        if match_year:
            year = match_year.group(1)

        try:
            parts = date_str.lower().split()
            if len(parts) >= 2:
                day = parts[0].zfill(2)
                month = MONTH_MAPPING.get(parts[1], "01")
                return f"{year}-{month}-{day}"
        except Exception:
            pass
            
        return f"{year}-01-01"