-- Add image_url column to events table
ALTER TABLE public.events ADD COLUMN image_url TEXT;

-- Create storage bucket for event images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('event-images', 'event-images', true);

-- Create RLS policies for event-images bucket
CREATE POLICY "Anyone can view event images"
ON storage.objects FOR SELECT
USING (bucket_id = 'event-images');

CREATE POLICY "Admins can upload event images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'event-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update event images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'event-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete event images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'event-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);