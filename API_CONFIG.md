# Configuration API

## Variables d'environnement

L'application utilise les variables d'environnement suivantes :

- `VITE_API_BASE_URL` : URL de base de votre API (par défaut: `http://localhost:8080`)
- `VITE_USE_MOCK_DATA` : Utiliser des données statiques au lieu de l'API (`true`/`false`)

## Configuration pour le développement

1. Copiez `.env.example` vers `.env.local` :
   ```bash
   cp .env.example .env.local
   ```

2. Modifiez `.env.local` avec vos paramètres :
   ```
   VITE_API_BASE_URL=http://votre-api-server:port
   VITE_USE_MOCK_DATA=false  # true pour les données statiques, false pour l'API réelle
   ```

## Mode développement avec données statiques

Pour développer le frontend sans serveur API actif :

1. **Option 1 - Variable d'environnement** :
   ```bash
   # Dans .env.local
   VITE_USE_MOCK_DATA=true
   ```

2. **Option 2 - Configuration Vite** :
   ```typescript
   // Dans vite.config.ts
   const USE_MOCK_DATA = true;
   ```

Avec cette configuration :
- ✅ Toutes les données du dashboard seront servies via des données statiques côté client
- ✅ L'utilisateur sera automatiquement connecté (pas besoin d'authentification)
- ✅ Un indicateur "Development Mode" apparaîtra dans le header
- ✅ Le logout fonctionne mais l'utilisateur sera reconnecté au refresh

## Configuration pour la production

Définissez la variable d'environnement `VITE_API_BASE_URL` lors du build :

```bash
VITE_API_BASE_URL=https://api.votre-domaine.com npm run build
```

## Endpoints API

L'application s'attend à ces endpoints sur votre serveur API :

- `POST /dashboard/login` : Authentification avec `{ username, password }`
  - Retourne : `{ token, user: { id, email, name? } }`
- `GET /dashboard/data` : Données du dashboard (nécessite authentification Bearer)
  - Retourne : `{ totalPublications, totalUsers, licensesLast12Months, licensesLastWeek, oldestLicenseDate, totalLicensesSinceStart }`

## Proxy de développement

Le fichier `vite.config.ts` est configuré avec un proxy pour rediriger les requêtes `/dashboard/*` vers votre serveur API pendant le développement. Cela évite les problèmes CORS en développement.

## Architecture

- `src/lib/api.ts` : Configuration des endpoints et helpers
- `src/lib/apiService.ts` : Service HTTP avec gestion d'erreurs
- `src/contexts/AuthContext.tsx` : Contexte d'authentification
- `src/hooks/useDashboardData.ts` : Hook pour récupérer les données du dashboard