-- The Maker's projects. One row per project; the whole site lives in `site` as the Maker site
-- document (@skryensya/maker-model), and `revision` goes up by one on every write, which is what lets
-- two writers (the person, an agent) refuse to overwrite each other.
--
-- Applied at startup and idempotent: every statement can run again on a database that has it.

create table if not exists maker_projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (length(btrim(name)) > 0),
  site        jsonb not null,
  revision    integer not null default 1 check (revision > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists maker_projects_updated_at on maker_projects (updated_at desc);

-- Every change to a project is announced on one channel with the project's id and revision, so an
-- open Maker hears an agent's write the moment it commits, whichever process made it.
create or replace function maker_projects_notify() returns trigger language plpgsql as $$
begin
  perform pg_notify('maker_projects', json_build_object(
    'id', coalesce(new.id, old.id),
    'revision', case when tg_op = 'DELETE' then null else new.revision end,
    'op', lower(tg_op)
  )::text);
  return coalesce(new, old);
end;
$$;

drop trigger if exists maker_projects_notify on maker_projects;
create trigger maker_projects_notify
  after insert or update or delete on maker_projects
  for each row execute function maker_projects_notify();

-- Publication: the site name a project is published under (unique across projects), which revision
-- is live, where, and since when. Null while the project is not published.
alter table maker_projects add column if not exists site_name text;
alter table maker_projects add column if not exists published_revision integer;
alter table maker_projects add column if not exists published_url text;
alter table maker_projects add column if not exists published_at timestamptz;
create unique index if not exists maker_projects_site_name on maker_projects (site_name) where site_name is not null;
