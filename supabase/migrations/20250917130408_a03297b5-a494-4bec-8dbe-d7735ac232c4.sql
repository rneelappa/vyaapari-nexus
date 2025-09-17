-- Add missing updated_at column to trn_inventory table
ALTER TABLE public.trn_inventory 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();