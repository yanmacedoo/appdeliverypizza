import { useState, useEffect } from 'react';
import { CheckCircle, Send, Loader2, X } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Order } from '../types/order';

interface PaymentSuccessModalProps {
    onClose: () => void;
}

export function PaymentSuccessModal({ onClose }: PaymentSuccessModalProps) {
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const searchParams = new URLSearchParams(window.location.search);
    const orderId = searchParams.get('order_id');

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            return;
        }

        const fetchOrder = async () => {
            try {
                const docRef = doc(db, 'orders', orderId);
                const docSnap = await getDoc(docRef);
                
                if (docSnap.exists()) {
                    setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
                } else {
                    setError('Pedido não encontrado no banco de dados.');
                }
            } catch (err) {
                console.error('Erro ao buscar pedido:', err);
                setError('Erro ao carregar detalhes do pedido.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleSendWhatsApp = () => {
        if (!order) return;

        let msg = `*Olá, Fome de Pizza! Pagamento confirmado via Cartão Online (Stripe):*\n\n`;
        
        order.items.forEach(item => {
            msg += `• *${item.name}*\n`;
            if (item.observation) msg += `  _Obs: ${item.observation}_\n`;
            msg += `  R$ ${item.price.toFixed(2).replace('.', ',')}\n\n`;
        });

        msg += `----------------------------\n`;
        msg += `Subtotal: R$ ${order.subtotal.toFixed(2).replace('.', ',')}\n`;
        if (order.discount && order.discount > 0) {
            msg += `Desconto: - R$ ${order.discount.toFixed(2).replace('.', ',')}\n`;
        }
        if (order.deliveryFee === 0) {
            msg += `Entrega: GRÁTIS\n`;
        } else {
            msg += `Entrega: R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}\n`;
        }
        msg += `*TOTAL: R$ ${order.total.toFixed(2).replace('.', ',')}*\n`;
        msg += `----------------------------\n\n`;
        msg += `*PAGO ONLINE VIA STRIPE* 💳\n\n`;

        msg += `*Cliente:* ${order.customer.name}\n`;
        msg += `*Endereço:* ${order.customer.address}\n`;
        if (order.customer.phone) msg += `*Telefone:* ${order.customer.phone}\n`;

        const encodedMsg = encodeURIComponent(msg);
        const whatsappUrl = `https://api.whatsapp.com/send?phone=5573982563570&text=${encodedMsg}`;

        // Limpa os parâmetros da URL para evitar reabrir o modal
        window.history.replaceState({}, document.title, window.location.pathname);
        onClose();
        
        // Redireciona para o WhatsApp
        window.location.href = whatsappUrl;
    };

    const handleClose = () => {
        // Limpa os parâmetros da URL
        window.history.replaceState({}, document.title, window.location.pathname);
        onClose();
    };

    if (!orderId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative bg-surface w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-white/10 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-2 rounded-full text-text-muted hover:text-text hover:bg-white/10 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-text-muted text-sm">Carregando detalhes do pedido...</p>
                    </div>
                ) : error || !order ? (
                    <div className="py-8 space-y-4">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto text-3xl">⚠️</div>
                        <h3 className="text-xl font-bold text-text">Ops! Algo deu errado</h3>
                        <p className="text-text-muted text-sm">{error || 'Não conseguimos carregar as informações do seu pedido.'}</p>
                        <button
                            onClick={handleClose}
                            className="px-6 py-2.5 bg-surface-light text-text rounded-xl hover:bg-white/5 transition-all text-sm font-semibold"
                        >
                            Fechar
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        {/* Success Icon */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full scale-75" />
                            <CheckCircle className="w-20 h-20 text-success mx-auto relative z-10 animate-bounce" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-text tracking-tight">Pagamento Aprovado!</h2>
                            <p className="text-text-muted text-sm px-4">
                                Seu pedido já foi registrado no sistema e está sendo enviado para a cozinha!
                            </p>
                        </div>

                        {/* Order Summary Card */}
                        <div className="bg-background/50 border border-white/5 rounded-xl p-4 text-left text-sm space-y-2 w-full">
                            <div className="flex justify-between font-semibold border-b border-white/5 pb-2 mb-2">
                                <span className="text-text">Pedido</span>
                                <span className="text-primary uppercase font-mono">#{order.id?.slice(-4)}</span>
                            </div>
                            <div className="flex justify-between text-text-muted">
                                <span>Cliente:</span>
                                <span className="text-text font-medium">{order.customer.name}</span>
                            </div>
                            <div className="flex justify-between text-text-muted text-xs">
                                <span>Itens:</span>
                                <span className="text-text truncate max-w-[200px]">
                                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                                </span>
                            </div>
                            <div className="flex justify-between text-text-muted border-t border-white/5 pt-2 mt-2 font-bold text-base">
                                <span className="text-text">Total Pago:</span>
                                <span className="text-emerald-500">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>

                        {/* WhatsApp Action Button */}
                        <div className="space-y-3 pt-2">
                            <button
                                onClick={handleSendWhatsApp}
                                className="w-full bg-success hover:bg-success/90 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                            >
                                <Send className="w-5 h-5" />
                                Enviar Pedido no WhatsApp
                            </button>
                            <p className="text-[10px] text-text-muted italic">
                                * Enviar no WhatsApp é importante para acompanhar a entrega e manter contato direto.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
