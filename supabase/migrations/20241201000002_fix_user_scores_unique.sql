-- Fix user_scores table to have unique user_id constraint
-- Drop existing constraint if it exists
ALTER TABLE user_scores DROP CONSTRAINT IF EXISTS user_scores_student_game_unique;

-- Add unique constraint on user_id only (one row per user)
ALTER TABLE user_scores ADD CONSTRAINT user_scores_user_id_unique UNIQUE (user_id);

-- Update the move_to_leaderboard function to handle user_scores properly
CREATE OR REPLACE FUNCTION move_to_leaderboard(
    p_student_id TEXT,
    p_admission_number TEXT,
    p_name TEXT,
    p_class TEXT,
    p_score INTEGER,
    p_time_taken INTEGER,
    p_words_found INTEGER,
    p_found_words TEXT,
    p_found_words_time TEXT,
    p_attempt_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Insert or update user_scores (only one row per user)
    INSERT INTO user_scores (
        user_id,
        admission_number,
        name,
        class,
        score,
        time_taken,
        words_found,
        found_words,
        found_words_time,
        attempt_count,
        game_date,
        created_at,
        updated_at
    ) VALUES (
        p_student_id,
        p_admission_number,
        p_name,
        p_class,
        p_score,
        p_time_taken,
        p_words_found,
        p_found_words::jsonb,
        p_found_words_time::jsonb,
        p_attempt_count,
        current_date,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        admission_number = EXCLUDED.admission_number,
        name = EXCLUDED.name,
        class = EXCLUDED.class,
        score = EXCLUDED.score,
        time_taken = EXCLUDED.time_taken,
        words_found = EXCLUDED.words_found,
        found_words = EXCLUDED.found_words,
        found_words_time = EXCLUDED.found_words_time,
        attempt_count = EXCLUDED.attempt_count,
        game_date = EXCLUDED.game_date,
        updated_at = NOW();

    -- Also insert into leaderboard_score for permanent history
    INSERT INTO leaderboard_score (
        student_id,
        admission_number,
        name,
        class,
        score,
        time_taken,
        words_found,
        found_words,
        found_words_time,
        attempt_count,
        game_date,
        created_at
    ) VALUES (
        p_student_id,
        p_admission_number,
        p_name,
        p_class,
        p_score,
        p_time_taken,
        p_words_found,
        p_found_words::jsonb,
        p_found_words_time::jsonb,
        p_attempt_count,
        current_date,
        NOW()
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in move_to_leaderboard: %', SQLERRM;
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Update the save_guest_user_data function to use the same pattern
CREATE OR REPLACE FUNCTION save_guest_user_data(
    p_guest_id TEXT,
    p_name TEXT,
    p_score INTEGER,
    p_time_taken INTEGER,
    p_words_found INTEGER,
    p_found_words JSONB,
    p_found_words_time JSONB,
    p_attempt_count INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    current_date DATE := CURRENT_DATE;
BEGIN
    -- Insert or update user_scores for guest user
    INSERT INTO user_scores (
        user_id,
        admission_number,
        name,
        class,
        score,
        time_taken,
        words_found,
        found_words,
        found_words_time,
        attempt_count,
        game_date,
        created_at,
        updated_at
    ) VALUES (
        p_guest_id,
        'GUEST',
        p_name,
        'Guest',
        p_score,
        p_time_taken,
        p_words_found,
        p_found_words,
        p_found_words_time,
        p_attempt_count,
        current_date,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        score = EXCLUDED.score,
        time_taken = EXCLUDED.time_taken,
        words_found = EXCLUDED.words_found,
        found_words = EXCLUDED.found_words,
        found_words_time = EXCLUDED.found_words_time,
        attempt_count = EXCLUDED.attempt_count,
        game_date = EXCLUDED.game_date,
        updated_at = NOW();

    -- Also insert into leaderboard_score for permanent history
    INSERT INTO leaderboard_score (
        student_id,
        admission_number,
        name,
        class,
        score,
        time_taken,
        words_found,
        found_words,
        found_words_time,
        attempt_count,
        game_date,
        created_at
    ) VALUES (
        p_guest_id,
        'GUEST',
        p_name,
        'Guest',
        p_score,
        p_time_taken,
        p_words_found,
        p_found_words,
        p_found_words_time,
        p_attempt_count,
        current_date,
        NOW()
    );

    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;