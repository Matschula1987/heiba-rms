-- Testdaten für die erweiterte Bewerbungsverwaltung
-- Diese Daten können mit dem Befehl 'sqlite3 heiba.db < database/seed_applications_extended.sql' eingespielt werden

-- Bewerbungen mit verschiedenen Status und Quellen
INSERT INTO applications_extended (
    id,
    job_id,
    candidate_id,
    applicant_name,
    applicant_email,
    applicant_phone,
    applicant_location,
    status,
    status_reason,
    status_changed_at,
    status_changed_by,
    source,
    source_detail,
    cover_letter,
    has_cv,
    cv_file_path,
    has_documents,
    documents_paths,
    match_score,
    match_data,
    communication_history,
    next_step,
    next_step_due_date,
    assigned_to
) VALUES
-- Neue Bewerbungen aus verschiedenen Quellen
(
    'app1', -- ID
    '1', -- job_id (Frontend-Entwickler)
    NULL, -- Noch kein Kandidat
    'Julia Meier',
    'julia.meier@example.com',
    '+4915123456789',
    'Berlin',
    'new', -- Status
    NULL,
    NULL,
    NULL,
    'email', -- Quelle
    'bewerbungen@heiba.de',
    'Sehr geehrte Damen und Herren,

ich bewerbe mich hiermit als Frontend-Entwicklerin in Ihrem Unternehmen. Mit 5 Jahren Erfahrung in der Webentwicklung und fundierten Kenntnissen in React, TypeScript und modernen CSS-Frameworks bin ich überzeugt, einen wertvollen Beitrag zu Ihrem Team leisten zu können.

Zu meinen Stärken zählen insbesondere:
- Entwicklung komplexer, responsiver Benutzeroberflächen
- Optimierung der Performance von Webanwendungen
- Agile Arbeitsweise und Teamarbeit

Ich freue mich auf ein persönliches Gespräch.

Mit freundlichen Grüßen,
Julia Meier',
    1, -- Hat CV
    '/uploads/resumes/julia_meier_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/julia_meier_zertifikat1.pdf", "uploads/documents/julia_meier_arbeitszeugnis.pdf"]',
    85.4, -- Match-Score
    '{"overallScore": 85.4, "categoryScores": {"skills": 92, "experience": 85, "education": 80, "location": 100}, "matchedSkills": [{"skill": "React", "score": 95}, {"skill": "TypeScript", "score": 90}, {"skill": "CSS", "score": 85}, {"skill": "JavaScript", "score": 95}]}',
    NULL, -- Noch keine Kommunikation
    'review_application',
    '2025-03-15 12:00:00',
    'admin'
),
(
    'app2',
    '2', -- job_id (Backend-Entwickler)
    NULL,
    'Michael Schmidt',
    'michael.schmidt@example.com',
    '+4917987654321',
    'München',
    'new',
    NULL,
    NULL,
    NULL,
    'portal', -- Quelle
    'Indeed',
    'Als erfahrener Backend-Entwickler mit Schwerpunkt auf Java und Spring Boot möchte ich mich auf Ihre ausgeschriebene Position bewerben. In meiner 7-jährigen Berufserfahrung habe ich mehrere große Systeme entwickelt und gewartet.',
    1, -- Hat CV
    '/uploads/resumes/michael_schmidt_cv.pdf',
    0, -- Keine weiteren Dokumente
    NULL,
    72.5, -- Match-Score
    '{"overallScore": 72.5, "categoryScores": {"skills": 80, "experience": 90, "education": 65, "location": 60}, "matchedSkills": [{"skill": "Java", "score": 95}, {"skill": "Spring Boot", "score": 90}, {"skill": "REST API", "score": 85}, {"skill": "SQL", "score": 80}]}',
    NULL,
    'review_application',
    '2025-03-14 14:30:00',
    'admin'
),
(
    'app3',
    '3', -- job_id (DevOps-Engineer)
    NULL,
    'Sophie Weber',
    'sophie.weber@example.com',
    '+4917612345678',
    'Hamburg',
    'new',
    NULL,
    NULL,
    NULL,
    'website', -- Quelle
    'Karriereseite',
    'Als DevOps-Ingenieurin mit umfangreicher Erfahrung in der Automatisierung von Infrastruktur und CI/CD-Pipelines bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über fundierte Kenntnisse in Docker, Kubernetes und verschiedenen Cloud-Plattformen.',
    1, -- Hat CV
    '/uploads/resumes/sophie_weber_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/sophie_weber_zertifikate.pdf"]',
    91.2, -- Match-Score
    '{"overallScore": 91.2, "categoryScores": {"skills": 95, "experience": 90, "education": 85, "location": 90}, "matchedSkills": [{"skill": "Docker", "score": 98}, {"skill": "Kubernetes", "score": 95}, {"skill": "AWS", "score": 90}, {"skill": "CI/CD", "score": 95}]}',
    '[{"date": "2025-03-08T10:15:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}]',
    'review_application',
    '2025-03-13 09:00:00',
    'admin'
),

