-- Feedback form storage. Run this once in the Supabase SQL editor.
--
-- RLS is enabled with NO policies: the only writer is the server-side
-- /api/feedback route, which uses the service_role key (bypasses RLS
-- entirely). The anon/publishable key can neither read nor write this
-- table, so there's nothing to expose to the browser.
create table if not exists feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  category text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table feedback_submissions enable row level security;

create index if not exists feedback_submissions_email_created_at_idx
  on feedback_submissions (email, created_at);
