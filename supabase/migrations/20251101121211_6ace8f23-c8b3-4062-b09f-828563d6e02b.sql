-- Create storage bucket for cultural images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('cultural-images', 'cultural-images', true);

-- RLS policies for cultural-images bucket
CREATE POLICY "Anyone can view cultural images"
ON storage.objects FOR SELECT
USING (bucket_id = 'cultural-images');

CREATE POLICY "Admins can upload cultural images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'cultural-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update cultural images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'cultural-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete cultural images"
ON storage.objects FOR DELETE
USING (bucket_id = 'cultural-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Create home_content table
CREATE TABLE public.home_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL DEFAULT 'Welcome to BASAMU',
  hero_subtitle text NOT NULL DEFAULT 'Banyakitara Students Association at Muni University.',
  mission_text text NOT NULL DEFAULT 'BASAMU is dedicated to promoting cultural and community awareness, social justice, equity, unity through positive attitude towards development of the community and the nation at large.',
  vision_text text NOT NULL DEFAULT 'To be model students in all walks of life Within the university and the community and the Nation in Target.',
  slogan text NOT NULL DEFAULT 'Banyakitara tubebamwe',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on home_content
ALTER TABLE public.home_content ENABLE ROW LEVEL SECURITY;

-- RLS policies for home_content
CREATE POLICY "Anyone can view home content"
ON public.home_content FOR SELECT
USING (true);

CREATE POLICY "Admins can update home content"
ON public.home_content FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert home content"
ON public.home_content FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default content
INSERT INTO public.home_content (id, hero_title, hero_subtitle, mission_text, vision_text, slogan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Welcome to BASAMU',
  'Banyakitara Students Association at Muni University.',
  'BASAMU is dedicated to promoting cultural and community awareness, social justice, equity, unity through positive attitude towards development of the community and the nation at large.',
  'To be model students in all walks of life Within the university and the community and the Nation in Target.',
  'Banyakitara tubebamwe'
);