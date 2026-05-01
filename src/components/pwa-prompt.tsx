'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {Button} from '@/components/ui/button';
import {Download, Rocket, ShieldCheck, Smartphone, Wifi} from 'lucide-react';
import {usePWAInstall} from '@/hooks/use-pwa-install';

export function PWAPrompt() {
  const {
    open,
    setOpen,
    dismiss,
    install,
    isIos,
    isInstallable,
    canShowInstallUi,
  } = usePWAInstall();

  if (!canShowInstallUi) {
    return null;
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen && open) {
      void dismiss();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="overflow-hidden border-white/10 bg-[#07111b] p-0 text-white shadow-[0_32px_120px_rgba(1,6,18,0.7)] sm:max-w-[34rem] sm:rounded-[28px]">
        <div className="relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(104,213,255,0.24),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(53,100,255,0.24),transparent_42%)]" />
          <div className="relative p-6 sm:p-7">
            <DialogHeader className="text-left">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-sky-200 shadow-inner shadow-white/10">
                <Download className="h-5 w-5" />
              </div>
              <DialogTitle className="text-2xl font-semibold tracking-tight text-white">
                Install SOHAM
              </DialogTitle>
              <DialogDescription className="max-w-md text-sm leading-6 text-slate-300">
                Turn SOHAM into an app on your phone or desktop for faster launch, cleaner navigation, and an always-ready chat workspace.
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Rocket className="mb-2 h-4 w-4 text-sky-200" />
                <p className="text-sm font-medium text-white">Quick launch</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Open from your home screen without browser clutter.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Wifi className="mb-2 h-4 w-4 text-sky-200" />
                <p className="text-sm font-medium text-white">Offline shell</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Keep the app shell available even when the network is unstable.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mb-2 h-4 w-4 text-sky-200" />
                <p className="text-sm font-medium text-white">Better focus</p>
                <p className="mt-1 text-xs leading-5 text-slate-300">Use SOHAM like a dedicated tool instead of a browser tab.</p>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-sky-200" />
                <p className="text-sm font-medium text-white">How it works</p>
              </div>
              {isIos ? (
                <ol className="space-y-2 text-sm leading-6 text-slate-300">
                  <li>1. Open SOHAM in Safari.</li>
                  <li>2. Tap the Share button.</li>
                  <li>3. Choose <span className="font-medium text-white">Add to Home Screen</span>.</li>
                </ol>
              ) : isInstallable ? (
                <ol className="space-y-2 text-sm leading-6 text-slate-300">
                  <li>1. Press <span className="font-medium text-white">Install app</span>.</li>
                  <li>2. Accept the browser install prompt.</li>
                  <li>3. Launch SOHAM from your home screen or app launcher.</li>
                </ol>
              ) : (
                <ol className="space-y-2 text-sm leading-6 text-slate-300">
                  <li>1. Open SOHAM in a supported browser.</li>
                  <li>2. Use the browser install option from the address bar or app menu.</li>
                  <li>3. Return here if you need install guidance again.</li>
                </ol>
              )}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="ghost"
                onClick={() => void dismiss()}
                className="border border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white"
              >
                Remind me later
              </Button>
              {!isIos && isInstallable ? (
                <Button
                  onClick={() => void install()}
                  className="bg-[linear-gradient(135deg,#68d5ff,#5b8cff)] text-slate-950 hover:opacity-95"
                >
                  Install app
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
