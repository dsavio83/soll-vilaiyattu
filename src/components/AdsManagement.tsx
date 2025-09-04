import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { mongodb } from '@/integrations/mongodb/client';

interface AdsConfig {
  id?: string;
  google_ads_id: string;
  banner_enabled: boolean;
  interstitial_enabled: boolean;
  rewarded_enabled: boolean;
  ads_frequency: number;
  show_ads_after_login: boolean;
  created_at?: string;
  updated_at?: string;
}

const AdsManagement: React.FC = () => {
  const [adsConfig, setAdsConfig] = useState<AdsConfig>({
    google_ads_id: 'ca-pub-5614525087268742',
    banner_enabled: true,
    interstitial_enabled: true,
    rewarded_enabled: false,
    ads_frequency: 3,
    show_ads_after_login: true,
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      toast({
        title: "Error",
        description: "Failed to fetch ads configuration",
        variant: "destructive",
      });
    }
  };

  const saveAdsConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await mongodb
        .from('ads_config')
        .upsert({
          ...adsConfig,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setAdsConfig(data);
      toast({
        title: "Success",
        description: "Ads configuration saved successfully",
      });
    } catch (error) {
      console.error('Error saving ads config:', error);
      toast({
        title: "Error",
        description: "Failed to save ads configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Google Ads Configuration</CardTitle>
          <CardDescription>
            Configure Google AdSense settings for the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_ads_id">Google Ads ID</Label>
            <Input
              id="google_ads_id"
              value={adsConfig.google_ads_id}
              onChange={(e) => setAdsConfig({ ...adsConfig, google_ads_id: e.target.value })}
              placeholder="ca-pub-xxxxxxxxxxxxxxxxx"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ads_frequency">Ads Frequency (every N games)</Label>
            <Input
              id="ads_frequency"
              type="number"
              min="1"
              max="10"
              value={adsConfig.ads_frequency}
              onChange={(e) => setAdsConfig({ ...adsConfig, ads_frequency: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Banner Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Show banner ads in the game
                </p>
              </div>
              <Switch
                checked={adsConfig.banner_enabled}
                onCheckedChange={(checked) => setAdsConfig({ ...adsConfig, banner_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Interstitial Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Show full-screen ads between games
                </p>
              </div>
              <Switch
                checked={adsConfig.interstitial_enabled}
                onCheckedChange={(checked) => setAdsConfig({ ...adsConfig, interstitial_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rewarded Ads</Label>
                <p className="text-sm text-muted-foreground">
                  Show rewarded ads for hints or bonuses
                </p>
              </div>
              <Switch
                checked={adsConfig.rewarded_enabled}
                onCheckedChange={(checked) => setAdsConfig({ ...adsConfig, rewarded_enabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Ads After Login</Label>
                <p className="text-sm text-muted-foreground">
                  Show interstitial ad after user logs in
                </p>
              </div>
              <Switch
                checked={adsConfig.show_ads_after_login}
                onCheckedChange={(checked) => setAdsConfig({ ...adsConfig, show_ads_after_login: checked })}
              />
            </div>
          </div>

          <Button onClick={saveAdsConfig} disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdsManagement;