import { useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    MapPin,
    Phone,
    User,
    CreditCard,
    Clock,
    Pizza,
    CheckCircle,
    Hash,
    Printer,
    FileText,
    StickyNote,
    DollarSign,
    Edit
} from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Order, OrderStatus } from '../../types/order';
import { orderStatusConfig } from '../../types/order';
import { updateOrderStatus, updateOrder } from '../../services/orderService';
import type { Timestamp } from 'firebase/firestore';
import { EditOrderModal } from './EditOrderModal';

interface OrderCardProps {
    order: Order;
    orderNumber: number; // Sequential number for the day
}

// Format timestamp to time string HH:MM
function formatTime(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return '--:--';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function OrderCard({ order, orderNumber }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState(order.note || '');
    const [isEditingOrder, setIsEditingOrder] = useState(false);

    const statusConfig = orderStatusConfig[order.status];

    const handleSaveNote = async () => {
        if (!order.id) return;
        setUpdating(true);
        try {
            await updateOrder(order.id, { note: noteDraft });
            setIsEditingNote(false);
        } catch (error) {
            console.error('Error updating note:', error);
            alert('Erro ao salvar nota.');
        } finally {
            setUpdating(false);
        }
    };

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (!order.id || updating) return;

        setUpdating(true);
        try {
            await updateOrderStatus(order.id, newStatus);

            // If status changed to preparing, open WhatsApp
            if (newStatus === 'preparing' && order.customer.phone) {
                const phone = order.customer.phone.replace(/\D/g, '');
                if (phone) {
                    const firstName = order.customer.name.split(' ')[0];
                    const message = `Olá, ${firstName}! Seu pedido foi recebido e está sendo preparado! (:`;

                    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
                    window.open(url, '_blank');
                }
            }

            // If status changed to delivering, open WhatsApp
            if (newStatus === 'delivering' && order.customer.phone) {
                const phone = order.customer.phone.replace(/\D/g, '');
                if (phone) {
                    const firstName = order.customer.name.split(' ')[0];
                    const message = `Olá, ${firstName}!
Seu pedido está a caminho!
Quando chegar, posta uma foto e marca a gente? (:
Bom apetite! <3`;

                    const url = `https://wa.me/55${phone}?text=${encodeURIComponent(message)}`;
                    window.open(url, '_blank');
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handleTogglePaid = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!order.id || updating) return;

        setUpdating(true);
        try {
            await updateOrder(order.id, { isPaid: !order.isPaid });
        } catch (error) {
            console.error('Error toggling paid status:', error);
        } finally {
            setUpdating(false);
        }
    };

    const handlePrint = () => {
        if (!order.id) return;
        window.open(`/admin/print/${order.id}`, '_blank', 'width=400,height=600');
    };



    const statusButtons: { status: OrderStatus; label: string }[] = [
        { status: 'pending', label: '🔴 Pendente' },
        { status: 'preparing', label: '🟡 Preparo' },
        { status: 'delivering', label: '🟢 Entrega' },
        { status: 'completed', label: '✅ Concluído' },
        { status: 'cancelled', label: '❌ Cancelado' },
    ];

    return (
        <div className={cn(
            "glass-card rounded-xl overflow-hidden transition-all duration-300",
            order.isPaid ? "border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]" : ""
        )}>
            {/* Header - Always visible */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-4">
                    {/* Order Number Badge */}
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">
                            {orderNumber}
                        </span>
                    </div>

                    {/* Status Badge */}
                    <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center text-xl",
                        statusConfig.bgColor
                    )}>
                        {statusConfig.icon}
                    </div>

                    {/* Customer Info */}
                    <div className="text-left">
                        <h3 className="font-semibold text-text">{order.customer.name}</h3>
                        <div className="flex items-center gap-3 text-text-muted text-xs">
                            <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(order.createdAt)}
                            </span>
                            {order.completedAt && (
                                <span className="flex items-center gap-1 text-emerald-500">
                                    <CheckCircle className="w-3 h-3" />
                                    {formatTime(order.completedAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Total */}
                    <div className="text-right">
                        <span className="text-primary font-bold text-lg">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                        </span>
                        <p className="text-xs text-text-muted">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </p>
                    </div>

                    {/* Expand Icon */}
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-text-muted" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-text-muted" />
                    )}
                </div>
            </button>

            {/* Expanded Details */}
            {expanded && (
                <div className="border-t border-white/10 p-4 space-y-4 animate-[slide-up_0.2s_ease-out]">
                    {/* Time Info */}
                    <div className="flex flex-wrap gap-4 text-sm bg-background/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-primary" />
                            <span className="text-text-muted">Pedido:</span>
                            <span className="text-text font-semibold">#{orderNumber}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span className="text-text-muted">Registrado:</span>
                            <span className="text-text">{formatTime(order.createdAt)}</span>
                        </div>
                        {order.completedAt && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                <span className="text-text-muted">Finalizado:</span>
                                <span className="text-emerald-500 font-medium">{formatTime(order.completedAt)}</span>
                            </div>
                        )}
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <User className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                                <span className="text-text-muted">Cliente:</span>
                                <p className="text-text">{order.customer.name}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Phone className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                                <span className="text-text-muted">Telefone:</span>
                                <p className="text-text">{order.customer.phone || 'Não informado'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <Hash className="w-4 h-4 text-yellow-500 mt-0.5" />
                            <div>
                                <span className="text-text-muted">Código:</span>
                                <p className="text-yellow-500 font-bold text-lg">{order.id?.slice(-4).toUpperCase() || '----'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2 sm:col-span-2">
                            <MapPin className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                                <span className="text-text-muted">Endereço:</span>
                                <p className="text-text">{order.customer.address}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-2">
                            <CreditCard className="w-4 h-4 text-primary mt-0.5" />
                            <div>
                                <span className="text-text-muted">Pagamento:</span>
                                <p className="text-text">
                                    {order.customer.paymentMethod}
                                    {order.customer.changeFor && (
                                        <span className="ml-2 text-yellow-400 font-medium">
                                            • Troco p/ R$ {order.customer.changeFor}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Note Display/Edit */}
                    {(order.note || isEditingNote) && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                            <div className="flex items-start gap-2 mb-2">
                                <StickyNote className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <span className="text-xs font-bold text-yellow-500 uppercase block">Nota Interna:</span>
                            </div>

                            {isEditingNote ? (
                                <div className="space-y-2">
                                    <textarea
                                        autoFocus
                                        className="w-full bg-black/20 border border-yellow-500/30 rounded p-2 text-base text-text resize-none focus:outline-none focus:border-yellow-500/50"
                                        rows={2}
                                        placeholder="Digite uma nota para este pedido..."
                                        value={noteDraft}
                                        onChange={(e) => setNoteDraft(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSaveNote();
                                            }
                                        }}
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            onClick={() => {
                                                setIsEditingNote(false);
                                                setNoteDraft(order.note || '');
                                            }}
                                            className="text-xs px-2 py-1 text-text-muted hover:text-text transition-colors"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            disabled={updating}
                                            className="text-xs px-3 py-1 bg-yellow-500 text-black font-bold rounded hover:bg-yellow-400 transition-colors"
                                        >
                                            Salvar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-text-muted italic pl-6 whitespace-pre-wrap">"{order.note}"</p>
                            )}
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="border-t border-white/10 pt-4">
                        <h4 className="text-sm font-semibold text-text-muted mb-2 flex items-center gap-2">
                            <Pizza className="w-4 h-4" />
                            Itens do Pedido
                        </h4>
                        <div className="space-y-2">
                            {order.items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex justify-between items-center bg-background/50 rounded-lg p-3"
                                >
                                    <div>
                                        <p className="text-text font-medium">{item.name}</p>
                                        {item.observation && (
                                            <p className="text-xs text-text-muted">Obs: {item.observation}</p>
                                        )}
                                    </div>
                                    <span className="text-primary font-medium">
                                        R$ {item.price.toFixed(2).replace('.', ',')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div className="mt-3 pt-3 border-t border-white/10 space-y-1 text-sm">
                            <div className="flex justify-between text-text-muted">
                                <span>Subtotal:</span>
                                <span>R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                            </div>
                            {order.discount !== undefined && order.discount > 0 && (
                                <div className="flex justify-between text-green-400 font-medium">
                                    <span>Desconto {order.couponCode ? `(${order.couponCode})` : ''}:</span>
                                    <span>- R$ {order.discount.toFixed(2).replace('.', ',')}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-text-muted">
                                <span>Entrega:</span>
                                <span>{order.deliveryFee === 0 ? 'GRÁTIS' : `R$ ${order.deliveryFee.toFixed(2).replace('.', ',')}`}</span>
                            </div>
                            <div className="flex justify-between text-text font-bold text-base pt-1">
                                <span>Total:</span>
                                <span className="text-primary">R$ {order.total.toFixed(2).replace('.', ',')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status Change Buttons */}
                    <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-text-muted">Alterar Status</h4>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsEditingOrder(true)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-sm font-medium hover:bg-primary/30 transition-colors"
                                    title="Editar Pedido"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                                <button
                                    onClick={() => setIsEditingNote(!isEditingNote)}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm font-medium hover:bg-yellow-500/30 transition-colors"
                                    title="Adicionar Nota"
                                >
                                    <FileText className="w-4 h-4" />
                                    {order.note ? 'Editar Nota' : 'Add Nota'}
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                                >
                                    <Printer className="w-4 h-4" />
                                    Imprimir
                                </button>
                                <button
                                    onClick={handleTogglePaid}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                        order.isPaid
                                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                                            : "bg-white/5 text-text-muted hover:bg-white/10"
                                    )}
                                    title={order.isPaid ? "Marcar como Não Pago" : "Marcar como Pago"}
                                >
                                    <DollarSign className="w-4 h-4" />
                                    {order.isPaid ? 'Pago' : 'Pagar'}
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {statusButtons.map(({ status, label }) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(status)}
                                    disabled={updating || order.status === status}
                                    className={cn(
                                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        order.status === status
                                            ? "bg-primary/20 text-primary ring-1 ring-primary"
                                            : "bg-surface-light text-text-muted hover:bg-surface hover:text-text",
                                        updating && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            
            <EditOrderModal
                isOpen={isEditingOrder}
                onClose={() => setIsEditingOrder(false)}
                order={order}
            />
        </div>
    );
}
