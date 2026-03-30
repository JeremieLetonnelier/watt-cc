#!/usr/bin/env python3
"""
fetch_gfny.py — Script de mise à jour automatique des courses GFNY en France

Récupère la liste depuis gfny.com/race-finder, enrichit depuis chaque page de course
(distances, dénivelé, prix), et met à jour lib/data/gfny_races.json en préservant
les données renseignées manuellement (difficulty, wattParticipated, etc.).

Usage:
    python3 scripts/fetch_gfny.py
    # ou via npm:
    npm run fetch:gfny
"""

import html as _html_lib
import json
import re
import sys
import time
from datetime import datetime
from pathlib import Path

import requests
from bs4 import BeautifulSoup

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

RACE_FINDER_URL = (
    "https://gfny.com/race-finder/"
    "?fwp_race_finder_event_type=cycling"
    "&fwp_race_finder_continents=europe"
    "&fwp_race_finder_locations=france"
)

OUTPUT_FILE = Path(__file__).parent.parent / "lib" / "data" / "gfny_races.json"

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
}

# ── Static city metadata ────────────────────────────────────────────────────
# Fields that can't be automatically derived; update manually for new cities.
CITY_METADATA = {
    "cannes":         {"distanceFromParis": "900km", "transportAccess": True},
    "villard":        {"distanceFromParis": "600km", "transportAccess": False},
    "villard-de-lans": {"distanceFromParis": "600km", "transportAccess": False},
    "lourdes":        {"distanceFromParis": "800km", "transportAccess": True},
    "vaujany":        {"distanceFromParis": "605km", "transportAccess": False},
    "thann":          {"distanceFromParis": "470km", "transportAccess": True},
}

# ── French month names → zero-padded number ─────────────────────────────────
FR_MONTHS = {
    "jan": "01", "janv": "01", "janvier": "01",
    "fev": "02", "févr": "02", "février": "02",
    "mar": "03", "mars": "03",
    "avr": "04", "avril": "04",
    "mai": "05",
    "juin": "06",
    "juil": "07", "juillet": "07",
    "aou": "08", "août": "08", "aout": "08",
    "sep": "09", "sept": "09", "septembre": "09",
    "oct": "10", "octobre": "10",
    "nov": "11", "novembre": "11",
    "dec": "12", "déc": "12", "décembre": "12",
}


# ---------------------------------------------------------------------------
# Parsing helpers
# ---------------------------------------------------------------------------

def parse_date(date_str: str) -> str:
    """Parse '12 Apr 2026' or '12 AVR 2026' → '2026-04-12'."""
    date_str = date_str.strip()

    # English short month (e.g. 'Apr')
    try:
        return datetime.strptime(date_str, "%d %b %Y").strftime("%Y-%m-%d")
    except ValueError:
        pass

    # French month (e.g. 'Avril', 'AVRIL')
    parts = date_str.lower().split()
    if len(parts) == 3:
        day, month_raw, year = parts
        month_num = FR_MONTHS.get(month_raw) or FR_MONTHS.get(month_raw[:4]) or FR_MONTHS.get(month_raw[:3])
        if month_num:
            return f"{year}-{month_num}-{day.zfill(2)}"

    print(f"    ⚠️  Could not parse date: '{date_str}' — storing as-is")
    return date_str


def extract_rwgps_routes(raw_html: str) -> list[tuple[str, str | None]]:
    """
    Scan raw HTML for RideWithGPS embed blocks and return
    (route_id, privacy_code_or_None) tuples (deduplicated).

    Handles:
    - Public routes (no privacyCode in URL)   → privacy_code = None
    - HTML-encoded '&amp;' entities
    - Newlines inside attribute values (seen on grandballon.gfny.com)
    """
    # Unescape HTML entities (&amp; → &, etc.) before regex
    html = _html_lib.unescape(raw_html)

    found: list[tuple[str, str | None]] = []
    seen_ids: set[str] = set()

    # Match each ridewithgps.com/embeds occurrence and the ~300 chars after it
    for embed_m in re.finditer(
        r'ridewithgps\.com/embeds([^"<>]{0,400})',
        html,
        re.I | re.DOTALL,
    ):
        params = embed_m.group(1)

        # Extract the route id (mandatory)
        id_m = re.search(r'[?&]id=\s*(\d+)', params, re.I)
        if not id_m:
            continue

        route_id = id_m.group(1)
        if route_id in seen_ids:
            continue
        seen_ids.add(route_id)

        # Extract privacyCode (optional – absent for public routes)
        code_m = re.search(r'[?&]privacyCode=([A-Za-z0-9]+)', params, re.I)
        privacy_code: str | None = code_m.group(1) if code_m else None

        found.append((route_id, privacy_code))

    return found


