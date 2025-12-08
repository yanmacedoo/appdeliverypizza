import { useState } from 'react';
import { X, Send, CreditCard, Banknote, QrCode } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const paymentMethods = [
    { id: 'pix', label: 'Pix', icon: QrCode },
    { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
    { id: 'cartao', label: 'Cartão', icon: CreditCard },
];

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    if (!isOpen) return null;

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [payment, setPayment] = useState('pix');

    const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

    const handleFinish = () => {
        if (!name.trim() || !address.trim()) {
            alert("Por favor preencha nome e endereço.");
            return;
        }

        // Build clean message without emojis
        let msg = `*Olá, Fome de Pizza! Gostaria de fazer um pedido:*\n\n`;

        items.forEach(item => {
            msg += `• *${item.name}*\n`;
            if (item.observation) msg += `  _Obs: ${item.observation}_\n`;
            msg += `  R$ ${item.price.toFixed(2).replace('.', ',')}\n\n`;
        });

        msg += `----------------------------\n`;
        msg += `Subtotal: R$ ${getSubtotal().toFixed(2).replace('.', ',')}\n`;
        msg += `Entrega: ${getDeliveryFee() === 0 ? 'GRÁTIS' : `R$ ${getDeliveryFee().toFixed(2).replace('.', ',')}`}\n`;
        msg += `*TOTAL: R$ ${getTotal().toFixed(2).replace('.', ',')}*\n`;
        msg += `----------------------------\n\n`;

        const selectedPayment = paymentMethods.find(p => p.id === payment)?.label || payment;

        msg += `*Cliente:* ${name}\n`;
        msg += `*Endereço:* ${address}\n`;
        if (phone.trim()) msg += `*Telefone:* ${phone}\n`;
        msg += `*Pagamento:* ${selectedPayment}`;

        const encodedMsg = encodeURIComponent(msg);
        const whatsappUrl = `https://wa.me/5573982563570?text=${encodedMsg}`;

        window.open(whatsappUrl, '_blank');
        clearCart();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-[fade-in_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl shadow-2xl animate-[slide-up_0.3s_ease-out] max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-text">Dados da Entrega</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-text-muted hover:text-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Seu Nome *</label>
                        <input
                            type="text"
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-text input-glow transition-all"
                            placeholder="Digite seu nome..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Telefone</label>
                        <input
                            type="tel"
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-text input-glow transition-all"
                            placeholder="(00) 00000-0000"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">Endereço Completo *</label>
                        <textarea
                            className="w-full bg-background border border-white/10 rounded-xl p-4 text-text input-glow transition-all h-24 resize-none"
                            placeholder="Rua, Número, Bairro, Referência..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    {/* Payment */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-3">Forma de Pagamento</label>
                        <div className="grid grid-cols-3 gap-3">
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
                </div>

                {/* Submit */}
                <div className="p-5 border-t border-white/10 bg-background">
                    <button
                        onClick={handleFinish}
                        disabled={!name.trim() || !address.trim()}
                        className="w-full bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                    >
                        <Send className="w-5 h-5" />
                        Enviar pelo WhatsApp
                    </button>
                </div>
            </div>
        </div>
    );
}
