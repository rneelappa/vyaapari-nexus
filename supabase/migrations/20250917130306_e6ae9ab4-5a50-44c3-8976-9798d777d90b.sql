-- Add missing updated_at column to trn_inventory table
ALTER TABLE public.trn_inventory 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add trigger to automatically update the timestamp
CREATE TRIGGER update_trn_inventory_updated_at
    BEFORE UPDATE ON public.trn_inventory
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();