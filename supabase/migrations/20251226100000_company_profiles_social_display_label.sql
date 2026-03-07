-- Optional display label for social link (e.g. @nvenm or Neven M) shown in PDF and live view
ALTER TABLE company_profiles ADD COLUMN IF NOT EXISTS social_display_label TEXT;