-- Bewerbungen im Review-Prozess
(
    'app4',
    '4', -- job_id (Data Scientist)
    NULL,
    'Daniel Müller',
    'daniel.mueller@example.com',
    '+4915712345678',
    'Berlin',
    'in_review',
    'Interessanter Kandidat mit starken analytischen Fähigkeiten',
    '2025-03-05 15:30:00',
    'admin',
    'referral', -- Quelle
    'Lisa Berger (Mitarbeiterin)',
    'Als Data Scientist mit Erfahrung in der Analyse großer Datenmengen und maschinellem Lernen bewerbe ich mich für die ausgeschriebene Position. Ich bin vertraut mit Python, TensorFlow und SQL und habe bereits mehrere Projekte im Bereich Predictive Analytics umgesetzt.',
    1, -- Hat CV
    '/uploads/resumes/daniel_mueller_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/daniel_mueller_zeugnisse.pdf", "uploads/documents/daniel_mueller_projekte.pdf"]',
    88.7, -- Match-Score
    '{"overallScore": 88.7, "categoryScores": {"skills": 90, "experience": 85, "education": 95, "location": 100}, "matchedSkills": [{"skill": "Python", "score": 95}, {"skill": "Machine Learning", "score": 90}, {"skill": "SQL", "score": 85}, {"skill": "Data Analysis", "score": 90}]}',
    '[{"date": "2025-03-05T10:00:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-03-06T14:15:00Z", "type": "note", "content": "Kandidat wurde über die weitere Bearbeitung informiert", "user": "admin"}]',
    'schedule_interview',
    '2025-03-12 11:00:00',
    'admin'
),
(
    'app5',
    '1', -- job_id (Frontend-Entwickler)
    NULL,
    'Laura Becker',
    'laura.becker@example.com',
    '+4917812345678',
    'Frankfurt',
    'in_review',
    'Starke Kenntnisse in UI/UX Design',
    '2025-03-04 09:45:00',
    'admin',
    'portal', -- Quelle
    'Stepstone',
    'Als Frontend-Entwicklerin mit Schwerpunkt auf UI/UX-Design bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über 4 Jahre Erfahrung in der Entwicklung ansprechender und benutzerfreundlicher Weboberflächen mit React und modernen CSS-Frameworks.',
    1, -- Hat CV
    '/uploads/resumes/laura_becker_cv.pdf',
    0, -- Keine weiteren Dokumente
    NULL,
    78.9, -- Match-Score
    '{"overallScore": 78.9, "categoryScores": {"skills": 85, "experience": 75, "education": 80, "location": 70}, "matchedSkills": [{"skill": "React", "score": 90}, {"skill": "UI/UX Design", "score": 95}, {"skill": "CSS", "score": 90}, {"skill": "HTML", "score": 85}]}',
    '[{"date": "2025-03-04T08:30:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-03-05T11:20:00Z", "type": "email", "content": "Anfrage nach Arbeitsproben", "sender": "admin"}, {"date": "2025-03-06T09:15:00Z", "type": "email", "content": "Arbeitsproben erhalten", "user": "admin"}]',
    'review_portfolio',
    '2025-03-11 10:00:00',
    'admin'
),

