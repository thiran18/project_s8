-- Allow authenticated users (Teachers & Clinicians) to view all patients
-- Check if RLS is enabled first (it likely is), then add policy
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users on patients"
ON patients FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow authenticated users to view all screenings
ALTER TABLE screenings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all authenticated users on screenings"
ON screenings FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow Clinicians (or any auth user) to update screenings (for reports)
CREATE POLICY "Enable update access for all authenticated users on screenings"
ON screenings FOR UPDATE
USING (auth.role() = 'authenticated');
