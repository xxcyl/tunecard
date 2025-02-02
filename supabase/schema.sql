-- Reset tables
drop table if exists playlist_tracks cascade;
drop table if exists playlists cascade;
drop table if exists profiles cascade;

-- Create profiles table first
create table public.profiles (
  id uuid not null primary key, -- remove the reference to auth.users
  username text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create playlists table
create table public.playlists (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  user_id uuid references public.profiles on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create playlist_tracks table
create table public.playlist_tracks (
  id uuid default gen_random_uuid() primary key,
  playlist_id uuid references playlists on delete cascade not null,
  title text not null,
  artist text not null,
  album text,
  duration integer,
  youtube_link text,
  lastfm_link text,
  image text,
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;
alter table playlists enable row level security;
alter table playlist_tracks enable row level security;

-- Set profile policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Set playlist policies
create policy "Users can view their own playlists"
  on playlists for select
  using (auth.uid() = user_id);

create policy "Users can create their own playlists"
  on playlists for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own playlists"
  on playlists for update
  using (auth.uid() = user_id);

create policy "Users can delete their own playlists"
  on playlists for delete
  using (auth.uid() = user_id);

-- Set playlist tracks policies
create policy "Users can view tracks from their playlists"
  on playlist_tracks for select
  using (
    exists (
      select 1 from playlists
      where id = playlist_tracks.playlist_id
      and user_id = auth.uid()
    )
  );

create policy "Users can insert tracks to their playlists"
  on playlist_tracks for insert
  with check (
    exists (
      select 1 from playlists
      where id = playlist_tracks.playlist_id
      and user_id = auth.uid()
    )
  );

create policy "Users can update tracks in their playlists"
  on playlist_tracks for update
  using (
    exists (
      select 1 from playlists
      where id = playlist_tracks.playlist_id
      and user_id = auth.uid()
    )
  );

create policy "Users can delete tracks from their playlists"
  on playlist_tracks for delete
  using (
    exists (
      select 1 from playlists
      where id = playlist_tracks.playlist_id
      and user_id = auth.uid()
    )
  );

-- Create trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'avatar_url', null)
  );
  return new;
end;
$$;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
