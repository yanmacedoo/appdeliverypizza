import { useState, useEffect } from 'react';
import { X, Plus, Minus, ShoppingBag, User, Phone, MapPin, CreditCard, Store, ChevronDown, Percent, Slice, MessageSquare } from 'lucide-react';
import { useMenuStore } from '../../store/menuStore';
import { updateOrder } from '../../services/orderService';
import type { CartItem } from '../../store/cartStore';
import type { Order } from '../../types/order';
import type { Product } from '../../data/menu';
import { cn, sanitizeInput } from '../../lib/utils';

interface EditOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: Order;
}

type ViewMode = 'menu' | 'order';

export function EditOrderModal({ isOpen, onClose, order }: EditOrderModalProps) {
    const { categories } = useMenuStore();
    const [items, setItems] = useState<CartItem[]>([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isDelivery, setIsDelivery] = useState(false);
    const [customerAddress, setCustomerAddress] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Dinheiro');
    const [discount, setDiscount] = useState(0);
    const [saving, setSaving] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('order'); // Default to order view to see what's being edited
    const [splitMode, setSplitMode] = useState<'none' | 'half' | 'thirds'>('none');
    const [selectedFlavors, setSelectedFlavors] = useState<Product[]>([]);

    // Load order data when modal opens
    useEffect(() => {
        if (isOpen && order) {
            setItems(order.items || []);
            setCustomerName(order.customer.name || '');
            setCustomerPhone(order.customer.phone || '');
            const delivery = order.customer.address !== 'Retirada no Local';
            setIsDelivery(delivery);
            setCustomerAddress(delivery ? order.customer.address : '');
            setPaymentMethod(order.customer.paymentMethod || 'Dinheiro');
            
            // Calculate discount
            const diff = (order.subtotal + order.deliveryFee) - order.total;
            if (diff > 0 && order.subtotal > 0) {
                setDiscount(Math.round((diff / order.subtotal) * 100));
            } else {
                setDiscount(0);
            }
        }
    }, [isOpen, order]);

    if (!isOpen) return null;

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = isDelivery && subtotal < 100 ? 5 : 0;
    const discountValue = (subtotal * discount) / 100;
    const total = Math.max(0, subtotal + deliveryFee - discountValue);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    // Get only pizza categories for split mode
    const pizzaCategories = categories.filter(cat =>
        cat.items.some(item => item.type === 'pizza')
    );

    const addItem = (product: Product) => {
        if (splitMode !== 'none' && product.type === 'pizza') {
            const currentFlavors = [...selectedFlavors];
            const maxFlavors = splitMode === 'half' ? 2 : 3;

            if (currentFlavors.find(f => f.id === product.id)) return;

            currentFlavors.push(product);

            if (currentFlavors.length === maxFlavors) {
                const price = Math.max(...currentFlavors.map(f => f.price));

                let name = '';
                if (splitMode === 'half') {
                    name = `½ ${currentFlavors[0].name} + ½ ${currentFlavors[1].name}`;
                } else {
                    name = `⅓ ${currentFlavors[0].name} + ⅓ ${currentFlavors[1].name} + ⅓ ${currentFlavors[2].name}`;
                }

                setItems([...items, {
                    id: `split-${Date.now()}`,
                    productId: currentFlavors.map(f => f.id).join('-'),
                    name,
                    price,
                    quantity: 1,
                    type: 'pizza',
                    flavors: currentFlavors.map(f => f.name),
                    observation: ''
                }]);

                setSelectedFlavors([]);
                setSplitMode('none');
            } else {
                setSelectedFlavors(currentFlavors);
            }
            return;
        }

        const existing = items.find(i => i.productId === product.id && !i.flavors);
        if (existing) {
            setItems(items.map(i =>
                i.productId === product.id && !i.flavors
                    ? { ...i, quantity: i.quantity + 1 }
                    : i
            ));
        } else {
            setItems([...items, {
                id: `manual-${Date.now()}`,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                type: product.type,
                observation: ''
            }]);
        }
    };

    const removeItem = (itemId: string) => {
        const existing = items.find(i => i.id === itemId);
        if (existing && existing.quantity > 1) {
            setItems(items.map(i =>
                i.id === itemId
                    ? { ...i, quantity: i.quantity - 1 }
                    : i
            ));
        } else {
            setItems(items.filter(i => i.id !== itemId));
        }
    };

    const updateItemObservation = (itemId: string, obs: string) => {
        setItems(items.map(i =>
            i.id === itemId ? { ...i, observation: obs } : i
        ));
    };

    const getItemQuantity = (productId: string) => {
        return items.find(i => i.productId === productId && !i.flavors)?.quantity || 0;
    };

    const handleSubmit = async () => {
        if (!customerName.trim() || items.length === 0) {
            alert('Preencha o nome do cliente e adicione itens ao pedido');
            return;
        }

        if (isDelivery && !customerAddress.trim()) {
            alert('Preencha o endereço de entrega');
            return;
        }

        setSaving(true);
        try {
            await updateOrder(order.id!, {
                customer: {
                    name: sanitizeInput(customerName),
                    phone: sanitizeInput(customerPhone),
                    address: isDelivery ? sanitizeInput(customerAddress) : 'Retirada no Local',
                    paymentMethod,
                    changeFor: order.customer.changeFor || ''
                },
                items,
                subtotal,
                deliveryFee,
                total
            });
            onClose();
        } catch (error) {
            console.error('Erro ao editar pedido:', error);
            alert('Erro ao editar pedido');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="shrink-0 p-4 border-b border-white/10 bg-surface-light flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-text">Editar Pedido #{order.id?.slice(-4)}</h2>
                            <p className="text-xs text-text-muted">Alterar informações, itens e valores do pedido</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Cancel Split Mode Warning */}
                {splitMode !== 'none' && (
                    <div className="bg-primary/10 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Slice className="w-4 h-4 text-primary" />
                            <span className="text-sm text-text">
                                Selecione {splitMode === 'half' ? '2' : '3'} sabores
                                ({selectedFlavors.length}/{splitMode === 'half' ? '2' : '3'})
                            </span>
                        </div>
                        <button
                            onClick={() => {
                                setSplitMode('none');
                                setSelectedFlavors([]);
                            }}
                            className="text-xs text-primary hover:underline"
                        >
                            Cancelar
                        </button>
                    </div>
                )}

                {/* Mobile Tabs */}
                <div className="sm:hidden flex border-b border-white/10">
                    <button
                        onClick={() => setViewMode('menu')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors",
                            viewMode === 'menu'
                                ? "text-primary border-b-2 border-primary"
                                : "text-text-muted"
                        )}
                    >
                        Adicionar Itens
                    </button>
                    <button
                        onClick={() => setViewMode('order')}
                        className={cn(
                            "flex-1 py-3 text-sm font-medium transition-colors relative",
                            viewMode === 'order'
                                ? "text-primary border-b-2 border-primary"
                                : "text-text-muted"
                        )}
                    >
                        Dados do Pedido
                        {itemCount > 0 && (
                            <span className="absolute top-2 right-4 bg-primary text-background text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                {itemCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col sm:flex-row">
                    {/* Menu Items (Left side to add items) */}
                    <div className={cn(
                        "sm:w-1/2 sm:border-r border-white/10 overflow-y-auto p-3 sm:p-4 flex flex-col",
                        viewMode === 'order' && "hidden sm:flex"
                    )}>
                        {/* Split Pizza Toggles */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            <button
                                onClick={() => {
                                    if (splitMode === 'half') {
                                        setSplitMode('none');
                                        setSelectedFlavors([]);
                                    } else {
                                        setSplitMode('half');
                                        setSelectedFlavors([]);
                                    }
                                }}
                                className={cn(
                                    "p-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                    splitMode === 'half'
                                        ? "bg-primary text-background"
                                        : "bg-surface-light text-text-muted hover:text-text"
                                )}
                            >
                                <Slice className="w-4 h-4" />
                                Meio a Meio
                            </button>
                            <button
                                onClick={() => {
                                    if (splitMode === 'thirds') {
                                        setSplitMode('none');
                                        setSelectedFlavors([]);
                                    } else {
                                        setSplitMode('thirds');
                                        setSelectedFlavors([]);
                                    }
                                }}
                                className={cn(
                                    "p-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors",
                                    splitMode === 'thirds'
                                        ? "bg-primary text-background"
                                        : "bg-surface-light text-text-muted hover:text-text"
                                )}
                            >
                                <Slice className="w-4 h-4" />
                                3 Sabores
                            </button>
                        </div>

                        <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Adicionar Itens do Cardápio</h3>
                        <div className="space-y-1 sm:space-y-2 flex-1 overflow-y-auto">
                            {(splitMode !== 'none' ? pizzaCategories : categories).map(category => (
                                <div key={category.id} className="rounded-lg overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                                        className={cn(
                                            "w-full p-3 text-left transition-colors text-sm font-medium flex items-center justify-between",
                                            expandedCategory === category.id
                                                ? "bg-primary/20 text-primary"
                                                : "bg-surface-light text-text hover:bg-surface"
                                        )}
                                    >
                                        <span>{category.title}</span>
                                        <ChevronDown className={cn(
                                            "w-4 h-4 transition-transform",
                                            expandedCategory === category.id && "rotate-180"
                                        )} />
                                    </button>

                                    {expandedCategory === category.id && (
                                        <div className="bg-background p-2 space-y-1 max-h-[30vh] overflow-y-auto">
                                            {category.items
                                                .filter(p => splitMode === 'none' || p.type === 'pizza')
                                                .map(product => {
                                                    const qty = getItemQuantity(product.id);
                                                    const isSelected = selectedFlavors.some(f => f.id === product.id);
                                                    return (
                                                        <div
                                                            key={product.id}
                                                            className={cn(
                                                                "flex items-center justify-between p-2 rounded-lg transition-colors",
                                                                isSelected
                                                                    ? "bg-primary/30 ring-2 ring-primary"
                                                                    : qty > 0
                                                                        ? "bg-primary/10"
                                                                        : "hover:bg-surface-light"
                                                            )}
                                                        >
                                                            <div className="flex-1 min-w-0 pr-2">
                                                                <span className="text-sm text-text block truncate">{product.name}</span>
                                                                <span className="text-xs text-primary">R$ {product.price.toFixed(2).replace('.', ',')}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {splitMode === 'none' && qty > 0 && (
                                                                    <>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                const item = items.find(i => i.productId === product.id && !i.flavors);
                                                                                if (item) removeItem(item.id);
                                                                            }}
                                                                            className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center"
                                                                        >
                                                                            <Minus className="w-4 h-4" />
                                                                        </button>
                                                                        <span className="text-sm font-medium text-text w-6 text-center">{qty}</span>
                                                                    </>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => addItem(product)}
                                                                    disabled={isSelected}
                                                                    className={cn(
                                                                        "w-8 h-8 rounded-full flex items-center justify-center",
                                                                        isSelected
                                                                            ? "bg-gray-500/20 text-gray-500 cursor-not-allowed"
                                                                            : "bg-primary/20 text-primary hover:bg-primary/30"
                                                                    )}
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Details and Totals (Right side) */}
                    <div className={cn(
                        "sm:w-1/2 overflow-y-auto p-3 sm:p-4 flex flex-col",
                        viewMode === 'menu' && "hidden sm:flex"
                    )}>
                        {/* Selected Items */}
                        <div className="mb-4">
                            <h3 className="text-xs font-semibold text-text-muted uppercase mb-2">Itens Atuais do Pedido ({itemCount})</h3>
                            {items.length === 0 ? (
                                <p className="text-text-muted text-sm py-4 text-center bg-surface-light rounded-lg">Nenhum item selecionado</p>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {items.map(item => (
                                        <div key={item.id} className="bg-surface-light rounded-lg p-3 space-y-2 border border-white/5">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(item.id)}
                                                        className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 flex items-center justify-center shrink-0"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-sm font-semibold text-text truncate">{item.quantity}x {item.name}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-primary font-medium shrink-0">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => addItem({ id: item.productId, name: item.name, price: item.price, type: item.type } as any)}
                                                        className="w-6 h-6 rounded-full bg-primary/20 text-primary hover:bg-primary/30 flex items-center justify-center shrink-0"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Observation field for this item */}
                                            <div className="flex items-center gap-2 bg-background/50 border border-white/5 rounded-lg px-2 py-1">
                                                <MessageSquare className="w-3.5 h-3.5 text-text-muted shrink-0" />
                                                <input
                                                    type="text"
                                                    placeholder="Observação (ex: Sem cebola)"
                                                    value={item.observation || ''}
                                                    onChange={e => updateItemObservation(item.id, e.target.value)}
                                                    className="flex-1 bg-transparent border-none outline-none text-xs text-text p-0.5"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Customer Info */}
                        <div className="space-y-2 mb-4">
                            <h3 className="text-xs font-semibold text-text-muted uppercase">Informações do Cliente</h3>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-text-muted shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Nome"
                                        value={customerName}
                                        onChange={e => setCustomerName(e.target.value)}
                                        className="flex-1 bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm min-w-0"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-text-muted shrink-0" />
                                    <input
                                        type="tel"
                                        placeholder="Telefone"
                                        value={customerPhone}
                                        onChange={e => setCustomerPhone(e.target.value)}
                                        className="flex-1 bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm min-w-0"
                                    />
                                </div>
                            </div>

                            {/* Delivery Toggle */}
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsDelivery(false)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors",
                                        !isDelivery
                                            ? "bg-primary text-background"
                                            : "bg-surface-light text-text-muted"
                                    )}
                                >
                                    <Store className="w-4 h-4" />
                                    Retirada
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsDelivery(true)}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg text-sm font-medium transition-colors",
                                        isDelivery
                                            ? "bg-primary text-background"
                                            : "bg-surface-light text-text-muted"
                                    )}
                                >
                                    <MapPin className="w-4 h-4" />
                                    Entrega
                                </button>
                            </div>

                            {isDelivery && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                                    <input
                                        type="text"
                                        placeholder="Endereço de entrega"
                                        value={customerAddress}
                                        onChange={e => setCustomerAddress(e.target.value)}
                                        className="flex-1 bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm"
                                    />
                                </div>
                            )}

                            {/* Payment and Discount */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-4 h-4 text-text-muted shrink-0" />
                                    <select
                                        value={paymentMethod}
                                        onChange={e => setPaymentMethod(e.target.value)}
                                        className="flex-1 bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm min-w-0"
                                    >
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Crédito">Crédito</option>
                                        <option value="Débito">Débito</option>
                                        <option value="PIX">PIX</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Percent className="w-4 h-4 text-text-muted shrink-0" />
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Desconto %"
                                        value={discount || ''}
                                        onChange={e => setDiscount(Math.min(100, Math.max(0, Number(e.target.value))))}
                                        className="flex-1 bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm min-w-0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="mt-auto pt-3 border-t border-white/10">
                            <div className="space-y-1 mb-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-text-muted">Subtotal</span>
                                    <span className="text-text">R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                                </div>
                                {isDelivery && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Entrega</span>
                                        <span className={deliveryFee === 0 ? "text-green-500" : "text-text"}>
                                            {deliveryFee === 0 ? 'Grátis' : `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`}
                                        </span>
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-text-muted">Desconto ({discount}%)</span>
                                        <span className="text-green-500">-R$ {discountValue.toFixed(2).replace('.', ',')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold">
                                    <span className="text-text">Total</span>
                                    <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving || items.length === 0}
                                className="w-full py-3 bg-primary text-background rounded-xl font-semibold disabled:opacity-50 hover:bg-primary/90 transition-colors"
                            >
                                {saving ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Footer - Switch button to see details */}
                {viewMode === 'menu' && items.length > 0 && (
                    <div className="sm:hidden shrink-0 p-3 border-t border-white/10 bg-surface-light">
                        <button
                            type="button"
                            onClick={() => setViewMode('order')}
                            className="w-full py-3 bg-primary text-background rounded-xl font-semibold flex items-center justify-center gap-2"
                        >
                            Ver Dados do Pedido ({itemCount}) - R$ {total.toFixed(2).replace('.', ',')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
