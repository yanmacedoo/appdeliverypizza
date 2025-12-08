import { X } from 'lucide-react';
import { type Product } from '../data/menu';
import { PizzaBuilder } from './PizzaBuilder';
import { useCartStore } from '../store/cartStore';

interface PizzaModalProps {
    product?: Product | null; // Optional - can open builder without pre-selected flavor
    isOpen: boolean;
    onClose: () => void;
}

export function PizzaModal({ product, isOpen, onClose }: PizzaModalProps) {
    if (!isOpen) return null;

    const addItem = useCartStore((state) => state.addItem);

    // Determine if this is for pizza building or drink
    const isPizzaMode = !product || product.type === 'pizza';

    // Handle drinks (non-pizza items) - simple add to cart
    const handleAddDrink = () => {
        if (!product) return;
        addItem({
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: 1,
            type: 'drink',
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface w-full sm:max-w-3xl sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden animate-[slide-up_0.3s_ease-out] max-h-[95vh] sm:max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="relative shrink-0 p-4 sm:p-6 border-b border-white/10 bg-gradient-to-b from-surface-light to-surface">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold text-text">
                                {isPizzaMode ? 'Monte sua Pizza' : product?.name}
                            </h2>
                            {!isPizzaMode && product?.description && (
                                <p className="text-text-muted text-sm mt-1">{product.description}</p>
                            )}
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="bg-surface-light p-2 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors shrink-0"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    {isPizzaMode ? (
                        <PizzaBuilder
                            initialFlavor={product?.type === 'pizza' && product?.id !== '__builder__' ? product : undefined}
                            onClose={onClose}
                        />
                    ) : (
                        /* Drink view */
                        product && (
                            <div className="flex flex-col items-center text-center">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-48 h-48 object-cover rounded-xl mb-6"
                                />
                                <p className="text-text-muted mb-6">
                                    Bebida gelada para acompanhar sua pizza!
                                </p>

                                <div className="flex items-center justify-between w-full max-w-xs">
                                    <span className="text-2xl font-bold text-primary text-glow">
                                        R$ {product.price.toFixed(2).replace('.', ',')}
                                    </span>
                                    <button
                                        onClick={handleAddDrink}
                                        className="btn-fire py-3 px-6"
                                    >
                                        Adicionar
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
