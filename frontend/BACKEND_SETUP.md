# Backend Setup Instructions

Your application uses **Supabase** as its backend database and authentication provider.
To make the app fully functional, you need to apply the database schema.

## 1. Access Supabase Dashboard
Go to your project at [https://supabase.com/dashboard](https://supabase.com/dashboard).

## 2. Run SQL Query
1.  Click on the **SQL Editor** icon (on the left sidebar).
2.  Click **New Query**.
3.  Copy and Paste the code from `src/db/schema.sql` (located in your project folder).
    *   *I have included the content below for convenience:*

```sql
-- Create profiles table
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique,
  role text default 'clinician',
  school_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using (true);
create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Create patients table
create table patients (
  id uuid default uuid_generate_v4() primary key,
  created_by uuid references profiles(id) not null,
  name text not null,
  age integer,
  gender text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table patients enable row level security;
create policy "Users can view their own patients." on patients for select using (auth.uid() = created_by);
create policy "Users can insert their own patients." on patients for insert with check (auth.uid() = created_by);

-- Create screenings table
create table screenings (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  created_by uuid references profiles(id) not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  data jsonb not null,
  classification text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table screenings enable row level security;
create policy "Users can view screenings for their patients." on screenings for select using (auth.uid() = created_by);
create policy "Users can insert screenings." on screenings for insert with check (auth.uid() = created_by);

-- Auto-create profile on signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## 3. Rate Limits
If you see "Rate Limit Exceeded":
1.  Go to **Authentication -> Rate Limits**.
2.  Disable or Increase the limits for testing.
3.  Or go to **Authentication -> Email** and disable "Confirm Email" to skip the verification step.
