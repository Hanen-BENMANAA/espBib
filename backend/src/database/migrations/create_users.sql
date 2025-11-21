-- Assurer l'encodage client pour les accents
SET client_encoding = 'UTF8';

-- Suppression et (re)création de la table users (obligatoire avant reports)
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Extension pour hasher les mots de passe côté base (si autorisée)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insérer des users mock (n'insérera pas de doublons par email)
INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Ahmed', 'Ben Salem', 'ahmed.bensalem@esprim.tn', crypt('student123', gen_salt('bf')), 'student', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.bensalem@esprim.tn');

INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Ahmed', 'Ben Salem', 'ahmed.bensalem.teacher@esprim.tn', crypt('teacher123', gen_salt('bf')), 'teacher', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.bensalem.teacher@esprim.tn');

INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Fatma', 'Gharbi', 'fatma.gharbi@esprim.tn', crypt('teacher456', gen_salt('bf')), 'teacher', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fatma.gharbi@esprim.tn');

INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Admin', 'System', 'admin.system@esprim.tn', crypt('admin123', gen_salt('bf')), 'admin', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin.system@esprim.tn');

-- Insérer Hanen en FORÇANT id = 4 si (et seulement si) id = 4 n'existe pas ET si son email n'existe pas
INSERT INTO users (id, first_name, last_name, email, password, role, created_at)
SELECT 4, 'Hanen', 'Benmanaa', 'hanen.benmanaa@esprim.tn', crypt('student456', gen_salt('bf')), 'student', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE id = 4)
  AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'hanen.benmanaa@esprim.tn');

-- Autres enseignants mock
INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Leila', 'Trabelsi', 'leila.trabelsi@esprim.tn', crypt('prof123', gen_salt('bf')), 'teacher', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'leila.trabelsi@esprim.tn');

INSERT INTO users (first_name, last_name, email, password, role, created_at)
SELECT 'Fatma', 'Mansouri', 'fatma.mansouri@esprim.tn', crypt('prof222', gen_salt('bf')), 'teacher', NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'fatma.mansouri@esprim.tn');

-- Remettre la séquence users.id en cohérence (important si on a forcé un id)
SELECT setval(pg_get_serial_sequence('users','id'), COALESCE((SELECT MAX(id) FROM users), 1), true);

-- Vérifications rapides
-- Voir les premiers users
SELECT id, first_name, last_name, email, role FROM users ORDER BY id LIMIT 50;

-- Vérifier que Hanen a bien id = 4
SELECT id, first_name, last_name, email FROM users WHERE email = 'hanen.benmanaa@esprim.tn' OR id = 4;