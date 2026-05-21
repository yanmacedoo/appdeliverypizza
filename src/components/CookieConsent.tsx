import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';

export function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already accepted cookies
        const accepted = localStorage.getItem('cookieConsent');
        if (!accepted) {
            // Show with a small delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        setIsVisible(false);
        localStorage.setItem('cookieConsent', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-[slide-up_0.5s_ease-out]">
            <div className="max-w-6xl mx-auto">
                <div className="bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-text-muted text-center sm:text-left">
                        <p>
                            Este site utiliza cookies para garantir que você tenha a melhor experiência.{' '}
                            <Link to="/politica-de-privacidade" className="text-primary hover:underline">
                                Ler Política
                            </Link>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={handleAccept}
                            className="flex-1 sm:flex-none bg-primary text-background font-bold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm"
                        >
                            Aceitar
                        </button>
                        <button
                            onClick={() => setIsVisible(false)}
                            className="p-2 hover:bg-white/10 rounded-lg text-text-muted transition-colors sm:hidden"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
