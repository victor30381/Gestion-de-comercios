import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { Order, Recipe, Ingredient, ProductionLog } from '../types';
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
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [productionLogs, setProductionLogs] = useState<ProductionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

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

        const qIngredients = query(collection(db, 'ingredients'), where('userId', '==', userId));
        const unsubIng = onSnapshot(qIngredients, (snapshot) => {
            setIngredients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ingredient)));
        });

        const qLogs = query(collection(db, 'production_logs'), where('userId', '==', userId));
        const unsubLogs = onSnapshot(qLogs, (snapshot) => {
            setProductionLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ProductionLog)));
        });

        return () => {
            unsubOrders();
            unsubRecipes();
            unsubIng();
            unsubLogs();
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

    const getStartOfWeek = (date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when Sunday
        return new Date(d.setDate(diff));
    };

    // Group data by selected timeframe
    const aggregatedDataMap = orders.reduce((acc, order) => {
        let dateKey = "";
        let rawDate = order.deliveryDate;

        if (timeframe === 'daily') {
            dateKey = order.deliveryDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        } else if (timeframe === 'weekly') {
            const startOfWeek = getStartOfWeek(order.deliveryDate);
            dateKey = `Sem. ${startOfWeek.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}`;
            rawDate = startOfWeek;
        } else if (timeframe === 'monthly') {
            dateKey = order.deliveryDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            rawDate = new Date(order.deliveryDate.getFullYear(), order.deliveryDate.getMonth(), 1);
        }

        const gross = order.total || 0;
        const cost = calculateOrderCost(order);
        const profit = gross - cost;

        if (!acc[dateKey]) {
            acc[dateKey] = { date: dateKey, ingresos: 0, costos: 0, ganancias: 0, rawDate };
        }
        acc[dateKey].ingresos += gross;
        acc[dateKey].costos += Math.round(cost);
        acc[dateKey].ganancias += Math.round(profit);
        return acc;
    }, {} as Record<string, DailyStat>);

    const sortedData: DailyStat[] = (Object.values(aggregatedDataMap) as DailyStat[]).sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime());

    // Totals
    const totalGross = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalCost = orders.reduce((sum, o) => sum + calculateOrderCost(o), 0);
    const totalProfit = Math.round(totalGross - totalCost);

    // New Calculations for Cards
    const stockValue = ingredients.reduce((sum, ing) => {
        if ((ing.currentStock || 0) > 0) {
            return sum + ((ing.currentStock || 0) * ing.pricePerUnit);
        }
        return sum;
    }, 0);

    const productionValue = productionLogs.reduce((sum, log) => {
        const recipe = recipes.find(r => r.id === log.recipeId);
        if (recipe && recipe.costPerGram) {
            return sum + (log.quantityProduced * recipe.costPerGram);
        }
        return sum;
    }, 0);

    if (loading) return <div className="p-8 text-center text-brand-brown font-serif italic">Cargando datos financieros...</div>;

    const maxVal = Math.max(...sortedData.map(d => d.ingresos), 1);

    return (
        <div className="flex flex-col gap-8 pb-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-brand-brown mb-2 tracking-tight">Finanzas de la Empresa</h2>
                    <p className="text-stone-500 font-medium">Análisis detallado de ingresos, costos y rentabilidad.</p>
                </div>

                {/* Timeframe Selector */}
                <div className="flex bg-brand-cream border border-[#E5DCD3] p-1 rounded-xl shadow-sm self-start md:self-auto">
                    {(['daily', 'weekly', 'monthly'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTimeframe(t)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all uppercase tracking-wider
                                ${timeframe === t
                                    ? 'bg-brand-brown text-white shadow-md'
                                    : 'text-brand-brown/60 hover:text-brand-brown hover:bg-white/50'}`}
                        >
                            {t === 'daily' ? 'Día' : t === 'weekly' ? 'Semana' : 'Mes'}
                        </button>
                    ))}
                </div>
            </header>

            {/* Global Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Ingresos Totales" value={`$${totalGross.toLocaleString()}`} />
                <StatCard title="Costos (Ventas)" value={`$${Math.round(totalCost).toLocaleString()}`} />
                <StatCard title="Ganancia Neta" value={`$${totalProfit.toLocaleString()}`} subtext="Rentabilidad total" />
            </div>

            {/* Inventory & Production Stats */}
            <h3 className="text-xl font-serif font-bold text-brand-brown mt-4 mb-2">Indicadores Operativos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <span className="text-4xl mb-2">📦</span>
                    <h4 className="text-stone-500 font-bold uppercase tracking-wider text-xs mb-1">Valor Stock Insumos</h4>
                    <p className="text-2xl font-serif font-bold text-brand-brown">
                        ${stockValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-stone-400 mt-2">Dinero en estantería (MP)</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <span className="text-4xl mb-2">👩‍🍳</span>
                    <h4 className="text-stone-500 font-bold uppercase tracking-wider text-xs mb-1">Producción Registrada</h4>
                    <p className="text-2xl font-serif font-bold text-brand-brown">
                        ${productionValue.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-stone-400 mt-2">Valor costo elaborado total</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <span className="text-4xl mb-2">📈</span>
                    <h4 className="text-stone-500 font-bold uppercase tracking-wider text-xs mb-1">Margen Promedio</h4>
                    <p className="text-2xl font-serif font-bold text-brand-accent">
                        {totalGross > 0 ? ((totalProfit / totalGross) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-xs text-stone-400 mt-2">Sobre ventas totales</p>
                </div>
            </div>

            {/* Visualización Simple */}
            <div className="bg-brand-cream rounded-2xl shadow-sm border border-[#E5DCD3] p-6 lg:p-8">
                <h3 className="text-xl font-serif font-bold text-brand-brown mb-6 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                        <span className="text-2xl">📊</span>
                        Resumen de Ingresos
                    </span>
                    <span className="text-xs uppercase tracking-widest text-[#D4A373] bg-[#D4A373]/10 px-3 py-1 rounded-full border border-[#D4A373]/20">
                        {timeframe === 'daily' ? 'Vista Diaria' : timeframe === 'weekly' ? 'Vista Semanal' : 'Vista Mensual'}
                    </span>
                </h3>
                <div className="space-y-4">
                    {sortedData.slice(timeframe === 'daily' ? -10 : timeframe === 'weekly' ? -8 : -12).map(day => (
                        <div key={day.date} className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm font-bold text-brand-brown">
                                <span className="capitalize">{day.date}</span>
                                <span>${day.ingresos.toLocaleString()}</span>
                            </div>
                            <div className="w-full bg-white rounded-full h-3 border border-stone-100 overflow-hidden">
                                <div
                                    className="bg-brand-accent h-full transition-all duration-700 ease-out"
                                    style={{ width: `${(day.ingresos / maxVal) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                    <p className="text-xs text-stone-400 italic text-center mt-4 uppercase tracking-tighter">
                        Mostrando histórico por {timeframe === 'daily' ? 'día' : timeframe === 'weekly' ? 'semana' : 'mes'}
                    </p>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="bg-brand-brown px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                        <span>🗓️</span> Desglose {timeframe === 'daily' ? 'Diario' : timeframe === 'weekly' ? 'Semanal' : 'Mensual'}
                    </h3>
                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">
                        {sortedData.length} registros
                    </span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-cream border-b border-stone-100 uppercase text-xs font-bold tracking-widest text-brand-brown/60">
                                <th className="px-6 py-4">Periodo</th>
                                <th className="px-6 py-4">Ingresos</th>
                                <th className="px-6 py-4">Costos Reales</th>
                                <th className="px-6 py-4 text-right">Ganancia</th>
                            </tr>
                        </thead>
                        <tbody className="text-base font-medium">
                            {sortedData.slice().reverse().map((day: DailyStat) => (
                                <tr key={day.date} className="border-b border-stone-50 hover:bg-brand-cream/30 transition-colors">
                                    <td className="px-6 py-4 font-bold text-brand-brown capitalize">{day.date}</td>
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
