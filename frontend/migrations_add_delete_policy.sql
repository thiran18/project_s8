-- Migration: Add Delete Policies

-- Allow users to delete their own patients
CREATE POLICY "Users can delete their own patients." ON patients
  FOR DELETE USING (auth.uid() = created_by);

-- Allow users to delete screenings they created (or valid cascading)
-- Note: Cascading delete from patients might require this policy if RLS is on.
CREATE POLICY "Users can delete their own screenings." ON screenings
  FOR DELETE USING (auth.uid() = created_by);