def fetch_rwgps_route(
    session: requests.Session, route_id: str, privacy_code: str | None
) -> dict | None:
    """
    Fetch a single RideWithGPS route via the public JSON API.
    Returns a dict with 'distance_km' (float) and 'elevation_m' (int), or None.
    """
    url = f"https://ridewithgps.com/routes/{route_id}.json"
    if privacy_code:
        url += f"?privacy_code={privacy_code}"
    try:
        r = session.get(url, timeout=12)
        if not r.ok:
            return None
        data = r.json()
        distance_m  = data.get("distance")        # metres
        elevation_m = data.get("elevation_gain")  # metres
        if distance_m is None:
            return None
        return {
            "distance_km": round(distance_m / 1000, 1),
            "elevation_m": round(elevation_m) if elevation_m is not None else None,
        }
    except Exception:
        return None


def extract_price(text: str) -> str | None:
    """Extract registration price from text like '89€', '89 €', 'EUR 89'."""
    for pattern in [r"\b(\d{2,3})\s*€", r"€\s*(\d{2,3})", r"EUR\s*(\d{2,3})"]:
        m = re.search(pattern, text, re.IGNORECASE)
        if m:
            return f"{m.group(1)}€"
    return None


def difficulty_from_elevation(elev: int | None) -> str:
    """Guess difficulty 1-5 from elevation gain."""
    if elev is None:
        return "3"
    if elev < 1000:
        return "1"
    if elev < 2000:
        return "2"
    if elev < 3000:
        return "3"
    if elev < 4000:
        return "4"
    return "5"


def city_defaults(location: str) -> dict:
    """Return known distance/transport metadata for a given city string."""
    loc = location.lower()
    for key, meta in CITY_METADATA.items():
        if key in loc:
            return meta
    return {"distanceFromParis": None, "transportAccess": None}


# ---------------------------------------------------------------------------
# Scraping
# ---------------------------------------------------------------------------

def make_session() -> requests.Session:
    s = requests.Session()
    s.headers.update(HEADERS)
    return s


def fetch_race_list(session: requests.Session) -> list[dict]:
    """Scrape gfny.com/race-finder to build the raw list of French races."""
    print(f"📡  Fetching race finder …")
    resp = session.get(RACE_FINDER_URL, timeout=20)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "lxml")

    # The rendered HTML contains direct <a> tags with name / city / date
    # Pattern (from observed HTML):
    #   <a href="https://cannes.gfny.com">GFNY Cannes\n\n\tCannes, France\n\n\t\t12 Apr 2026</a>
    date_re = re.compile(r"^\d{1,2}\s+\w+\s+\d{4}$", re.IGNORECASE)

    races = []
    seen = set()

    for a in soup.find_all("a", href=True):
        href = a["href"].rstrip("/")
        # Must be an event subdomain (e.g. cannes.gfny.com), not gfny.com itself
        if not re.match(r"https?://[a-z][a-z0-9-]+\.gfny\.com$", href):
            continue
        if href in seen:
            continue

        lines = [ln.strip() for ln in a.get_text(separator="\n").splitlines() if ln.strip()]
        if len(lines) < 3:
            continue

        # First line = name, hunt for date & location in the rest
        name = lines[0]
        date_line = None
        location_line = None

        for line in lines[1:]:
            if date_re.match(line):
                date_line = line
            elif "France" in line:
                location_line = line

        if not date_line:
            continue

        location = (location_line or "").replace(", France", "").strip()

        seen.add(href)
        races.append({
            "name": name,
            "location": location,
            "date_raw": date_line,
            "link": href,
        })
        print(f"     ✅  {name} | {location} | {date_line}")

    return races


def enrich_race(session: requests.Session, race: dict) -> dict:
    """
    Fetch /parcours/ raw HTML → extract RideWithGPS route IDs → call RWGPS API
    for exact distance & elevation.  Also tries /inscription/ for the price.
    """
    base_url = race["link"]
    print(f"  📄  Enriching {race['name']} …", end="", flush=True)

    distances: list[str] = []
    elevation: int | None = None
    price: str | None = None

    # ── Step 1: extract RideWithGPS routes from /parcours/ raw HTML ──────────
    parcours_url = base_url.rstrip("/") + "/parcours/"
    try:
        r = session.get(parcours_url, timeout=15)
        if r.ok:
            raw_html = r.text
            rwgps_routes = extract_rwgps_routes(raw_html)

            if rwgps_routes:
                route_data: list[dict] = []
                for route_id, privacy_code in rwgps_routes:
                    time.sleep(0.3)
                    rd = fetch_rwgps_route(session, route_id, privacy_code)
                    if rd:
                        route_data.append(rd)

                if route_data:
                    # Sort descending by distance (longest = competitive course first)
                    route_data.sort(key=lambda d: d["distance_km"], reverse=True)
                    distances = [f"{rd['distance_km']}km" for rd in route_data]
                    # Use longest route's elevation as the reference
                    elevation = route_data[0]["elevation_m"]

            # Also try price from the parcours page text
            body_text = BeautifulSoup(raw_html, "lxml").get_text(separator=" ")
            price = extract_price(body_text)
        time.sleep(0.4)
    except Exception as exc:
        print(f"\n    ⚠️  {parcours_url} → {exc}")

    # ── Step 2: try /inscription/ for price if still missing ─────────────────
    if price is None:
        inscription_url = base_url.rstrip("/") + "/inscription/"
        try:
            r = session.get(inscription_url, timeout=10)
            if r.ok:
                price = extract_price(BeautifulSoup(r.text, "lxml").get_text(separator=" "))
            time.sleep(0.3)
        except Exception:
            pass

    tag = []
    if distances:
        tag.append(f"dist={','.join(distances)}")
    if elevation:
        tag.append(f"D+={elevation}m")
    if price:
        tag.append(f"price={price}")
    print(f" [{', '.join(tag) or 'no data'}]")

    return {"distances": distances, "elevation": elevation, "price": price}


