import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Order } from '../types';

interface HeaderProps {
    user: User | null;
    title: string;
    onLogout: () => void;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, title, onLogout, toggleSidebar }) => {
    const [unreadOrders, setUnreadOrders] = useState<Order[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid),
            where('isRead', '==', false)
        );
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
            data.sort((a, b) => {
                const timeA = a.createdAt && (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : 0;
                const timeB = b.createdAt && (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : 0;
                return timeB - timeA;
            });
            setUnreadOrders(data);
        });
        return () => unsub();
    }, [user]);

    const markAsRead = async (orderId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        try {
            await updateDoc(doc(db, 'orders', orderId), { isRead: true });
        } catch (err) {
            console.error('Error marking as read', err);
        }
    };

    const markAllAsRead = async () => {
        try {
            const promises = unreadOrders.map(order => 
                updateDoc(doc(db, 'orders', order.id), { isRead: true })
            );
            await Promise.all(promises);
            setShowNotifications(false);
        } catch (err) {
            console.error('Error marking all as read', err);
        }
    };

    return (
        <header className="bg-white/60 backdrop-blur-xl border-b border-brand-brown/5 p-4 md:p-6 flex justify-between items-center sticky top-0 z-40 shadow-[0_2px_16px_rgba(93,58,41,0.03)]">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-brand-brown hover:bg-brand-accent/10 p-2.5 rounded-xl transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <div className="flex flex-col">
                    <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-brown leading-tight tracking-tight">
                        {title}
                    </h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-brand-brown/50 font-medium capitalize bg-brand-accent/8 px-3 py-1 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Notifications Bell */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2.5 rounded-full bg-brand-brown/5 text-brand-brown hover:bg-brand-brown/10 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                        {unreadOrders.length > 0 && (
                            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                {unreadOrders.length}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
                            <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-xl border border-brand-brown/10 z-50 overflow-hidden flex flex-col max-h-[80vh] animate-fade-in-up origin-top-right">
                                <div className="p-4 border-b border-brand-brown/10 flex justify-between items-center bg-brand-brown/5">
                                    <h3 className="font-serif font-bold text-brand-brown">Notificaciones</h3>
                                    {unreadOrders.length > 0 && (
                                        <button onClick={markAllAsRead} className="text-xs font-bold text-brand-accent hover:text-brand-brown transition-colors">
                                            Leer todo
                                        </button>
                                    )}
                                </div>
                                <div className="overflow-y-auto w-full custom-scrollbar">
                                    {unreadOrders.length === 0 ? (
                                        <div className="p-8 text-center text-brand-brown/50">
                                            <span className="text-4xl block mb-3 opacity-50">🔔</span>
                                            <p className="font-bold text-sm text-brand-brown">¡Todo al día!</p>
                                            <p className="text-xs mt-1">No tienes pedidos nuevos.</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-brand-brown/5">
                                            {unreadOrders.map(order => {
                                                const rawDate = order.deliveryDate as any;
                                                const dDate = rawDate?.toDate ? rawDate.toDate() : rawDate ? new Date(rawDate) : null;
                                                const dateStr = dDate ? dDate.toLocaleDateString('es-ES') : 'Sin fecha';
                                                
                                                return (
                                                    <div key={order.id} className="p-4 bg-brand-cream/20 hover:bg-brand-cream/50 transition-colors relative group">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="pr-2">
                                                                <h4 className="font-bold text-brand-brown text-sm flex items-center gap-1.5">
                                                                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                                                                    Pedido de {order.clientName}
                                                                </h4>
                                                            </div>
                                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full whitespace-nowrap">${order.total?.toLocaleString() || 0}</span>
                                                        </div>
                                                        <p className="text-xs text-brand-brown/70 mb-2 line-clamp-2">
                                                            {order.items.map(i => `${i.quantity} ${i.name}`).join(', ')}
                                                        </p>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] font-bold text-brand-brown/50 uppercase tracking-wider">
                                                                Entrega: {dateStr}
                                                            </span>
                                                            <button 
                                                                onClick={(e) => markAsRead(order.id, e)}
                                                                className="text-xs font-bold text-brand-accent hover:text-brand-brown transition-colors bg-white px-2 py-1 rounded-md shadow-sm border border-brand-brown/5"
                                                            >
                                                                Marcar visto
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
