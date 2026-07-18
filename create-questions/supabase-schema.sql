create extension if not exists pgcrypto;

create table if not exists public.quiz_history (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null,
  title text not null,
  file_name text not null default '',
  context text not null default '',
  rubric text not null default '',
  questions jsonb not null,
  question_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists quiz_history_client_created_idx
  on public.quiz_history (client_id, created_at desc);

alter table public.quiz_history enable row level security;

-- No se crean políticas públicas: únicamente la función servidor usa la clave secreta.
