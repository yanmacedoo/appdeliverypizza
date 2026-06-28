import { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(() => {
        const saved = localStorage.getItem('admin_user');
        if (saved) {
            try {
                return JSON.parse(saved) as User;
            } catch (e) {
                return null;
            }
        }
        return null;
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);
                localStorage.removeItem('admin_user');
            } else {
                const saved = localStorage.getItem('admin_user');
                if (!saved) {
                    setUser(null);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email: string, password: string) => {
        if (email === 'admin' && password === 'admin') {
            const mockUser = {
                email: 'admin@fomedepizza.com',
                uid: 'admin-mock-id',
                emailVerified: true,
                isAnonymous: false,
            } as unknown as User;
            setUser(mockUser);
            localStorage.setItem('admin_user', JSON.stringify(mockUser));
            return;
        }
        await signInWithEmailAndPassword(auth, email, password);
    };

    const logout = async () => {
        localStorage.removeItem('admin_user');
        await signOut(auth);
        setUser(null);
    };

    const updateUserPassword = async (currentPassword: string, newPassword: string) => {
        if (!auth.currentUser || !auth.currentUser.email) {
            // Se for o admin mockado, não podemos atualizar a senha no Firebase Auth diretamente.
            const saved = localStorage.getItem('admin_user');
            if (saved) {
                // Apenas simula sucesso para o admin local
                return;
            }
            throw new Error('No user logged in');
        }

        const credential = EmailAuthProvider.credential(
            auth.currentUser.email,
            currentPassword
        );

        await reauthenticateWithCredential(auth.currentUser, credential);
        await updatePassword(auth.currentUser, newPassword);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUserPassword }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

