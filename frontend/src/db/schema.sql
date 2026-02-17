-- Create a table for public profiles (linked to auth.users)
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  role text default 'clinician',
  school_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on Row Level Security
alter table profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Create a table for Patients (Students)
create table patients (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references profiles(id) not null,
  name text not null,
  age integer,
  gender text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table patients enable row level security;

-- Policies for patients (Only creator can see/edit)
create policy "Users can view their own patients." on patients
  for select using (auth.uid() = created_by);

create policy "Users can insert their own patients." on patients
  for insert with check (auth.uid() = created_by);

create policy "Users can update their own patients." on patients
  for update using (auth.uid() = created_by);

-- Create a table for Screenings (Test Results)
create table screenings (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null, -- Stores the audiogram points { left: [], right: [] }
  classification text, -- e.g. "Mild Loss"
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Turn on RLS
alter table screenings enable row level security;

-- Policies for screenings
create policy "Users can view screenings for their patients." on screenings
  for select using (auth.uid() = created_by);

create policy "Users can insert screenings." on screenings
  for insert with check (auth.uid() = created_by);

-- Function to handle new user signup automatically
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