-- Bewerbungen im Interview-Prozess
(
    'app6',
    '2', -- job_id (Backend-Entwickler)
    NULL,
    'Markus Wagner',
    'markus.wagner@example.com',
    '+4915187654321',
    'Köln',
    'interview',
    'Erster Interviewtermin vereinbart',
    '2025-03-03 10:15:00',
    'admin',
    'email', -- Quelle
    'bewerbungen@heiba.de',
    'Als Backend-Entwickler mit 6 Jahren Erfahrung und Spezialisierung auf Node.js und MongoDB bewerbe ich mich auf die ausgeschriebene Position. Ich habe umfangreiche Erfahrung in der Entwicklung skalierbarer Microservices und RESTful APIs.',
    1, -- Hat CV
    '/uploads/resumes/markus_wagner_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/markus_wagner_zertifikate.pdf"]',
    81.5, -- Match-Score
    '{"overallScore": 81.5, "categoryScores": {"skills": 85, "experience": 80, "education": 75, "location": 65}, "matchedSkills": [{"skill": "Node.js", "score": 95}, {"skill": "MongoDB", "score": 90}, {"skill": "Microservices", "score": 85}, {"skill": "REST API", "score": 85}]}',
    '[{"date": "2025-03-01T14:00:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-03-02T11:30:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-03-02T16:45:00Z", "type": "email", "content": "Terminbestätigung für den 15.03.2025", "user": "markus.wagner@example.com"}]',
    'conduct_interview',
    '2025-03-15 14:00:00',
    'admin'
),
(
    'app7',
    '5', -- job_id (UX/UI Designer)
    NULL,
    'Nina Hoffmann',
    'nina.hoffmann@example.com',
    '+4915198765432',
    'Berlin',
    'interview',
    'Zweites Interview nach erfolgreichem Erstgespräch',
    '2025-03-01 16:30:00',
    'admin',
    'website', -- Quelle
    'Karriereseite',
    'Als UX/UI-Designerin mit 5 Jahren Erfahrung in der Gestaltung benutzerfreundlicher digitaler Produkte bewerbe ich mich auf die ausgeschriebene Position. Ich bin vertraut mit verschiedenen Design-Tools wie Figma und Adobe XD und habe bereits mehrere große Projekte von der Konzeption bis zur Umsetzung begleitet.',
    1, -- Hat CV
    '/uploads/resumes/nina_hoffmann_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/nina_hoffmann_portfolio.pdf"]',
    94.3, -- Match-Score
    '{"overallScore": 94.3, "categoryScores": {"skills": 95, "experience": 90, "education": 85, "location": 100}, "matchedSkills": [{"skill": "UX Design", "score": 98}, {"skill": "UI Design", "score": 95}, {"skill": "Figma", "score": 95}, {"skill": "Adobe XD", "score": 90}]}',
    '[{"date": "2025-02-25T09:30:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-26T14:00:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-02-28T15:30:00Z", "type": "note", "content": "Erstes Gespräch sehr positiv verlaufen, großes Interesse an zweitem Gespräch mit Teamleitung", "user": "admin"}, {"date": "2025-03-01T10:00:00Z", "type": "email", "content": "Einladung zum zweiten Gespräch", "sender": "admin"}]',
    'conduct_second_interview',
    '2025-03-10 11:00:00',
    'admin'
),

