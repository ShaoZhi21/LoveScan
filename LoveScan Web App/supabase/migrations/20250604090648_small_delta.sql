/*
  # Create chat scans tables

  1. New Tables
    - `chat_scans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `chat_log` (text)
      - `screenshot_url` (text)
      - `message_text` (text)
      - `created_at` (timestamp)
      - `status` (text)
      - `risk_score` (integer)
      - `report` (jsonb)

  2. Security
    - Enable RLS on `chat_scans` table
    - Add policies for authenticated users to manage their own scans
*/

CREATE TABLE IF NOT EXISTS chat_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  chat_log text,
  screenshot_url text,
  message_text text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  risk_score integer,
  report jsonb,
  CONSTRAINT at_least_one_input CHECK (
    chat_log IS NOT NULL OR 
    screenshot_url IS NOT NULL OR 
    message_text IS NOT NULL
  )
);

ALTER TABLE chat_scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own scans"
  ON chat_scans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own scans"
  ON chat_scans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);