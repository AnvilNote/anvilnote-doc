-- Adds title/name/status/admin_reason/seq to a table already created by
-- schema.sql + 002_add_category.sql. Run once in the Supabase SQL editor.

alter table feedback_submissions
  add column if not exists seq bigint generated always as identity;

alter table feedback_submissions
  add column if not exists title text not null default 'Untitled';
alter table feedback_submissions
  alter column title drop default;

alter table feedback_submissions
  add column if not exists name text;

alter table feedback_submissions
  add column if not exists status text not null default 'published';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'feedback_submissions_status_check'
  ) then
    alter table feedback_submissions
      add constraint feedback_submissions_status_check
      check (status in ('published', 'in_progress', 'rejected', 'done'));
  end if;
end $$;

alter table feedback_submissions
  add column if not exists admin_reason text;

create index if not exists feedback_submissions_status_idx
  on feedback_submissions (status);
