-- Add profile_image and bio fields to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image text DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text DEFAULT '';

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image ON public.profiles(profile_image);