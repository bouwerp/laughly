-- Users profile extension
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  website TEXT,
  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Media items table
CREATE TABLE jokes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT,
  description TEXT,
  media_path TEXT NOT NULL,
  media_type TEXT NOT NULL, -- 'image' or 'video'
  media_url TEXT, -- Can be pre-signed or public
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jokes ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone." ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Jokes policies
CREATE POLICY "Jokes are viewable by owner." ON jokes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jokes." ON jokes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jokes." ON jokes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jokes." ON jokes
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for media bucket
CREATE POLICY "Public Access" ON storage.objects 
  FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media" ON storage.objects 
  FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own media" ON storage.objects 
  FOR DELETE USING (bucket_id = 'media' AND auth.uid() = (storage.foldername(name))[1]::uuid);
