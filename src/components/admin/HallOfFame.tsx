import { useState, useEffect, useMemo } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Trophy, Crown, TrendingUp, Star, Medal, Calendar } from 'lucide-react';
import type { Order } from '../../types/order';
import { cn } from '../../lib/utils';

interface FlavorRanking {
    name: string;
    count: number;
}

interface CustomerRanking {
    name: string;
    phone: string;
    totalSpent: number;
    orderCount: number;
}

type Period = 'weekly' | 'monthly';

export function HallOfFame() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('weekly');

    // Fetch completed orders
    useEffect(() => {
        const fetchCompletedOrders = async () => {
            try {
                const q = query(
                    collection(db, 'orders'),
                    where('status', '==', 'completed')
                );
                const snapshot = await getDocs(q);
                const completedOrders = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Order[];

                setOrders(completedOrders);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCompletedOrders();
    }, []);

    // Filter orders by period
    const filteredOrders = useMemo(() => {
        const now = new Date();
        const cutoffDate = new Date();

        if (period === 'weekly') {
            cutoffDate.setDate(now.getDate() - 7);
        } else {
            cutoffDate.setMonth(now.getMonth() - 1);
        }

        return orders.filter(order => {
            if (!order.createdAt) return false;
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date();
            return orderDate >= cutoffDate;
        });
    }, [orders, period]);

    // Process flavor rankings
    const topFlavors = useMemo<FlavorRanking[]>(() => {
        const flavorCounts: Record<string, number> = {};

        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (item.type !== 'pizza') return;

                if (item.flavors && item.flavors.length > 0) {
                    // Has explicit flavors (from half-half or flavor selection)
                    const increment = item.flavors.length === 2 ? 0.5 : 1;
                    item.flavors.forEach(flavor => {
                        flavorCounts[flavor] = (flavorCounts[flavor] || 0) + (increment * item.quantity);
                    });
                } else {
                    // Single pizza, use name
                    flavorCounts[item.name] = (flavorCounts[item.name] || 0) + item.quantity;
                }
            });
        });

        return Object.entries(flavorCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredOrders]);

    // Process customer rankings
    const topCustomers = useMemo<CustomerRanking[]>(() => {
        const customerData: Record<string, CustomerRanking> = {};

        filteredOrders.forEach(order => {
            const phone = order.customer.phone || 'unknown';

            if (!customerData[phone]) {
                customerData[phone] = {
                    name: order.customer.name,
                    phone,
                    totalSpent: 0,
                    orderCount: 0
                };
            }

            customerData[phone].totalSpent += order.total;
            customerData[phone].orderCount += 1;
            // Update name if this order has a more complete name
            if (order.customer.name && order.customer.name !== 'Balcão') {
                customerData[phone].name = order.customer.name;
            }
        });

        return Object.values(customerData)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, 5);
    }, [filteredOrders]);

    const getMedalIcon = (position: number) => {
        if (position === 0) return <Trophy className="w-5 h-5 text-yellow-400" />;
        if (position === 1) return <Medal className="w-5 h-5 text-gray-300" />;
        if (position === 2) return <Medal className="w-5 h-5 text-amber-600" />;
        return <Star className="w-4 h-4 text-text-muted" />;
    };

    const getPositionStyle = (position: number) => {
        if (position === 0) return "text-yellow-400 text-lg font-bold";
        if (position === 1) return "text-gray-300 font-semibold";
        if (position === 2) return "text-amber-600 font-semibold";
        return "text-text font-medium";
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-card rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-surface-light rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-surface-light rounded"></div>
                        ))}
                    </div>
                </div>
                <div className="glass-card rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-surface-light rounded w-48 mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-10 bg-surface-light rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Period Filter */}
            <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-text-muted" />
                <div className="flex rounded-lg overflow-hidden border border-white/10">
                    <button
                        onClick={() => setPeriod('weekly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-all",
                            period === 'weekly'
                                ? "bg-primary text-background"
                                : "bg-surface text-text-muted hover:bg-surface-light"
                        )}
                    >
                        Semanal
                    </button>
                    <button
                        onClick={() => setPeriod('monthly')}
                        className={cn(
                            "px-4 py-2 text-sm font-medium transition-all",
                            period === 'monthly'
                                ? "bg-primary text-background"
                                : "bg-surface text-text-muted hover:bg-surface-light"
                        )}
                    >
                        Mensal
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Top Flavors Card */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-white/10">
                        <h3 className="font-bold text-text flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            🏆 O Queridinho da Galera
                        </h3>
                        <p className="text-xs text-text-muted mt-1">Top 5 sabores mais vendidos</p>
                    </div>

                    <div className="p-4">
                        {topFlavors.length === 0 ? (
                            <p className="text-text-muted text-sm text-center py-4">
                                Nenhum pedido finalizado ainda
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {topFlavors.map((flavor, index) => (
                                    <div
                                        key={flavor.name}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg transition-all",
                                            index === 0
                                                ? "bg-yellow-500/10 ring-1 ring-yellow-500/30"
                                                : "bg-surface-light hover:bg-surface"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {getMedalIcon(index)}
                                            <div>
                                                <span className={cn("block", getPositionStyle(index))}>
                                                    {index + 1}º {flavor.name}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn(
                                                "font-bold",
                                                index === 0 ? "text-yellow-400" : "text-primary"
                                            )}>
                                                {flavor.count % 1 === 0 ? flavor.count : flavor.count.toFixed(1)}x
                                            </span>
                                            <span className="text-xs text-text-muted block">vendidas</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Customers Card */}
                <div className="glass-card rounded-xl overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                        <h3 className="font-bold text-text flex items-center gap-2">
                            <Crown className="w-5 h-5 text-purple-400" />
                            👑 Clientes VIP
                        </h3>
                        <p className="text-xs text-text-muted mt-1">Top 5 clientes que mais gastaram</p>
                    </div>

                    <div className="p-4">
                        {topCustomers.length === 0 ? (
                            <p className="text-text-muted text-sm text-center py-4">
                                Nenhum cliente registrado ainda
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {topCustomers.map((customer, index) => (
                                    <div
                                        key={customer.phone}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg transition-all",
                                            index === 0
                                                ? "bg-purple-500/10 ring-1 ring-purple-500/30"
                                                : "bg-surface-light hover:bg-surface"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            {index === 0 ? (
                                                <Crown className="w-5 h-5 text-purple-400" />
                                            ) : (
                                                <TrendingUp className={cn(
                                                    "w-4 h-4",
                                                    index === 1 ? "text-gray-300" :
                                                        index === 2 ? "text-amber-600" : "text-text-muted"
                                                )} />
                                            )}
                                            <div>
                                                <span className={cn("block", getPositionStyle(index))}>
                                                    {customer.name || 'Cliente'}
                                                </span>
                                                <span className="text-xs text-text-muted">
                                                    {customer.orderCount} {customer.orderCount === 1 ? 'pedido' : 'pedidos'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={cn(
                                                "font-bold",
                                                index === 0 ? "text-purple-400" : "text-primary"
                                            )}>
                                                R$ {customer.totalSpent.toFixed(2).replace('.', ',')}
                                            </span>
                                            <span className="text-xs text-text-muted block">total gasto</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
