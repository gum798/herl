-- HERL Database Schema
-- Run this in Supabase SQL Editor

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  companion_name text default 'Herl',
  tts_voice text default 'default',
  device_tier text check (device_tier in ('high', 'low')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  started_at timestamptz default now(),
  ended_at timestamptz,
  summary text,
  mood text,
  created_at timestamptz default now()
);

-- Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  has_image boolean default false,
  image_url text,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists idx_conversations_user_id on conversations(user_id);
create index if not exists idx_conversations_started_at on conversations(started_at desc);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
create index if not exists idx_messages_created_at on messages(created_at);

-- Row Level Security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = id);

create policy "Users can view own conversations"
  on conversations for select using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on conversations for insert with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on conversations for update using (auth.uid() = user_id);

create policy "Users can view messages in own conversations"
  on messages for select using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

create policy "Users can insert messages in own conversations"
  on messages for insert with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
