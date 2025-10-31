-- Create storage bucket for executive photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('executive-photos', 'executive-photos', true);

-- Allow public read access to executive photos
CREATE POLICY "Executive photos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'executive-photos');

-- Allow admins to upload executive photos
CREATE POLICY "Admins can upload executive photos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'executive-photos' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update executive photos
CREATE POLICY "Admins can update executive photos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'executive-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete executive photos
CREATE POLICY "Admins can delete executive photos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'executive-photos'
  AND has_role(auth.uid(), 'admin'::app_role)
);