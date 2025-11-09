-- Add email column to executives table
ALTER TABLE public.executives
ADD COLUMN email text;

-- Remove chairperson_email from home_content table as it's now in executives
ALTER TABLE public.home_content
DROP COLUMN chairperson_email;