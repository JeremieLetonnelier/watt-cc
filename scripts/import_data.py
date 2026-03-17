"""
import_data.py — Script unifié d'import des données FFC
=========================================================

Usage:
    python import_data.py --source ffc          # Scrape le site velo.ffc.fr
    python import_data.py --source pdf --url URL # Scrape un PDF distant
    python import_data.py --source all --url URL # Les deux

Les données sont mergées (non écrasées) dans scripts/data/ffcResults.json
et scripts/data/ffcRiders.json.
"""

import argparse
import json
import os
import re
import time
import unicodedata
from datetime import datetime
from io import BytesIO, StringIO

import pandas as pd
import requests
from bs4 import BeautifulSoup
from pypdf import PdfReader

from points import compute_results_ffc_points

# ---------------------------------------------------------------------------
# Helpers partagés
# ---------------------------------------------------------------------------

MONTH_MAPPING = {
    "janvier": "01", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "décembre": "12"
}

def parse_french_date(date_str: str) -> str:
    """Convertit une date '8 mars 2026' en '2026-03-08'."""
    try:
        parts = date_str.lower().split()
        if len(parts) >= 3:
            day = parts[0].zfill(2)
            month = MONTH_MAPPING.get(parts[1], "01")
            year = parts[2]
            return f"{year}-{month}-{day}"
    except Exception:
        pass
    return datetime.now().strftime("%Y-%m-%d")


def slugify(text: str) -> str:

    """Convertit un texte en slug URL-friendly."""
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("utf-8")
    return text.lower().replace(" ", "-")


def normalize_category(cat: str) -> str:
    """Normalise une catégorie en l'une des valeurs canoniques."""
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
    return "Access 1"  # fallback


# ---------------------------------------------------------------------------
# Extract
# ---------------------------------------------------------------------------

def extract_ffc_web() -> list[dict]:
    """Scrape les résultats depuis velo.ffc.fr (Île-de-France / CIF)."""
    print("[FFC Web] Démarrage de l'extraction…")
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    cif_url = "https://velo.ffc.fr/resultats-des-courses/?_region=ile-de-france"
    raw_data = []

    try:
        response = requests.get(cif_url, headers=headers, timeout=15)
        soup = BeautifulSoup(response.text, "html.parser")
        links = soup.select('a[href*="/resultats/"]')

        for link in links:
            race_url = link["href"]
            if not race_url.startswith("http"):
                race_url = f"https://velo.ffc.fr{race_url}"

            print(f"  → {race_url}")
            race_response = requests.get(race_url, headers=headers, timeout=15)
            race_soup = BeautifulSoup(race_response.text, "html.parser")

            h1 = race_soup.find("h1")
            race_name = h1.text.strip() if h1 else "Course Inconnue"

            # Extraction de la date réelle
            time_tag = race_soup.find("time", class_="header-race__date")
            race_date = parse_french_date(time_tag.text.strip()) if time_tag else datetime.now().strftime("%Y-%m-%d")

            try:
                tables = pd.read_html(StringIO(race_response.text))
                if not tables:
                    continue
                df_results = tables[0]

                for index, row in df_results.iterrows():
                    if "Nom" not in df_results.columns or pd.isna(row.get("Nom")):
                        continue
                    rider_name = f"{row.get('Prénom', '')} {row.get('Nom', '')}".strip()
                    position = row.get("Rang", index + 1)
                    raw_data.append({
                        "raceName": race_name,
                        "date": race_date,
                        "riderName": rider_name,
                        "club": row.get("Club", "Indépendant"),
                        "category": race_name,
                        "position": int(position) if str(position).isdigit() else index + 1,
                    })

            except Exception as e:
                print(f"  ✗ Aucun tableau valide pour {race_name} : {e}")

            time.sleep(1)

        print(f"[FFC Web] {len(raw_data)} coureurs extraits.")
        return raw_data

    except Exception as e:
        print(f"[FFC Web] Erreur globale : {e}")
        return []


def extract_pdf(url: str, race_name: str, race_date: str) -> list[dict]:
    """
    Scrape les résultats depuis un PDF FFC distant.

    Args:
        url:       URL du fichier PDF.
        race_name: Nom de la course (ex: 'FONTAINEBLEAU - OPEN 2-3').
        race_date: Date au format YYYY-MM-DD.
    """
    print(f"[PDF] Téléchargement : {url}")
    response = requests.get(url, timeout=30)
    pdf = PdfReader(BytesIO(response.content))

    line_regex = re.compile(
        r"^(\d+)\s+(\d+)\s+([A-Z\s]+?)\s+([A-Z][a-z\xA0-\xFF\s-]+?)\s+(.+?)\s+(Open \d|Access \d)\s*.*?(H|F)\s+([\d:\'\"0-9]*)$"
    )

    raw_data = []
    for page in pdf.pages:
        for line in page.extract_text().split("\n"):
            line = line.strip()
            match = line_regex.match(line)
            if match:
                rg = int(match.group(1))
                nom = match.group(3).strip()
                prenom = match.group(4).strip()
                equipe = match.group(5).strip()
                cat = match.group(6).strip()
                sexe = match.group(7).strip()
                raw_data.append({
                    "raceName": race_name,
                    "date": race_date,
                    "riderName": f"{prenom} {nom}",
                    "club": equipe,
                    "category": cat,
                    "position": rg,
                    "gender": sexe,
                })

    print(f"[PDF] {len(raw_data)} coureurs extraits.")
    return raw_data


