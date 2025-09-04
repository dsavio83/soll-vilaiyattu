import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { mongodb } from '@/integrations/mongodb/client';

interface AdsConfig {
  google_ads_id: string;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  ads_frequency: number;
  show_ads_after_login: boolean;
}

interface InterstitialAdProps {
  isOpen: boolean;
  onClose: () => void;
  adSlot: string;
}

const InterstitialAd: React.FC<InterstitialAdProps> = ({ isOpen, onClose, adSlot }) => {
  const [adsConfig, setAdsConfig] = useState<AdsConfig | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    fetchAdsConfig();
  }, []);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
    }
  }, [isOpen]);

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

  if (!adsConfig || !adsConfig.interstitial_enabled || !adsConfig.google_ads_id) {
    return null;
  }

  return null;
};

export default InterstitialAd;