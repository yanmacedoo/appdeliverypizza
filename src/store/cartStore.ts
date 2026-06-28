import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string; // unique timestamp based id for cart entry
    productId: string;
    name: string;
    price: number;
    quantity: number;
    type: 'pizza' | 'drink';
    observation?: string;
    // Pizza specifics
    flavors?: string[]; // [Flavor1] or [Flavor1, Flavor2]
}

export interface AppliedCoupon {
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
}

interface CartState {
    items: CartItem[];
    appliedCoupon: AppliedCoupon | null;
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    updateItemObservation: (id: string, observation: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getDeliveryFee: () => number;
    getDiscountAmount: () => number;
    getTotal: () => number;
    applyCoupon: (coupon: AppliedCoupon | null) => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            appliedCoupon: null,
            addItem: (item) => {
                set((state) => ({
                    items: [...state.items, { ...item, id: Date.now().toString() + Math.random() }]
                }));
            },
            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id)
                }));
            },
            updateItemObservation: (id, observation) => {
                set((state) => ({
                    items: state.items.map((item) =>
                        item.id === id ? { ...item, observation } : item
                    )
                }));
            },
            clearCart: () => set({ items: [], appliedCoupon: null }),
            getSubtotal: () => {
                const { items } = get();
                return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
            getDeliveryFee: () => {
                const subtotal = get().getSubtotal();
                // If subtotal > 100, free shipping. Else 6.
                // NOTE: Prompt says "Isenção: se subtotal > 100".
                return subtotal >= 100 ? 0 : 6;
            },
            getDiscountAmount: () => {
                const coupon = get().appliedCoupon;
                if (!coupon) return 0;
                const subtotal = get().getSubtotal();
                if (subtotal < coupon.minOrderValue) return 0;

                if (coupon.type === 'percentage') {
                    return Number(((subtotal * coupon.value) / 100).toFixed(2));
                } else {
                    return Math.min(coupon.value, subtotal);
                }
            },
            getTotal: () => {
                const totalWithDiscount = get().getSubtotal() - get().getDiscountAmount();
                return Math.max(0, totalWithDiscount) + get().getDeliveryFee();
            },
            applyCoupon: (coupon) => set({ appliedCoupon: coupon })
        }),
        {
            name: 'fome-de-pizza-cart',
        }
    )
);
