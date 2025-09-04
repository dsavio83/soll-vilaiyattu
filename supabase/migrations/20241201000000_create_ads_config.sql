-- Create ads_config table
CREATE TABLE IF NOT EXISTS ads_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  google_ads_id TEXT NOT NULL,
  banner_enabled BOOLEAN DEFAULT true,
  interstitial_enabled BOOLEAN DEFAULT true,
  rewarded_enabled BOOLEAN DEFAULT false,
  ads_frequency INTEGER DEFAULT 3,
  show_ads_after_login BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE ads_config ENABLE ROW LEVEL SECURITY;

-- Only allow authenticated users to read ads config
CREATE POLICY "Allow authenticated users to read ads config" ON ads_config
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow admin users to modify ads config
CREATE POLICY "Allow admin users to modify ads config" ON ads_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.email IN ('admin@example.com', 'your-admin-email@domain.com')
    )
  );

-- Insert default configuration
INSERT INTO ads_config (google_ads_id, banner_enabled, interstitial_enabled, rewarded_enabled, ads_frequency, show_ads_after_login)
VALUES ('ca-pub-5614525087268742', true, true, false, 3, true)
ON CONFLICT DO NOTHING;