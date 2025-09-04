-- Create user_scores table for daily progress tracking
CREATE TABLE public.user_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  total_score INTEGER NOT NULL DEFAULT 0,
  last_played_date DATE,
  streak_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations on user_scores" 
ON public.user_scores 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_scores_updated_at
BEFORE UPDATE ON public.user_scores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle daily scoring
CREATE OR REPLACE FUNCTION public.handle_daily_scoring()
RETURNS void AS $$
DECLARE
    student_record RECORD;
    yesterday_date DATE;
    today_date DATE;
BEGIN
    yesterday_date := CURRENT_DATE - INTERVAL '1 day';
    today_date := CURRENT_DATE;
    
    -- Loop through all students who have scores
    FOR student_record IN 
        SELECT DISTINCT s.id, s.name, us.total_score, us.last_played_date, us.streak_days
        FROM public.students s
        LEFT JOIN public.user_scores us ON s.id = us.student_id
    LOOP
        -- If student has no score record, create one
        IF student_record.total_score IS NULL THEN
            INSERT INTO public.user_scores (student_id, total_score, last_played_date, streak_days)
            VALUES (student_record.id, 0, NULL, 0);
            CONTINUE;
        END IF;
        
        -- Check if student played yesterday and completed the game
        IF EXISTS (
            SELECT 1 FROM public.leaderboard_score 
            WHERE student_id = student_record.id 
            AND game_date = yesterday_date
            AND words_found > 0
        ) THEN
            -- Student played yesterday, check if they completed all words
            DECLARE
                total_words_yesterday INTEGER;
                student_words_found INTEGER;
            BEGIN
                -- Get total words for yesterday's puzzle
                SELECT 
                    COALESCE(array_length(words_2_letter, 1), 0) +
                    COALESCE(array_length(words_3_letter, 1), 0) +
                    COALESCE(array_length(words_4_letter, 1), 0) +
                    COALESCE(array_length(words_5_letter, 1), 0) +
                    COALESCE(array_length(words_6_letter, 1), 0) +
                    COALESCE(array_length(words_7_letter, 1), 0)
                INTO total_words_yesterday
                FROM public.word_puzzle 
                WHERE game_date = yesterday_date;
                
                -- Get student's words found
                SELECT words_found INTO student_words_found
                FROM public.leaderboard_score 
                WHERE student_id = student_record.id 
                AND game_date = yesterday_date;
                
                -- If completed all words, add 5 points and increase streak
                IF student_words_found = total_words_yesterday THEN
                    UPDATE public.user_scores 
                    SET 
                        total_score = total_score + 5,
                        last_played_date = yesterday_date,
                        streak_days = streak_days + 1
                    WHERE student_id = student_record.id;
                ELSE
                    -- Played but didn't complete, just update last played date
                    UPDATE public.user_scores 
                    SET last_played_date = yesterday_date
                    WHERE student_id = student_record.id;
                END IF;
            END;
        ELSE
            -- Student didn't play yesterday
            IF student_record.last_played_date IS NOT NULL AND 
               student_record.last_played_date = yesterday_date - INTERVAL '1 day' THEN
                -- They played the day before yesterday, so missed yesterday
                UPDATE public.user_scores 
                SET 
                    total_score = GREATEST(0, total_score - 3),
                    streak_days = 0
                WHERE student_id = student_record.id;
            END IF;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;