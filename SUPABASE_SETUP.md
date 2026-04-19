# Supabase Setup Guide for DriveTo

To get your DriveTo application fully functional, you need to set up your Supabase project with a database table and a storage bucket.

## 1. Create a Supabase Project
1. Go to [Supabase](https://supabase.com/) and create a new project.
2. Once created, go to **Project Settings > API** to get your `Project URL` and `Anon Key`.
3. Add these to your environment variables (`.env`).

## 2. Authentication
1. Go to **Authentication > Providers**.
2. Ensure **Email** is enabled.
3. (Optional) Disable "Confirm Email" if you want to test immediately without verifying emails.

## 3. Database Table
Run the following SQL in the **SQL Editor**:

```sql
-- Update files table for folders and sharing
alter table files add column if not exists folder_id uuid references folders(id);
alter table files add column if not exists is_public boolean default false;
alter table files add column if not exists share_token text;

-- Create a table for folders
create table if not exists folders (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  parent_id uuid references folders(id) on delete cascade,
  user_id uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for folders
alter table folders enable row level security;

-- Policies for folders
create policy "Users can view their own folders"
  on folders for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own folders"
  on folders for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own folders"
  on folders for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own folders"
  on folders for delete
  using ( auth.uid() = user_id );

-- Update file policies to support public viewing via share_token
create policy "Anyone can view public files"
  on files for select
  using ( is_public = true or auth.uid() = user_id );
```

## 4. Storage Bucket
1. Go to **Storage** in the Supabase dashboard.
2. Create a new bucket named `user-files`.
3. Set the bucket to **Public** (or configure more restrictive policies if you prefer).
4. **Important**: Add a policy for the bucket to allow authenticated users to upload and delete objects.

### Storage Policy (SQL Editor):
```sql
-- Allow authenticated users to upload files to their own folder
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'user-files' 
);

-- Allow users to view files in the bucket
create policy "Allow public viewing"
on storage.objects for select
to public
using (
  bucket_id = 'user-files'
);

-- Allow owners to delete their files
create policy "Allow owners to delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'user-files'
);

-- Advanced Features Migration
alter table files add column if not exists is_trashed boolean default false;
alter table files add column if not exists version integer default 1;
alter table files add column if not exists permission text default 'view';

alter table folders add column if not exists is_trashed boolean default false;

-- Create file_versions table
create table if not exists file_versions (
  id uuid default gen_random_uuid() primary key,
  file_id uuid references files(id) on delete cascade not null,
  file_url text not null,
  version_number integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users not null
);

alter table file_versions enable row level security;

create policy "Users can view versions of their files"
  on file_versions for select
  using ( 
    exists (
      select 1 from files 
      where files.id = file_versions.file_id 
      and files.user_id = auth.uid()
    )
  );

create policy "Users can create versions of their files"
  on file_versions for insert
  with check ( 
    exists (
      select 1 from files 
      where files.id = file_versions.file_id 
      and files.user_id = auth.uid()
    )
  );
```

## 5. Deployment
Your app is ready to run! Make sure your `.env` variables are correctly set in your deployment environment (e.g., Vercel, Netlify).
