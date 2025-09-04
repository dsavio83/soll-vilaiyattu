
-- Create users table for admin login
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table with admission number, name, class, division, gender
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  division TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard_score table
CREATE TABLE public.leaderboard_score (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  admission_number TEXT NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL, -- in seconds
  words_found INTEGER NOT NULL DEFAULT 0,
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create word_puzzle table
CREATE TABLE public.word_puzzle (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_date DATE NOT NULL DEFAULT CURRENT_DATE,
  center_letter TEXT NOT NULL,
  surrounding_letters TEXT[] NOT NULL, -- array of 6 letters
  words_2_letter TEXT[] DEFAULT '{}',
  words_3_letter TEXT[] DEFAULT '{}',
  words_4_letter TEXT[] DEFAULT '{}',
  words_5_letter TEXT[] DEFAULT '{}',
  words_6_letter TEXT[] DEFAULT '{}',
  words_7_letter TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(game_date)
);

-- Insert default admin user (password is 'admin' hashed)
INSERT INTO public.users (username, password_hash) 
VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Insert sample students data
INSERT INTO public.students (admission_number, name, class, division, gender) VALUES
('ADM001', 'அருண் குமார்', '10', 'A', 'male'),
('ADM002', 'பிரியா சுந்தர்', '10', 'A', 'female'),
('ADM003', 'கார்த்திக் ராஜ்', '9', 'B', 'male'),
('ADM004', 'தீபிகா முருகன்', '9', 'B', 'female'),
('ADM005', 'விஜய் பாலன்', '11', 'A', 'male');

-- Insert sample word puzzle data (fixed empty array issue)
INSERT INTO public.word_puzzle (game_date, center_letter, surrounding_letters, words_2_letter, words_3_letter, words_4_letter, words_5_letter, words_6_letter, words_7_letter) VALUES
(CURRENT_DATE, 'ல்', ARRAY['ப', 'க', 'ப்', 'ப', 'ட', 'ட்'], ARRAY['கல்', 'பல்'], ARRAY['பகல்', 'கடல்'], ARRAY['கப்பல்'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['பட்டப்பகல்']),
(CURRENT_DATE + INTERVAL '1 day', 'தி', ARRAY['சை', 'க', 'ய', 'ரு', 'றி', 'வி'], ARRAY['திசை', 'திரு', 'வித', 'யதி', 'கதி'], ARRAY['கருவி', 'கடல்'], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY[]::TEXT[], ARRAY['திசையறிகருவி']);

-- Enable Row Level Security (but keep it open for now since we'll handle auth differently)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_score ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_puzzle ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since we're handling auth in the application layer)
CREATE POLICY "Allow all operations on users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on students" ON public.students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leaderboard_score" ON public.leaderboard_score FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on word_puzzle" ON public.word_puzzle FOR ALL USING (true) WITH CHECK (true);
