import json
import os
import unicodedata
import requests
import pandas as pd
import time

from bs4 import BeautifulSoup
from io import StringIO
from datetime import datetime
from points import compute_results_ffc_points

def extract_data():
    print("Démarrage de l'extraction (Extract)...")
    
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    # URL filtrée sur l'Île-de-France pour ne récupérer que le CIF
    cif_url = "https://velo.ffc.fr/resultats-des-courses/?_region=ile-de-france"
    raw_data = []
    
    try:
        # 1. Récupération de la liste des courses
        response = requests.get(cif_url, headers=headers)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # 2. Cibler les liens pointant vers les détails des courses
        links = soup.select('a[href*="/resultats/"]')
        
        # On limite aux 5 premières courses pour la phase de test
        for link in links:
            race_url = link['href']
            if not race_url.startswith('http'):
                race_url = f"https://velo.ffc.fr{race_url}"
                
            print(f"Extraction de : {race_url}")
            race_response = requests.get(race_url, headers=headers)
            race_soup = BeautifulSoup(race_response.text, 'html.parser')
            
            # Récupération du nom de la course
            h1 = race_soup.find('h1')
            race_name = h1.text.strip() if h1 else "Course Inconnue"
            
            # 3. Extraction du tableau HTML avec Pandas
            try:
                # read_html parse nativement les <table> HTML
                tables = pd.read_html(StringIO(race_response.text))
                if not tables:
                    continue
                
                df_results = tables[0] # Le premier tableau est toujours le classement
                
                # 4. Formatage selon votre structure cible
                for index, row in df_results.iterrows():
                    # Sécurité : vérifier que la ligne contient un vrai coureur
                    if 'Nom' not in df_results.columns or pd.isna(row.get('Nom')):
                        continue
                        
                    rider_name = f"{row.get('Prénom', '')} {row.get('Nom', '')}".strip()
                    position = row.get('Rang', index + 1)
                    
                    raw_data.append({
                        "raceName": race_name,
                        "date": datetime.now().strftime("%Y-%m-%d"), # Remplacer par du parsing si la date exacte est requise
                        "riderName": rider_name,
                        "club": row.get('Club', 'Indépendant'),
                        "category": race_name, # Souvent inclus dans le titre (ex: "ACCESS 1-2")
                        "position": int(position) if str(position).isdigit() else index + 1
                    })
            except Exception as e:
                print(f"Aucun tableau valide pour {race_name} : {e}")
            
            # Respect des serveurs de la fédération
            time.sleep(1)

        print(raw_data)
            
        return raw_data
        
    except Exception as e:
        print(f"Erreur globale lors du scraping: {e}")
        return []
    
# Helper pour créer un ID standardisé basé sur le nom
def slugify(text):
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8')
    return text.lower().replace(' ', '-')

def transform_data(raw_data):

    df = compute_results_ffc_points(raw_data)
    df = df.dropna(subset=['riderName'])

    # Création du format exact attendu par RaceResult
    results_list = []
    for index, row in df.iterrows():
        rider_id = slugify(row['riderName'])
        race_id = slugify(f"{row['raceName']}-{row['date']}-{rider_id}")
        
        results_list.append({
            "id": race_id,
            "raceName": row['raceName'],
            "date": row['date'], # Doit être au format YYYY-MM-DD
            "riderId": rider_id,
            "position": int(row['position']),
            "points": int(row['points'])
        })
    
    return results_list

def load_data(results_list, output_file="data/ffcResults.json"):
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', encoding='utf-8') as f:
        # On sauvegarde directement la liste, pas un objet global
        json.dump(results_list, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    data = extract_data()
    df_transformed = transform_data(data)
    load_data(df_transformed)
