import React, { useState } from 'react';
import { Order } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

// ... (StatCard and CalendarWidget remain unchanged) ...

// --- DELIVERY LIST ---
interface DeliveryListProps {
    orders: Order[];
    onEdit?: (order: Order) => void;
    onView?: (order: Order) => void;
}

export const DeliveryList: React.FC<DeliveryListProps> = ({ orders, onEdit, onView }) => {
    // Filter for upcoming orders (pending and future/today)
    const upcomingOrders = orders
        .filter(o => o.status !== 'completed' && new Date(o.deliveryDate) >= new Date(new Date().setHours(0, 0, 0, 0)))
        .sort((a, b) => new Date(a.deliveryDate).getTime() - new Date(b.deliveryDate).getTime())
        .slice(0, 5);

    // Filter for delivered orders
    const deliveredOrders = orders
        .filter(o => o.status === 'completed')
        .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()) // Most recent first
        .slice(0, 10); // Show last 10 delivered

    const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

    const handleToggleStatus = async (order: Order) => {
        try {
            const newStatus = order.status === 'completed' ? 'pending' : 'completed';
            await updateDoc(doc(db, 'orders', order.id), { status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar estado");
        }
    };

    const handleDeleteClick = (orderId: string) => {
        if (confirmingDeleteId === orderId) {
            performDelete(orderId);
        } else {
            setConfirmingDeleteId(orderId);
            setTimeout(() => setConfirmingDeleteId(null), 3000);
        }
    };

    const performDelete = async (orderId: string) => {
        try {
            await deleteDoc(doc(db, 'orders', orderId));
            setConfirmingDeleteId(null);
        } catch (error: any) {
            console.error("Error deleting order:", error);
            alert(`Error al eliminar pedido: ${error.message}`);
        }
    };

    return (
        <div className="w-full lg:w-80 flex flex-col gap-6">
            <div className="bg-brand-cream rounded-xl shadow-sm border border-[#E5DCD3] p-6">
                <h3 className="text-xl font-serif font-bold text-brand-brown mb-4">Próximas Entregas</h3>
                <div className="space-y-4">
                    {upcomingOrders.length > 0 ? (
                        upcomingOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => onView && onView(order)}
                                className="flex flex-col pb-3 border-b border-brand-brown/10 last:border-0 group cursor-pointer hover:bg-brand-brown/5 transition-colors rounded-lg p-2"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm text-brand-brown">
                                        <span className="font-bold block text-brand-brown/80">
                                            {new Date(order.deliveryDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                        {order.items.map(item => item.name).join(', ')}
                                        <span className="text-stone-500 block text-base font-bold mt-1">({order.clientName})</span>
                                    </div>
                                    <div className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">
                                        Pendiente
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(order); }}
                                        className="p-1.5 text-xs bg-white border border-brand-brown/20 rounded hover:bg-brand-brown/5 text-brand-brown shadow-sm"
                                        title="Marcar Entregado"
                                    >
                                        ✅
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(order); }}
                                        className="p-1.5 text-xs bg-white border border-brand-brown/20 rounded hover:bg-brand-brown/5 text-brand-brown shadow-sm"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(order.id); }}
                                        className={`p-1.5 text-xs bg-white border rounded shadow-sm transition-colors ${confirmingDeleteId === order.id
                                            ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                                            : 'border-red-200 hover:bg-red-50 text-red-500'
                                            }`}
                                        title="Eliminar"
                                    >
                                        {confirmingDeleteId === order.id ? '¿Borrar?' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-brand-brown/40 italic text-center py-4">No hay entregas pendientes</p>
                    )}
                </div>
            </div>

            {deliveredOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 opacity-80">
                    <h3 className="text-lg font-serif font-bold text-stone-500 mb-4 flex items-center gap-2">
                        <span className="text-xl">📦</span> Entregados Recientemente
                    </h3>
                    <div className="space-y-4">
                        {deliveredOrders.map((order) => (
                            <div
                                key={order.id}
                                onClick={() => onView && onView(order)}
                                className="flex flex-col pb-3 border-b border-stone-100 last:border-0 group cursor-pointer transition-colors rounded-lg p-2 opacity-60 hover:opacity-100 hover:bg-gray-50"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div className="text-sm text-brand-brown">
                                        <span className="font-bold block text-brand-brown/60 line-through">
                                            {new Date(order.deliveryDate).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })}
                                        </span>
                                        <span className="line-through">
                                            {order.items.map(item => item.name).join(', ')}
                                        </span>
                                        <span className="text-stone-500 block text-base font-bold mt-1">({order.clientName})</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(order); }}
                                        className="p-1.5 text-xs bg-white border border-brand-brown/20 rounded hover:bg-brand-brown/5 text-brand-brown shadow-sm"
                                        title="Marcar Pendiente"
                                    >
                                        ↩️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(order); }}
                                        className="p-1.5 text-xs bg-white border border-brand-brown/20 rounded hover:bg-brand-brown/5 text-brand-brown shadow-sm"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDeleteClick(order.id); }}
                                        className={`p-1.5 text-xs bg-white border rounded shadow-sm transition-colors ${confirmingDeleteId === order.id
                                            ? 'border-red-500 bg-red-500 text-white hover:bg-red-600'
                                            : 'border-red-200 hover:bg-red-50 text-red-500'
                                            }`}
                                        title="Eliminar"
                                    >
                                        {confirmingDeleteId === order.id ? '¿Borrar?' : '🗑️'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
interface StatCardProps {
    title: string;
    value: string | number;
    subtext?: string;
    isAlert?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, isAlert }) => (
    <div className="bg-brand-cream rounded-xl shadow-sm border border-[#E5DCD3] overflow-hidden flex flex-col">
        <div className="bg-brand-brown text-white px-4 py-2 text-sm font-bold">
            {title}
        </div>
        <div className="p-4 flex-1 flex flex-col justify-center items-center text-center">
            <div className={`text-2xl font-bold ${isAlert ? 'text-red-500' : 'text-brand-brown'}`}>
                {value}
            </div>
            {subtext && <div className="text-xs text-stone-500 mt-1">{subtext}</div>}
        </div>
    </div>
);

