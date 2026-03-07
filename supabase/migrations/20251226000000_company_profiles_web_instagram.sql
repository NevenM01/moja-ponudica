-- Add optional web and Instagram links to company_profiles
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS web_link TEXT;
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS instagram_link TEXT;
