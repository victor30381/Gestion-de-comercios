import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, Timestamp } from 'firebase/firestore';
import { StatCard, CalendarWidget, DeliveryList } from './DashboardWidgets';
import { Order } from '../types';

interface DashboardProps {
    userId: string;
    onEditOrder?: (order: Order) => void;
    onViewOrder?: (order: Order) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userId, onEditOrder, onViewOrder }) => {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (!userId) return;

        const q = query(collection(db, 'orders'), where('userId', '==', userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedOrders = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    // Handle Firestore Timestamps
                    deliveryDate: data.deliveryDate instanceof Timestamp ? data.deliveryDate.toDate() : new Date(data.deliveryDate),
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt)
                } as Order;
            });
            setOrders(fetchedOrders);
        });

        return () => unsubscribe();
    }, [userId]);

    // Calculate Stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ordersToday = orders.filter(o => {
        const d = new Date(o.deliveryDate);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime();
    }).length;

    const currentMonth = today.getMonth();
    const monthlyIncome = orders
        .filter(o => new Date(o.deliveryDate).getMonth() === currentMonth)
        .reduce((sum, o) => {
            const deliveryDate = new Date(o.deliveryDate);
            deliveryDate.setHours(0, 0, 0, 0);

            // Check if delivered or past due
            const isDelivered = o.status === 'completed';
            const isPastDue = deliveryDate < today; // today is already normalized to 00:00:00

            if (isDelivered || isPastDue) {
                return sum + (o.total || 0);
            } else {
                return sum + (o.deposit || 0);
            }
        }, 0);

    return (
        <div className="flex flex-col gap-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Pedidos Hoy:" value={ordersToday.toString()} />
                <StatCard title="Ingresos Mes:" value={`$${monthlyIncome.toLocaleString()}`} />
                {/* Placeholder for now or connect clients count if needed */}
            </div>

            {/* Main Content Row */}
            <div className="flex flex-col lg:flex-row gap-6">
                <CalendarWidget orders={orders} />
                <DeliveryList orders={orders} onEdit={onEditOrder} onView={onViewOrder} />
            </div>
        </div>
    );
};

export default Dashboard;
