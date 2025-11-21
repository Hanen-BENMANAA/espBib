-- Migration pour ajouter les colonnes manquantes à la table reports
-- Exécutez ce script dans votre base de données PostgreSQL

-- Supprimer l'ancienne table reports si elle existe
DROP TABLE IF EXISTS reports CASCADE;

-- Créer la nouvelle table reports avec tous les champs nécessaires
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
  -- Métadonnées du rapport
  title VARCHAR(500) NOT NULL,
  author_first_name VARCHAR(255) NOT NULL,
  author_last_name VARCHAR(255) NOT NULL,
  student_number VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  specialty VARCHAR(255) NOT NULL,
  academic_year VARCHAR(50) NOT NULL,
  supervisor VARCHAR(255) NOT NULL,
  co_supervisor VARCHAR(255),
  host_company VARCHAR(255),
  defense_date DATE NOT NULL,
  keywords TEXT[], -- Array PostgreSQL
  abstract TEXT NOT NULL,
  
  -- Options de visibilité
  allow_public_access BOOLEAN DEFAULT true,
  is_confidential BOOLEAN DEFAULT false,
  
  -- Informations du fichier
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL,
  file_url VARCHAR(1000),
  
  -- Statut et validation
  status VARCHAR(50) DEFAULT 'pending', -- 'draft', 'pending', 'validated', 'rejected'
  validation_status VARCHAR(50),
  teacher_comments TEXT,
  validated_by INTEGER REFERENCES users(id),
  validated_at TIMESTAMP,
  
  -- Checklist de vérification (stocké en JSON)
  checklist JSONB,
  
  -- Audit
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_academic_year ON reports(academic_year);
CREATE INDEX idx_reports_specialty ON reports(specialty);
CREATE INDEX idx_reports_submission_date ON reports(submission_date);

-- Trigger pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reports_updated_at 
BEFORE UPDATE ON reports
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO reports (
  user_id, title, author_first_name, author_last_name,
  student_number, email, specialty, academic_year,
  supervisor, defense_date, keywords, abstract,
  file_name, file_path, file_size, status
) VALUES (
  4,
  'Analyse et implémentation d’un système de recommandation intelligent',
  'Hanen',
  'Benmanaa',
  'ESP2024030',
  'hanen.benmanaa@esprim.tn',
  'Génie Logiciel',
  '2023-2024',
  'Dr. Ahmed Jebali',
  '2024-06-22',
  ARRAY['Machine Learning', 'Recommandation', 'IA', 'Système intelligent'],
  'Ce projet vise à concevoir un système de recommandation basé sur l’apprentissage automatique pour optimiser la personnalisation des contenus.',
  'rapport-ESP2024030.pdf',
  '/uploads/reports/rapport-ESP2024030.pdf',
  2800000,
  'validated'
);