// --- CALENDAR WIDGET ---
interface CalendarWidgetProps {
    orders: Order[];
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ orders }) => {
    const today = new Date();
    // Simple state for current month view (defaults to current real month)
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday start (0=Mon, 6=Sun) if desired, but sticking to standard 0=Sun for simplicity or matching UI
    // The previous mockup had "Dom" first. Let's keep Dom first.

    // Generate dates
    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const startDayOffset = firstDayOfMonth;

    // Helper to check orders on a date
    const getOrdersForDate = (day: number) => {
        return orders.filter(o => {
            const d = new Date(o.deliveryDate);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return (
        <div className="bg-brand-cream rounded-xl shadow-sm border border-[#E5DCD3] p-6 flex-1">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                    className="text-brand-brown hover:bg-brand-brown/10 p-1 rounded"
                >
                    &lt;
                </button>
                <h3 className="text-xl font-serif font-bold text-brand-brown capitalize">
                    {monthNames[month]} {year}
                </h3>
                <button
                    onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                    className="text-brand-brown hover:bg-brand-brown/10 p-1 rounded"
                >
                    &gt;
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                {['Dom', 'Lun', 'Mar', 'Mier', 'Jue', 'Vie', 'Sab'].map(d => <div key={d} className="font-bold text-brand-brown/70">{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-2">
                {Array(startDayOffset).fill(null).map((_, i) => <div key={`empty-${i}`} />)}

                {dates.map(date => {
                    const dayOrders = getOrdersForDate(date);
                    const hasDelivery = dayOrders.length > 0;
                    const isToday = date === today.getDate() && month === today.getMonth() && year === today.getFullYear();

                    return (
                        <div
                            key={date}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors relative
                                ${isToday ? 'bg-brand-accent/20 border border-brand-accent' : 'hover:bg-white'}
                                ${hasDelivery ? 'bg-white font-bold' : ''}
                            `}
                            title={hasDelivery ? `${dayOrders.length} entregas` : ''}
                        >
                            <span className={`text-sm ${hasDelivery ? 'font-bold text-brand-brown' : 'text-stone-500'}`}>{date}</span>
                            {hasDelivery && (
                                <span className="text-xl leading-none mt-1">🍪</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


