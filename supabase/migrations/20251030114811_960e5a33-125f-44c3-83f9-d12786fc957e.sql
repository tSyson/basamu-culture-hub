-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Update handle_new_user function to use user_roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email)
  VALUES (new.id, new.email);
  
  -- Assign default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Drop old RLS policies that check is_admin
DROP POLICY IF EXISTS "Admins can insert executives" ON public.executives;
DROP POLICY IF EXISTS "Admins can update executives" ON public.executives;
DROP POLICY IF EXISTS "Admins can delete executives" ON public.executives;

DROP POLICY IF EXISTS "Admins can insert events" ON public.events;
DROP POLICY IF EXISTS "Admins can update events" ON public.events;
DROP POLICY IF EXISTS "Admins can delete events" ON public.events;

DROP POLICY IF EXISTS "Admins can insert cultural images" ON public.cultural_images;
DROP POLICY IF EXISTS "Admins can delete cultural images" ON public.cultural_images;

-- Create new RLS policies using has_role function
-- Executives table
CREATE POLICY "Admins can insert executives" ON public.executives
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update executives" ON public.executives
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete executives" ON public.executives
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Events table
CREATE POLICY "Admins can insert events" ON public.events
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events" ON public.events
FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events" ON public.events
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Cultural images table
CREATE POLICY "Admins can insert cultural images" ON public.cultural_images
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete cultural images" ON public.cultural_images
FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add policy for users to view their own roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Remove is_admin column from profiles
ALTER TABLE public.profiles DROP COLUMN IF EXISTS is_admin;