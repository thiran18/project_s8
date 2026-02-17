-- Migration: Add created_by column to patients table

-- 1. Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'created_by') THEN
        ALTER TABLE patients ADD COLUMN created_by UUID REFERENCES auth.users;
    END IF;
END $$;

-- 2. Update existing records (optional, but good if there are existing rows)
-- We can try to infer it from section owner if possible, or leave null. 
-- Since we don't have easy link back to user from patient without this, we might leave it null or set to a default admin if known.
-- For now, we'll leave it as nullable. If you need it NOT NULL, you'd need to backfill.

-- 3. Enable RLS on patients if not already valid
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 4. Create policy for insert if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Users can create patients') THEN
        CREATE POLICY "Users can create patients" ON patients FOR INSERT WITH CHECK (auth.uid() = created_by);
    END IF;
END $$;

-- 5. Create policy for select if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'patients' AND policyname = 'Users can view patients in their sections') THEN
         -- This is a bit complex depending on how we want to share. 
         -- For now, let's allow creators to see them.
         CREATE POLICY "Users can view their own patients" ON patients FOR SELECT USING (auth.uid() = created_by);
    END IF;
END $$;
