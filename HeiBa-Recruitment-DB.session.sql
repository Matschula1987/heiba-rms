INSERT INTO candidates (
    candidate_id,
    first_name,
    last_name,
    email,
    phone,
    address,
    created_at,
    updated_at
  )
VALUES (
    candidate_id:INTEGER,
    'first_name:VARCHAR(50)',
    'last_name:VARCHAR(50)',
    'email:VARCHAR(100)',
    'phone:VARCHAR(20)',
    'address:TEXT',
    'created_at:DATETIME',
    'updated_at:DATETIME'
  );