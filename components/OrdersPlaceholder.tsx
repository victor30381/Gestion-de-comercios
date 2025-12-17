import React from 'react';

const OrdersPlaceholder: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-12 text-center text-brand-brown/50">
            <div className="bg-brand-brown/5 p-6 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </div>
            <h3 className="text-xl font-serif font-bold mb-2">Gestión de Pedidos</h3>
            <p>Próximamente podrás gestionar tus clientes y pedidos aquí.</p>
        </div>
    );
};

export default OrdersPlaceholder;
