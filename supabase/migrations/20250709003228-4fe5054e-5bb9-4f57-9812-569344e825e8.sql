-- Update user_scores table to include found words and timing data
ALTER TABLE public.user_scores 
ADD COLUMN IF NOT EXISTS found_words_list TEXT[];

-- Update found_words_time column to store detailed timing data
-- This will store JSON array of {word: string, time: number, timestamp: timestamp}
ALTER TABLE public.user_scores 
ALTER COLUMN found_words_time TYPE TEXT;

ALTER TABLE public.leaderboard_score 
ALTER COLUMN found_words_time TYPE TEXT;

-- Add function to move completed game data from user_scores to leaderboard_score
CREATE OR REPLACE FUNCTION public.move_to_leaderboard(
  p_student_id UUID,
  p_admission_number TEXT,
  p_name TEXT,
  p_class TEXT,
  p_score INTEGER,
  p_time_taken INTEGER,
  p_words_found INTEGER,
  p_found_words TEXT,
  p_found_words_time TEXT,
  p_game_date DATE DEFAULT CURRENT_DATE
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert into leaderboard_score
  INSERT INTO public.leaderboard_score (
    student_id,
    admission_number,
    name,
    class,
    score,
    time_taken,
    words_found,
    found_words,
    found_words_time,
    complete_game,
    game_date,
    completed_at
  ) VALUES (
    p_student_id,
    p_admission_number,
    p_name,
    p_class,
    p_score,
    p_time_taken,
    p_words_found,
    p_found_words,
    p_found_words_time,
    true,
    p_game_date,
    NOW()
  );
  
  -- Delete from user_scores
  DELETE FROM public.user_scores 
  WHERE student_id = p_student_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;