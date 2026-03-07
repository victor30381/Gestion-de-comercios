import React, { useState } from 'react';
import { Order } from '../types';
import { db } from '../firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';



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
    // Limit removed to show all upcoming orders

    // Filter for delivered orders
    const deliveredOrders = orders
        .filter(o => o.status === 'completed')
        .sort((a, b) => new Date(b.deliveryDate).getTime() - new Date(a.deliveryDate).getTime()); // Most recent first

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
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
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
                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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
            {subtext && <div className="text-base font-bold text-brand-accent mt-2">{subtext}</div>}
        </div>
    </div>
);

// --- CALENDAR WIDGET ---
// --- CALENDAR WIDGET ---
interface CalendarWidgetProps {
    orders: Order[];
    onNewOrder?: (date: Date) => void;
    onViewOrder?: (order: Order) => void;
    onEditOrder?: (order: Order) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ orders, onNewOrder, onViewOrder, onEditOrder }) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDateDetails, setSelectedDateDetails] = useState<{ date: Date, orders: Order[] } | null>(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const startDayOffset = firstDayOfMonth;

    const getOrdersForDate = (day: number) => {
        return orders.filter(o => {
            const d = new Date(o.deliveryDate);
            return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
        });
    };

    const handleDateClick = (day: number) => {
        const date = new Date(year, month, day);
        const dayOrders = getOrdersForDate(day);
        setSelectedDateDetails({ date, orders: dayOrders });
    };

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return (
        <div className="bg-brand-cream rounded-xl shadow-sm border border-[#E5DCD3] p-6 flex-1 relative">

            {/* Date Details Modal/Popover */}
            {selectedDateDetails && (
                <div className="absolute inset-0 z-10 bg-black/20 backdrop-blur-[1px] rounded-xl flex items-center justify-center p-4 animate-in fade-in duration-100">
                    <div className="bg-white rounded-xl shadow-xl border border-brand-brown/10 p-4 w-full max-w-[280px] space-y-3" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b border-brand-brown/10 pb-2">
                            <h4 className="font-serif font-bold text-brand-brown">
                                {selectedDateDetails.date.getDate()} de {monthNames[selectedDateDetails.date.getMonth()]}
                            </h4>
                            <button
                                onClick={() => setSelectedDateDetails(null)}
                                className="text-stone-400 hover:text-brand-brown"
                            >
                                ✕
                            </button>
                        </div>

                        {selectedDateDetails.orders.length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                <p className="text-xs font-bold text-brand-brown/60 uppercase">Pedidos:</p>
                                {selectedDateDetails.orders.map(order => (
                                    <div key={order.id} className="flex gap-2 items-center">
                                        <button
                                            onClick={() => {
                                                onViewOrder && onViewOrder(order);
                                                setSelectedDateDetails(null);
                                            }}
                                            className="flex-1 text-left p-2 rounded bg-brand-cream hover:bg-brand-brown/10 text-sm text-brand-brown transition-colors flex items-center justify-between group"
                                        >
                                            <span className="font-medium truncate">{order.clientName}</span>
                                            <span className="text-xs opacity-0 group-hover:opacity-100 text-brand-accent">Ver →</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                onEditOrder && onEditOrder(order);
                                                setSelectedDateDetails(null);
                                            }}
                                            className="p-2 rounded bg-brand-cream hover:bg-brand-brown/10 text-brand-brown transition-colors"
                                            title="Editar Pedido"
                                        >
                                            ✏️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-stone-500 italic py-2">Sin pedidos agendados</p>
                        )}

                        <button
                            onClick={() => {
                                onNewOrder && onNewOrder(selectedDateDetails.date);
                                setSelectedDateDetails(null);
                            }}
                            className="w-full py-2 bg-brand-brown text-white text-sm font-bold rounded-lg hover:bg-[#5D4229] transition-colors shadow-sm flex items-center justify-center gap-1"
                        >
                            <span>+</span> Nuevo Pedido
                        </button>
                    </div>
                    {/* Background click to close */}
                    <div className="absolute inset-0 -z-10" onClick={() => setSelectedDateDetails(null)}></div>
                </div>
            )}

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
                            onClick={() => handleDateClick(date)}
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all relative
                                ${isToday ? 'today-neon-glow' : 'hover:bg-white hover:shadow-md'}
                                ${hasDelivery ? 'bg-white font-bold border border-stone-100' : ''}
                            `}
                            title={hasDelivery ? `${dayOrders.length} entregas` : 'Crear Pedido'}
                        >
                            <span className={`text-sm ${hasDelivery || isToday ? 'font-bold text-brand-brown' : 'text-stone-500'}`}>{date}</span>
                            {hasDelivery && (
                                <span className="text-xl leading-none mt-1 animate-pulse">🍪</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};



// --- PRODUCTION SUMMARY ---
interface ProductionSummaryProps {
    orders: Order[];
}

export const ProductionSummary: React.FC<ProductionSummaryProps> = ({ orders }) => {
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [crossedOutItems, setCrossedOutItems] = useState<Set<string>>(new Set());

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [year, month, day] = e.target.value.split('-').map(Number);
        setSelectedDate(new Date(year, month - 1, day));
        setCrossedOutItems(new Set()); // Reset crosses when date changes
    };

    const toggleCrossOut = (itemName: string) => {
        setCrossedOutItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(itemName)) {
                newSet.delete(itemName);
            } else {
                newSet.add(itemName);
            }
            return newSet;
        });
    };

    const formatDateForInput = (date: Date) => {
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    // Filter orders by selected date
    const filteredOrders = orders.filter(o => {
        const d = new Date(o.deliveryDate);
        return d.getDate() === selectedDate.getDate() &&
               d.getMonth() === selectedDate.getMonth() &&
               d.getFullYear() === selectedDate.getFullYear();
    });

    // Group items and collect client details
    const summary = filteredOrders.reduce((acc, order) => {
        order.items.forEach(item => {
            if (!acc[item.name]) {
                acc[item.name] = { total: 0, clients: [] };
            }
            acc[item.name].total += item.quantity;
            acc[item.name].clients.push({
                name: order.clientName,
                qty: item.quantity
            });
        });
        return acc;
    }, {} as Record<string, { total: number, clients: { name: string, qty: number }[] }>);

    const items: [string, { total: number, clients: { name: string, qty: number }[] }][] = Object.entries(summary);

    return (
        <div className="bg-brand-cream rounded-xl shadow-sm border border-[#E5DCD3] p-4 sm:p-6 w-full relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="text-lg sm:text-xl font-serif font-bold text-brand-brown flex items-center gap-2">
                    <span className="text-xl sm:text-2xl">👩‍🍳</span> Resumen de Producción
                </h3>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <label className="text-sm font-bold text-brand-brown whitespace-nowrap">Fecha:</label>
                    <input 
                        type="date"
                        className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg border border-brand-brown/20 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-white shadow-sm"
                        value={formatDateForInput(selectedDate)}
                        onChange={handleDateChange}
                    />
                </div>
            </div>

            {items.length === 0 ? (
                <p className="text-center text-brand-brown/50 italic py-8">No hay producción programada para esta fecha.</p>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(([name, data]) => {
                        const isCrossed = crossedOutItems.has(name);
                        return (
                        <div key={name} className="relative group">
                            <div
                                className={`w-full bg-white p-3 sm:p-4 rounded-xl border flex flex-col justify-center items-stretch shadow-sm hover:shadow-md transition-all ${expandedItem === name ? 'border-brand-accent ring-2 ring-brand-accent/20' : 'border-brand-brown/10'} ${isCrossed ? 'opacity-50 bg-stone-50' : ''}`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <div 
                                        className="flex-1 cursor-pointer flex items-center pr-2 py-1"
                                        onClick={() => toggleCrossOut(name)}
                                        title="Click para tachar/destachar producto"
                                    >
                                        <span className={`text-brand-brown font-bold text-sm leading-tight text-left transition-all ${isCrossed ? 'line-through text-stone-400' : ''}`}>
                                            {name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`bg-brand-brown text-white px-3 py-1 rounded-full text-base font-bold shadow-sm whitespace-nowrap transition-colors ${isCrossed ? 'bg-stone-400' : ''}`}>
                                            {data.total}
                                        </span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setExpandedItem(expandedItem === name ? null : name); }}
                                            className="text-brand-brown p-1.5 hover:bg-brand-brown/10 rounded-lg transition-colors flex items-center justify-center"
                                            title="Ver detalle para clientes"
                                        >
                                            <svg className={`w-4 h-4 transition-transform ${expandedItem === name ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
    
                            {/* Dropdown for client details (UPWARDS) */}
                            {expandedItem === name && (
                                <div className="absolute bottom-full left-0 right-0 z-50 mb-2 bg-white rounded-xl shadow-2xl border border-brand-accent/20 p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                                    <p className="text-[10px] font-bold text-stone-400 uppercase mb-2 tracking-wider">¿Para quién es?</p>
                                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                        {data.clients.map((c, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-xs pb-1.5 border-b border-stone-50 last:border-0 last:pb-0">
                                                <span className="text-brand-brown/80 font-medium">{c.name}</span>
                                                <span className="font-bold text-brand-accent bg-brand-accent/5 px-2 py-0.5 rounded">x{c.qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setExpandedItem(null); }}
                                        className="w-full mt-3 text-[10px] text-stone-400 hover:text-brand-brown font-bold"
                                    >
                                        Cerrar detalle
                                    </button>
                                </div>
                            )}
                        </div>
                    )})}
                </div>
            )}

            {/* Background click to close overlay */}
            {expandedItem && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setExpandedItem(null)}
                ></div>
            )}
        </div>
    );
};
