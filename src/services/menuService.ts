import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, Category, PatternType, PatternColors } from '../data/menu';

const MENU_COLLECTION = 'menu';

export interface MenuItemData {
    id: string;
    name: string;
    description?: string;
    price: number;
    type: 'pizza' | 'drink';
    image: string;
    categoryId: string;
    categoryTitle: string;
    visualPattern?: PatternType;
    patternColors?: PatternColors;
    order?: number;
    available?: boolean;
    options?: { id: string; name: string; description?: string; price?: number; available?: boolean }[];
}

// Convert menu items from Firebase to Category structure
export function groupItemsByCategory(items: MenuItemData[]): Category[] {
    const categoryMap = new Map<string, { id: string; title: string; items: Product[] }>();

    items.forEach(item => {
        if (!categoryMap.has(item.categoryId)) {
            categoryMap.set(item.categoryId, {
                id: item.categoryId,
                title: item.categoryTitle,
                items: []
            });
        }

        const category = categoryMap.get(item.categoryId)!;
        category.items.push({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            image: item.image,
            visualPattern: item.visualPattern,
            patternColors: item.patternColors,
            available: item.available !== false, // Default to true if undefined
            options: item.options
        });
    });

    // Sort categories and items by order
    return Array.from(categoryMap.values());
}

// Save a single menu item
export async function saveMenuItem(item: MenuItemData): Promise<void> {
    const docRef = doc(db, MENU_COLLECTION, item.id);

    // Remove campos undefined que causam erro no Firestore
    const cleanedItem: Record<string, unknown> = {};
    Object.entries(item).forEach(([key, value]) => {
        if (value !== undefined) {
            cleanedItem[key] = value;
        }
    });

    await setDoc(docRef, cleanedItem, { merge: true });
}

// Delete a menu item
export async function deleteMenuItem(itemId: string): Promise<void> {
    const docRef = doc(db, MENU_COLLECTION, itemId);
    await deleteDoc(docRef);
}

// Get all menu items
export async function getMenuItems(): Promise<MenuItemData[]> {
    const q = query(collection(db, MENU_COLLECTION), orderBy('categoryId'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data() as MenuItemData);
}

// Subscribe to menu changes in real-time
export function subscribeToMenu(callback: (items: MenuItemData[]) => void): () => void {
    const q = query(collection(db, MENU_COLLECTION), orderBy('categoryId'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const items: MenuItemData[] = snapshot.docs.map(doc => doc.data() as MenuItemData);
        callback(items);
    });

    return unsubscribe;
}

// Initialize menu from static data (run once to populate Firebase)
export async function initializeMenuFromStatic(categories: Category[]): Promise<void> {
    const batch = writeBatch(db);

    categories.forEach(category => {
        category.items.forEach((item, index) => {
            const docRef = doc(db, MENU_COLLECTION, item.id);
            const data: MenuItemData = {
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                type: item.type,
                image: item.image,
                categoryId: category.id,
                categoryTitle: category.title,
                visualPattern: item.visualPattern,
                patternColors: item.patternColors,
                order: index,
                available: true,
                options: item.options
            };
            batch.set(docRef, data);
        });
    });

    await batch.commit();
}
