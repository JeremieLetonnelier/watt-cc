import pandas as pd

def compute_results_ffc_points(raw_data):
        
    df = pd.DataFrame(raw_data)
    
    # Nettoyage des chaînes
    df['riderName'] = df['riderName'].str.strip().str.title()
    df['club'] = df['club'].str.strip().str.upper()
    
    # 1. Barème FFC pour les promotions (P1: 6, P2: 4, P3: 3, P4: 2, P5: 1)
    # Les positions > 5 renverront NaN avec le map, qu'on remplace par 0
    points_system = {1: 6, 2: 4, 3: 3, 4: 2, 5: 1}
    df['points'] = df['position'].map(points_system).fillna(0).astype(int)
    
    # 2. Ajout d'un flag "victoire" pour compter les wins facilement (pour la règle des 2 ou 3 wins)
    df['isWin'] = (df['position'] == 1)
    
    # Génération d'un ID unique "slug" pour le coureur (pour matcher avec Next.js)
    # Ex: "Camille Dupont" -> "camille-dupont"
    df['riderId'] = df['riderName'].str.lower().str.replace(' ', '-', regex=False)
    
    # Génération d'un ID unique pour la ligne de résultat
    df['id'] = df['raceName'].str.lower().str.replace(' ', '-', regex=False) + '-' + df['riderId']
    
    return df
