-- Add geolocation columns to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS lat FLOAT,
ADD COLUMN IF NOT EXISTS lng FLOAT;

-- Optional: Create an index for faster geospatial queries if we were using PostGIS
-- But for simple sorting standard indexing is fine if needed later.
