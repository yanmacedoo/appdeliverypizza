import { Timestamp } from 'firebase/firestore';
import type { CartItem } from '../store/cartStore';

export type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';

export interface OrderCustomer {
    name: string;
    phone: string;
    address: string;
    paymentMethod: string;
    changeFor?: string;
}

export interface Order {
    id?: string;
    customer: OrderCustomer;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    status: OrderStatus;
    createdAt: Timestamp;
    completedAt?: Timestamp | null;
    note?: string; // Internal note for the order
    isPaid?: boolean; // Payment status override
}

export interface OrderFormData {
    customer: OrderCustomer;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    total: number;
}

// Status display configuration
export const orderStatusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: string }> = {
    pending: {
        label: 'Pendente',
        color: 'text-red-500',
        bgColor: 'bg-red-500/20',
        icon: '🔴'
    },
    preparing: {
        label: 'Em Preparo',
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500/20',
        icon: '🟡'
    },
    delivering: {
        label: 'Saiu para Entrega',
        color: 'text-green-500',
        bgColor: 'bg-green-500/20',
        icon: '🟢'
    },
    completed: {
        label: 'Concluído',
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/20',
        icon: '✅'
    },
    cancelled: {
        label: 'Cancelado',
        color: 'text-gray-500',
        bgColor: 'bg-gray-500/20',
        icon: '❌'
    },
};
