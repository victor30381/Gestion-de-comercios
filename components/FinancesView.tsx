import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { Order, Recipe } from '../types';
import { StatCard } from './DashboardWidgets';

interface FinancesViewProps {
    userId: string;
}

interface DailyStat {
    date: string;
    ingresos: number;
    costos: number;
    ganancias: number;
    rawDate: Date;
}

const FinancesView: React.FC<FinancesViewProps> = ({ userId }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const qOrders = query(collection(db, 'orders'), where('userId', '==', userId));
        const unsubOrders = onSnapshot(qOrders, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(data.deliveryDate),
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
                } as Order;
            });
            setOrders(fetchedOrders);
            setLoading(false);
        });

        const qRecipes = query(collection(db, 'recipes'), where('userId', '==', userId));
        const unsubRecipes = onSnapshot(qRecipes, (snapshot) => {
            setRecipes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe)));
        });

        return () => {
            unsubOrders();
            unsubRecipes();
        };
    }, [userId]);

    const calculateOrderCost = (order: Order) => {
        return order.items.reduce((sum, item: any) => {
            const recipe = recipes.find(r => r.id === item.recipeId);
            if (recipe) {
                return sum + (item.amount * recipe.costPerGram * item.quantity);
            }
            return sum + (item.price * item.quantity / 3);
        }, 0);
    };

    // Group data by day
    const dailyDataMap = orders.reduce((acc, order) => {
        const dateKey = order.deliveryDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const gross = order.total || 0;
        const cost = calculateOrderCost(order);
        const profit = gross - cost;

        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, ingresos: 0, costos: 0, ganancias: 0, rawDate: order.deliveryDate };
        }
        acc[dateKey].ingresos += gross;
        acc[dateKey].costos += Math.round(cost);
        acc[dateKey].ganancias += Math.round(profit);
        return acc;
    }, {} as Record<string, DailyStat>);

    const sortedData: DailyStat[] = (Object.values(dailyDataMap) as DailyStat[]).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Totals
    const totalGross = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + calculateOrderCost(o), 0);
    const totalProfit = Math.round(totalGross - totalCost);

    if (loading) return <div className="p-8 text-center text-brand-brown font-serif italic">Cargando datos financieros...</div>;

    const maxVal = Math.max(...sortedData.map(d => d.ingresos), 1);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header>
                <h2 className="text-3xl font-serif font-bold text-brand-brown mb-2 tracking-tight">Finanzas de la Empresa</h2>
                <p className="text-stone-500 font-medium">Análisis detallado de ingresos, costos y rentabilidad.</p>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Ingresos Totales" value={`$${totalGross.toLocaleString()}`} />
                <StatCard title="Costos Totales" value={`$${Math.round(totalCost).toLocaleString()}`} />
                <StatCard title="Ganancia Neta" value={`$${totalProfit.toLocaleString()}`} subtext="Rentabilidad total" />
            </div>

            {/* Visualización Simple (Provisional para estabilidad) */}
            <div className="bg-brand-cream rounded-2xl shadow-sm border border-[#E5DCD3] p-6 lg:p-8">
                <h3 className="text-xl font-serif font-bold text-brand-brown mb-6">
                    <span className="text-2xl">📊</span> Resumen de Ingresos por Día
                </h3>
                <div className="space-y-4">
                    {sortedData.slice(-7).map(day => (
                        <div key={day.date} className="flex flex-col gap-1">
                            <div className="flex justify-between text-xs font-bold text-brand-brown">
                                <span>{day.date}</span>
                                <span>${day.ingresos.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 border border-stone-100 overflow-hidden">
                                <div
                                    className="bg-brand-accent h-full transition-all duration-500"
                                    style={{ width: `${(day.ingresos / maxVal) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    <p className="text-[10px] text-stone-400 italic text-center mt-4">Mostrando últimos 7 días con actividad</p>
                </div>
            </div>

            {/* Daily Breakdown Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-brand-brown px-6 py-4">
                    <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <span>🗓️</span> Detalle Diario Generado
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-cream border-b border-stone-100 uppercase text-[10px] font-bold tracking-widest text-brand-brown/60">
                                <th className="px-6 py-4">Fecha</th>
                                <th className="px-6 py-4">Ingresos</th>
                                <th className="px-6 py-4">Costos Reales</th>
                                <th className="px-6 py-4 text-right">Ganancia</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {sortedData.slice().reverse().map((day: DailyStat) => (
                                <tr key={day.date} className="border-b border-stone-50 hover:bg-brand-cream/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-brand-brown">{day.date}</td>
                                    <td className="px-6 py-4 text-stone-600">${day.ingresos.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-400 font-medium">-${day.costos.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right font-bold text-brand-accent">
                                        +${day.ganancias.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FinancesView;
