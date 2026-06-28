import {
    collection,
    addDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Order, OrderFormData, OrderStatus } from '../types/order';

const ORDERS_COLLECTION = 'orders';

// Create a new order
export async function createOrder(data: OrderFormData): Promise<string> {
    // Convert items to plain objects (remove any non-serializable data)
    const plainItems = data.items.map(item => ({
        id: item.id,
        productId: item.productId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        type: item.type,
        observation: item.observation || '',
        flavors: item.flavors || [],
    }));

    const orderData = {
        customer: data.customer,
        items: plainItems,
        subtotal: data.subtotal,
        deliveryFee: data.deliveryFee,
        total: data.total,
        status: 'pending' as OrderStatus,
        createdAt: serverTimestamp(),
        discount: data.discount || 0,
        couponCode: data.couponCode || null,
        isPaid: data.isPaid || false
    };

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), orderData);
    return docRef.id;
}

// Update order status
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    const updateData: Record<string, any> = { status };

    // Set completedAt when order is completed
    if (status === 'completed') {
        updateData.completedAt = serverTimestamp();
    } else if (status !== 'cancelled') {
        // Clear completedAt if going back to other status (not cancelled)
        updateData.completedAt = null;
    }

    await updateDoc(orderRef, updateData);
}

// Update any order fields
export async function updateOrder(orderId: string, data: Partial<Order>): Promise<void> {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, data);
}

// Subscribe to orders in real-time (for admin dashboard)
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    const q = query(
        collection(db, ORDERS_COLLECTION),
        orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const orders: Order[] = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });

    return unsubscribe;
}

// Helper to format relative time
export function formatRelativeTime(timestamp: Timestamp | null | undefined): string {
    if (!timestamp) return 'Agora';

    const now = new Date();
    const date = timestamp.toDate();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `Há ${diffMins} min`;
    if (diffHours < 24) return `Há ${diffHours}h`;
    return `Há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
}
