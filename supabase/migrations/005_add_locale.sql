alter table feedback_submissions add column if not exists locale text not null default 'en';
alter table feedback_submissions alter column locale drop default;
