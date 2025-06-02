
-- Create enum for crime types
CREATE TYPE crime_type AS ENUM (
  'homicidio_doloso',
  'latrocinio',
  'lesao_corporal_morte',
  'roubo_transeunte',
  'estupro',
  'tentativa_homicidio',
  'furto',
  'roubo_veiculo',
  'outros'
);

-- Create table for user crime reports
CREATE TABLE public.crime_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  crime_type crime_type NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  neighborhood TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create table for safety index by area
CREATE TABLE public.safety_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  neighborhood TEXT NOT NULL,
  city TEXT NOT NULL DEFAULT 'Salvador',
  state TEXT NOT NULL DEFAULT 'BA',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  safety_percentage DECIMAL(5, 2) NOT NULL DEFAULT 50.0,
  crime_count INTEGER NOT NULL DEFAULT 0,
  last_calculated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(neighborhood, city, state)
);

-- Enable Row Level Security
ALTER TABLE public.crime_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_index ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crime_reports
CREATE POLICY "Users can view all crime reports" ON public.crime_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reports" ON public.crime_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports" ON public.crime_reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports" ON public.crime_reports
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for safety_index
CREATE POLICY "Everyone can view safety index" ON public.safety_index
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage safety index" ON public.safety_index
  FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_crime_reports_location ON public.crime_reports (latitude, longitude);
CREATE INDEX idx_crime_reports_neighborhood ON public.crime_reports (neighborhood);
CREATE INDEX idx_crime_reports_occurred_at ON public.crime_reports (occurred_at);
CREATE INDEX idx_safety_index_location ON public.safety_index (latitude, longitude);
CREATE INDEX idx_safety_index_neighborhood ON public.safety_index (neighborhood);
