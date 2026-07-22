-- Storage bucket for feedback screenshots. Public read (so the URL works
-- directly in the confirmation email / wherever the message is displayed),
-- but nothing can write to it except through our server-issued signed
-- upload URLs (/api/feedback/upload-url) — no INSERT policy is needed for
-- anon since a signed upload token is pre-authorized regardless.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-images',
  'feedback-images',
  true,
  5242880, -- 5MB, matches MAX_IMAGE_BYTES in src/lib/feedback/image-limits.ts
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;
