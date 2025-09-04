-- Add unique constraint for game_date in word_puzzle table
ALTER TABLE word_puzzle ADD CONSTRAINT unique_game_date UNIQUE (game_date);

-- Create function to check for duplicate words within a game and 7-letter word uniqueness across games
CREATE OR REPLACE FUNCTION check_word_uniqueness()
RETURNS TRIGGER AS $$
DECLARE
    all_words TEXT[];
    word_count INTEGER;
    existing_7_letter_words TEXT[];
    duplicate_7_letter_words TEXT[];
BEGIN
    -- Combine all words from all length categories
    all_words := ARRAY[]::TEXT[];
    
    IF NEW.words_2_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_2_letter;
    END IF;
    
    IF NEW.words_3_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_3_letter;
    END IF;
    
    IF NEW.words_4_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_4_letter;
    END IF;
    
    IF NEW.words_5_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_5_letter;
    END IF;
    
    IF NEW.words_6_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_6_letter;
    END IF;
    
    IF NEW.words_7_letter IS NOT NULL THEN
        all_words := all_words || NEW.words_7_letter;
    END IF;
    
    -- Check if there are duplicate words within this game
    SELECT COUNT(*) INTO word_count FROM unnest(all_words) AS word;
    
    IF word_count != (SELECT COUNT(DISTINCT word) FROM unnest(all_words) AS word) THEN
        RAISE EXCEPTION 'Duplicate words found in the game. Each word must be unique within the game.';
    END IF;
    
    -- Check for 7-letter word uniqueness across all games
    IF NEW.words_7_letter IS NOT NULL AND array_length(NEW.words_7_letter, 1) > 0 THEN
        -- Get all existing 7-letter words from other games
        SELECT ARRAY(
            SELECT DISTINCT unnest(words_7_letter) 
            FROM word_puzzle 
            WHERE id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
            AND words_7_letter IS NOT NULL
        ) INTO existing_7_letter_words;
        
        -- Find duplicates
        SELECT ARRAY(
            SELECT word 
            FROM unnest(NEW.words_7_letter) AS word 
            WHERE word = ANY(existing_7_letter_words)
        ) INTO duplicate_7_letter_words;
        
        IF array_length(duplicate_7_letter_words, 1) > 0 THEN
            RAISE EXCEPTION 'These 7-letter words already exist in other games: %. Each 7-letter word must be unique across all games.', array_to_string(duplicate_7_letter_words, ', ');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to check word uniqueness before insert/update
DROP TRIGGER IF EXISTS check_word_uniqueness_trigger ON word_puzzle;
CREATE TRIGGER check_word_uniqueness_trigger
    BEFORE INSERT OR UPDATE ON word_puzzle
    FOR EACH ROW
    EXECUTE FUNCTION check_word_uniqueness();

-- Create function to handle guest user data saving
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
BEGIN
    -- Insert guest user data into leaderboard
    INSERT INTO leaderboard (
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
        CURRENT_DATE,
        NOW()
    );
    
    RETURN TRUE;
EXCEPTION
    WHEN OTHERS THEN
        RETURN FALSE;
END;
$$ LANGUAGE plpgsql;