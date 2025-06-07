/*
  # Create profile scans table

  1. New Tables
    - `profile_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `image_url` (text)
      - `created_at` (timestamptz)
      - `status` (text)
      - `risk_score` (integer)
      - `report` (jsonb)

  2. Security
    - Enable RLS on `profile_scans` table
    - Add policies for authenticated users to:
      - Create their own scans
      - View their own scans
*/

CREATE TABLE IF NOT EXISTS profile_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  risk_score integer,
  report jsonb
);

ALTER TABLE profile_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own scans"
  ON profile_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scans"
  ON profile_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);