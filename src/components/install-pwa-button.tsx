'use client';

import {useEffect, useState} from 'react';
import {Download} from 'lucide-react';
import {Button, type ButtonProps} from '@/components/ui/button';
import {requestPWAPromptOpen} from '@/hooks/use-pwa-install';

export function InstallPWAButton(props: ButtonProps) {
  const [canShowInstallUi, setCanShowInstallUi] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    setCanShowInstallUi(!isStandalone);
  }, []);

  if (!canShowInstallUi) {
    return null;
  }

  return (
    <Button
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        if (!event.defaultPrevented) {
          requestPWAPromptOpen();
        }
      }}
    >
      <Download className="mr-2 h-4 w-4" />
      Install App
    </Button>
  );
}
