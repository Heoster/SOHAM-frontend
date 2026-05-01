'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import {idbGet, idbSet} from '@/lib/indexed-db';

const DISMISS_KEY = 'pwa-prompt-dismissed-at-v2';
const INSTALLED_KEY = 'pwa-installed-v2';
const DISMISS_DURATION_MS = 3 * 24 * 60 * 60 * 1000;
const OPEN_EVENT = 'soham:pwa-open-request';

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function isStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function requestPWAPromptOpen() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(true);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
    const standalone = isStandaloneMode();
    setIsIos(ios);
    setIsStandalone(standalone);

    let isMounted = true;
    let autoOpenTimer: number | null = null;

    const openIfAllowed = async () => {
      const dismissedAt = await idbGet<number>(DISMISS_KEY);
      const installed = await idbGet<boolean>(INSTALLED_KEY);
      const snoozed = !!dismissedAt && Date.now() - dismissedAt < DISMISS_DURATION_MS;

      if (!isMounted) return;

      setIsReady(true);

      if (!standalone && !installed && !snoozed && (ios || isInstallable || !!deferredPrompt)) {
        autoOpenTimer = window.setTimeout(() => setOpen(true), 2200);
      }
    };

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setOpen(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsStandalone(true);
      idbSet(INSTALLED_KEY, true);
    };

    const handleOpenRequest = () => {
      if (!isStandalone) {
        setOpen(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener(OPEN_EVENT, handleOpenRequest);

    openIfAllowed();

    return () => {
      isMounted = false;
      if (autoOpenTimer) {
        window.clearTimeout(autoOpenTimer);
      }
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener(OPEN_EVENT, handleOpenRequest);
    };
  }, [deferredPrompt, isInstallable]);

  const dismiss = useCallback(async () => {
    setOpen(false);
    await idbSet(DISMISS_KEY, Date.now());
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const {outcome} = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setOpen(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
      await idbSet(INSTALLED_KEY, true);
    } else {
      await dismiss();
    }
  }, [deferredPrompt, dismiss]);

  const canShowInstallUi = useMemo(
    () => isReady && !isStandalone,
    [isReady, isStandalone]
  );

  return {
    open,
    setOpen,
    dismiss,
    install,
    isIos,
    isStandalone,
    isInstallable: isInstallable || !!deferredPrompt,
    canShowInstallUi,
  };
}
