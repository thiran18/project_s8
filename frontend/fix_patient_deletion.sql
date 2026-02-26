-- Migration: Allow Clinicians to Delete Any Patient and Screening
-- This fixes the issue where clinicians cannot delete patients created by others.

-- 1. Allow clinicians to delete any patient
CREATE POLICY "Clinicians can delete all patients" ON patients
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'clinician'
    )
  );

-- 2. Allow clinicians to delete any screening
-- Required because patients have a cascading delete to screenings, 
-- and RLS requires permission on the child records.
CREATE POLICY "Clinicians can delete all screenings" ON screenings
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'clinician'
    )
  );
