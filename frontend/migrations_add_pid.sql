-- Migration: Add Unique PID to Patients Table

-- 1. Add the column (nullable at first to allow backfill)
ALTER TABLE patients ADD COLUMN pid TEXT UNIQUE;

-- 2. Create a function to generate a random 7-character alphanumeric ID
-- Format: PID + 4 random alphanumeric characters (e.g., PID9X2A)
CREATE OR REPLACE FUNCTION generate_patient_pid()
RETURNS TRIGGER AS $$
DECLARE
  new_pid TEXT;
  done BOOLEAN DEFAULT FALSE;
BEGIN
  -- Build a loop to ensure uniqueness (though collision probability is low)
  WHILE NOT done LOOP
    -- Generate PID: 'PID' + 4 random characters (A-Z, 0-9)
    -- substring(md5(random()::text) from 1 for 4) is hex, we want alphanumeric. 
    -- Let's use a simpler approach for random string or just hex if acceptable.
    -- User asked for "7 digit alphanumerical ... first three digit is PID".
    -- So 'PID' + 4 chars.
    -- Let's stick to upper case hex for simplicity or a custom charset if needed.
    -- Hex is easy:
    new_pid := 'PID' || upper(substring(md5(random()::text) from 1 for 4));
    
    -- Check if it already exists
    PERFORM 1 FROM patients WHERE pid = new_pid;
    IF NOT FOUND THEN
      done := TRUE;
    END IF;
  END LOOP;

  NEW.pid := new_pid;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create the trigger
CREATE TRIGGER before_insert_patients_pid
BEFORE INSERT ON patients
FOR EACH ROW
EXECUTE FUNCTION generate_patient_pid();

-- 4. Backfill existing patients (if any exist without PID)
-- We can reuse the logic by updating them. 
-- However, triggers usually fire on INSERT, depending on definition. 
-- The above trigger is BEFORE INSERT.
-- For backfill, we can just run a do block or update statement.
DO $$
DECLARE
  r RECORD;
  new_gen_pid TEXT;
  pid_exists BOOLEAN;
BEGIN
  FOR r IN SELECT id FROM patients WHERE pid IS NULL LOOP
    LOOP
      new_gen_pid := 'PID' || upper(substring(md5(random()::text) from 1 for 4));
      PERFORM 1 FROM patients WHERE pid = new_gen_pid;
      IF NOT FOUND THEN
         EXIT; -- Valid PID found
      END IF;
    END LOOP;
    
    UPDATE patients SET pid = new_gen_pid WHERE id = r.id;
  END LOOP;
END;
$$;

-- 5. Make column not null (optional, but good for integrity)
ALTER TABLE patients ALTER COLUMN pid SET NOT NULL;
