-- Testdaten für Kandidaten
INSERT INTO candidates (first_name, last_name, email, phone, skills, experience, education, status) VALUES 
('Max', 'Mustermann', 'max.mustermann@example.com', '+49123456789', 'JavaScript, React, Node.js', '5 Jahre Erfahrung als Webentwickler', 'Bachelor Informatik', 'new'),
('Anna', 'Schmidt', 'anna.schmidt@example.com', '+49987654321', 'Projektmanagement, SCRUM, Agile', '7 Jahre Erfahrung im Projektmanagement', 'Master BWL', 'in_process'),
('Thomas', 'Weber', 'thomas.weber@example.com', '+49555666777', 'Marketing, SEO, Social Media', '3 Jahre Erfahrung im Online-Marketing', 'Bachelor Marketing', 'new');

-- Testdaten für Bewerbungen
INSERT INTO applications (job_id, candidate_id, status) VALUES 
(1, 1, 'pending'),
(2, 2, 'interview'),
(3, 3, 'pending');
