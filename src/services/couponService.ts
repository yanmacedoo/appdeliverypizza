import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export interface Coupon {
    id?: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue?: number;
    isActive: boolean;
    createdAt?: any;
}

const COUPONS_COLLECTION = 'coupons';

// Subscribe to all coupons (for admin dashboard)
export function subscribeToCoupons(callback: (coupons: Coupon[]) => void): () => void {
    const q = query(collection(db, COUPONS_COLLECTION));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        try {
            const coupons = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Coupon[];
            
            // Sort defensively in case a document doesn't have a code property
            coupons.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
            callback(coupons);
        } catch (error) {
            console.error("Erro ao processar cupons do Firestore:", error);
        }
    }, (error) => {
        console.error("Erro na escuta em tempo real dos cupons:", error);
    });

    return unsubscribe;
}

// Save or update a coupon
export async function saveCoupon(coupon: Coupon): Promise<void> {
    const codeUpper = coupon.code.toUpperCase().trim();
    const id = coupon.id || codeUpper; // Use the uppercase code as the document ID for uniqueness
    
    const docRef = doc(db, COUPONS_COLLECTION, id);

    const couponData = {
        id,
        code: codeUpper,
        type: coupon.type,
        value: coupon.value,
        minOrderValue: coupon.minOrderValue || 0,
        isActive: coupon.isActive,
        createdAt: coupon.createdAt || serverTimestamp()
    };

    await setDoc(docRef, couponData, { merge: true });
}

// Delete a coupon
export async function deleteCoupon(couponId: string): Promise<void> {
    const docRef = doc(db, COUPONS_COLLECTION, couponId);
    await deleteDoc(docRef);
}

// Fetch a coupon by its code (for client checkout)
export async function checkCoupon(code: string): Promise<Coupon | null> {
    const codeUpper = code.toUpperCase().trim();
    const q = query(
        collection(db, COUPONS_COLLECTION),
        where('code', '==', codeUpper),
        where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return {
        id: doc.id,
        ...doc.data()
    } as Coupon;
}
