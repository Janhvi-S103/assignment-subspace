/*
  # Create News Dashboard Tables

  1. New Tables
    - `user_preferences`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `preferences` (jsonb array of preferences)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `summary` (text)
      - `sentiment` (text)
      - `source` (text)
      - `url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `user_articles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `article_id` (uuid, references articles)
      - `is_read` (boolean)
      - `is_saved` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read and update their own preferences
      - Read all articles
      - Read and update their own article interactions
*/

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  preferences jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  sentiment text NOT NULL DEFAULT 'neutral',
  source text NOT NULL,
  url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_articles table for tracking read/saved status
CREATE TABLE IF NOT EXISTS user_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  article_id uuid REFERENCES articles NOT NULL,
  is_read boolean DEFAULT false,
  is_saved boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, article_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_articles ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for articles
CREATE POLICY "Anyone can view articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for user_articles
CREATE POLICY "Users can view own article interactions"
  ON user_articles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own article interactions"
  ON user_articles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own article interactions"
  ON user_articles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Insert some sample articles
INSERT INTO articles (title, summary, sentiment, source, url) VALUES
  (
    'AI Breakthrough in Climate Research',
    'Scientists have developed a new AI model that can predict climate patterns with unprecedented accuracy, potentially revolutionizing our approach to climate change mitigation.',
    'positive',
    'Tech Science Daily',
    'https://example.com/ai-climate-research'
  ),
  (
    'Global Markets Face Uncertainty',
    'Markets worldwide experience volatility amid concerns over inflation and geopolitical tensions, leading to cautious investor sentiment.',
    'negative',
    'Financial Times',
    'https://example.com/markets-uncertainty'
  ),
  (
    'New Renewable Energy Project Launches',
    'A major solar and wind power initiative breaks ground, aiming to provide clean energy to over 100,000 homes by 2025.',
    'positive',
    'Energy News',
    'https://example.com/renewable-energy-project'
  ),
  (
    'Tech Industry Updates Privacy Standards',
    'Leading tech companies announce new privacy guidelines to enhance user data protection and transparency.',
    'neutral',
    'Tech Review',
    'https://example.com/privacy-standards'
  ),
  (
    'Healthcare Innovation Shows Promise',
    'Recent medical research reveals potential breakthrough in treating chronic conditions using personalized medicine approaches.',
    'positive',
    'Health Journal',
    'https://example.com/healthcare-innovation'
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at
    BEFORE UPDATE ON articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_articles_updated_at
    BEFORE UPDATE ON user_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();