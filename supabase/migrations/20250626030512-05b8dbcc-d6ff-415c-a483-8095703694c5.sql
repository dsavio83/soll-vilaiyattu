
-- Fix the gender constraint to allow proper values
ALTER TABLE students DROP CONSTRAINT IF EXISTS students_gender_check;

-- Add a proper gender constraint that allows the expected values
ALTER TABLE students ADD CONSTRAINT students_gender_check 
CHECK (gender IN ('Male', 'Female', 'male', 'female', '') OR gender IS NULL);
