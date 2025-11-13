-- 🇺🇬 AML/CFT Statistics Collection System Database Schema

-- Drop existing tables (for clean setup)
DROP TABLE IF EXISTS submission_data CASCADE;
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS indicators CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Organizations table (17 government organizations)
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'org_user', 'org_admin', 'fia_admin'
  status VARCHAR(20) DEFAULT 'active',
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indicators table (1,061 indicators!)
CREATE TABLE indicators (
  id SERIAL PRIMARY KEY,
  organization_type VARCHAR(50) NOT NULL,
  section VARCHAR(255),
  number VARCHAR(10) NOT NULL,
  description TEXT NOT NULL,
  data_type VARCHAR(50) DEFAULT 'number',
  required BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Submissions table (monthly forms)
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'submitted', 'approved'
  submitted_by INTEGER REFERENCES users(id),
  submitted_at TIMESTAMP,
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(organization_id, month, year)
);

-- Submission data (actual indicator values)
CREATE TABLE submission_data (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  indicator_id INTEGER REFERENCES indicators(id),
  value TEXT,
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(submission_id, indicator_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_indicators_org_type ON indicators(organization_type);
CREATE INDEX idx_submissions_org_month ON submissions(organization_id, month, year);
CREATE INDEX idx_submission_data_submission ON submission_data(submission_id);

COMMENT ON TABLE organizations IS '17 government organizations in Uganda';
COMMENT ON TABLE users IS 'System users with different roles';
COMMENT ON TABLE indicators IS '1,061 statistical indicators across all organizations';
COMMENT ON TABLE submissions IS 'Monthly statistics submissions';
COMMENT ON TABLE submission_data IS 'Actual values for each indicator';
