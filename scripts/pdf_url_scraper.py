import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from typing import List

class CIFUrlScraper:
    """
    Service responsible for finding and extracting all PDF result URLs 
    from the main CIF FFC results page.
    """
    
    # Base URL where the HTML table of results is located
    SOURCE_PAGE_URL = "https://cif-ffc.fr/menuCif/resultats/eprdateresultroute1.php"

    def get_pdf_urls(self) -> List[str]:
        """
        Scrapes the results page to find all links pointing to PDF files.
        Converts any relative URLs into absolute URLs.
        
        :return: A list of absolute URL strings.
        """
        try:
            response = requests.get(self.SOURCE_PAGE_URL, timeout=15)
            response.raise_for_status()
        except requests.RequestException as e:
            print(f"Failed to fetch the results page: {e}")
            return []

        soup = BeautifulSoup(response.text, "html.parser")
        pdf_urls = []

        # Find all link tags (<a>) in the HTML
        for link in soup.find_all("a", href=True):
            href = link["href"]
            
            # Check if the link points to a PDF
            if href.lower().endswith(".pdf"):
                # Convert relative URLs (e.g., "2026/file.pdf") to absolute URLs
                absolute_url = urljoin(self.SOURCE_PAGE_URL, href)
                
                # Avoid duplicates
                if absolute_url not in pdf_urls:
                    pdf_urls.append(absolute_url)

        return pdf_urls