-- HERL: Custom Persona Settings
-- Adds persona configuration columns to profiles for cross-device sync.

alter table profiles
  add column if not exists persona_preset_id text
    check (persona_preset_id in ('default','friendly','mentor','witty','counselor','custom'))
    default 'default';

alter table profiles
  add column if not exists persona_custom_prompt text default '';
