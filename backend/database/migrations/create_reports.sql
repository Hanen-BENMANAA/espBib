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

-- Données de test
INSERT INTO reports (
  user_id, title, author_first_name, author_last_name,
  student_number, email, specialty, academic_year,
  supervisor, defense_date, keywords, abstract,
  file_name, file_path, file_size, status
) VALUES (
  3,
  'Développement d''une application mobile de gestion des ressources humaines',
  'Ahmed',
  'Ben Salem',
  'ESP2024001',
  'student1@bibesprim.edu',
  'Génie Informatique',
  '2023-2024',
  'Dr. Ahmed Ben Salem',
  '2024-06-15',
  ARRAY['mobile', 'ressources humaines', 'gestion'],
  'Ce projet vise à développer une application mobile complète pour la gestion des ressources humaines dans les PME tunisiennes.',
  'rapport-pfe-2024.pdf',
  '/uploads/reports/rapport-pfe-2024.pdf',
  2500000,
  'pending'
);
