-- Create sections table
create table sections (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  strength integer,
  school_name text,
  created_by uuid references auth.users not null
);

-- Add section_id to patients
alter table patients add column section_id uuid references sections(id);

-- Add clinical reporting fields to screenings
alter table screenings add column clinical_report text;
alter table screenings add column reviewed_by uuid references auth.users;

-- Enable RLS (Row Level Security)
alter table sections enable row level security;

-- Policies for sections
create policy "Teachers can insert their own sections"
  on sections for insert
  with check (auth.uid() = created_by);

create policy "Teachers can view their own sections"
  on sections for select
  using (auth.uid() = created_by);

-- Clinicians can view all sections (assuming broad access for now, or filter by school if needed)
-- For now, allow authenticated users to view sections? Or specific logic.
-- Ideally, we'd have a school_id or similar. For now, let's allow all authenticated to read.
-- Simplified RLS for now:
create policy "Enable read access for all users"
  on sections for select
  using (auth.role() = 'authenticated');
