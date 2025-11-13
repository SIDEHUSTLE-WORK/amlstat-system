-- Insert 17 Government Organizations

INSERT INTO organizations (code, name, type, email, status) VALUES
('BOU', 'Bank of Uganda', 'regulator', 'info@bou.or.ug', 'active'),
('CMA', 'Capital Markets Authority', 'regulator', 'info@cmauganda.co.ug', 'active'),
('IRA', 'Insurance Regulatory Authority', 'regulator', 'info@ira.go.ug', 'active'),
('UMRA', 'Uganda Microfinance Regulatory Authority', 'regulator', 'info@umra.go.ug', 'active'),
('URSB', 'Uganda Registration Services Bureau', 'regulator', 'info@ursb.go.ug', 'active'),
('NLGRB', 'National Lotteries and Gaming Regulatory Board', 'regulator', 'info@nlgrb.go.ug', 'active'),
('MEMD', 'Ministry of Energy and Mineral Development', 'ministry', 'info@memd.go.ug', 'active'),
('ICPAU', 'Institute of Certified Public Accountants', 'professional', 'icpau@icpau.co.ug', 'active'),
('ULC', 'Uganda Law Council', 'professional', 'info@ulc.go.ug', 'active'),
('NGO_BUREAU', 'NGO Bureau', 'regulator', 'info@ngobbureau.go.ug', 'active'),
('FIA', 'Financial Intelligence Authority', 'fia', 'info@fia.go.ug', 'active'),
('CID', 'Criminal Investigations Department', 'law_enforcement', 'cid@upf.go.ug', 'active'),
('IG', 'Inspector General', 'law_enforcement', 'ig@upf.go.ug', 'active'),
('UWA', 'Uganda Wildlife Authority', 'law_enforcement', 'info@ugandawildlife.org', 'active'),
('URA', 'Uganda Revenue Authority', 'law_enforcement', 'info@ura.go.ug', 'active'),
('ODPP', 'Office of Director of Public Prosecutions', 'prosecution', 'info@odpp.go.ug', 'active'),
('INTERPOL', 'Interpol Uganda', 'international', 'interpol@upf.go.ug', 'active');

-- Create test users for each organization
INSERT INTO users (organization_id, name, email, password, role, status) VALUES
-- FIA Admin (Super Admin)
(11, 'FIA Administrator', 'admin@fia.go.ug', '$2a$10$rKvVLVvXz0/nKmFqYYF8.OqxGJxJX.qvnhC6yz9xP8UECzq6KZ0Hi', 'fia_admin', 'active'),

-- Organization Users (password: password123)
(1, 'BOU User', 'user@bou.or.ug', '$2a$10$rKvVLVvXz0/nKmFqYYF8.OqxGJxJX.qvnhC6yz9xP8UECzq6KZ0Hi', 'org_user', 'active'),
(2, 'CMA User', 'user@cmauganda.co.ug', '$2a$10$rKvVLVvXz0/nKmFqYYF8.OqxGJxJX.qvnhC6yz9xP8UECzq6KZ0Hi', 'org_user', 'active'),
(3, 'IRA User', 'user@ira.go.ug', '$2a$10$rKvVLVvXz0/nKmFqYYF8.OqxGJxJX.qvnhC6yz9xP8UECzq6KZ0Hi', 'org_user', 'active'),
(12, 'CID User', 'user@cid.go.ug', '$2a$10$rKvVLVvXz0/nKmFqYYF8.OqxGJxJX.qvnhC6yz9xP8UECzq6KZ0Hi', 'org_user', 'active');

-- Note: All passwords are "password123" (hashed with bcrypt)
