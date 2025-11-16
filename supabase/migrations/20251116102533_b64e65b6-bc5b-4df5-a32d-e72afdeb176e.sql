-- Create route_history table for storing user's route searches
CREATE TABLE public.route_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  start_name TEXT NOT NULL,
  start_lat NUMERIC NOT NULL,
  start_lon NUMERIC NOT NULL,
  end_name TEXT NOT NULL,
  end_lat NUMERIC NOT NULL,
  end_lon NUMERIC NOT NULL,
  distance NUMERIC,
  duration NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.route_history ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own route history"
ON public.route_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own route history"
ON public.route_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own route history"
ON public.route_history
FOR DELETE
USING (auth.uid() = user_id);