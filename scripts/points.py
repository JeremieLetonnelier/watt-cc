import pandas as pd

def compute_results_ffc_points(raw_data):
        
    df = pd.DataFrame(raw_data)
    
    # Nettoyage des chaînes
    df['riderName'] = df['riderName'].str.strip().str.title()
    df['club'] = df['club'].str.strip().str.upper()
    
    # 1. Barème FFC pour les promotions (P1: 6, P2: 4, P3: 3, P4: 2, P5: 1)
    # Les positions > 5 renverront NaN avec le map, qu'on remplace par 0
    points_system = {1: 50, 2: 25, 3: 22, 4: 19, 5: 17, 6: 15, 7: 14, 8: 13, 9: 12, 10: 11, 11: 10, 12: 9, 13: 8, 14: 7, 15: 6, 16: 5, 17: 4, 18: 3, 19: 2, 20: 1, 21: 0}

    df['points'] = df['position'].map(points_system).fillna(0).astype(int)
    
    # 2. Ajout d'un flag "victoire" pour compter les wins facilement (pour la règle des 2 ou 3 wins)
    df['isWin'] = (df['position'] == 1)
    
    # Génération d'un ID unique "slug" pour le coureur (pour matcher avec Next.js)
    # Ex: "Camille Dupont" -> "camille-dupont"
    df['riderId'] = df['riderName'].str.lower().str.replace(' ', '-', regex=False)
    
    # Génération d'un ID unique pour la ligne de résultat
    # Format: nom-course-YYYY-MM-DD-id-coureur
    df['id'] = (
        df['raceName'].str.lower().str.replace(' ', '-', regex=False) + '-' +
        df['date'] + '-' +
        df['riderId']
    )
    
    return df

