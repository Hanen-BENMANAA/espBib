# BIBESPRIM Backend API

Backend API pour le système de gestion des PFE (Projets de Fin d'Études) de l'ESPRIM.

## Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm

## Configuration

### Variables d'environnement

Copiez le fichier `.env.example` vers `.env` et configurez les variables :

```bash
cp .env.example .env
```

Variables requises :

- **DATABASE_URL** : URL de connexion PostgreSQL complète (recommandé)
  - Format : `postgres://user:password@host:port/database`
  - Exemple : `postgres://postgres:hanen222@localhost:5432/bib_esprim_db`

- **DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT** : Variables individuelles (pour compatibilité avec scripts existants)

- **PORT** : Port du serveur (défaut: 5000)

- **JWT_SECRET** : Clé secrète pour les tokens JWT (à changer en production)

- **UPLOAD_DIR** : Répertoire pour les fichiers uploadés (défaut: uploads)

## Installation

1. Installez les dépendances :

```bash
npm install
```

2. Initialisez la base de données PostgreSQL :

```bash
# Connectez-vous à PostgreSQL
psql -U postgres

# Créez la base de données
CREATE DATABASE bib_esprim_db;

# Sortez de psql
\q
```

3. Exécutez les scripts SQL dans l'ordre suivant :

```bash
# Script de création de la table users (OBLIGATOIRE EN PREMIER)
psql -U postgres -d bib_esprim_db -f database/migrations/create_users.sql

# Script de création de la table reports
psql -U postgres -d bib_esprim_db -f database/migrations/create_reports.sql

# Ou utilisez le script complet (contient les deux tables)
# psql -U postgres -d bib_esprim_db -f database.sql
```

4. Créez des utilisateurs de test :

```bash
node scripts/createTestUsers.js
```

Cela créera les utilisateurs suivants :
- **Étudiant** : ahmed.bensalem@esprim.tn / student123
- **Enseignant** : ahmed.bensalem.teacher@esprim.tn / teacher123
- **Enseignant** : fatma.gharbi@esprim.tn / teacher456
- **Admin** : admin.system@esprim.tn / admin123
- **Étudiant** : hanen.benmanaa@esprim.tn / student456
- **Enseignant** : leila.trabelsi@esprim.tn / prof123
- **Enseignant** : fatma.mansouri@esprim.tn / prof222

## Démarrage

### Mode développement (avec auto-reload)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5000` (ou le port configuré dans .env).

## Tests avec cURL

### 1. Test de santé (Health Check)

```bash
curl http://localhost:5000/api/health
```

Réponse attendue :
```json
{
  "status": "OK",
  "message": "Backend is running"
}
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed.bensalem@esprim.tn",
    "password": "student123"
  }'
```

Réponse attendue :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "ahmed.bensalem@esprim.tn",
    "role": "student",
    "firstName": "Ahmed",
    "lastName": "Ben Salem"
  }
}
```

### 3. Soumettre un rapport (nécessite un token)

```bash
# Sauvegardez d'abord le token reçu lors du login
TOKEN="votre_token_ici"

curl -X POST http://localhost:5000/api/reports/submit \
  -H "Authorization: Bearer $TOKEN" \
  -F "title=Mon Rapport de PFE" \
  -F "authorFirstName=Ahmed" \
  -F "authorLastName=Ben Salem" \
  -F "studentNumber=ESP2024001" \
  -F "email=ahmed.bensalem@esprim.tn" \
  -F "specialty=Génie Informatique" \
  -F "academicYear=2023-2024" \
  -F "supervisor=Prof. Fatma Gharbi" \
  -F "defenseDate=2024-06-30" \
  -F "keywords=[\"IA\",\"Machine Learning\"]" \
  -F "abstract=Résumé de mon projet..." \
  -F "allowPublicAccess=true" \
  -F "isConfidential=false" \
  -F "checklist={}" \
  -F "file=@/chemin/vers/votre/rapport.pdf"
```

### 4. Récupérer mes soumissions

```bash
curl -X GET http://localhost:5000/api/reports/my-submissions \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Récupérer mes statistiques

```bash
curl -X GET http://localhost:5000/api/reports/my-stats \
  -H "Authorization: Bearer $TOKEN"
```

## Architecture

### Structure des fichiers

```
backend/
├── db.js                 # Module centralisé de connexion PostgreSQL
├── server.js             # Serveur Express principal
├── package.json          # Dépendances npm
├── .env.example          # Variables d'environnement (exemple)
├── .env                  # Variables d'environnement (à créer, ignoré par git)
├── database/
│   └── migrations/
│       ├── create_users.sql    # Migration table users
│       └── create_reports.sql  # Migration table reports
├── scripts/
│   └── createTestUsers.js      # Script de création d'utilisateurs de test
└── uploads/              # Répertoire des fichiers uploadés (créé automatiquement)
    └── reports/          # Rapports PDF
```

### Module db.js

Le module `db.js` centralise la connexion PostgreSQL :
- Utilise `DATABASE_URL` pour la connexion
- Configure un pool de connexions (max: 20, timeouts optimisés)
- Exporte une fonction `query()` et l'objet `pool` pour les transactions
- Gère les erreurs de connexion automatiquement

## Dépannage

### Erreur de connexion à PostgreSQL

Vérifiez que :
1. PostgreSQL est démarré : `sudo systemctl status postgresql` (Linux) ou `brew services list` (macOS)
2. La base de données existe : `psql -U postgres -l`
3. Les credentials dans `.env` sont corrects
4. Le port PostgreSQL (5432) est accessible

### Erreur "relation users does not exist"

Exécutez d'abord le script `create_users.sql` avant `create_reports.sql`.

### Les uploads ne fonctionnent pas

Vérifiez que le répertoire `uploads/reports` existe et a les permissions appropriées :
```bash
mkdir -p uploads/reports
chmod 755 uploads
```

## API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/2fa/setup` - Configuration 2FA
- `POST /api/auth/2fa/verify` - Vérification 2FA
- `POST /api/auth/2fa/send-sms` - Envoi SMS 2FA

### Rapports (Étudiants)
- `POST /api/reports/submit` - Soumettre un rapport
- `GET /api/reports/current-submission` - Soumission actuelle
- `GET /api/reports/my-submissions` - Toutes mes soumissions
- `GET /api/reports/my-stats` - Mes statistiques
- `GET /api/reports/history` - Historique (legacy)
- `GET /api/reports/my-reports` - Mes rapports (legacy)

### Rapports (Enseignants)
- `GET /api/reports/assigned-to-me` - Rapports assignés
- `GET /api/reports/pending-validation` - En attente de validation
- `PUT /api/reports/:id/validate` - Valider/rejeter un rapport
- `GET /api/reports/teacher-stats` - Statistiques enseignant

### Rapports (Commun)
- `GET /api/reports/:id` - Détails d'un rapport

### Autres
- `GET /api/health` - Health check
- `GET /api/catalog` - Catalogue
- `GET /api/dashboard/stats` - Statistiques dashboard

## Licence

ISC
