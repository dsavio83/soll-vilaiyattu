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

interface AMPAdsProps {
  adSlot: string;
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

const AMPAds: React.FC<AMPAdsProps> = ({ 
  adSlot, 
  width = "100vw",
  height = "320",
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

  useEffect(() => {
    if (adsConfig && adsConfig.banner_enabled && adsConfig.google_ads_id) {
      // Load AMP ad script if not already loaded
      if (!document.querySelector('script[src*="amp-ad-0.1.js"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('custom-element', 'amp-ad');
        script.src = 'https://cdn.ampproject.org/v0/amp-ad-0.1.js';
        document.head.appendChild(script);
      }
    }
  }, [adsConfig]);

  if (!adsConfig || !adsConfig.banner_enabled || !adsConfig.google_ads_id) {
    return null;
  }

  return (
    <div className={`amp-ads-container ${className}`} style={style}>
      <amp-ad 
        width={width}
        height={height}
        type="adsense"
        data-ad-client={adsConfig.google_ads_id}
        data-ad-slot={adSlot}
        data-auto-format="rspv"
        data-full-width=""
      >
        <div overflow=""></div>
      </amp-ad>
    </div>
  );
};

export default AMPAds;