# ---------------------------------------------------------------------------
# Merge logic (preserves manual overrides)
# ---------------------------------------------------------------------------

# Fields that the script ALWAYS refreshes (authoritative source = GFNY website)
AUTO_FIELDS = {"name", "date", "location", "link"}

# Fields that the script provides as defaults but NEVER overwrites once set manually
MANUAL_FIELDS = {
    "difficulty", "wattParticipated", "lastYearResults",
    "participantsCount", "popularity",
    "distanceFromParis", "transportAccess",
}


def load_existing(path: Path) -> list[dict]:
    if path.exists():
        try:
            with open(path, encoding="utf-8") as f:
                data = json.load(f)
            return data if isinstance(data, list) else []
        except Exception:
            return []
    return []


def merge(existing: list[dict], fresh: list[dict]) -> list[dict]:
    existing_map = {r["name"]: r for r in existing}
    merged = []

    for race in fresh:
        prev = existing_map.get(race["name"], {})

        entry = {
            # ── Always updated from GFNY ──────────────────────────────────
            "name":             race["name"],
            "date":             race["date"],
            "location":         race["location"],
            "link":             race["link"],
            # ── Updated from GFNY but kept if manually overridden ─────────
            "distances":        prev.get("distances") or race.get("distances", []),
            "price":            prev.get("price") or race.get("price"),
            # ── Fully manual (never overwritten once set) ─────────────────
            "participantsCount": prev.get("participantsCount", 1500),
            "difficulty":       prev.get("difficulty") or race.get("difficulty", "3"),
            "popularity":       prev.get("popularity", 3),
            "distanceFromParis": prev.get("distanceFromParis") or race.get("distanceFromParis"),
            "transportAccess":  prev.get("transportAccess") if "transportAccess" in prev else race.get("transportAccess"),
            "wattParticipated": prev.get("wattParticipated", False),
            "lastYearResults":  prev.get("lastYearResults", None),
        }

        # ── Drop null-only optional fields to keep JSON clean ─────────────────
        # We explicitly keep booleans as they are required in the TS interface
        entry = {k: v for k, v in entry.items() if v is not None or k in (
            "wattParticipated", "transportAccess"
        )}

        # Ensure booleans are never null (default to False if missing)
        if entry.get("wattParticipated") is None:
            entry["wattParticipated"] = False
        if entry.get("transportAccess") is None:
            entry["transportAccess"] = False

        merged.append(entry)

    return sorted(merged, key=lambda r: r.get("date", "9999"))


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> None:
    session = make_session()

    print("\n🚴  GFNY France Race Fetcher")
    print("=" * 44)

    # 1. Get race list from race finder
    raw_races = fetch_race_list(session)
    if not raw_races:
        print("\n❌  No races found — the page structure may have changed.")
        sys.exit(1)
    print(f"\n  → {len(raw_races)} race(s) found\n")

    # 2. Enrich each race
    enriched_races: list[dict] = []
    for raw in raw_races:
        time.sleep(0.3)
        enrichment = enrich_race(session, raw)
        meta = city_defaults(raw["location"])
        elev = enrichment["elevation"]

        enriched_races.append({
            "name":             raw["name"],
            "date":             parse_date(raw["date_raw"]),
            "location":         raw["location"],
            "link":             raw["link"],
            "distances":        enrichment["distances"],
            "price":            enrichment["price"],
            "difficulty":       difficulty_from_elevation(elev),
            "participantsCount": 1500,
            "popularity":       3,
            "distanceFromParis": meta["distanceFromParis"],
            "transportAccess":  meta["transportAccess"],
            "wattParticipated": False,
            "lastYearResults":  None,
        })

    # 3. Merge with existing (preserve manual overrides)
    existing = load_existing(OUTPUT_FILE)
    merged = merge(existing, enriched_races)

    # 4. Write output
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)

    print(f"\n✅  {len(merged)} race(s) written → {OUTPUT_FILE.relative_to(Path.cwd())}")
    print("\n📝  Champs à vérifier/ajuster manuellement dans gfny_races.json :")
    print("     • difficulty (1-5)")
    print("     • participantsCount")
    print("     • distanceFromParis")
    print("     • transportAccess")
    print("     • wattParticipated")
    print("     • lastYearResults")


if __name__ == "__main__":
    main()
