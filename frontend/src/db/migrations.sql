-- Add sections table
create table sections (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  strength integer,
  school_name text,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for sections
alter table sections enable row level security;

create policy "Users can view their own sections." on sections
  for select using (auth.uid() = created_by);

create policy "Users can insert their own sections." on sections
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own sections." on sections
  for update using (auth.uid() = created_by);

-- Update patients table to link to sections
alter table patients add column section_id uuid references sections(id) on delete set null;

-- Update screenings table for clinical reports
alter table screenings add column clinical_report text;
alter table screenings add column reviewed_by uuid references profiles(id);

-- Policy for Clinicians to see ALL screenings (or at least those in their school/district - for now all since we don't have district logic)
create policy "Clinicians can view all screenings." on screenings
  for select using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'clinician'
    )
  );

-- Policy for Clinicians to update screenings (only clinical_report and reviewed_by)
create policy "Clinicians can update clinical reports." on screenings
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role = 'clinician'
    )
  );
