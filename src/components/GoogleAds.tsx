import React, { useEffect, useState } from 'react';
import { mongodb } from '@/integrations/mongodb/client';

interface AdsConfig {
  google_ads_id: string;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  ads_frequency: number;
  show_ads_after_login: boolean;
}

interface GoogleAdsProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal' | 'fluid';
  adLayoutKey?: string;
  className?: string;
  style?: React.CSSProperties;
}

const GoogleAds: React.FC<GoogleAdsProps> = ({ 
  adSlot, 
  adFormat = 'auto',
  adLayoutKey,
  className = '',
  style = {}
}) => {
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);

  useEffect(() => {
    fetchAdsConfig();
  }, []);

  const fetchAdsConfig = async () => {
    try {
      const { data, error } = await mongodb
        .from('ads_config')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setAdsConfig(data);
      }
    } catch (error) {
      console.error('Error fetching ads config:', error);
    }
  };

  if (!adsConfig || !adsConfig.banner_enabled || !adsConfig.google_ads_id) {
    return null;
  }

  return null;
};

export default GoogleAds;