# ---------------------------------------------------------------------------
# Transform
# ---------------------------------------------------------------------------

def transform(raw_data: list[dict]) -> tuple[list[dict], list[dict]]:
    """Calcule les points et construit les listes results + riders."""
    df = compute_results_ffc_points(raw_data)
    df = df.dropna(subset=["riderName"])

    results_list = []
    riders_dict = {}

    for _, row in df.iterrows():
        rider_id = row["riderId"]
        race_id = row["id"]

        results_list.append({
            "id": race_id,
            "raceName": row["raceName"],
            "date": row["date"],
            "riderId": rider_id,
            "position": int(row["position"]),
            "points": int(row["points"]),
        })


        if rider_id not in riders_dict:
            riders_dict[rider_id] = {
                "id": rider_id,
                "name": row["riderName"],
                "club": row.get("club", "Indépendant"),
                "category": normalize_category(row.get("category", "")),
            }

    return results_list, list(riders_dict.values())


# ---------------------------------------------------------------------------
# Load (merge — ne jamais écraser l'existant)
# ---------------------------------------------------------------------------

def load(results_list: list[dict], riders_list: list[dict]) -> None:
    """Merge les nouvelles données dans les fichiers JSON existants."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(script_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    results_path = os.path.join(data_dir, "ffcResults.json")
    riders_path = os.path.join(data_dir, "ffcRiders.json")

    # Chargement des données existantes
    existing_results: list[dict] = []
    existing_riders: dict[str, dict] = {}

    if os.path.exists(results_path):
        with open(results_path, "r", encoding="utf-8") as f:
            existing_results = json.load(f)

    if os.path.exists(riders_path):
        with open(riders_path, "r", encoding="utf-8") as f:
            existing_riders = {r["id"]: r for r in json.load(f)}

    # Merge résultats (dédupliqués par id)
    existing_ids = {r["id"] for r in existing_results}
    new_results = [r for r in results_list if r["id"] not in existing_ids]
    existing_results.extend(new_results)

    # Merge coureurs (dédupliqués par id, sans écraser les existants)
    for rider in riders_list:
        if rider["id"] not in existing_riders:
            existing_riders[rider["id"]] = rider

    with open(results_path, "w", encoding="utf-8") as f:
        json.dump(existing_results, f, ensure_ascii=False, indent=2)

    with open(riders_path, "w", encoding="utf-8") as f:
        json.dump(list(existing_riders.values()), f, ensure_ascii=False, indent=2)

    print(
        f"[Load] ✔ {len(new_results)} nouveaux résultats ajoutés "
        f"(total : {len(existing_results)}) | "
        f"{len(existing_riders)} coureurs au total."
    )


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import des données FFC dans les fichiers JSON.")
    parser.add_argument(
        "--source",
        choices=["ffc", "pdf", "all"],
        default="ffc",
        help="Source à importer : 'ffc' (site web), 'pdf' (fichier PDF), 'all' (les deux).",
    )
    parser.add_argument(
        "--url",
        default="",
        help="URL du PDF à scraper (requis si --source pdf ou all).",
    )
    parser.add_argument(
        "--race-name",
        default="Course FFC",
        help="Nom de la course pour le PDF (ex: 'FONTAINEBLEAU - OPEN 2-3').",
    )
    parser.add_argument(
        "--race-date",
        default=datetime.now().strftime("%Y-%m-%d"),
        help="Date de la course au format YYYY-MM-DD.",
    )
    args = parser.parse_args()

    all_raw: list[dict] = []

    if args.source in ("ffc", "all"):
        all_raw.extend(extract_ffc_web())

    if args.source in ("pdf", "all"):
        if not args.url:
            parser.error("--url est requis quand --source est 'pdf' ou 'all'.")
        all_raw.extend(extract_pdf(args.url, args.race_name, args.race_date))

    if not all_raw:
        print("Aucune donnée extraite. Arrêt.")
    else:
        results, riders = transform(all_raw)
        load(results, riders)
