-- Change year column from integer to text to support formats like "2025/2026"
ALTER TABLE public.executives 
ALTER COLUMN year TYPE text USING year::text;