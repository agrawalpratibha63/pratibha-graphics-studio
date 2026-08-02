-- Fix: allow public read of works images/videos (bucket is public)
-- Run this once in Supabase SQL Editor

drop policy if exists "works_storage_read" on storage.objects;
drop policy if exists "works_storage_public_read" on storage.objects;

create policy "works_storage_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'works');

-- Ensure bucket is public
update storage.buckets set public = true where id = 'works';
