'use client';

import { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Self-contained PWA install button.
 * Captures the beforeinstallprompt event directly and calls .prompt() on click.
 * Does NOT depend on a separate modal or hook — works anywhere it's rendered.
 */
export function InstallPWAButton(props: ButtonProps) {
  const [visible, setVisible] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Already installed — don't show
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    const handler = (e: Event) => {
      // Must preventDefault to suppress the browser's default mini-infobar
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setVisible(true);
    };

    const installedHandler = () => {
      setVisible(false);
      deferredPrompt.current = null;
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  if (!visible) return null;

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    props.onClick?.(e);
    if (e.defaultPrevented) return;

    const prompt = deferredPrompt.current;
    if (!prompt) return;

    // Show the native install dialog
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;

    if (outcome === 'accepted') {
      deferredPrompt.current = null;
      setVisible(false);
    }
  };

  return (
    <Button {...props} onClick={handleClick}>
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}
