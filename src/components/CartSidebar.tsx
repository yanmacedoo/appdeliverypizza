import { X, Trash2, ShoppingBag, Truck } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const subtotal = useCartStore((state) => state.getSubtotal());
    const deliveryFee = useCartStore((state) => state.getDeliveryFee());
    const total = useCartStore((state) => state.getTotal());

    const isFreeDelivery = deliveryFee === 0;
    const amountToFreeDelivery = 100 - subtotal;

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] transition-all duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-full max-w-md bg-surface z-[80] shadow-2xl transition-transform duration-300 flex flex-col border-l border-white/5",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-background">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-text text-lg">Seu Pedido</h2>
                            <p className="text-xs text-text-muted">{items.length} {items.length === 1 ? 'item' : 'itens'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Free Delivery Progress */}
                {!isFreeDelivery && items.length > 0 && (
                    <div className="p-4 bg-surface-light border-b border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <Truck className="w-4 h-4 text-accent" />
                            <span className="text-sm text-text">
                                Faltam <span className="font-bold text-primary">R$ {amountToFreeDelivery.toFixed(2).replace('.', ',')}</span> para entrega grátis!
                            </span>
                        </div>
                        <div className="h-2 bg-background rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500"
                                style={{ width: `${Math.min((subtotal / 100) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Items */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4">
                            <div className="p-6 bg-surface-light rounded-full">
                                <ShoppingBag className="w-12 h-12 opacity-50" />
                            </div>
                            <p className="text-lg font-medium">Carrinho vazio</p>
                            <p className="text-sm text-center opacity-70">Adicione deliciosas pizzas ao seu pedido!</p>
                        </div>
                    ) : (
                        items.map((item, index) => (
                            <div
                                key={item.id}
                                className="glass-card p-4 flex gap-3"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'slide-up 0.3s ease-out forwards'
                                }}
                            >
                                <div className="flex-1">
                                    <h4 className="text-text font-semibold text-sm leading-tight">{item.name}</h4>
                                    {item.observation && (
                                        <p className="text-xs text-text-muted mt-1 bg-background px-2 py-1 rounded inline-block">
                                            {item.observation}
                                        </p>
                                    )}
                                    <div className="text-primary font-bold text-base mt-2">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="text-text-muted hover:text-secondary transition-colors self-start p-2 hover:bg-secondary/10 rounded-lg"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-5 bg-background border-t border-white/10 space-y-4">
                        {/* Free delivery badge */}
                        {isFreeDelivery && (
                            <div className="flex items-center justify-center gap-2 bg-success/20 text-success py-2 rounded-lg animate-[glow-pulse_2s_ease-in-out_infinite]">
                                <Truck className="w-4 h-4" />
                                <span className="text-sm font-semibold">Entrega GRÁTIS!</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-text-muted">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            <div className="flex justify-between text-sm text-text-muted">
                                <span>Entrega</span>
                                <span className={isFreeDelivery ? "text-success font-semibold" : ""}>
                                    {isFreeDelivery ? "GRÁTIS" : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-xl font-bold text-text pt-3 border-t border-white/10">
                                <span>Total</span>
                                <span className="text-primary text-glow">R$ {total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        <button
                            onClick={onCheckout}
                            className="w-full btn-fire py-4 text-lg font-bold"
                        >
                            Finalizar Pedido
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
