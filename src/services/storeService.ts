import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const STORE_STATUS_DOC = 'settings/store';

export interface StoreStatus {
    isOpen: boolean;
    lastUpdated?: Date;
}

// Get store status
export async function getStoreStatus(): Promise<StoreStatus> {
    const docRef = doc(db, STORE_STATUS_DOC);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as StoreStatus;
    }

    // Default to open if no document exists
    return { isOpen: true };
}

// Update store status
export async function setStoreStatus(isOpen: boolean): Promise<void> {
    const docRef = doc(db, STORE_STATUS_DOC);
    await setDoc(docRef, {
        isOpen,
        lastUpdated: new Date()
    });
}

// Subscribe to store status changes
export function subscribeToStoreStatus(callback: (status: StoreStatus) => void): () => void {
    const docRef = doc(db, STORE_STATUS_DOC);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as StoreStatus);
        } else {
            callback({ isOpen: true });
        }
    });

    return unsubscribe;
}
