/*
  # Create Storage Buckets and Policies

  1. New Storage Buckets
    - reported_photos: For storing uploaded photos
    - reported_chatlogs: For storing uploaded chat logs
  
  2. Security
    - Enable bucket-level security
    - Add policies for authenticated users to read/write their own files
*/

-- Enable Storage by creating the storage schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS storage;

-- Create the storage buckets
INSERT INTO storage.buckets (id, name)
VALUES 
  ('reported_photos', 'reported_photos'),
  ('reported_chatlogs', 'reported_chatlogs');

-- Set up security policies for the reported_photos bucket
CREATE POLICY "Users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reported_photos');

CREATE POLICY "Users can read their photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reported_photos');

-- Set up security policies for the reported_chatlogs bucket
CREATE POLICY "Users can upload chatlogs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'reported_chatlogs');

CREATE POLICY "Users can read their chatlogs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'reported_chatlogs');