-- Akzeptierte Bewerbungen
(
    'app8',
    '3', -- job_id (DevOps-Engineer)
    '1', -- Wurde schon zum Kandidaten konvertiert (Max Mustermann)
    'Max Mustermann',
    'max.mustermann@example.com',
    '+49123456789',
    'Berlin',
    'accepted',
    'Hervorragende technische Fähigkeiten und Kommunikation',
    '2025-02-28 11:45:00',
    'admin',
    'referral', -- Quelle
    'Thomas Weber (CTO)',
    'Als DevOps-Engineer mit 7 Jahren Erfahrung in der Automatisierung von Infrastruktur und CI/CD-Pipelines bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über umfassende Kenntnisse in Docker, Kubernetes, AWS und Terraform.',
    1, -- Hat CV
    '/uploads/resumes/max_mustermann_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/max_mustermann_zertifikate.pdf", "uploads/documents/max_mustermann_projekte.pdf"]',
    96.8, -- Match-Score
    '{"overallScore": 96.8, "categoryScores": {"skills": 98, "experience": 95, "education": 90, "location": 100}, "matchedSkills": [{"skill": "Docker", "score": 98}, {"skill": "Kubernetes", "score": 95}, {"skill": "AWS", "score": 98}, {"skill": "Terraform", "score": 95}, {"skill": "CI/CD", "score": 98}]}',
    '[{"date": "2025-02-20T10:00:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-21T11:30:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-02-23T14:00:00Z", "type": "note", "content": "Erstes Gespräch sehr positiv, direkt zum technischen Interview eingeladen", "user": "admin"}, {"date": "2025-02-25T15:30:00Z", "type": "note", "content": "Technisches Interview hervorragend bestanden", "user": "admin"}, {"date": "2025-02-26T09:00:00Z", "type": "email", "content": "Angebot unterbreitet", "sender": "admin"}, {"date": "2025-02-28T10:30:00Z", "type": "email", "content": "Angebot angenommen", "user": "max.mustermann@example.com"}]',
    'prepare_onboarding',
    '2025-03-15 09:00:00',
    'admin'
),
(
    'app9',
    '4', -- job_id (Data Scientist)
    '2', -- Wurde schon zum Kandidaten konvertiert (Anna Schmidt)
    'Anna Schmidt',
    'anna.schmidt@example.com',
    '+49987654321',
    'München',
    'accepted',
    'Beste Kandidatin für die Position mit hervorragenden Referenzen',
    '2025-02-25 14:20:00',
    'admin',
    'portal', -- Quelle
    'LinkedIn',
    'Als Data Scientist mit 5 Jahren Erfahrung in der Datenanalyse und Implementierung von Machine-Learning-Modellen bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über umfassende Kenntnisse in Python, R, TensorFlow und SQL.',
    1, -- Hat CV
    '/uploads/resumes/anna_schmidt_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/anna_schmidt_zertifikate.pdf", "uploads/documents/anna_schmidt_projekte.pdf"]',
    93.5, -- Match-Score
    '{"overallScore": 93.5, "categoryScores": {"skills": 95, "experience": 90, "education": 95, "location": 85}, "matchedSkills": [{"skill": "Python", "score": 98}, {"skill": "R", "score": 90}, {"skill": "TensorFlow", "score": 95}, {"skill": "SQL", "score": 90}, {"skill": "Machine Learning", "score": 95}]}',
    '[{"date": "2025-02-15T11:30:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-16T14:00:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-02-18T16:30:00Z", "type": "note", "content": "Erstes Gespräch sehr positiv, zur technischen Aufgabe eingeladen", "user": "admin"}, {"date": "2025-02-20T10:00:00Z", "type": "note", "content": "Technische Aufgabe hervorragend gelöst", "user": "admin"}, {"date": "2025-02-22T09:30:00Z", "type": "email", "content": "Einladung zum Abschlussgespräch", "sender": "admin"}, {"date": "2025-02-24T15:00:00Z", "type": "note", "content": "Abschlussgespräch sehr gut verlaufen, Angebot wird vorbereitet", "user": "admin"}, {"date": "2025-02-25T10:00:00Z", "type": "email", "content": "Angebot unterbreitet", "sender": "admin"}, {"date": "2025-02-25T13:45:00Z", "type": "email", "content": "Angebot angenommen", "user": "anna.schmidt@example.com"}]',
    'prepare_onboarding',
    '2025-03-01 09:00:00',
    'admin'
),

