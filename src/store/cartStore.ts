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

interface CartState {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'id'>) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    getSubtotal: () => number;
    getDeliveryFee: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
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
            clearCart: () => set({ items: [] }),
            getSubtotal: () => {
                const { items } = get();
                return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
            },
            getDeliveryFee: () => {
                const subtotal = get().getSubtotal();
                // If subtotal > 100, free shipping. Else 5.
                // NOTE: Prompt says "Isenção: se subtotal > 100".
                return subtotal >= 100 ? 0 : 5;
            },
            getTotal: () => {
                return get().getSubtotal() + get().getDeliveryFee();
            }
        }),
        {
            name: 'fome-de-pizza-cart',
        }
    )
);
