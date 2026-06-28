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
    Lock,
    TrendingUp,
    BarChart3,
    Ticket,
    Trash2
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
import { subscribeToCoupons, saveCoupon, deleteCoupon, type Coupon } from '../services/couponService';
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

    // Revenue & Coupons Tab States
    const [activeTab, setActiveTab] = useState<'orders' | 'revenue' | 'coupons'>('orders');
    const [revenuePeriod, setRevenuePeriod] = useState<'week' | 'month' | 'custom'>('week');
    const [revenueStartDate, setRevenueStartDate] = useState<string>(() => {
        const d = new Date();
        d.setDate(d.getDate() - 6); // default to last 7 days
        return formatDateKey(d);
    });
    const [revenueEndDate, setRevenueEndDate] = useState<string>(() => {
        return formatDateKey(new Date());
    });

    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [isAddingCoupon, setIsAddingCoupon] = useState(false);
    const [couponForm, setCouponForm] = useState<Partial<Coupon>>({
        code: '',
        type: 'percentage',
        value: 0,
        minOrderValue: 0,
        isActive: true
    });
    const [deletingCouponId, setDeletingCouponId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Fetch coupons in real-time
    useEffect(() => {
        const unsubscribe = subscribeToCoupons((newCoupons) => {
            setCoupons(newCoupons);
        });
        return () => unsubscribe();
    }, []);

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

    const handleSaveCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!couponForm.code || !couponForm.value) return;
        setSaving(true);
        try {
            await saveCoupon({
                id: couponForm.id,
                code: couponForm.code.toUpperCase().trim(),
                type: couponForm.type || 'percentage',
                value: Number(couponForm.value),
                minOrderValue: Number(couponForm.minOrderValue || 0),
                isActive: couponForm.isActive ?? true
            });
            setIsAddingCoupon(false);
            setCouponForm({ code: '', type: 'percentage', value: 0, minOrderValue: 0, isActive: true });
        } catch (error) {
            console.error('Erro ao salvar cupom:', error);
            alert('Erro ao salvar cupom');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteCoupon = async () => {
        if (!deletingCouponId) return;
        try {
            await deleteCoupon(deletingCouponId);
            setDeletingCouponId(null);
        } catch (error) {
            console.error('Erro ao excluir cupom:', error);
            alert('Erro ao excluir cupom');
        }
    };

    const handleToggleCouponActive = async (coupon: Coupon) => {
        try {
            await saveCoupon({
                ...coupon,
                isActive: !coupon.isActive
            });
        } catch (error) {
            console.error('Erro ao alternar status do cupom:', error);
        }
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

    // Financial/Revenue stats calculation
    const revenueData = useMemo(() => {
        let start = new Date();
        const end = new Date();
        end.setHours(23, 59, 59, 999);

        if (revenuePeriod === 'week') {
            start.setDate(start.getDate() - 6); // Last 7 days
            start.setHours(0, 0, 0, 0);
        } else if (revenuePeriod === 'month') {
            start.setDate(start.getDate() - 29); // Last 30 days
            start.setHours(0, 0, 0, 0);
        } else {
            if (revenueStartDate) {
                const [year, month, day] = revenueStartDate.split('-').map(Number);
                start = new Date(year, month - 1, day, 0, 0, 0, 0);
            } else {
                start.setDate(start.getDate() - 6);
            }
            if (revenueEndDate) {
                const [year, month, day] = revenueEndDate.split('-').map(Number);
                end.setFullYear(year, month - 1, day);
                end.setHours(23, 59, 59, 999);
            }
        }

        // Filter orders in range
        const filtered = orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = order.createdAt.toDate();
            return orderDate >= start && orderDate <= end;
        });

        const completedOrders = filtered.filter(o => o.status === 'completed');
        const cancelledOrders = filtered.filter(o => o.status === 'cancelled');
        const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
        const completedCount = completedOrders.length;
        const averageTicket = completedCount > 0 ? totalRevenue / completedCount : 0;

        // Group by day for the chart
        const dailyMap = new Map<string, { dateKey: string; dateStr: string; revenue: number; count: number }>();
        
        // Initialize all days in range
        const current = new Date(start);
        while (current <= end) {
            const key = formatDateKey(current);
            dailyMap.set(key, {
                dateKey: key,
                dateStr: current.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                revenue: 0,
                count: 0
            });
            current.setDate(current.getDate() + 1);
        }

        // Populate actual values
        completedOrders.forEach(order => {
            const key = formatDateKey(order.createdAt.toDate());
            const existing = dailyMap.get(key);
            if (existing) {
                existing.revenue += order.total;
                existing.count += 1;
            }
        });

        const dailyList = Array.from(dailyMap.values());
        const maxDailyRevenue = Math.max(...dailyList.map(d => d.revenue), 1);

        return {
            totalRevenue,
            completedCount,
            averageTicket,
            cancelledCount: cancelledOrders.length,
            dailyList,
            maxDailyRevenue
        };
    }, [orders, revenuePeriod, revenueStartDate, revenueEndDate]);

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
                {/* Tabs */}
                <div className="flex border-b border-white/10 mb-6 gap-2">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={cn(
                            "pb-3 text-sm font-semibold transition-colors border-b-2 px-4 flex items-center gap-2",
                            activeTab === 'orders'
                                ? "text-primary border-primary"
                                : "text-text-muted border-transparent hover:text-text"
                        )}
                    >
                        <Package className="w-4 h-4" />
                        Pedidos
                    </button>
                    <button
                        onClick={() => setActiveTab('revenue')}
                        className={cn(
                            "pb-3 text-sm font-semibold transition-colors border-b-2 px-4 flex items-center gap-2",
                            activeTab === 'revenue'
                                ? "text-primary border-primary"
                                : "text-text-muted border-transparent hover:text-text"
                        )}
                    >
                        <TrendingUp className="w-4 h-4" />
                        Faturamento
                    </button>
                    <button
                        onClick={() => setActiveTab('coupons')}
                        className={cn(
                            "pb-3 text-sm font-semibold transition-colors border-b-2 px-4 flex items-center gap-2",
                            activeTab === 'coupons'
                                ? "text-primary border-primary"
                                : "text-text-muted border-transparent hover:text-text"
                        )}
                    >
                        <Ticket className="w-4 h-4" />
                        Cupons
                    </button>
                </div>

                {activeTab === 'orders' && (
                    <>
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
                    </>
                )}

                {activeTab === 'revenue' && (
                    <div className="space-y-6">
                        {/* Period Selector & Custom Dates */}
                        <div className="glass-card rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => setRevenuePeriod('week')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        revenuePeriod === 'week'
                                            ? "bg-primary/20 text-primary ring-1 ring-primary"
                                            : "bg-surface-light text-text-muted hover:text-text hover:bg-surface"
                                    )}
                                >
                                    Últimos 7 dias
                                </button>
                                <button
                                    onClick={() => setRevenuePeriod('month')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        revenuePeriod === 'month'
                                            ? "bg-primary/20 text-primary ring-1 ring-primary"
                                            : "bg-surface-light text-text-muted hover:text-text hover:bg-surface"
                                    )}
                                >
                                    Últimos 30 dias
                                </button>
                                <button
                                    onClick={() => setRevenuePeriod('custom')}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        revenuePeriod === 'custom'
                                            ? "bg-primary/20 text-primary ring-1 ring-primary"
                                            : "bg-surface-light text-text-muted hover:text-text hover:bg-surface"
                                    )}
                                >
                                    Período Personalizado
                                </button>
                            </div>

                            {revenuePeriod === 'custom' && (
                                <div className="flex flex-wrap items-center gap-2">
                                    <input
                                        type="date"
                                        value={revenueStartDate}
                                        onChange={e => setRevenueStartDate(e.target.value)}
                                        className="bg-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-text text-sm"
                                    />
                                    <span className="text-text-muted text-xs">até</span>
                                    <input
                                        type="date"
                                        value={revenueEndDate}
                                        onChange={e => setRevenueEndDate(e.target.value)}
                                        className="bg-surface-light border border-white/10 rounded-lg px-3 py-1.5 text-text text-sm"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Revenue Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-emerald-500">
                                <div>
                                    <p className="text-xs text-text-muted font-medium uppercase">Faturamento Total</p>
                                    <p className="text-2xl font-bold text-emerald-500 mt-1">
                                        R$ {revenueData.totalRevenue.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-muted mt-4">
                                    <span>Vendas Concluídas</span>
                                    <DollarSign className="w-4 h-4 text-emerald-500" />
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-blue-500">
                                <div>
                                    <p className="text-xs text-text-muted font-medium uppercase">Pedidos Concluídos</p>
                                    <p className="text-2xl font-bold text-blue-500 mt-1">
                                        {revenueData.completedCount}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-muted mt-4">
                                    <span>Volume de vendas</span>
                                    <CheckCircle className="w-4 h-4 text-blue-500" />
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-violet-500">
                                <div>
                                    <p className="text-xs text-text-muted font-medium uppercase">Ticket Médio</p>
                                    <p className="text-2xl font-bold text-violet-500 mt-1">
                                        R$ {revenueData.averageTicket.toFixed(2).replace('.', ',')}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-muted mt-4">
                                    <span>Valor médio / pedido</span>
                                    <TrendingUp className="w-4 h-4 text-violet-500" />
                                </div>
                            </div>

                            <div className="glass-card rounded-xl p-4 flex flex-col justify-between border-l-4 border-red-500">
                                <div>
                                    <p className="text-xs text-text-muted font-medium uppercase">Pedidos Cancelados</p>
                                    <p className="text-2xl font-bold text-red-500 mt-1">
                                        {revenueData.cancelledCount}
                                    </p>
                                </div>
                                <div className="flex items-center justify-between text-xs text-text-muted mt-4">
                                    <span>Não faturados</span>
                                    <XCircle className="w-4 h-4 text-red-500" />
                                </div>
                            </div>
                        </div>

                        {/* Chart (Premium CSS Grid Chart) */}
                        <div className="glass-card rounded-xl p-5">
                            <h3 className="text-sm font-semibold text-text mb-6 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Evolução Diária de Vendas
                            </h3>

                            {revenueData.dailyList.length === 0 ? (
                                <p className="text-text-muted text-center py-10">Nenhum dado de faturamento no período</p>
                            ) : (
                                <div className="h-64 flex items-end gap-1 md:gap-2 pt-6 border-b border-white/10 overflow-x-auto select-none">
                                    {revenueData.dailyList.map((day, idx) => {
                                        const pct = (day.revenue / revenueData.maxDailyRevenue) * 100;
                                        return (
                                            <div
                                                key={idx}
                                                className="flex-1 flex flex-col items-center group relative min-w-[32px] max-w-[60px]"
                                                style={{ height: '100%' }}
                                            >
                                                {/* Tooltip on Hover */}
                                                <div className="absolute bottom-full mb-2 bg-surface border border-white/10 rounded px-2 py-1 text-center scale-0 group-hover:scale-100 origin-bottom transition-transform duration-200 z-10 pointer-events-none shadow-xl min-w-[90px]">
                                                    <p className="text-[10px] text-text-muted">{day.dateStr}</p>
                                                    <p className="text-xs font-bold text-primary">R$ {day.revenue.toFixed(2).replace('.', ',')}</p>
                                                    <p className="text-[9px] text-text-muted">{day.count} ped.</p>
                                                </div>

                                                {/* Bar */}
                                                <div 
                                                    className="w-full rounded-t bg-gradient-to-t from-primary/50 to-primary group-hover:to-primary-hover transition-all duration-300 relative flex items-end justify-center"
                                                    style={{ height: `${Math.max(4, pct)}%` }}
                                                >
                                                    {day.revenue > 0 && (
                                                        <div className="text-[9px] font-bold text-background opacity-0 group-hover:opacity-100 transition-opacity mb-1 whitespace-nowrap">
                                                            R$
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <span className="text-[10px] text-text-muted mt-2 truncate w-full text-center">
                                                    {day.dateStr}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Detailed Table */}
                        <div className="glass-card rounded-xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <h3 className="text-sm font-semibold text-text">Detalhamento por Dia</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse text-sm">
                                    <thead>
                                        <tr className="bg-surface-light text-text-muted border-b border-white/10">
                                            <th className="p-4 font-semibold">Data</th>
                                            <th className="p-4 font-semibold text-center">Pedidos Concluídos</th>
                                            <th className="p-4 font-semibold text-right">Faturamento</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[...revenueData.dailyList].reverse().map((day, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4 text-text font-medium">{day.dateStr}</td>
                                                <td className="p-4 text-center text-text-muted">{day.count}</td>
                                                <td className="p-4 text-right text-emerald-500 font-bold">
                                                    R$ {day.revenue.toFixed(2).replace('.', ',')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'coupons' && (
                    <div className="space-y-6">
                        {/* Header & Add Button */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-text">Cupons de Desconto</h3>
                                <p className="text-xs text-text-muted">Crie e gerencie os cupons da sua pizzaria</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsAddingCoupon(true);
                                    setCouponForm({ code: '', type: 'percentage', value: 0, minOrderValue: 0, isActive: true });
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-background font-bold rounded-lg hover:bg-primary/95 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Criar Cupom
                            </button>
                        </div>

                        {/* Add/Edit Coupon Form */}
                        {isAddingCoupon && (
                            <form onSubmit={handleSaveCoupon} className="glass-card rounded-xl p-5 space-y-4 animate-in slide-in-from-top-2 duration-200">
                                <h4 className="text-sm font-semibold text-primary">
                                    {couponForm.id ? 'Editar Cupom' : 'Novo Cupom de Desconto'}
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    {/* Code Input */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted font-medium">Código do Cupom</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Ex: QUEROPIZZA10"
                                            value={couponForm.code || ''}
                                            onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                                            className="w-full bg-surface-light border border-white/10 rounded-xl px-3 py-2 text-text text-sm uppercase focus:outline-none focus:border-primary/50"
                                        />
                                    </div>

                                    {/* Type Select */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted font-medium">Tipo de Desconto</label>
                                        <select
                                            value={couponForm.type || 'percentage'}
                                            onChange={e => setCouponForm({ ...couponForm, type: e.target.value as 'percentage' | 'fixed', value: 0 })}
                                            className="w-full bg-surface-light border border-white/10 rounded-xl px-3 py-2 text-text text-sm focus:outline-none focus:border-primary/50"
                                        >
                                            <option value="percentage">Porcentagem (%)</option>
                                            <option value="fixed">Valor Fixo (R$)</option>
                                        </select>
                                    </div>

                                    {/* Value Input */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted font-medium">Valor do Desconto</label>
                                        <div className="relative">
                                            {couponForm.type === 'fixed' && (
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">R$</span>
                                            )}
                                            <input
                                                type="number"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                placeholder={couponForm.type === 'percentage' ? 'Ex: 10' : 'Ex: 5,00'}
                                                value={couponForm.value || ''}
                                                onChange={e => setCouponForm({ ...couponForm, value: Number(e.target.value) })}
                                                className={cn(
                                                    "w-full bg-surface-light border border-white/10 rounded-xl py-2 text-text text-sm focus:outline-none focus:border-primary/50",
                                                    couponForm.type === 'fixed' ? "pl-8 pr-3" : "px-3"
                                                )}
                                            />
                                            {couponForm.type === 'percentage' && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">%</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Min Order Value Input */}
                                    <div className="space-y-1">
                                        <label className="text-xs text-text-muted font-medium">Pedido Mínimo (Opcional)</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">R$</span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                placeholder="Ex: 50,00"
                                                value={couponForm.minOrderValue || ''}
                                                onChange={e => setCouponForm({ ...couponForm, minOrderValue: Number(e.target.value) })}
                                                className="w-full bg-surface-light border border-white/10 rounded-xl pl-8 pr-3 py-2 text-text text-sm focus:outline-none focus:border-primary/50"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            checked={couponForm.isActive ?? true}
                                            onChange={e => setCouponForm({ ...couponForm, isActive: e.target.checked })}
                                            className="rounded border-white/10 text-primary focus:ring-0 bg-surface-light"
                                        />
                                        <span className="text-sm text-text-muted">Cupom Ativo (Disponível para uso)</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsAddingCoupon(false)}
                                            className="px-4 py-2 text-sm text-text-muted hover:text-text"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-4 py-2 bg-primary text-background font-bold rounded-lg text-sm"
                                        >
                                            {saving ? 'Salvando...' : 'Salvar Cupom'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        )}

                        {/* Coupons List Grid */}
                        {coupons.length === 0 ? (
                            <div className="glass-card rounded-xl p-10 text-center text-text-muted">
                                <Ticket className="w-12 h-12 text-text-muted/40 mx-auto mb-3" />
                                <p className="text-sm">Nenhum cupom de desconto criado.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {coupons.map((coupon) => (
                                    <div key={coupon.id} className={cn(
                                        "glass-card rounded-xl p-4 flex flex-col justify-between border-t-2 relative overflow-hidden",
                                        coupon.isActive ? "border-primary" : "border-gray-500 opacity-60"
                                    )}>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-bold text-lg text-text bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase">
                                                    {coupon.code}
                                                </span>
                                                <span className={cn(
                                                    "text-xs px-2 py-1 rounded-full font-medium",
                                                    coupon.isActive ? "bg-green-500/20 text-green-400" : "bg-white/10 text-text-muted"
                                                )}>
                                                    {coupon.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-1">
                                                <p className="text-sm text-text-muted">
                                                    Desconto:{' '}
                                                    <strong className="text-text">
                                                        {coupon.type === 'percentage' 
                                                            ? `${coupon.value}%` 
                                                            : `R$ ${coupon.value.toFixed(2).replace('.', ',')}`}
                                                    </strong>
                                                </p>
                                                <p className="text-xs text-text-muted">
                                                    Pedido Mínimo:{' '}
                                                    <strong className="text-text-muted/80">
                                                        {coupon.minOrderValue && coupon.minOrderValue > 0
                                                            ? `R$ ${coupon.minOrderValue.toFixed(2).replace('.', ',')}`
                                                            : 'Sem valor mínimo'}
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end gap-2 mt-6 border-t border-white/5 pt-3 shrink-0">
                                            <button
                                                onClick={() => handleToggleCouponActive(coupon)}
                                                className="px-2.5 py-1.5 bg-surface-light rounded-lg text-xs text-text hover:text-primary transition-colors font-medium"
                                            >
                                                {coupon.isActive ? 'Desativar' : 'Ativar'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsAddingCoupon(true);
                                                    setCouponForm(coupon);
                                                }}
                                                className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setDeletingCouponId(coupon.id!)}
                                                className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                                                title="Deletar"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

            {/* Modal de Confirmação de Exclusão de Cupom */}
            {deletingCouponId && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeletingCouponId(null)}
                    />
                    <div className="relative bg-surface rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                        <h3 className="text-lg font-bold text-text mb-2">Excluir Cupom</h3>
                        <p className="text-text-muted mb-6">Tem certeza que deseja excluir o cupom {deletingCouponId}?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeletingCouponId(null)}
                                className="px-4 py-2 text-text-muted hover:text-text transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDeleteCoupon}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
