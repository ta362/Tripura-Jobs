import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsInstalled(isStandalone);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(iosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (!deferredPrompt) {
      // If prompt not captured yet, give instructions or test mode prompt
      setShowIOSGuide(true);
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Install Prompt Banner / Popup */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 animate-bounce-subtle backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white">Install Tripura Jobs App</h4>
            <p className="text-xs text-slate-300">Open instantly from your home screen anytime!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS or Browser Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Install App to Phone</h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              {isIOS ? (
                <>
                  <p>To install this app on your iPhone or iPad:</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-medium">
                    <p>1. Tap the <strong>Share</strong> button <span className="inline-block px-1.5 py-0.5 bg-slate-200 rounded">⎋</span> in Safari.</p>
                    <p>2. Scroll down and tap <strong>Add to Home Screen</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-200 rounded">➕</span>.</p>
                  </div>
                </>
              ) : (
                <>
                  <p>You can install this app for quick offline access and instant notifications:</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs font-medium">
                    <p>• <strong>Chrome / Edge / Brave:</strong> Tap the menu (three dots <span className="font-bold">⋮</span>) at the top right and select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</p>
                    <p>• <strong>Firefox:</strong> Tap menu and select <strong>"Install"</strong>.</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 text-sm transition-all"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
