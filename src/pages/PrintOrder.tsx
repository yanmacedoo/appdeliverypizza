import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Order } from '../types/order';

export function PrintOrder() {
    const { orderId } = useParams<{ orderId: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) return;

            try {
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (orderDoc.exists()) {
                    setOrder({ id: orderDoc.id, ...orderDoc.data() } as Order);
                }
            } catch (error) {
                console.error('Error fetching order:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const hasPrinted = useRef(false);

    // Auto-print when order loads
    useEffect(() => {
        if (order && !loading && !hasPrinted.current) {
            hasPrinted.current = true;
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }, [order, loading]);

    if (loading) {
        return (
            <div className="print-container">
                <p>Carregando...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="print-container">
                <p>Pedido não encontrado</p>
            </div>
        );
    }

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <>
            {/* Print-specific styles */}
            <style>{`
                @media print {
                    @page {
                        size: 72mm auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                    }
                }
                
                * {
                    box-sizing: border-box;
                }
                
                body {
                    background: white !important;
                    margin: 0;
                    padding: 0;
                }
                
                .print-container {
                    width: 72mm;
                    max-width: 72mm;
                    margin: 0 auto;
                    padding: 2mm;
                    font-family: 'Arial', 'Helvetica', sans-serif;
                    font-size: 12px;
                    line-height: 1.3;
                    color: #000000;
                    background: white;
                    font-weight: 600;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                .print-header {
                    text-align: center;
                    border-bottom: 2px solid #000;
                    padding-bottom: 8px;
                    margin-bottom: 8px;
                }
                
                .print-title {
                    font-size: 20px;
                    font-weight: 900;
                    margin: 0 0 4px 0;
                    text-transform: uppercase;
                }
                
                .print-subtitle {
                    font-size: 12px;
                    font-weight: 700;
                    margin: 0;
                }
                
                .print-section {
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px dashed #000;
                }
                
                .print-section-title {
                    font-weight: 900;
                    margin-bottom: 4px;
                    text-transform: uppercase;
                    font-size: 14px;
                }
                
                .print-row {
                    display: block;
                    margin-bottom: 4px;
                    font-weight: 700;
                }
                
                .print-label {
                    color: #000;
                    display: block;
                    font-size: 11px;
                }
                
                .print-value {
                    font-weight: 900;
                    display: block;
                    font-size: 14px;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                }
                
                .print-address {
                    font-size: 12px;
                    font-weight: 900;
                    padding: 6px;
                    border: 2px solid #000;
                    margin: 6px 0;
                    text-align: center;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
                    text-transform: uppercase;
                }
                
                .print-items {
                    margin: 8px 0;
                }
                
                .print-item {
                    margin-bottom: 6px;
                    padding-bottom: 4px;
                    border-bottom: 1px solid #000;
                }
                
                .print-item-name {
                    font-weight: 900;
                    font-size: 14px;
                }
                
                .print-item-details {
                    font-size: 12px;
                    color: #000;
                    margin-left: 8px;
                    font-weight: 600;
                }
                
                .print-flavors {
                    font-weight: 700;
                    font-size: 12px;
                    margin-left: 8px;
                }
                
                .print-total {
                    font-size: 20px;
                    font-weight: 900;
                    text-align: center;
                    padding: 8px;
                    border: 3px solid #000;
                    margin-top: 8px;
                }
                
                .print-payment {
                    text-align: center;
                    font-weight: 800;
                    font-size: 14px;
                    margin-top: 8px;
                    padding: 6px;
                    background: #ddd;
                    border: 1px solid #000;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                }
                
                .print-footer {
                    text-align: center;
                    margin-top: 12px;
                    font-size: 12px;
                    font-weight: 700;
                    border-top: 2px solid #000;
                    padding-top: 8px;
                }
                
                .print-order-number {
                    font-size: 32px;
                    font-weight: 900;
                    text-align: center;
                    margin: 8px 0;
                }
            `}</style>

            <div className="print-container">
                {/* Header */}
                <div className="print-header">
                    <img
                        src="/images/logo-print.png"
                        alt="Fome de Pizza"
                        style={{
                            maxWidth: '80px',
                            height: 'auto',
                            margin: '0 auto 8px auto',
                            display: 'block',
                            filter: 'grayscale(100%) brightness(0) contrast(200%)' // Force dark for thermal printer
                        }}
                    />
                    <p className="print-subtitle">{formatDate(order.createdAt)}</p>
                </div>

                {/* Order Number */}
                <div className="print-order-number">
                    #{orderId?.slice(-4).toUpperCase()}
                </div>

                {/* Customer Info */}
                <div className="print-section">
                    <div className="print-section-title">Cliente</div>
                    <div className="print-row">
                        <span className="print-label">Nome:</span>
                        <span className="print-value">{order.customer.name}</span>
                    </div>
                    <div className="print-row">
                        <span className="print-label">Tel:</span>
                        <span className="print-value">{order.customer.phone}</span>
                    </div>
                </div>

                {/* Address - Big and Bold */}
                <div className="print-address">
                    📍 {order.customer.address}
                </div>

                {/* Note */}
                {order.note && (
                    <div style={{
                        border: '2px dashed #000',
                        padding: '8px',
                        margin: '8px 0',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}>
                        📝 NOTA: {order.note}
                    </div>
                )}

                {/* Items */}
                <div className="print-section">
                    <div className="print-section-title">Itens do Pedido</div>
                    <div className="print-items">
                        {order.items.map((item, index) => (
                            <div key={index} className="print-item">
                                <div className="print-item-name">
                                    {item.quantity}x {item.name}
                                </div>

                                {item.observation && (
                                    <div className="print-item-details">
                                        📝 {item.observation}
                                    </div>
                                )}
                                <div className="print-item-details">
                                    R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals */}
                <div className="print-section">
                    <div className="print-row">
                        <span className="print-label">Subtotal:</span>
                        <span className="print-value">R$ {order.subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    {order.deliveryFee > 0 && (
                        <div className="print-row">
                            <span className="print-label">Entrega:</span>
                            <span className="print-value">R$ {order.deliveryFee.toFixed(2).replace('.', ',')}</span>
                        </div>
                    )}
                </div>

                {/* Total */}
                <div className="print-total">
                    TOTAL: R$ {order.total.toFixed(2).replace('.', ',')}
                </div>

                {/* Payment Method */}
                <div className="print-payment">
                    💳 {order.customer.paymentMethod}
                    {order.customer.changeFor && (
                        <span> • Troco p/ R$ {order.customer.changeFor}</span>
                    )}
                </div>

                {/* Footer */}
                <div className="print-footer">
                    <p>Obrigado pela preferência!</p>
                    <p>Fome de Pizza</p>
                </div>
            </div>
        </>
    );
}
