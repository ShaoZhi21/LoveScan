/*
  # Create social media scans table

  1. New Tables
    - `social_media_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `social_data` (jsonb, stores URLs and screenshot paths)
      - `created_at` (timestamp)
      - `status` (text)
      - `risk_score` (integer)
      - `report` (jsonb)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS social_media_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  social_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  risk_score integer,
  report jsonb
);

ALTER TABLE social_media_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own scans"
  ON social_media_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scans"
  ON social_media_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);