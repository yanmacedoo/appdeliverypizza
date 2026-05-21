import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,

    Package,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    RefreshCw,
    Calendar,
    DollarSign,
    ChevronLeft,
    ChevronRight,
    Edit,
    Plus,
    Volume2,
    VolumeX,
    Store,
    DoorOpen,
    Settings,
    Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { OrderCard } from '../components/admin/OrderCard';
import { MenuEditor } from '../components/admin/MenuEditor';
import { ChangePasswordModal } from '../components/admin/ChangePasswordModal';
import { ManualOrderModal } from '../components/admin/ManualOrderModal';
import { HallOfFame } from '../components/admin/HallOfFame';
import { subscribeToOrders } from '../services/orderService';
import { useMenuStore } from '../store/menuStore';
import { subscribeToStoreStatus, setStoreStatus } from '../services/storeService';
import type { Order, OrderStatus } from '../types/order';
import { cn } from '../lib/utils';

type FilterStatus = 'all' | OrderStatus;

// Notification sound URL (free sound effect)
const NOTIFICATION_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

// Helper to format date as YYYY-MM-DD using LOCAL timezone
function formatDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to format date for display
function formatDateDisplay(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (formatDateKey(date) === formatDateKey(today)) {
        return 'Hoje';
    } else if (formatDateKey(date) === formatDateKey(yesterday)) {
        return 'Ontem';
    } else {
        return date.toLocaleDateString('pt-BR', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit'
        });
    }
}

