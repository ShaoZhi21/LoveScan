/*
  # Create Storage Buckets for File Uploads

  1. New Storage Buckets
    - `chatlogs`: For storing chat log files
    - `screenshots`: For storing screenshot images
  
  2. Security
    - Enable public access for authenticated users
    - Allow authenticated users to upload and read their own files
*/

-- Create the chatlogs bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('chatlogs', 'chatlogs')
ON CONFLICT (id) DO NOTHING;

-- Create the screenshots bucket if it doesn't exist
INSERT INTO storage.buckets (id, name)
VALUES ('screenshots', 'screenshots')
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for chatlogs
CREATE POLICY "Allow authenticated users to upload chat logs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chatlogs' AND
  auth.uid() = owner
);

CREATE POLICY "Allow users to read their own chat logs"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chatlogs' AND
  auth.uid() = owner
);

-- Set up storage policies for screenshots
CREATE POLICY "Allow authenticated users to upload screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'screenshots' AND
  auth.uid() = owner
);

CREATE POLICY "Allow users to read their own screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'screenshots' AND
  auth.uid() = owner
);