

<h1 align="center">🏆 WATT.CC - Plateforme de Résultats & Classements Cyclistes</h1>

<p align="center">
  Une application web moderne pour suivre et valoriser les performances des cyclistes du club <strong>WATT.CC</strong> (et d'ailleurs), en intégrant automatiquement les résultats officiels FFC et GFNY.
</p>

## ✨ Fonctionnalités Principales

- 🏅 **Classement FFC Automatisé** : Récupération et calcul des points basés sur les résultats officiels de la Fédération Française de Cyclisme (Comité d'Île-de-France).
- 🌍 **Résultats GFNY** : Suivi des performances sur les courses cyclosportives du circuit mondial GFNY (Cannes, Villard de Lans, Lourdes Tourmalet...).
- 📊 **Tableau de Bord WATT.CC vs Général** : Possibilité de filtrer le classement pour ne voir que les coureurs du club ou le classement général CIF.
- 🎯 **Filtres Intelligents** : Tri par catégorie (Access 1-4, Open 1-3) pour une vue ciblée.
- ⚡ **Design Moderne & Réactif** : Interface premium avec animations, mode sombre et typographie soignée (propulsée par Tailwind CSS et Motion).

## 🛠️ Stack Technique

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Style** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations** : [Motion](https://motion.dev/) (anciennement Framer Motion)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Scripts Data** : Python (pour le scraping et la gestion du barème des points FFC)

## 🚀 Installation & Lancement (Local)

**Prérequis** : [Node.js](https://nodejs.org/) (v18+ recommandé) et Python (pour les scripts de données).

1. **Cloner le projet** et installer les dépendances :
   ```bash
   npm install
   ```

2. **Lancer le serveur de développement** :
   ```bash
   npm run dev
   ```

3. **Voir l'application** :
   Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## 📦 Architecture des Données

Les données qui alimentent l'application proviennent du dossier `scripts/data/` :

- `ffcResults.json` : Contient l'historique de tous les résultats de courses FFC scrapés.
- `ffcRiders.json` : Base de données des coureurs et de leurs attributs (nom, club, catégorie).
- `lib/data.ts` : Point d'entrée côté frontend qui type, assemble et calcule les classements à la volée.

Les anciens scripts monolithiques (`import_data.py` et `points.py`) ont été remplacés par une architecture python modulaire orientée objet (ex: `extractor.py`, `transformer.py`, `points_manager.py`) orchestrée par `main.py`.

## 🔄 Mise à jour des Données FFC

Le pipeline Python s'occupe de récupérer automatiquement les résultats depuis le site du CIF FFC et d'appliquer le barème de points (avec division par 2 pour les pelotons de moins de 31 coureurs, et filtration par catégorie actuelle).

**1. Mettre à jour les données (Intégration des nouveautés) :**
Pour aller chercher les nouveaux résultats et les ajouter à la base existante sans perte d'historique :
```bash
cd scripts
python3 main.py --source auto
```

**2. Réinitialiser la base de données (Écrasement total) :**
En cas de dédoublonnage incorrect ou pour forcer un recalcul de toutes les courses depuis zéro, vous devez supprimer les fichiers JSON puis relancer le script (les coureurs sans catégorie recevront la valeur par défaut `"Not known category"`) :
```bash
cd scripts
rm data/ffcResults.json data/ffcRiders.json
python3 main.py --source auto
```

## 📝 Scripts Disponibles

- `npm run dev` : Lance le serveur en mode développement.
- `npm run build` : Construit l'application pour la production.
- `npm run start` : Lance l'application construite.
- `npm run lint` : Vérifie les erreurs de linting avec ESLint.

---

<p align="center">
  Développé avec passion pour le cyclisme de compétition 🚴‍♂️💨
</p>
