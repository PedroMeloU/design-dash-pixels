
-- Adiciona uma coluna de status à tabela de crime_reports
ALTER TABLE public.crime_reports
ADD COLUMN status TEXT NOT NULL DEFAULT 'Em apuração';

-- Cria índice para otimizar busca por tipo, bairro e período
CREATE INDEX IF NOT EXISTS idx_crime_reports_similarity ON public.crime_reports (crime_type, neighborhood, occurred_at);

