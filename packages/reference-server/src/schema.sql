create table if not exists reference_ingests (
  id uuid primary key, source_url text not null, source_host text not null, source_title text,
  status text not null check (status in ('captured','processing','review','accepted','rejected','publishing','published')),
  revision integer not null check (revision > 0), processing_id uuid, captured_at timestamptz not null,
  created_at timestamptz not null, updated_at timestamptz not null
);
alter table reference_ingests add column if not exists processing_id uuid;
create index if not exists reference_inbox on reference_ingests(status, captured_at desc);
create index if not exists reference_hosts on reference_ingests(source_host);
create table if not exists reference_captures (
  id uuid primary key, ingest_id uuid not null unique references reference_ingests on delete cascade,
  viewport_width integer not null, viewport_height integer not null, device_scale_factor float,
  screenshot_asset_key text not null, thumbnail_asset_key text, raw_capture_asset_key text not null,
  dom_hash text not null, structure_hash text not null, created_at timestamptz not null
);
alter table reference_captures add column if not exists thumbnail_asset_key text;
create index if not exists reference_structure on reference_captures(structure_hash);
create table if not exists reference_classifications (
  ingest_id uuid primary key references reference_ingests on delete cascade,
  subject text, scale text, intent text, density text, traits text[] not null default '{}', confidence float,
  classifier text not null, classifier_version text not null, provenance jsonb not null, updated_at timestamptz not null
);
create index if not exists reference_dimensions on reference_classifications(subject, scale, intent);
create index if not exists reference_confidence on reference_classifications(confidence);
create table if not exists reference_classification_runs (
  id uuid primary key, ingest_id uuid not null references reference_ingests on delete cascade,
  classifier text not null, classifier_version text not null, result jsonb not null, created_at timestamptz not null
);
create index if not exists reference_classification_history on reference_classification_runs(ingest_id, created_at);
create table if not exists reference_reviews (
  ingest_id uuid primary key references reference_ingests on delete cascade,
  decision text not null, notes text not null, rating integer, updated_at timestamptz not null
);
create table if not exists reference_publications (
  id uuid primary key, ingest_id uuid not null references reference_ingests on delete cascade,
  example_id text not null, kind text not null, branch text, commit_sha text, pr_number integer, pr_url text,
  generated_files text[] not null, status text not null, error text, created_at timestamptz not null, updated_at timestamptz not null
);
create index if not exists reference_attempts on reference_publications(ingest_id, created_at);
create or replace function reference_notify() returns trigger language plpgsql as $$
begin
  perform pg_notify('reference_ingests', json_build_object('id', coalesce(new.id, old.id), 'revision', case when TG_OP = 'DELETE' then null else new.revision end)::text);
  return coalesce(new, old);
end $$;
drop trigger if exists reference_changes on reference_ingests;
create trigger reference_changes after insert or update or delete on reference_ingests for each row execute function reference_notify();
