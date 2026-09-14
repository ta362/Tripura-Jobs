import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone, CheckCircle, Share, Menu } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    setIsAndroid(/android/.test(userAgent));

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
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
          setDeferredPrompt(null);
          return;
        }
      } catch (err) {
        console.error('Install prompt error:', err);
      }
    }
    
    // If prompt is not captured (or iframe / browser restriction), show comprehensive install guide modal
    setShowGuide(true);
  };

  if (isInstalled || dismissed) {
    return null;
  }

  return (
    <>
      {/* Floating Install Prompt Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-md z-50 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white">Install Tripura Jobs App</h4>
            <p className="text-xs text-slate-300">Instant access & alerts on your home screen!</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center space-x-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Comprehensive Install Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white text-slate-900 p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold">Install Tripura Jobs App</h3>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm text-slate-700">
              {isIOS ? (
                <div className="space-y-3">
                  <p className="font-medium text-slate-800">For iPhone / iPad (Safari):</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">1</span>
                      <span>Tap the <strong>Share</strong> button <Share className="w-4 h-4 inline text-blue-600 mx-1" /> at the bottom of Safari.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">2</span>
                      <span>Scroll down and tap <strong>"Add to Home Screen"</strong> ➕.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">3</span>
                      <span>Tap <strong>Add</strong> at the top right corner. Done!</span>
                    </div>
                  </div>
                </div>
              ) : isAndroid ? (
                <div className="space-y-3">
                  <p className="font-medium text-slate-800">For Android (Chrome / Brave / Edge):</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">1</span>
                      <span>Tap the browser menu icon (three dots <Menu className="w-4 h-4 inline font-bold mx-1" />) at the top right.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">2</span>
                      <span>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">3</span>
                      <span>Confirm by tapping <strong>Install</strong>. The app icon will appear on your phone!</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-slate-800">For Desktop / Laptop (Chrome / Edge / Firefox):</p>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">1</span>
                      <span>Look at the right side of your browser address bar for the <strong>Install</strong> icon (<Download className="w-4 h-4 inline text-emerald-600 mx-1" />) or browser menu (<Menu className="w-4 h-4 inline mx-1" />).</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">2</span>
                      <span>Click <strong>"Install Tripura Jobs App"</strong>.</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2 text-xs text-emerald-900">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Installing enables lightning-fast startup, offline access, and instant notification alerts for all Tripura govt jobs!</span>
              </div>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="mt-6 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm transition-all shadow-md cursor-pointer"
            >
              Got it, Thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
