-- Add missing columns to leaderboard_score table
ALTER TABLE public.leaderboard_score 
ADD COLUMN IF NOT EXISTS found_words TEXT,
ADD COLUMN IF NOT EXISTS found_words_time TEXT,
ADD COLUMN IF NOT EXISTS complete_game BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Add missing columns to user_scores table  
ALTER TABLE public.user_scores 
ADD COLUMN IF NOT EXISTS found_words_time TEXT,
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 0;

-- Add social_score column to students table if not exists
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS social_score INTEGER DEFAULT 0;

-- Create function to clear user_scores table daily at 12:00 AM IST
CREATE OR REPLACE FUNCTION public.clear_user_scores_daily()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Clear all user_scores data for daily reset
  DELETE FROM public.user_scores;
  
  -- Log the reset
  RAISE NOTICE 'User scores cleared at %', NOW() AT TIME ZONE 'Asia/Kolkata';
END;
$$;

-- Create function to schedule daily reset (this would typically be called by a cron job)
-- For now, we'll handle this in the application code
CREATE OR REPLACE FUNCTION public.should_reset_user_scores()
RETURNS boolean
LANGUAGE plpgsql
AS $$
DECLARE
  current_ist_time TIMESTAMP WITH TIME ZONE;
  last_reset_date DATE;
  current_date_ist DATE;
BEGIN
  -- Get current IST time
  current_ist_time := NOW() AT TIME ZONE 'Asia/Kolkata';
  current_date_ist := (current_ist_time)::DATE;
  
  -- Check if we need to reset (simplified version)
  -- In production, you'd want to store the last reset timestamp
  RETURN true; -- For now, let the application handle the logic
END;
$$;

-- Update the move_to_leaderboard function to include attempt_count
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
  p_attempt_count INTEGER DEFAULT 0,
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
    attempt_count,
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
    p_attempt_count,
    p_game_date,
    NOW()
  ) ON CONFLICT (student_id, game_date) DO UPDATE SET
    score = EXCLUDED.score,
    time_taken = EXCLUDED.time_taken,
    words_found = EXCLUDED.words_found,
    found_words = EXCLUDED.found_words,
    found_words_time = EXCLUDED.found_words_time,
    complete_game = EXCLUDED.complete_game,
    attempt_count = EXCLUDED.attempt_count,
    completed_at = EXCLUDED.completed_at;
  
  -- Delete from user_scores
  DELETE FROM public.user_scores 
  WHERE student_id = p_student_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Add unique constraint to prevent duplicate entries per student per day
ALTER TABLE public.leaderboard_score 
DROP CONSTRAINT IF EXISTS leaderboard_score_student_game_unique;

ALTER TABLE public.leaderboard_score 
ADD CONSTRAINT leaderboard_score_student_game_unique 
UNIQUE (student_id, game_date);