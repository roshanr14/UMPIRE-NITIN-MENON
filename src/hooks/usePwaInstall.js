import { useState, useEffect, useCallback } from 'react';

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [platform, setPlatform] = useState({
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isDesktop: false,
  });

  // Detect platform & standalone display mode
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const ua = window.navigator.userAgent || '';
    const isIOS =
      (/iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) &&
      !window.MSStream;
    const isAndroid = /Android/i.test(ua);
    const isSafari = /Safari/i.test(ua) && !/Chrome|Chromium|Edg/i.test(ua);
    const isChrome = /Chrome|Chromium/i.test(ua) && !/Edg/i.test(ua);
    const isDesktop = !isIOS && !isAndroid;

    setPlatform({ isIOS, isAndroid, isSafari, isChrome, isDesktop });

    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(standalone));
      if (standalone) setIsInstalled(true);
    };

    checkStandalone();

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handler = (e) => {
      setIsStandalone(e.matches);
      if (e.matches) setIsInstalled(true);
    };
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Listen for beforeinstallprompt & appinstalled events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      console.log('CricScore PWA was successfully installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger browser install prompt
  const promptInstall = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
      return choiceResult;
    }

    // If on iOS or browsers without direct prompt
    return { outcome: 'manual', isIOS: platform.isIOS };
  }, [deferredPrompt, platform.isIOS]);

  return {
    deferredPrompt,
    isInstallable: Boolean(deferredPrompt) || (platform.isIOS && !isStandalone) || (!isStandalone && !isInstalled),
    isInstalled,
    isStandalone,
    platform,
    promptInstall,
  };
}
