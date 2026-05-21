import { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';
import type { Product } from '../data/menu';

interface DrinkModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

const drinkOptions = [
    { id: 'coca', name: 'Coca-Cola', icon: '🥤', available: true },
    { id: 'coca-zero', name: 'Coca-Cola Zero', icon: '🥤', available: true },
    { id: 'guarana', name: 'Guaraná Antarctica', icon: '🥤', available: true },
    { id: 'guarana-zero', name: 'Guaraná Antarctica Zero', icon: '🥤', available: true },
    { id: 'pepsi', name: 'Pepsi', icon: '🥤', available: true },
    { id: 'pepsi-zero', name: 'Pepsi Zero', icon: '🥤', available: true },
];

export function DrinkModal({ product, isOpen, onClose }: DrinkModalProps) {
    const [selectedDrink, setSelectedDrink] = useState<string | null>(null);
    const { addItem } = useCartStore();

    if (!isOpen) return null;

    const handleAddToCart = () => {
        if (!selectedDrink) return;

        const optionsList = product.options && product.options.length > 0 ? product.options : drinkOptions;
        const selectedOption = optionsList.find(d => d.id === selectedDrink);

        addItem({
            productId: product.id,
            name: `${product.name} - ${selectedOption?.name}`,
            price: product.price,
            quantity: 1,
            type: 'drink',
        });

        setSelectedDrink(null);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
                onClick={handleBackdropClick}
            />

            {/* Modal */}
            <div
                className="relative bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl animate-[slide-up_0.3s_ease-out] max-h-[75dvh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text">{product.name}</h2>
                        <p className="text-sm text-text-muted">Escolha o sabor</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Drink Options - Scrollable */}
                <div className="p-5 space-y-3 overflow-y-auto flex-1">
                    {/* If product has options defined in menu.ts, use them. Otherwise fallback to hardcoded (legacy support) */}
                    {(product.options && product.options.length > 0 ? product.options : drinkOptions)
                        .filter(drink => drink.available !== false) // Filter out unavailable options
                        .map((drink) => (
                            <button
                                key={drink.id}
                                onClick={() => setSelectedDrink(drink.id)}
                                className={cn(
                                    "w-full p-4 rounded-xl border-2 transition-all duration-300 flex items-center justify-between",
                                    selectedDrink === drink.id
                                        ? "border-primary bg-primary/10"
                                        : "border-white/10 bg-background hover:border-white/20"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">🥤</span>
                                    <span className={cn(
                                        "font-medium",
                                        selectedDrink === drink.id ? "text-primary" : "text-text"
                                    )}>
                                        {drink.name}
                                    </span>
                                </div>
                                {selectedDrink === drink.id && (
                                    <Check className="w-5 h-5 text-primary" />
                                )}
                            </button>
                        ))}
                </div>

                {/* Price and Add Button - Fixed at bottom */}
                <div className="p-5 border-t border-white/10 bg-background flex-shrink-0" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-text-muted">Valor:</span>
                        <span className="text-2xl font-bold text-primary">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedDrink}
                        className="w-full btn-fire py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Adicionar ao Carrinho
                    </button>
                </div>
            </div>
        </div>
    );
}
