-- Adds the category column to a table already created from the original
-- schema.sql. Run this once in the Supabase SQL editor if your table
-- predates this change (it does — you ran schema.sql before this existed).
alter table feedback_submissions
  add column if not exists category text not null default 'general';

alter table feedback_submissions
  alter column category drop default;
