-- Add hero_image_url to home_content table
ALTER TABLE public.home_content 
ADD COLUMN hero_image_url text;

-- Add rank column to executives table for custom ordering
ALTER TABLE public.executives 
ADD COLUMN rank integer DEFAULT 0;

-- Create index for better performance when ordering by rank
CREATE INDEX idx_executives_rank ON public.executives(rank DESC);