import { useState } from 'react';
import { X, Trash2, ShoppingBag, Truck, MessageSquarePlus, Check, Ticket } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { cn, sanitizeInput } from '../lib/utils';

interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onCheckout: () => void;
}

export function CartSidebar({ isOpen, onClose, onCheckout }: CartSidebarProps) {
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateItemObservation = useCartStore((state) => state.updateItemObservation);
    const subtotal = useCartStore((state) => state.getSubtotal());
    const deliveryFee = useCartStore((state) => state.getDeliveryFee());
    const total = useCartStore((state) => state.getTotal());
    const appliedCoupon = useCartStore((state) => state.appliedCoupon);
    const applyCoupon = useCartStore((state) => state.applyCoupon);
    const discountAmount = useCartStore((state) => state.getDiscountAmount());

    const [editingItemId, setEditingItemId] = useState<string | null>(null);
    const [editingNote, setEditingNote] = useState('');

    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [couponError, setCouponError] = useState('');
    const [applying, setApplying] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCodeInput.trim()) return;
        setApplying(true);
        setCouponError('');
        try {
            const { checkCoupon } = await import('../services/couponService');
            const coupon = await checkCoupon(couponCodeInput);
            if (!coupon) {
                setCouponError('Cupom inválido ou inativo');
                return;
            }

            if (subtotal < (coupon.minOrderValue || 0)) {
                setCouponError(`Valor mínimo do pedido para este cupom é R$ ${coupon.minOrderValue?.toFixed(2).replace('.', ',')}`);
                return;
            }

            applyCoupon({
                code: coupon.code,
                type: coupon.type,
                value: coupon.value,
                minOrderValue: coupon.minOrderValue || 0
            });
            setCouponCodeInput('');
        } catch (error) {
            console.error('Erro ao aplicar cupom:', error);
            setCouponError('Erro ao aplicar cupom');
        } finally {
            setApplying(false);
        }
    };

    const handleRemoveCoupon = () => {
        applyCoupon(null);
        setCouponCodeInput('');
        setCouponError('');
    };

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
                                className="glass-card p-4 mx-1"
                                style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'slide-up 0.3s ease-out forwards'
                                }}
                            >
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <h4 className="text-text font-semibold text-sm leading-tight">{item.name}</h4>
                                        {item.observation && editingItemId !== item.id && (
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

                                {editingItemId === item.id ? (
                                    <div className="flex gap-2 items-center mt-3 animate-in fade-in slide-in-from-top-2">
                                        <input
                                            type="text"
                                            value={editingNote}
                                            onChange={(e) => setEditingNote(e.target.value)}
                                            placeholder="Ex: Sem cebola, cortar em 8..."
                                            className="flex-1 bg-background/50 border border-white/10 rounded px-2 py-1.5 text-sm text-text focus:outline-none focus:border-primary/50 focus:bg-background transition-colors"
                                            autoFocus
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    updateItemObservation(item.id, sanitizeInput(editingNote));
                                                    setEditingItemId(null);
                                                }
                                            }}
                                        />
                                        <button
                                            onClick={() => {
                                                updateItemObservation(item.id, sanitizeInput(editingNote));
                                                setEditingItemId(null);
                                            }}
                                            className="p-1.5 bg-primary/20 text-primary rounded hover:bg-primary/30 transition-colors"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingItemId(item.id);
                                            setEditingNote(item.observation || '');
                                        }}
                                        className="text-xs text-primary/80 hover:text-primary flex items-center gap-1.5 mt-2 transition-colors"
                                    >
                                        <MessageSquarePlus className="w-3.5 h-3.5" />
                                        {item.observation ? 'Editar observação' : 'Adicionar observação'}
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="p-5 bg-background border-t border-white/10 space-y-4">
                        {isFreeDelivery && (
                            <div className="flex items-center justify-center gap-2 bg-success/20 text-success py-2 rounded-lg animate-[glow-pulse_2s_ease-in-out_infinite]">
                                <Truck className="w-4 h-4" />
                                <span className="text-sm font-semibold">Entrega GRÁTIS!</span>
                            </div>
                        )}

                        {/* Campo de Cupom */}
                        <div className="border-b border-white/5 pb-3">
                            {appliedCoupon ? (
                                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-sm animate-in zoom-in-95 duration-200">
                                    <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1.5 uppercase">
                                        <Ticket className="w-3.5 h-3.5" />
                                        {appliedCoupon.code}
                                    </span>
                                    <button
                                        onClick={handleRemoveCoupon}
                                        className="text-xs text-red-400 hover:text-red-300 font-semibold transition-colors"
                                    >
                                        Remover
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Cupom de desconto"
                                            value={couponCodeInput}
                                            onChange={e => {
                                                setCouponCodeInput(e.target.value.toUpperCase());
                                                setCouponError('');
                                            }}
                                            className="flex-1 bg-surface-light border border-white/10 rounded-xl px-3 py-2 text-text text-sm uppercase focus:outline-none focus:border-primary/50"
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') handleApplyCoupon();
                                            }}
                                        />
                                        <button
                                            onClick={handleApplyCoupon}
                                            disabled={applying || !couponCodeInput.trim()}
                                            className="px-4 py-2 bg-primary text-background font-bold rounded-xl text-sm hover:bg-primary-hover transition-colors disabled:opacity-50 animate-in fade-in"
                                        >
                                            {applying ? '...' : 'Aplicar'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p className="text-xs text-red-400 pl-1">{couponError}</p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-text-muted">
                                <span>Subtotal</span>
                                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-400 font-medium">
                                    <span>Desconto ({appliedCoupon?.code})</span>
                                    <span>- R$ {discountAmount.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
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

                        <p className="text-center text-[10px] text-text-muted mt-2 flex items-center justify-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                            Desenvolvido por{' '}
                            <a
                                href="https://nuscorre.com.br"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                            >
                                <img src="/nuscorre-logo.png" alt="Nuscorre" className="h-3 w-auto" />
                            </a>
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
