import { useState, useEffect } from 'react';
import { getUserSettings } from '../lib/db';

export const useBranding = () => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [sidebarBg, setSidebarBg] = useState<string | null>(null);
  const [sidebarText, setSidebarText] = useState<string | null>(null);
  const [sidebarHighlight, setSidebarHighlight] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const settings = await getUserSettings();
        if (settings?.branding) {
          setLogoUrl(settings.branding.logo_url || null);
          setCompanyName(settings.branding.company_name || null);
          setSidebarBg(settings.branding.sidebar_bg || null);
          setSidebarText(settings.branding.sidebar_text || null);
          setSidebarHighlight(settings.branding.sidebar_highlight || null);
        }
      } catch (err) {
        console.error('Error fetching branding:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBranding();
    
    // Listen for custom events to refresh branding (e.g. after update in settings)
    const handleBrandingUpdate = (e: any) => {
        setLogoUrl(e.detail?.logo_url || null);
        setCompanyName(e.detail?.company_name || null);
        setSidebarBg(e.detail?.sidebar_bg || null);
        setSidebarText(e.detail?.sidebar_text || null);
        setSidebarHighlight(e.detail?.sidebar_highlight || null);
    };
    
    window.addEventListener('branding-updated', handleBrandingUpdate);
    return () => window.removeEventListener('branding-updated', handleBrandingUpdate);
  }, []);

  return { logoUrl, companyName, sidebarBg, sidebarText, sidebarHighlight, loading };
};
