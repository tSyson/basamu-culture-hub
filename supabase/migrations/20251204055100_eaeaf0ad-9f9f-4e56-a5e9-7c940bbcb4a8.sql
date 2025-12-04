-- Add badge_url column to home_content table
ALTER TABLE public.home_content 
ADD COLUMN badge_url TEXT;