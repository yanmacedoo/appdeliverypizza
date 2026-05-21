import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

interface HeaderProps {
    onOpenCart: () => void;
}

export function Header({ onOpenCart }: HeaderProps) {
    const items = useCartStore((state) => state.items);
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <header className="fixed top-0 left-0 w-full z-50">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-white/5" />

            <div className="relative max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <img
                        src="/images/logo.png"
                        alt="Fome de Pizza"
                        className="w-10 h-10 object-contain brightness-0 invert sepia saturate-[10] hue-rotate-[5deg]"
                    />
                    <div className="font-display text-2xl tracking-wider">
                        <span className="text-text">FOME DE </span>
                        <span className="text-primary text-glow">PIZZA</span>
                    </div>
                </div>

                {/* Cart Button */}
                <button
                    onClick={onOpenCart}
                    className="relative group"
                >
                    <div className={`
            p-3 rounded-xl transition-all duration-300
            ${itemCount > 0
                            ? 'bg-gradient-to-br from-accent to-secondary fire-glow'
                            : 'bg-surface-light hover:bg-surface border border-white/10'
                        }
          `}>
                        <ShoppingCart className="w-5 h-5 text-white" />
                    </div>

                    {itemCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-primary text-background font-bold text-xs w-6 h-6 flex items-center justify-center rounded-full animate-[bounce_0.5s_ease-out]">
                            {itemCount}
                        </span>
                    )}
                </button>
            </div>
        </header>
    );
}
