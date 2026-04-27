# Contribuer au projet WATT.CC

Tout d'abord, merci de l'intérêt que tu portes au projet WATT.CC ! 🎉  
Toute contribution (correction de bug, nouvelle fonctionnalité, amélioration de la documentation) est la bienvenue.

Ce document fournit les lignes directrices pour contribuer au projet dans les meilleures conditions.

## 💻 Environnement de développement

Le projet utilise **Next.js** avec **React 19**, **TypeScript** et **Tailwind CSS 4**.

### Prérequis

* Un environnement **Node.js** (version 18+ recommandée)
* **npm** (inclus avec Node.js)
* **Python 3** (pour l'exécution de certains scripts de scraping de données de courses)

### Installation locale

1. **Cloner le dépôt :**
   ```bash
   git clone <URL_DU_DEPOT>
   cd watt-cc
   ```

2. **Installer les dépendances :**
   ```bash
   npm install
   ```

3. **Lancer le serveur de développement :**
   ```bash
   npm run dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## 🗂 Architecture du projet

Le projet utilise l'architecture standard de Next.js (le dossier `app/` ou `pages/`).  
Il inclut également des outils annexes :
* `scripts/` : contient des scripts Python (comme `fetch_gfny.py`) utilisés pour récupérer ou traiter des données sur les cyclosportives et résultats.

## 🌿 Stratégie de Branches (Git)

Pour faciliter les tests et le déploiement sur Vercel, nous utilisons la stratégie de branches suivante :

* **`master`** : Branche principale. Les *commits* sur cette branche sont automatiquement déployés en **Production**. (Ne pas commiter au-dessus directement sans une Review).
* **`staging`** : Branche de pré-production. Les *commits* sur cette branche génèrent un environnement de **Preview** automatique sur Vercel pour faire des tests en ligne.
* **Toutes les autres branches** : Ne génèrent *aucun* déploiement sur Vercel pour économiser des ressources.

### Comment travailler ?

1. Crée une branche à partir de `master` ou `staging` :
   ```bash
   # Remplace 'feature/ajout-widget' par un nom explicite
   git checkout -b feature/ajout-widget
   ```
2. Travaille tranquillement en local (`npm run dev`).
3. (Optionnel) Si tu as besoin de tester ton rendu de façon centralisée en ligne, tu pourras soit te fusionner avec la branche `staging`, soit changer la cible de ta *Pull Request* vers `staging` pour avoir un lien de preview.

## ✍️ Conventions et Qualité du code

* **Composants** : Privilégie l'utilisation de `lucide-react` pour les icônes et `motion` (Framer Motion) pour les animations. Les classes utilitaires `clsx` et `tailwind-merge` sont également disponibles pour la gestion avancée des styles.
* **Linting** : Assure-toi que ton code respecte les règles avant de commiter.
  ```bash
  npm run lint
  ```
  S'il y a des erreurs, corrige-les.

## 🚀 Soumettre une Pull Request (PR)

1. **Commit test changements** avec des messages clairs et concis :
   ```bash
   git commit -m "feat: ajout du support pour de nouvelles cyclosportives"
   ```
2. **Pousse ta branche** sur le dépôt distant :
   ```bash
   git push origin feature/mon-amelioration
   ```
3. Ouvre une **Pull Request** sur GitHub.
4. Décris précisement ce que fait ta PR :
   * Quel problème résout-elle ?
   * Comment as-tu implémenté la solution ?
   * S'il y a des changements visuels, ajoute des captures d'écran.

## 📜 Commandes utiles (Rappel)

| Commande | Action |
|----------|--------|
| `npm run dev` | Lance le serveur local avec rechargement à chaud |
| `npm run build` | Construit l'application pour la production |
| `npm run lint` | Lance ESLint pour analyser le code |
| `npm run fetch:gfny` | Lance l'extraction de données Python (si besoin) |

Merci encore pour tes contributions à WATT.CC ! 🚴‍♂️
