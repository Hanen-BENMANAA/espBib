# Backend - BIBESPRIM PFE Management System

Backend API pour le système de gestion des PFE (Projets de Fin d'Études) de l'ESPRIM.

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- PostgreSQL (v12 ou supérieur)
- npm ou yarn

## 🔧 Installation

### 1. Installer les dépendances

```bash
cd backend
npm install
```

### 2. Configuration des variables d'environnement

Créer un fichier `.env` à partir du fichier exemple :

```bash
cp .env.example .env
```

Puis éditer le fichier `.env` avec vos propres valeurs :

```env
# Server Configuration
PORT=5000

# Database Configuration (PostgreSQL)
DATABASE_URL=postgres://your_username:your_password@localhost:5432/bib_esprim_db

# JWT Secret Key (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload Configuration
UPLOAD_DIR=./uploads/reports
```

### 3. Initialiser la base de données

#### Option A : Utiliser le script SQL complet

Exécutez le fichier `database.sql` qui contient toutes les migrations nécessaires :

```bash
psql -U postgres -d bib_esprim_db -f database.sql
```

#### Option B : Exécuter les migrations dans l'ordre

1. Créer d'abord la table `users` :
```bash
psql -U postgres -d bib_esprim_db -f database/migrations/create_users.sql
```

2. Ensuite créer la table `reports` :
```bash
psql -U postgres -d bib_esprim_db -f database/migrations/create_reports.sql
```

**Note:** La table `reports` a une clé étrangère vers `users`, donc `users` doit être créée en premier.

### 4. Créer des utilisateurs de test

Exécutez le script pour créer des utilisateurs de test dans la base de données :

```bash
node scripts/createTestUsers.js
```

**Note:** Si vous utilisez des variables d'environnement individuelles (DB_USER, DB_HOST, etc.) au lieu de DATABASE_URL, assurez-vous qu'elles sont définies avant d'exécuter ce script :

```bash
export DB_USER=postgres
export DB_PASSWORD=your_password
export DB_NAME=bib_esprim_db
export DB_HOST=localhost
export DB_PORT=5432
node scripts/createTestUsers.js
```

Le script créera les utilisateurs suivants :
- **Étudiants** : ahmed.bensalem@esprim.tn (password: student123), hanen.benmanaa@esprim.tn (password: student456)
- **Enseignants** : ahmed.bensalem.teacher@esprim.tn (password: teacher123), fatma.gharbi@esprim.tn (password: teacher456)
- **Admin** : admin.system@esprim.tn (password: admin123)

## 🚀 Démarrage

### Mode développement (avec nodemon)

```bash
npm run dev
```

### Mode production

```bash
npm start
```

Le serveur démarre sur `http://localhost:5000` (ou le port configuré dans `.env`).

## 📡 API Endpoints

### Health Check

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

### Authentification

#### Login

```bash
curl -X POST http://localhost:5000/api/login \
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

### Soumettre un rapport (multipart/form-data)

```bash
curl -X POST http://localhost:5000/api/reports/submit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=Développement d'une application web" \
  -F "authorFirstName=Ahmed" \
  -F "authorLastName=Ben Salem" \
  -F "studentNumber=2021001" \
  -F "email=ahmed.bensalem@esprim.tn" \
  -F "specialty=Informatique" \
  -F "academicYear=2023-2024" \
  -F "supervisor=Dr. Fatma Gharbi" \
  -F "defenseDate=2024-06-15" \
  -F "keywords=[\"web\",\"nodejs\",\"react\"]" \
  -F "abstract=Ce projet consiste à développer une application web moderne..." \
  -F "allowPublicAccess=true" \
  -F "isConfidential=false" \
  -F "checklist={}" \
  -F "file=@/path/to/your/report.pdf"
```

Réponse attendue (201) :
```json
{
  "success": true,
  "message": "Rapport soumis avec succès",
  "data": {
    "id": 1,
    "submissionDate": "2024-01-15T10:30:00.000Z"
  }
}
```

### Récupérer mes soumissions

```bash
curl http://localhost:5000/api/reports/my-submissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🗄️ Structure de la base de données

### Table `users`
- `id` : Identifiant unique (SERIAL PRIMARY KEY)
- `first_name` : Prénom
- `last_name` : Nom
- `email` : Email (unique)
- `password` : Mot de passe hashé (bcrypt)
- `role` : Rôle (student, teacher, admin)
- `two_factor_enabled` : 2FA activé (boolean)
- `two_factor_method` : Méthode 2FA (app, sms)
- `two_factor_secret` : Secret 2FA
- `phone` : Numéro de téléphone
- `created_at` : Date de création

### Table `reports`
- Métadonnées du rapport (title, author, student_number, etc.)
- Informations académiques (specialty, academic_year, supervisor, etc.)
- Fichier (file_name, file_path, file_size, file_url)
- Statut et validation (status, validation_status, teacher_comments)
- Dates (submission_date, defense_date, validated_at)

## 🔒 Sécurité

- Les mots de passe sont hashés avec **bcrypt** (10 rounds)
- Authentication JWT avec expiration de 24h
- Validation des fichiers uploadés (seulement PDF, max 50MB)
- CORS activé pour le développement
- Variables d'environnement pour les secrets

## 🧪 Tests rapides

Après installation complète, vérifiez que tout fonctionne :

1. **Démarrer le serveur** : `npm run dev` → Le serveur doit démarrer sans erreur
2. **Health check** : `curl http://localhost:5000/api/health` → Doit retourner `{"status":"OK"}`
3. **Test de connexion DB** : Vérifier les logs du serveur → Doit afficher "✓ Connected to PostgreSQL database"
4. **Login avec un utilisateur test** : Utiliser les credentials ci-dessus → Doit retourner un JWT token
5. **Soumettre un rapport** : Utiliser l'exemple curl ci-dessus avec un fichier PDF → Doit retourner 201

## 📝 Scripts disponibles

- `npm start` : Démarrer le serveur en mode production
- `npm run dev` : Démarrer le serveur en mode développement avec nodemon
- `npm run init-db` : Initialiser la base de données (si script disponible)

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifiez que PostgreSQL est démarré : `sudo service postgresql status`
- Vérifiez votre `DATABASE_URL` dans le fichier `.env`
- Testez la connexion manuellement : `psql -U postgres -d bib_esprim_db`

### Port déjà utilisé
- Changez le port dans `.env` : `PORT=5001`
- Ou tuez le processus utilisant le port 5000 : `lsof -ti:5000 | xargs kill`

### Erreur "bcrypt not installed"
- Réinstallez bcrypt : `npm install bcrypt`
- Si erreur de compilation, installez bcryptjs : `npm install bcryptjs`

### Erreur "Cannot find module './db'"
- Assurez-vous que le fichier `backend/db.js` existe
- Vérifiez que vous êtes dans le bon répertoire

## 📚 Documentation API complète

Pour une documentation API complète avec tous les endpoints disponibles, consultez le code source de `server.js` qui contient :

- Routes d'authentification (login, 2FA)
- Routes étudiants (soumettre, consulter, statistiques)
- Routes enseignants (valider, commenter, consulter)
- Routes communes (détails de rapport)

## 🤝 Contribution

Ce projet est développé pour l'ESPRIM. Pour toute question ou suggestion, contactez l'équipe de développement.

## 📄 Licence

ISC
