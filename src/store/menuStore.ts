import { create } from 'zustand';
import { menu as staticMenu, type Category, type Product } from '../data/menu';
import { subscribeToMenu, type MenuItemData } from '../services/menuService';

interface MenuState {
    categories: Category[];
    isLoading: boolean;
    isInitialized: boolean;
    setCategories: (categories: Category[]) => void;
    getAllPizzas: () => Product[];
    getPizzasByCategory: () => { category: string; items: Product[] }[];
    initializeFromFirebase: () => () => void;
}

// Helper function to merge Firebase updates with static menu
// Firebase data overrides prices/descriptions AND can add new items
function mergeWithStaticMenu(firebaseItems: MenuItemData[]): Category[] {
    // Create a map of Firebase items by ID for quick lookup
    const firebaseMap = new Map<string, MenuItemData>();
    const usedFirebaseIds = new Set<string>();

    firebaseItems.forEach(item => {
        firebaseMap.set(item.id, item);
    });

    // Clone and update static menu with Firebase data
    const mergedCategories = staticMenu.map(category => {
        // Update existing items from static menu
        const updatedItems = category.items.map(item => {
            const firebaseItem = firebaseMap.get(item.id);
            if (firebaseItem) {
                usedFirebaseIds.add(item.id);
                // Override with Firebase values
                return {
                    ...item,
                    name: firebaseItem.name || item.name,
                    description: firebaseItem.description || item.description,
                    price: firebaseItem.price ?? item.price,
                    available: firebaseItem.available !== undefined ? firebaseItem.available : item.available,
                    // Merge options if present
                    options: item.options?.map(opt => {
                        const firebaseOpt = firebaseItem.options?.find(fo => fo.id === opt.id);
                        // Explicitly check for boolean false to ensure we hide items
                        const isAvailable = firebaseOpt?.available !== undefined
                            ? firebaseOpt.available
                            : (opt.available ?? true);

                        return {
                            ...opt,
                            available: isAvailable
                        };
                    })
                };
            }
            return item;
        });

        // Add new items from Firebase that belong to this category
        const newItems: Product[] = [];
        firebaseItems.forEach(fbItem => {
            if (fbItem.categoryId === category.id && !usedFirebaseIds.has(fbItem.id)) {
                usedFirebaseIds.add(fbItem.id);
                newItems.push({
                    id: fbItem.id,
                    name: fbItem.name,
                    description: fbItem.description,
                    price: fbItem.price,
                    type: fbItem.type,
                    image: fbItem.image,
                    visualPattern: fbItem.visualPattern,
                    patternColors: fbItem.patternColors,
                    available: fbItem.available,
                    options: fbItem.options
                });
            }
        });

        // Combine and sort alphabetically by name
        const allItems = [...updatedItems, ...newItems];
        allItems.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        return {
            ...category,
            items: allItems
        };
    });

    return mergedCategories;
}

export const useMenuStore = create<MenuState>((set, get) => ({
    // Start with static menu
    categories: staticMenu,
    isLoading: true,
    isInitialized: false,

    setCategories: (categories) => set({ categories, isLoading: false, isInitialized: true }),

    getAllPizzas: () => {
        const { categories } = get();
        return categories
            .flatMap(cat => cat.items)
            .filter(item => item.type === 'pizza' && item.available !== false);
    },

    getPizzasByCategory: () => {
        const { categories } = get();
        return categories
            .filter(cat => cat.items.some(item => item.type === 'pizza' && item.available !== false))
            .map(cat => ({
                category: cat.title,
                items: cat.items.filter(item => item.type === 'pizza' && item.available !== false)
            }));
    },

    initializeFromFirebase: () => {
        // Subscribe to Firebase menu updates
        const unsubscribe = subscribeToMenu((items: MenuItemData[]) => {
            // Always use static menu as base, merge with Firebase updates
            const mergedCategories = mergeWithStaticMenu(items);
            set({ categories: mergedCategories, isLoading: false, isInitialized: true });
        });

        return unsubscribe;
    }
}));
