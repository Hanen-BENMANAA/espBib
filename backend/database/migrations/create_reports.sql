-- Supprimer l'ancienne table reports si elle existe
DROP TABLE IF EXISTS reports CASCADE;

-- Création de la table reports
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  
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
  keywords TEXT[],
  abstract TEXT NOT NULL,
  
  allow_public_access BOOLEAN DEFAULT TRUE,
  is_confidential BOOLEAN DEFAULT FALSE,
  
  file_name VARCHAR(500) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  file_size BIGINT NOT NULL,
  file_url VARCHAR(1000),
  
  status VARCHAR(50) DEFAULT 'pending',
  validation_status VARCHAR(50),
  teacher_comments TEXT,
  validated_by INTEGER REFERENCES users(id),
  validated_at TIMESTAMP,
  
  checklist JSONB,
  
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index
CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_academic_year ON reports(academic_year);
CREATE INDEX idx_reports_specialty ON reports(specialty);
CREATE INDEX idx_reports_submission_date ON reports(submission_date);

-- Trigger pour mise à jour automatique du updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

INSERT INTO reports (
  user_id, title, author_first_name, author_last_name,
  student_number, email, specialty, academic_year,
  supervisor, co_supervisor,host_company, defense_date, keywords, abstract,
  file_name, file_path,status
) VALUES (
  4,
  'Analyse et implémentation d’un système de recommandation intelligent',
  'Hanen',
  'Benmanaa',
  'ESP2024030',
  'hanen.benmanaa@esprim.tn',
  'Génie Informatique',
  '2023-2024',
  'Prof. Leila Trabelsi',
  'Prof. Fatma Mansouri',
  'Tanit',
  '2024-06-22',
  ARRAY['Machine Learning', 'Recommandation', 'IA', 'Système intelligent'],
  'Ce projet vise à concevoir un système de recommandation basé sur l’apprentissage automatique pour optimiser la personnalisation des contenus.',
   'Cahier de charge Biblio.pdf',
  '/uploads/reports/rapport-ESP2024030.pdf',
  'validated'
);

