import React, { useState } from 'react';
import ClientsView from './ClientsView';
import NewOrderView from './NewOrderView';

import { Order } from '../types';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialOrder?: Order | null;
    isReadOnly?: boolean;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, userId, initialOrder, isReadOnly }) => {
    const [view, setView] = useState<'menu' | 'clients' | 'newOrder'>('menu');

    // Reset view to menu every time the modal opens, UNLESS editing
    React.useEffect(() => {
        if (isOpen) {
            setView(initialOrder ? 'newOrder' : 'menu');
        }
    }, [isOpen, initialOrder]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/20 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Backdrop click handler */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl bg-brand-cream rounded-2xl shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200 p-8 border border-brand-brown/10 max-h-[90vh] overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-brand-brown/40 hover:text-brand-brown hover:bg-brand-brown/5 rounded-full transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content Logic */}
                {view === 'menu' && (
                    <>
                        {/* Title */}
                        <h2 className="text-3xl font-serif font-bold text-center text-brand-brown mb-8">
                            Gestión de Pedidos
                        </h2>

                        {/* Selection Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Clientes Card */}
                            <button
                                onClick={() => setView('clients')}
                                className="group flex flex-col items-center p-8 bg-gradient-to-br from-[#D4A373] to-[#C59263] rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-[#B08055]"
                            >
                                <div className="mb-4 text-brand-brown/80 group-hover:text-brand-brown group-hover:scale-110 transition-transform duration-300">
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#6B4423]" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                        </svg>
                                        <div className="absolute -right-2 -bottom-2 bg-[#6B4423] rounded-full p-1 text-[#D4A373]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-[#4A3728] mb-2 font-serif">Clientes</h3>
                                <p className="text-[#5D4229] text-sm text-center font-medium leading-tight">
                                    Administrar base de datos,<br />teléfono y dirección.
                                </p>
                            </button>

                            {/* Nuevo Pedido Card */}
                            <button
                                onClick={() => setView('newOrder')}
                                className="group flex flex-col items-center p-8 bg-gradient-to-br from-[#D4A373] to-[#C59263] rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300 border border-[#B08055]"
                            >
                                <div className="mb-4 text-brand-brown/80 group-hover:text-brand-brown group-hover:scale-110 transition-transform duration-300">
                                    <div className="relative">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-[#6B4423]" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                                        </svg>
                                        <div className="absolute -right-2 -top-2 bg-[#6B4423] rounded-full p-1 text-[#D4A373]">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold text-[#4A3728] mb-2 font-serif">Nuevo Pedido</h3>
                                <p className="text-[#5D4229] text-sm text-center font-medium leading-tight">
                                    Crear una nueva venta y<br />agendar entrega.
                                </p>
                            </button>
                        </div>
                    </>
                )}

                {view === 'clients' && (
                    <ClientsView
                        userId={userId}
                        onBack={() => setView('menu')}
                    />
                )}

                {view === 'newOrder' && (
                    <NewOrderView
                        userId={userId}
                        onBack={() => setView('menu')}
                        initialOrder={initialOrder}
                        readOnly={isReadOnly}
                    />
                )}

            </div>
        </div>
    );
};

export default OrdersModal;
