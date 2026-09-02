-- VitiCampo Supabase schema

-- Enable pgcrypto for gen_random_uuid()
create extension if not exists pgcrypto;

-- Users table
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now(),
  subscription_status text not null default 'inactive', -- active / inactive
  es_vip boolean not null default false
);

-- Work orders
create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  lote text not null,
  tarea text not null,
  insumos text,
  operario text,
  created_at timestamptz default now(),
  sync_status text not null default 'synced'
);

-- Field tasks (completions)
create table if not exists field_tasks (
  id uuid primary key default gen_random_uuid(),
  task_ref text,
  title text,
  assignee text,
  status text default 'Pendiente',
  kilos numeric,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Generic sync table for archived raw payloads
create table if not exists sync (
  id uuid primary key default gen_random_uuid(),
  type text,
  payload jsonb,
  created_at timestamptz default now()
);

-- Organizations and memberships
create table if not exists orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_user_id uuid references users(id) on delete set null,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text not null default 'inactive', -- active / past_due / canceled
  created_at timestamptz default now()
);

create table if not exists org_memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references orgs(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  role text not null default 'member', -- owner | admin | member
  created_at timestamptz default now()
);

create index if not exists idx_orgs_owner on orgs(owner_user_id);
create index if not exists idx_members_org on org_memberships(org_id);

-- Indexes to improve queries
create index if not exists idx_users_email on users(email);
create index if not exists idx_work_orders_created on work_orders(created_at);
create index if not exists idx_field_tasks_created on field_tasks(created_at);

-- Example policy: allow insert/select for service role only (placeholder)
-- Policies should be configured in Supabase dashboard per project security needs.
