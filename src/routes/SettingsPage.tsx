import React, { useState, useEffect } from 'react';
import useColorMode from '../hooks/useColorMode';
import { getUserSettings, updateUserSettings, uploadLogo, resetLogo } from '../lib/db';
import { auth } from '../lib/firebase';

const SettingsPage = () => {
  const [colorMode, setColorMode] = useColorMode();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [branding, setBranding] = useState<{ 
    logo_url: string | null, 
    company_name: string | null, 
    sidebar_bg: string | null,
    sidebar_text: string | null,
    sidebar_highlight: string | null
  }>({ 
    logo_url: null, 
    company_name: null, 
    sidebar_bg: null,
    sidebar_text: null,
    sidebar_highlight: null
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchUserSettings();
      if (settings) {
        setEmailNotifications(settings.email_notifications !== false);
        setBranding(settings.branding || { 
          logo_url: null, 
          company_name: null, 
          sidebar_bg: null,
          sidebar_text: null,
          sidebar_highlight: null
        });
      }
    };
    loadSettings();
  }, []);

  const fetchUserSettings = async () => {
    return await getUserSettings();
  };

  const handleToggleDarkMode = () => {
    const nextMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
    setMessage('Theme updated');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleToggleEmail = async (checked: boolean) => {
    setEmailNotifications(checked);
    setIsSaving(true);
    setMessage('Saving...');
    try {
      await updateUserSettings({ email_notifications: checked });
      setMessage('Settings saved automatically');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage('Uploading logo...');
    try {
        const url = await uploadLogo(file);
        const newBranding = { ...branding, logo_url: url };
        setBranding(newBranding);
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        
        setMessage('Logo updated successfully');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error uploading logo:', err);
        setMessage('Error uploading logo');
    } finally {
        setUploading(false);
    }
  };

  const handleResetLogo = async () => {
    setIsSaving(true);
    try {
        await resetLogo();
        const newBranding = { 
          logo_url: null, 
          company_name: branding.company_name, 
          sidebar_bg: branding.sidebar_bg,
          sidebar_text: branding.sidebar_text,
          sidebar_highlight: branding.sidebar_highlight
        };
        setBranding(newBranding);
        
        // Dispatch event to update other components
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        
        setMessage('Branding reset to default');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error resetting logo:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdateCompanyName = async (name: string) => {
    const newBranding = { ...branding, company_name: name || null };
    setBranding(newBranding);
    setIsSaving(true);
    try {
        await updateUserSettings({ branding: newBranding });
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        setMessage('Company name updated');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error updating company name:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleResetTheme = async () => {
    setIsSaving(true);
    const newBranding = { 
      ...branding,
      sidebar_bg: null,
      sidebar_text: null,
      sidebar_highlight: null
    };
    setBranding(newBranding);
    setMessage('Resetting theme...');
    try {
        await updateUserSettings({ branding: newBranding });
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        setMessage('Theme reset to Kiritsu default');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error resetting theme:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdateSidebarTheme = async (bg: string | null, text: string | null, highlight: string | null) => {
    const newBranding = { ...branding, sidebar_bg: bg, sidebar_text: text, sidebar_highlight: highlight };
    setBranding(newBranding);
    setIsSaving(true);
    try {
        await updateUserSettings({ branding: newBranding });
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        setMessage('Sidebar theme updated');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error updating sidebar theme:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const handleUpdateSidebarBg = async (bg: string | null) => {
    const newBranding = { ...branding, sidebar_bg: bg };
    setBranding(newBranding);
    setIsSaving(true);
    try {
        await updateUserSettings({ branding: newBranding });
        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
        setMessage('Sidebar background updated');
        setTimeout(() => setMessage(''), 3000);
    } catch (err) {
        console.error('Error updating sidebar bg:', err);
    } finally {
        setIsSaving(false);
    }
  };

  const sidebarThemes = [
    { 
      name: 'Default', 
      bg: null, 
      text: null, 
      highlight: null, 
      class: 'bg-black' 
    },
    { 
      name: 'Slate Deep', 
      bg: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', 
      text: '#94a3b8', 
      highlight: '#334155', 
      class: 'bg-gradient-to-b from-[#1e293b] to-[#0f172a]' 
    },
    { 
      name: 'Midnight', 
      bg: 'linear-gradient(180deg, #111827 0%, #000000 100%)', 
      text: '#d1d5db', 
      highlight: '#374151', 
      class: 'bg-gradient-to-b from-[#111827] to-black' 
    },
    { 
      name: 'Indigo Night', 
      bg: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)', 
      text: '#c7d2fe', 
      highlight: '#4f46e5', 
      class: 'bg-gradient-to-br from-[#4338ca] to-[#312e81]' 
    },
    { 
      name: 'Kiritsu Gradient', 
      bg: 'linear-gradient(180deg, #3c50e0 0%, #3142bc 100%)', 
      text: '#ffffff', 
      highlight: '#2f3fac', 
      class: 'bg-gradient-to-b from-[#3c50e0] to-[#3142bc]' 
    },
    { 
      name: 'Ocean Mist', 
      bg: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)', 
      text: '#e0f2fe', 
      highlight: '#0369a1', 
      class: 'bg-gradient-to-b from-[#0ea5e9] to-[#0284c7]' 
    },
    { 
      name: 'Forest', 
      bg: 'linear-gradient(180deg, #065f46 0%, #064e3b 100%)', 
      text: '#d1fae5', 
      highlight: '#047857', 
      class: 'bg-gradient-to-b from-[#065f46] to-[#064e3b]' 
    },
    { 
      name: 'Royal', 
      bg: 'linear-gradient(180deg, #6d28d9 0%, #4c1d95 100%)', 
      text: '#ede9fe', 
      highlight: '#7c3aed', 
      class: 'bg-gradient-to-b from-[#6d28d9] to-[#4c1d95]' 
    },
  ];

  return (
    <div className="mx-auto max-w-270">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white">
          Settings
        </h2>
        <div className="flex items-center gap-2">
            {message && (
                <span className={`text-sm ${message.includes('Error') ? 'text-danger' : 'text-success'}`}>
                    {message}
                </span>
            )}
            {(isSaving || uploading) && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Preferences Card */}
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
            <h3 className="font-bold text-lg text-black dark:text-white">
              General Preferences
            </h3>
          </div>
          <div className="p-7">
            <div className="flex flex-col gap-9">
              {/* Dark Mode Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-black dark:text-white">
                    Dark Mode
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {colorMode === 'dark'
                      ? 'Dark theme is currently active'
                      : 'Click to enable dark theme'}
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={colorMode === 'dark'}
                    onChange={handleToggleDarkMode}
                  />
                  <div
                    className={`block h-8 w-14 rounded-full transition ${
                      colorMode === 'dark' ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
                      colorMode === 'dark' ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </label>
              </div>

              {/* Email Notifications Toggle */}
              <div className="flex items-center justify-between border-t border-stroke pt-9 dark:border-strokedark">
                <div>
                  <h4 className="font-medium text-black dark:text-white flex items-center gap-2">
                    Email Notifications
                    {auth.currentUser?.email && (
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500">
                        {auth.currentUser.email}
                      </span>
                    )}
                  </h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Receive alerts about new opportunities and overdue follow-ups
                  </p>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={emailNotifications}
                    onChange={(e) => handleToggleEmail(e.target.checked)}
                  />
                  <div
                    className={`block h-8 w-14 rounded-full transition ${
                      emailNotifications ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  ></div>
                  <div
                    className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
                      emailNotifications ? 'translate-x-6' : ''
                    }`}
                  ></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Settings Card */}
        <div className="rounded-lg border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
            <h3 className="font-bold text-lg text-black dark:text-white">
              Branding Settings
            </h3>
          </div>
          <div className="p-7">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <div className="mb-6">
                  <label className="mb-3 block font-medium text-black dark:text-white">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your company name"
                    className="w-full rounded-lg border border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    value={branding.company_name || ''}
                    onChange={(e) => handleUpdateCompanyName(e.target.value)}
                  />
                </div>

                <div className="mb-8 p-4 border border-stroke dark:border-strokedark rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block font-medium text-black dark:text-white text-sm opacity-70 uppercase tracking-wider">
                        Sidebar Theme
                    </label>
                    <button 
                        onClick={handleResetTheme}
                        className="text-[10px] font-bold uppercase text-primary hover:underline px-2 py-1 rounded bg-primary/5"
                    >
                        Reset to Kiritsu Default
                    </button>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-4 mb-6">
                    {sidebarThemes.map((theme) => (
                      <button
                        key={theme.name}
                        onClick={() => handleUpdateSidebarTheme(theme.bg, theme.text, theme.highlight)}
                        title={theme.name}
                        className={`h-10 w-10 rounded-full border-2 transition-all ${theme.class} ${
                          branding.sidebar_bg === theme.bg ||
                          (branding.sidebar_bg === null && theme.bg === null)
                            ? 'border-primary scale-110 shadow-lg'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="h-10 w-12 rounded cursor-pointer bg-transparent"
                                value={branding.sidebar_bg?.startsWith('#') ? branding.sidebar_bg : '#1e293b'}
                                onChange={(e) => handleUpdateSidebarBg(e.target.value)}
                            />
                            <span className="text-[10px] font-mono text-slate-500">{branding.sidebar_bg?.startsWith('#') ? branding.sidebar_bg.toUpperCase() : 'Custom'}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Menu Text</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="h-10 w-12 rounded cursor-pointer bg-transparent"
                                value={branding.sidebar_text || '#ffffff'}
                                onChange={(e) => {
                                    const newBranding = { ...branding, sidebar_text: e.target.value };
                                    setBranding(newBranding);
                                    updateUserSettings({ branding: newBranding }).then(() => {
                                        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
                                    });
                                }}
                            />
                            <span className="text-[10px] font-mono text-slate-500">{branding.sidebar_text || '#FFFFFF'}</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold uppercase text-slate-500">Active Highlight</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                className="h-10 w-12 rounded cursor-pointer bg-transparent"
                                value={branding.sidebar_highlight || '#3c50e0'}
                                onChange={(e) => {
                                    const newBranding = { ...branding, sidebar_highlight: e.target.value };
                                    setBranding(newBranding);
                                    updateUserSettings({ branding: newBranding }).then(() => {
                                        window.dispatchEvent(new CustomEvent('branding-updated', { detail: newBranding }));
                                    });
                                }}
                            />
                            <span className="text-[10px] font-mono text-slate-500">{branding.sidebar_highlight || '#3C50E0'}</span>
                        </div>
                    </div>
                  </div>
                </div>

                <h4 className="font-medium text-black dark:text-white mb-2">
                  Company Logo
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Upload a custom logo to replace the default branding across the
                  application. Recommended size: 200x50px or similar aspect ratio.
                </p>

                <div className="flex items-center gap-4">
                  <label className="flex cursor-pointer items-center justify-center rounded-lg bg-primary py-2 px-6 font-medium text-white hover:bg-opacity-90">
                    {uploading ? 'Uploading...' : 'Upload Logo'}
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </label>
                  {branding.logo_url && (
                    <button
                      onClick={handleResetLogo}
                      className="text-sm text-danger hover:underline"
                    >
                      Reset to default
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 border-t border-stroke py-4 dark:border-strokedark">
              <p className="text-center text-xs text-slate-500">
                Changes are saved automatically to your account profile.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
