import { useState, useEffect } from 'react';
import { X, Smartphone, Share } from 'lucide-react';

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [showIOSInstructions, setShowIOSInstructions] = useState(false);

    useEffect(() => {
        // Check if already in standalone mode (installed as PWA)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
            || (window.navigator as any).standalone 
            || document.referrer.includes('android-app://');

        if (isStandalone) return;

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIOSDevice);

        // Check if user dismissed it recently (within 3 days)
        const dismissedTime = localStorage.getItem('pwa_prompt_dismissed');
        if (dismissedTime) {
            const now = new Date().getTime();
            const threeDays = 3 * 24 * 60 * 60 * 1000;
            if (now - Number(dismissedTime) < threeDays) {
                return;
            }
        }

        // Handler for Android / Chrome PWA install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Show prompt for non-iOS devices that support the installation prompt
            if (!isIOSDevice) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // For iOS devices, we show our custom guide banner because iOS doesn't support 'beforeinstallprompt'
        if (isIOSDevice) {
            // Wait 3 seconds to show iOS banner so it's not too intrusive on load
            const timer = setTimeout(() => {
                setShowPrompt(true);
            }, 3000);
            return () => {
                window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
                clearTimeout(timer);
            };
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isIOS]);

    const handleInstallClick = async () => {
        if (isIOS) {
            setShowIOSInstructions(true);
            return;
        }

        if (!deferredPrompt) return;

        // Show native prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to install prompt: ${outcome}`);

        // Reset state
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', new Date().getTime().toString());
    };

    if (!showPrompt) return null;

    return (
        <>
            {/* Install Banner (Mobile First) */}
            <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
                <div className="bg-surface/95 backdrop-blur border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                            <img src="/images/logo-hero.png" alt="App Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-text">Instale nosso Aplicativo</h4>
                            <p className="text-xs text-text-muted">Faça seus pedidos muito mais rápido!</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInstallClick}
                            className="bg-primary text-background font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-primary-hover transition-colors whitespace-nowrap"
                        >
                            {isIOS ? 'Como Instalar' : 'Instalar'}
                        </button>
                        <button
                            onClick={handleDismiss}
                            className="p-1 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* iOS Step-by-Step Instructions Modal */}
            {showIOSInstructions && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface w-full max-w-sm rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-surface-light">
                            <div className="flex items-center gap-2">
                                <Smartphone className="w-5 h-5 text-primary" />
                                <span className="font-bold text-text">Instalar no iPhone</span>
                            </div>
                            <button
                                onClick={() => setShowIOSInstructions(false)}
                                className="p-1 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Steps */}
                        <div className="p-5 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                                    1
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-text font-medium">Abra no navegador Safari</p>
                                    <p className="text-xs text-text-muted">Certifique-se de que está usando o Safari para adicionar à tela inicial.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                                    2
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-text font-medium flex items-center gap-1.5 flex-wrap">
                                        Toque no botão Compartilhar
                                        <span className="inline-flex items-center justify-center bg-white/5 border border-white/10 rounded p-1">
                                            <Share className="w-3.5 h-3.5 text-blue-400" />
                                        </span>
                                    </p>
                                    <p className="text-xs text-text-muted">Fica no rodapé do Safari no iPhone ou no topo no iPad.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                                    3
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm text-text font-medium flex items-center gap-1.5 flex-wrap">
                                        Selecione adicionar
                                        <span className="text-xs font-semibold text-text bg-white/5 border border-white/10 rounded px-1.5 py-0.5">
                                            "Adicionar à Tela de Início"
                                        </span>
                                    </p>
                                    <p className="text-xs text-text-muted">Role o menu para baixo até encontrar a opção com o ícone de mais <span className="inline-block text-primary font-bold bg-primary/10 rounded-sm px-1">+</span>.</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-surface-light border-t border-white/10 text-center">
                            <button
                                onClick={() => {
                                    setShowIOSInstructions(false);
                                    setShowPrompt(false); // also hide prompt banner after view
                                    localStorage.setItem('pwa_prompt_dismissed', new Date().getTime().toString());
                                }}
                                className="w-full py-2.5 bg-primary text-background font-bold rounded-xl hover:bg-primary-hover transition-colors text-sm"
                            >
                                Entendido!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
