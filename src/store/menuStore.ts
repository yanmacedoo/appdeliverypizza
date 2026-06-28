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
    const categoriesMap = new Map<string, Category>();

    // Initialize map with static categories
    staticMenu.forEach(cat => {
        categoriesMap.set(cat.id, {
            ...cat,
            items: [...cat.items]
        });
    });

    const usedFirebaseIds = new Set<string>();

    // Update existing static items
    firebaseItems.forEach(item => {
        const category = categoriesMap.get(item.categoryId);
        if (category) {
            const itemIndex = category.items.findIndex(i => i.id === item.id);
            if (itemIndex > -1) {
                usedFirebaseIds.add(item.id);
                category.items[itemIndex] = {
                    ...category.items[itemIndex],
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    available: item.available !== false,
                    options: item.options
                };
            }
        }
    });

    // Add new items and handle dynamic new categories
    firebaseItems.forEach(item => {
        if (!usedFirebaseIds.has(item.id)) {
            usedFirebaseIds.add(item.id);

            if (!categoriesMap.has(item.categoryId)) {
                categoriesMap.set(item.categoryId, {
                    id: item.categoryId,
                    title: item.categoryTitle,
                    items: []
                });
            }

            const category = categoriesMap.get(item.categoryId)!;
            category.items.push({
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price,
                type: item.type,
                image: item.image || '',
                visualPattern: item.visualPattern,
                patternColors: item.patternColors,
                available: item.available !== false,
                options: item.options
            });
        }
    });

    // Sort items alphabetically in each category
    const finalCategories = Array.from(categoriesMap.values()).map(category => {
        category.items.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        return category;
    });

    return finalCategories;
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