export function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout, loading: authLoading } = useAuth();

    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterStatus>('all');
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isMenuEditorOpen, setIsMenuEditorOpen] = useState(false);
    const [isManualOrderOpen, setIsManualOrderOpen] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showHallOfFame, setShowHallOfFame] = useState(false);
    const [isStoreOpen, setIsStoreOpen] = useState(true);
    const [togglingStore, setTogglingStore] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Refs for sound alert
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const prevPendingCountRef = useRef<number>(0);
    const isInitialLoadRef = useRef(true);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
        audioRef.current.volume = 0.7;
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin');
        }
    }, [user, authLoading, navigate]);

    // Subscribe to orders and play sound for new pending orders
    useEffect(() => {
        const unsubscribe = subscribeToOrders((newOrders) => {
            const pendingCount = newOrders.filter(o => o.status === 'pending').length;

            // Play sound if pending count increased (and not initial load)
            if (!isInitialLoadRef.current && soundEnabled && pendingCount > prevPendingCountRef.current) {
                audioRef.current?.play().catch(err => {
                    console.log('Could not play notification sound:', err);
                });
            }

            prevPendingCountRef.current = pendingCount;
            isInitialLoadRef.current = false;
            setOrders(newOrders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [soundEnabled]);

    // Subscribe to menu updates for MenuEditor
    const { initializeFromFirebase } = useMenuStore();
    useEffect(() => {
        const unsubscribe = initializeFromFirebase();
        return () => unsubscribe();
    }, [initializeFromFirebase]);

    // Subscribe to store status
    useEffect(() => {
        const unsubscribe = subscribeToStoreStatus((status) => {
            setIsStoreOpen(status.isOpen);
        });
        return () => unsubscribe();
    }, []);

    // Toggle store open/closed
    const handleToggleStore = async () => {
        setTogglingStore(true);
        try {
            await setStoreStatus(!isStoreOpen);
        } catch (error) {
            console.error('Error toggling store status:', error);
        } finally {
            setTogglingStore(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin');
    };

    // Navigate dates
    const goToPreviousDay = () => {
        const prev = new Date(selectedDate);
        prev.setDate(prev.getDate() - 1);
        setSelectedDate(prev);
    };

    const goToNextDay = () => {
        const next = new Date(selectedDate);
        next.setDate(next.getDate() + 1);
        // Don't allow future dates
        if (next <= new Date()) {
            setSelectedDate(next);
        }
    };

    const goToToday = () => {
        setSelectedDate(new Date());
    };

    // Filter orders by selected date
    const ordersForSelectedDate = useMemo(() => {
        const selectedDateKey = formatDateKey(selectedDate);
        return orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = order.createdAt.toDate();
            return formatDateKey(orderDate) === selectedDateKey;
        });
    }, [orders, selectedDate]);

    // Calculate order numbers (sorted by createdAt ascending for numbering)
    const orderNumbersMap = useMemo(() => {
        const sorted = [...ordersForSelectedDate].sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeA - timeB; // Ascending order - first order gets #01
        });
        const map = new Map<string, number>();
        sorted.forEach((order, index) => {
            if (order.id) {
                map.set(order.id, index + 1);
            }
        });
        return map;
    }, [ordersForSelectedDate]);

    // Apply status filter
    const filteredOrders = filter === 'all'
        ? ordersForSelectedDate
        : ordersForSelectedDate.filter(o => o.status === filter);

    // Stats for selected date
    const stats = useMemo(() => ({
        pending: ordersForSelectedDate.filter(o => o.status === 'pending').length,
        preparing: ordersForSelectedDate.filter(o => o.status === 'preparing').length,
        delivering: ordersForSelectedDate.filter(o => o.status === 'delivering').length,
        completed: ordersForSelectedDate.filter(o => o.status === 'completed').length,
    }), [ordersForSelectedDate]);

    // Daily revenue (only completed orders)
    const dailyRevenue = useMemo(() => {
        return ordersForSelectedDate
            .filter(o => o.status === 'completed')
            .reduce((sum, order) => sum + order.total, 0);
    }, [ordersForSelectedDate]);

    const filterButtons: { status: FilterStatus; label: string; icon: any; count?: number }[] = [
        { status: 'all', label: 'Todos', icon: Package, count: ordersForSelectedDate.length },
        { status: 'pending', label: 'Pendentes', icon: Clock, count: stats.pending },
        { status: 'preparing', label: 'Preparo', icon: RefreshCw, count: stats.preparing },
        { status: 'delivering', label: 'Entrega', icon: Truck, count: stats.delivering },
        { status: 'completed', label: 'Concluídos', icon: CheckCircle, count: stats.completed },
        { status: 'cancelled', label: 'Cancelados', icon: XCircle },
    ];

    const isToday = formatDateKey(selectedDate) === formatDateKey(new Date());

    if (authLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-card border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/images/logo-hero.png" alt="Logo" className="w-8 h-8 object-contain" />
                        <div>
                            <h1 className="font-bold text-text">Fome de Pizza</h1>
                            <p className="text-xs text-text-muted">Painel Admin</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Store Open/Close Toggle */}
                        <button
                            onClick={handleToggleStore}
                            disabled={togglingStore}
                            className={cn(
                                "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors font-medium text-sm",
                                isStoreOpen
                                    ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                    : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            )}
                            title={isStoreOpen ? 'Loja aberta' : 'Loja fechada'}
                        >
                            {isStoreOpen ? <Store className="w-4 h-4" /> : <DoorOpen className="w-4 h-4" />}
                            <span className="hidden sm:inline">{isStoreOpen ? 'Aberto' : 'Fechado'}</span>
                        </button>

                        {/* Sound Toggle */}
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                soundEnabled
                                    ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                    : "bg-surface-light text-text-muted hover:text-text"
                            )}
                            title={soundEnabled ? 'Som ativado' : 'Som desativado'}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </button>

                        <button
                            onClick={() => setIsManualOrderOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Novo Pedido</span>
                        </button>

                        <div className="relative">
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="hidden sm:inline">Configurações</span>
                            </button>

                            {/* Settings Dropdown */}
                            {isSettingsOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsSettingsOpen(false)}
                                    />
                                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface border border-white/10 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">

                                        <button
                                            onClick={() => {
                                                setIsMenuEditorOpen(true);
                                                setIsSettingsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-white/5 transition-colors"
                                        >
                                            <Edit className="w-4 h-4 text-primary" />
                                            Editar Cardápio
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsChangePasswordOpen(true);
                                                setIsSettingsOpen(false);
                                            }}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-text hover:bg-white/5 transition-colors border-t border-white/5"
                                        >
                                            <Lock className="w-4 h-4 text-text-muted" />
                                            Alterar Senha
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-surface-light rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sair</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Date Navigator */}
                <div className="glass-card rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={goToPreviousDay}
                            className="p-2 rounded-lg bg-surface-light hover:bg-surface text-text-muted hover:text-text transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-3">
                            <Calendar className="w-5 h-5 text-primary" />
                            <span className="text-lg font-semibold text-text">
                                {formatDateDisplay(selectedDate)}
                            </span>
                            {!isToday && (
                                <button
                                    onClick={goToToday}
                                    className="text-xs px-2 py-1 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors"
                                >
                                    Ir para Hoje
                                </button>
                            )}
                        </div>

                        <button
                            onClick={goToNextDay}
                            disabled={isToday}
                            className={cn(
                                "p-2 rounded-lg transition-colors",
                                isToday
                                    ? "bg-surface-light text-text-muted/30 cursor-not-allowed"
                                    : "bg-surface-light hover:bg-surface text-text-muted hover:text-text"
                            )}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Revenue Card */}
                <div className="glass-card rounded-xl p-4 mb-6 bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-text-muted">Faturamento do Dia</p>
                                <p className="text-xs text-text-muted/70">(pedidos concluídos)</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-500">
                                R$ {dailyRevenue.toFixed(2).replace('.', ',')}
                            </p>
                            <p className="text-xs text-text-muted">
                                {stats.completed} pedido{stats.completed !== 1 ? 's' : ''} finalizado{stats.completed !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-red-500">{stats.pending}</div>
                        <div className="text-xs text-text-muted mt-1">🔴 Pendentes</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-yellow-500">{stats.preparing}</div>
                        <div className="text-xs text-text-muted mt-1">🟡 Em Preparo</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-green-500">{stats.delivering}</div>
                        <div className="text-xs text-text-muted mt-1">🟢 Em Entrega</div>
                    </div>
                    <div className="glass-card rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-500">{stats.completed}</div>
                        <div className="text-xs text-text-muted mt-1">✅ Concluídos</div>
                    </div>
                </div>

                {/* Hall of Fame - Collapsible */}
                <div className="mb-6">
                    <button
                        onClick={() => setShowHallOfFame(!showHallOfFame)}
                        className="w-full glass-card rounded-xl p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                        <span className="text-sm font-semibold text-text flex items-center gap-2">
                            🏆 Hall da Fama (Rankings)
                        </span>
                        <span className="text-xs text-text-muted">
                            {showHallOfFame ? '▲ Ocultar' : '▼ Mostrar'}
                        </span>
                    </button>
                    {showHallOfFame && (
                        <div className="mt-3">
                            <HallOfFame />
                        </div>
                    )}
                </div>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-2 mb-6">
                    {filterButtons.map(({ status, label, icon: Icon, count }) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                filter === status
                                    ? "bg-primary/20 text-primary ring-1 ring-primary"
                                    : "bg-surface-light text-text-muted hover:text-text hover:bg-surface"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                            {count !== undefined && count > 0 && (
                                <span className={cn(
                                    "px-2 py-0.5 rounded-full text-xs",
                                    filter === status ? "bg-primary/30" : "bg-white/10"
                                )}>
                                    {count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-50" />
                        <p className="text-text-muted">
                            {filter === 'all'
                                ? `Nenhum pedido em ${formatDateDisplay(selectedDate).toLowerCase()}`
                                : `Nenhum pedido ${filterButtons.find(f => f.status === filter)?.label.toLowerCase()}`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map((order) => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                orderNumber={order.id ? orderNumbersMap.get(order.id) || 0 : 0}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Menu Editor Modal */}
            <MenuEditor
                isOpen={isMenuEditorOpen}
                onClose={() => setIsMenuEditorOpen(false)}
            />

            {/* Manual Order Modal */}
            <ManualOrderModal
                isOpen={isManualOrderOpen}
                onClose={() => setIsManualOrderOpen(false)}
            />

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
        </div>
    );
}
