-- 1. Add 'is_public' flag to jokes
ALTER TABLE jokes ADD COLUMN is_public BOOLEAN DEFAULT false;

-- 2. Create 'follows' table
CREATE TABLE IF NOT EXISTS follows (
  follower_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id),
  CONSTRAINT different_users CHECK (follower_id <> following_id)
);

-- 3. Enable RLS
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- 4. Follows policies
CREATE POLICY "Everyone can see follows." ON follows
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others." ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others." ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 5. Update jokes visibility policy
-- Users can see their own jokes (already exists) OR any public joke
DROP POLICY IF EXISTS "Jokes are viewable by owner." ON jokes;
CREATE POLICY "Jokes are viewable by owner or if public." ON jokes
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- 6. Enable Realtime for follows
ALTER PUBLICATION supabase_realtime ADD TABLE follows;
