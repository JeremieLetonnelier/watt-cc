<div align="center">
  <img width="600" alt="WATT.CC Logo" src="https://picsum.photos/seed/wattcc/800/250" />
</div>

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
- `points.py` : Script Python chargé de calculer les points selon le barème officiel de montée de catégorie FFC (P1: 50pts, P2: 25pts, etc.).
- `lib/data.ts` : Point d'entrée côté frontend qui type, assemble et calcule les classements à la volée.

## 📝 Scripts Disponibles

- `npm run dev` : Lance le serveur en mode développement.
- `npm run build` : Construit l'application pour la production.
- `npm run start` : Lance l'application construite.
- `npm run lint` : Vérifie les erreurs de linting avec ESLint.

---

<p align="center">
  Développé avec passion pour le cyclisme de compétition 🚴‍♂️💨
</p>
