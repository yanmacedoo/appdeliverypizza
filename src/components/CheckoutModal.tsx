import { useState, memo } from 'react';
import { X, Send, CreditCard, Banknote, QrCode, Loader2, Truck, Store, Copy, Check, Wallet } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../services/orderService';
import { cn, sanitizeInput, formatPhone } from '../lib/utils';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const paymentMethods = [
    { id: 'pix', label: 'Pix', icon: QrCode },
    { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { id: 'cartao', label: 'Cartão (Maquininha)', icon: CreditCard },
    { id: 'stripe', label: 'Cartão Online', icon: CreditCard },
    { id: 'cartao_dinheiro', label: 'Cartão e Dinheiro', icon: Wallet },
];

export const CheckoutModal = memo(function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    // Hooks must always execute to persist state
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [street, setStreet] = useState('');
    const [number, setNumber] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [reference, setReference] = useState('');
    const [payment, setPayment] = useState('pix');
    const [isPickup, setIsPickup] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [changeFor, setChangeFor] = useState('');
    const [pixCopied, setPixCopied] = useState(false);

    const PIX_KEY = '53155944000102';
    const PIX_NAME = 'Rafael De Jesus Fonseca';

    const NEIGHBORHOODS = [
        { name: 'Alto da Bela Vista', fee: 6 },
        { name: 'Barrigudo', fee: 6 },
        { name: 'Centro', fee: 6 },
        { name: 'Compensado', fee: 6 },
        { name: 'Índios', fee: 6 },
        { name: 'Itajaí', fee: 10 },
        { name: 'Jaqueiral', fee: 6 },
        { name: 'Luiz', fee: 6 },
        { name: 'Malvinas', fee: 6 },
        { name: 'Novo Tempo', fee: 10 },
        { name: 'Odebrecht', fee: 6 },
        { name: 'Pedreiras', fee: 6 },
        { name: 'Piaçaba', fee: 6 },
        { name: 'Pina', fee: 6 },
        { name: 'Poeirão', fee: 10 },
        { name: 'Ponte da Saici', fee: 6 },
        { name: 'Porto Falso', fee: 6 },
        { name: 'Prainha 1', fee: 6 },
        { name: 'Prainha 2', fee: 6 },
        { name: 'Vila de Santo André', fee: 6 },
    ];

    const { items, clearCart, appliedCoupon, getDiscountAmount, getTotal } = useCartStore();

    const getSubtotal = () => {
        return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    };

    const getDeliveryFee = () => {
        if (isPickup) return 0;
        if (getSubtotal() >= 100) return 0; // Free shipping for orders >= 100
        const selectedNeighborhood = NEIGHBORHOODS.find(n => n.name === neighborhood);
        return selectedNeighborhood ? selectedNeighborhood.fee : 0;
    };

    const handleFinish = async (e: React.MouseEvent) => {
        e.preventDefault();

        if (!name.trim() || (!isPickup && (!street.trim() || !number.trim() || !neighborhood.trim()))) {
            setError(isPickup ? "Por favor preencha seu nome." : "Por favor preencha todos os dados do endereço.");
            return;
        }

        setError('');

        const selectedPayment = paymentMethods.find(p => p.id === payment)?.label || payment;

        // Copy values before clearing cart
        const orderItems = [...items];
        const orderSubtotal = getSubtotal();
        const orderDeliveryFee = getDeliveryFee();
        const orderDiscount = getDiscountAmount();
        const orderTotal = Math.max(0, orderSubtotal - orderDiscount) + orderDeliveryFee;

        if (payment === 'stripe') {
            setError('');
            const functionUrl = 'https://criarsessaostripe-32qjwk2hla-uc.a.run.app';

            const fullAddress = isPickup
                ? 'RETIRADA NO LOCAL'
                : `${sanitizeInput(street.trim())}, ${sanitizeInput(number.trim())}, ${neighborhood}. Ref: ${sanitizeInput(reference.trim())}`;

            try {
                setSaving(true);
                // 1. Criar pedido com status pendente e isPaid = false
                const pedidoId = await createOrder({
                    customer: {
                        name: sanitizeInput(name.trim()),
                        phone: sanitizeInput(phone.trim()),
                        address: fullAddress,
                        paymentMethod: 'Cartão de Crédito Online (Stripe)',
                        changeFor: '',
                    },
                    items: orderItems,
                    subtotal: orderSubtotal,
                    deliveryFee: orderDeliveryFee,
                    discount: orderDiscount,
                    couponCode: appliedCoupon ? appliedCoupon.code : null,
                    total: orderTotal,
                });

                // 2. Chamar Cloud Function para gerar link da Stripe
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        pedidoId,
                        items: orderItems,
                        deliveryFee: orderDeliveryFee,
                        discount: orderDiscount,
                        total: orderTotal
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || 'Falha ao iniciar pagamento do Stripe');
                }

                const data = await response.json();
                
                // Limpa carrinho e redireciona para a Stripe
                clearCart();
                onClose();
                window.location.href = data.url;
                return;
            } catch (err: any) {
                console.error('Erro ao redirecionar para a Stripe:', err);
                setError(err.message || 'Erro ao iniciar pagamento. Tente novamente ou use outra forma de pagamento.');
                setSaving(false);
                return;
            }
        }

        // Build WhatsApp message
        let msg = `*Olá, Fome de Pizza! Gostaria de fazer um pedido:*\n\n`;

        orderItems.forEach(item => {
            msg += `• *${item.name}*\n`;
            if (item.observation) msg += `  _Obs: ${item.observation}_\n`;
            msg += `  R$ ${item.price.toFixed(2).replace('.', ',')}\n\n`;
        });

        msg += `----------------------------\n`;
        msg += `Subtotal: R$ ${orderSubtotal.toFixed(2).replace('.', ',')}\n`;
        if (orderDiscount > 0) {
            msg += `Desconto (${appliedCoupon?.code}): - R$ ${orderDiscount.toFixed(2).replace('.', ',')}\n`;
        }
        if (isPickup) {
            msg += `*🏪 RETIRADA NO LOCAL*\n`;
        } else {
            msg += `Entrega (${neighborhood}): ${orderDeliveryFee === 0 ? 'GRÁTIS' : `R$ ${orderDeliveryFee.toFixed(2).replace('.', ',')}`}\n`;
        }
        msg += `*TOTAL: R$ ${orderTotal.toFixed(2).replace('.', ',')}*\n`;
        msg += `----------------------------\n\n`;

        msg += `*Cliente:* ${name}\n`;
        if (isPickup) {
            msg += `*Modalidade:* 🏪 Retirada no Local\n`;
        } else {
            const fullAddress = `${street}, ${number}, ${neighborhood}. Ref: ${reference}`;
            msg += `*Endereço:* ${fullAddress}\n`;
        }
        if (phone.trim()) msg += `*Telefone:* ${phone}\n`;
        msg += `*Pagamento:* ${selectedPayment}`;
        if ((payment === 'dinheiro' || payment === 'cartao_dinheiro') && changeFor.trim()) {
            msg += `\n*Troco para:* R$ ${changeFor}`;
        }

        const encodedMsg = encodeURIComponent(msg);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=5573982563570&text=${encodedMsg}`;

        // Save to Firebase in background (non-blocking)
        const fullAddress = isPickup
            ? 'RETIRADA NO LOCAL'
            : `${sanitizeInput(street.trim())}, ${sanitizeInput(number.trim())}, ${neighborhood}. Ref: ${sanitizeInput(reference.trim())}`;

        createOrder({
            customer: {
                name: sanitizeInput(name.trim()),
                phone: sanitizeInput(phone.trim()),
                address: fullAddress,
                paymentMethod: selectedPayment,
                changeFor: (payment === 'dinheiro' || payment === 'cartao_dinheiro') && changeFor.trim() ? sanitizeInput(changeFor.trim()) : '',
            },
            items: orderItems,
            subtotal: orderSubtotal,
            deliveryFee: orderDeliveryFee,
            discount: orderDiscount,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
            total: orderTotal,
        }).then((id) => console.log('✅ Firebase OK:', id)).catch((err) => console.error('❌ Firebase:', err));

        // Clear cart and redirect IMMEDIATELY (no popup)
        clearCart();
        onClose();
        window.location.href = whatsappUrl;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal - removed animation to fix iOS input focus bug */}
            <div className="relative bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text">{isPickup ? 'Dados para Retirada' : 'Dados da Entrega'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                    {/* Delivery/Pickup Toggle */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className={cn(
                                "p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2",
                                !isPickup
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-white/10 bg-background text-text-muted hover:border-white/20"
                            )}
                            onClick={() => setIsPickup(false)}
                        >
                            <Truck className="w-5 h-5" />
                            <span className="text-sm font-medium">Entrega</span>
                        </button>
                        <button
                            type="button"
                            className={cn(
                                "p-3 rounded-xl border-2 transition-all duration-300 flex items-center justify-center gap-2",
                                isPickup
                                    ? "border-primary bg-primary/10 text-primary"
                                    : "border-white/10 bg-background text-text-muted hover:border-white/20"
                            )}
                            onClick={() => setIsPickup(true)}
                        >
                            <Store className="w-5 h-5" />
                            <span className="text-sm font-medium">Retirar</span>
                        </button>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label htmlFor="checkout-name" className="block text-sm font-medium text-text-muted mb-2">Seu Nome *</label>
                        <input
                            id="checkout-name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            autoCorrect="off"
                            autoCapitalize="words"
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-text input-glow transition-all"
                            placeholder="Digite seu nome..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="checkout-phone" className="block text-sm font-medium text-text-muted mb-2">Telefone</label>
                        <input
                            id="checkout-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-text input-glow transition-all"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={(e) => setPhone(formatPhone(e.target.value))}
                            maxLength={15}
                        />
                    </div>

                    {/* Address - only for delivery */}
                    {!isPickup && (
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-text-muted">Endereço de Entrega</label>

                            <div className="grid grid-cols-[1fr,100px] gap-3">
                                <div>
                                    <label htmlFor="checkout-street" className="block text-xs text-text-muted mb-1">Rua</label>
                                    <input
                                        id="checkout-street"
                                        type="text"
                                        autoComplete="street-address"
                                        className="w-full bg-background border border-white/10 rounded-xl p-3 text-text input-glow transition-all"
                                        placeholder="Nome da Rua"
                                        value={street}
                                        onChange={(e) => setStreet(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="checkout-number" className="block text-xs text-text-muted mb-1">Número</label>
                                    <input
                                        id="checkout-number"
                                        type="text"
                                        className="w-full bg-background border border-white/10 rounded-xl p-3 text-text input-glow transition-all"
                                        placeholder="123"
                                        value={number}
                                        onChange={(e) => setNumber(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="checkout-neighborhood" className="block text-xs text-text-muted mb-1">Bairro</label>
                                <select
                                    id="checkout-neighborhood"
                                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-text input-glow transition-all appearance-none"
                                    value={neighborhood}
                                    onChange={(e) => setNeighborhood(e.target.value)}
                                >
                                    <option value="" disabled>Selecione o Bairro</option>
                                    {NEIGHBORHOODS.map((nb) => (
                                        <option key={nb.name} value={nb.name} className="bg-background text-text">
                                            {nb.name} (+ R$ {nb.fee.toFixed(2)})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="checkout-reference" className="block text-xs text-text-muted mb-1">Ponto de Referência</label>
                                <input
                                    id="checkout-reference"
                                    type="text"
                                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-text input-glow transition-all"
                                    placeholder="Ao lado da padaria"
                                    value={reference}
                                    onChange={(e) => setReference(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Pickup notice */}
                    {isPickup && (
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl text-center">
                            <Store className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-sm text-text-muted">
                                Seu pedido estará pronto para retirada no estabelecimento.
                            </p>
                        </div>
                    )}

                    {/* Payment */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-3">Forma de Pagamento</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <button
                                        key={method.id}
                                        className={cn(
                                            "p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                                            payment === method.id
                                                ? "border-primary bg-primary/10 text-primary"
                                                : "border-white/10 bg-background text-text-muted hover:border-white/20"
                                        )}
                                        onClick={() => setPayment(method.id)}
                                    >
                                        <Icon className="w-6 h-6" />
                                        <span className="text-xs font-medium">{method.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Change for cash payment */}
                    {(payment === 'dinheiro' || payment === 'cartao_dinheiro') && (
                        <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <label className="block text-sm font-medium text-yellow-400 mb-2">Precisa de troco para a parte em dinheiro?</label>
                            <div className="flex items-center gap-2">
                                <span className="text-text-muted">R$</span>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    className="flex-1 bg-background border border-white/10 rounded-lg p-3 text-text input-glow transition-all"
                                    placeholder="Ex: 50 (deixe vazio se não precisar)"
                                    value={changeFor}
                                    onChange={(e) => setChangeFor(e.target.value)}
                                />
                            </div>
                        </div>
                    )}


                    {/* Total Value Display (especially for PIX) */}
                    {payment === 'pix' && (
                        <div className="p-4 bg-background border border-white/10 rounded-xl flex items-center justify-between">
                            <span className="text-text-muted text-sm">Valor Total a Pagar:</span>
                            <span className="text-xl font-bold text-primary text-glow">
                                R$ {getTotal().toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    )}

                    {/* PIX key display */}
                    {payment === 'pix' && (
                        <div className="p-4 bg-primary/10 border border-primary/30 rounded-xl">
                            <p className="text-sm font-medium text-primary mb-2">Chave PIX (CNPJ):</p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(PIX_KEY);
                                    setPixCopied(true);
                                    setTimeout(() => setPixCopied(false), 2000);
                                }}
                                className="w-full flex items-center justify-between p-3 bg-background border border-white/10 rounded-lg hover:bg-white/5 transition-colors group"
                            >
                                <div className="text-left">
                                    <p className="text-lg font-mono text-text">{PIX_KEY}</p>
                                    <p className="text-xs text-text-muted">{PIX_NAME}</p>
                                </div>
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    pixCopied ? "bg-green-500/20 text-green-400" : "bg-white/10 text-text-muted group-hover:text-primary"
                                )}>
                                    {pixCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                </div>
                            </button>
                            {pixCopied && (
                                <p className="text-xs text-green-400 text-center mt-2">✓ Chave copiada!</p>
                            )}
                            <p className="text-sm font-semibold text-yellow-500 text-center mt-3 flex flex-col items-center justify-center gap-1 bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                                <span className="flex items-center gap-2">
                                    ⚠️ Atenção!
                                </span>
                                <span className="text-xs font-normal">
                                    O pedido só irá para a produção mediante envio do comprovante do PIX pelo WhatsApp!
                                </span>
                            </p>
                        </div>
                    )}
                </div>

                {/* Submit - Fixed at bottom */}
                <div className="shrink-0 p-4 border-t border-white/10 bg-background pb-[env(safe-area-inset-bottom,16px)]">
                    <button
                        onClick={handleFinish}
                        disabled={!name.trim() || (!isPickup && (!street.trim() || !number.trim() || !neighborhood.trim())) || saving}
                        className="w-full bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {payment === 'stripe' ? 'Redirecionando para o Stripe...' : 'Registrando pedido...'}
                            </>
                        ) : (
                            <>
                                {payment === 'stripe' ? (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Pagar Online (Stripe)
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Enviar pelo WhatsApp
                                    </>
                                )}
                            </>
                        )}
                    </button>
                    <p className="text-center text-xs text-text-muted mt-3 flex items-center justify-center gap-1">
                        Desenvolvido por{' '}
                        <a
                            href="https://nuscorre.com.br"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline flex items-center gap-1"
                        >
                            <img src="/nuscorre-logo.png" alt="Nuscorre" className="h-4 w-auto" />
                        </a>
                    </p>
                </div>
            </div>
        </div >
    );
});