-- Abgelehnte Bewerbungen
(
    'app10',
    '1', -- job_id (Frontend-Entwickler)
    NULL,
    'Felix Klein',
    'felix.klein@example.com',
    '+4917612345678',
    'Düsseldorf',
    'rejected',
    'Unzureichende Erfahrung mit modernen Frontend-Frameworks',
    '2025-02-22 09:30:00',
    'admin',
    'email', -- Quelle
    'bewerbungen@heiba.de',
    'Als Frontend-Entwickler mit 2 Jahren Erfahrung bewerbe ich mich auf die ausgeschriebene Position. Ich habe bereits mit HTML, CSS und jQuery gearbeitet und bin dabei, mich in React einzuarbeiten.',
    1, -- Hat CV
    '/uploads/resumes/felix_klein_cv.pdf',
    0, -- Keine weiteren Dokumente
    NULL,
    45.2, -- Match-Score
    '{"overallScore": 45.2, "categoryScores": {"skills": 40, "experience": 30, "education": 65, "location": 60}, "matchedSkills": [{"skill": "HTML", "score": 80}, {"skill": "CSS", "score": 75}, {"skill": "JavaScript", "score": 50}, {"skill": "React", "score": 30}]}',
    '[{"date": "2025-02-18T10:30:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-19T14:15:00Z", "type": "note", "content": "Kenntnisse in modernen Frameworks wie React nicht ausreichend", "user": "admin"}, {"date": "2025-02-22T09:15:00Z", "type": "email", "content": "Absage gesendet", "sender": "admin"}]',
    NULL,
    NULL,
    'admin'
),
(
    'app11',
    '2', -- job_id (Backend-Entwickler)
    NULL,
    'Sarah Meyer',
    'sarah.meyer@example.com',
    '+4915712345678',
    'Hamburg',
    'rejected',
    'Gehaltsvorstellungen außerhalb unseres Budgets',
    '2025-02-20 15:45:00',
    'admin',
    'portal', -- Quelle
    'XING',
    'Als Backend-Entwicklerin mit 8 Jahren Erfahrung in der Entwicklung von Java-Anwendungen bewerbe ich mich auf die ausgeschriebene Position. Ich verfüge über umfassende Kenntnisse in Spring Boot, Hibernate und relationalen Datenbanken.',
    1, -- Hat CV
    '/uploads/resumes/sarah_meyer_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/sarah_meyer_zertifikate.pdf"]',
    85.6, -- Match-Score
    '{"overallScore": 85.6, "categoryScores": {"skills": 90, "experience": 95, "education": 80, "location": 70}, "matchedSkills": [{"skill": "Java", "score": 95}, {"skill": "Spring Boot", "score": 90}, {"skill": "Hibernate", "score": 90}, {"skill": "SQL", "score": 85}]}',
    '[{"date": "2025-02-15T09:00:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-16T11:30:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-02-18T14:00:00Z", "type": "note", "content": "Gespräch gut verlaufen, aber Gehaltsvorstellungen 30% über Budget", "user": "admin"}, {"date": "2025-02-19T10:30:00Z", "type": "note", "content": "Nach Rücksprache mit der Geschäftsführung keine Möglichkeit, auf die Gehaltsvorstellungen einzugehen", "user": "admin"}, {"date": "2025-02-20T15:30:00Z", "type": "email", "content": "Absage gesendet", "sender": "admin"}]',
    NULL,
    NULL,
    'admin'
),

-- Archivierte Bewerbungen
(
    'app12',
    '5', -- job_id (UX/UI Designer)
    NULL,
    'Tobias Wolf',
    'tobias.wolf@example.com',
    '+4917812345678',
    'Berlin',
    'archived',
    'Kandidat hat sich zurückgezogen',
    '2025-02-15 10:30:00',
    'admin',
    'website', -- Quelle
    'Karriereseite',
    'Als UX/UI-Designer mit 4 Jahren Erfahrung in der Gestaltung digitaler Produkte bewerbe ich mich auf die ausgeschriebene Position. Ich bin vertraut mit verschiedenen Design-Tools wie Sketch und Adobe XD und habe bereits mehrere große Projekte von der Konzeption bis zur Umsetzung begleitet.',
    1, -- Hat CV
    '/uploads/resumes/tobias_wolf_cv.pdf',
    1, -- Hat Dokumente
    '["uploads/documents/tobias_wolf_portfolio.pdf"]',
    82.3, -- Match-Score
    '{"overallScore": 82.3, "categoryScores": {"skills": 85, "experience": 80, "education": 75, "location": 100}, "matchedSkills": [{"skill": "UX Design", "score": 85}, {"skill": "UI Design", "score": 85}, {"skill": "Sketch", "score": 90}, {"skill": "Adobe XD", "score": 80}]}',
    '[{"date": "2025-02-10T09:00:00Z", "type": "email", "content": "Automatische Eingangsbestätigung", "sender": "system"}, {"date": "2025-02-11T14:30:00Z", "type": "email", "content": "Einladung zum ersten Gespräch", "sender": "admin"}, {"date": "2025-02-15T09:15:00Z", "type": "email", "content": "Kandidat zieht Bewerbung zurück aufgrund eines anderen Angebots", "sender": "tobias.wolf@example.com"}]',
    NULL,
    NULL,
    'admin'
);

-- Notizen zu Bewerbungen
INSERT INTO application_notes (
    id,
    application_id,
    user_id,
    content,
    created_at
) VALUES
-- Notizen zu Julia Meier (app1)
(
    'note1',
    'app1',
    'admin',
    'Portfolio sieht sehr vielversprechend aus. Hat bereits an ähnlichen Projekten gearbeitet.',
    '2025-03-09 10:15:00'
),
-- Notizen zu Michael Schmidt (app2)
(
    'note2',
    'app2',
    'admin',
    'Umfangreiche Erfahrung in Java, aber keine Node.js-Kenntnisse. Eventuell für andere Backend-Positionen geeignet.',
    '2025-03-08 14:30:00'
),
-- Notizen zu Sophie Weber
