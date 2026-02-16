-- Create addresses table for user delivery addresses
CREATE TABLE public.addresses (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  phone text NOT NULL,
  street_address text NOT NULL,
  home_address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  country text NOT NULL,
  pincode text NOT NULL,
  tag text NOT NULL DEFAULT 'home'::text CHECK (tag IN ('home', 'office', 'other')),
  custom_tag text,
  is_default boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT addresses_pkey PRIMARY KEY (id),
  CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for faster lookups by user_id
CREATE INDEX idx_addresses_user_id ON public.addresses(user_id);

-- Index for default addresses
CREATE INDEX idx_addresses_user_default ON public.addresses(user_id, is_default) WHERE is_default = true;

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated address is being set as default
  IF NEW.is_default = true THEN
    -- Unset all other default addresses for this user
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id AND id != NEW.id AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to maintain single default address per user
CREATE TRIGGER ensure_default_address_trigger
  BEFORE INSERT OR UPDATE ON public.addresses
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_default_address();
