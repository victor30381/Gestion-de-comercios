import React from 'react';
import NewOrderView from './NewOrderView';
import { Order } from '../types';

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    initialOrder?: Order | null;
    isReadOnly?: boolean;
    initialDate?: Date | null;
}

const OrdersModal: React.FC<OrdersModalProps> = ({ isOpen, onClose, userId, initialOrder, isReadOnly, initialDate }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            {/* Backdrop click handler */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-3xl glass-card-strong sm:rounded-3xl shadow-2xl flex flex-col animate-fade-in-up overflow-hidden bg-white/90 h-[100dvh] sm:h-auto sm:max-h-[90vh]">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 sm:top-5 sm:right-5 p-2 text-brand-brown/40 hover:text-brand-brown hover:bg-brand-brown/10 rounded-full transition-colors z-50 bg-white/50 backdrop-blur-md border border-white/20 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Content Logic - always show NewOrderView since Clients is separated */}
                <div className="flex-1 overflow-hidden flex flex-col relative w-full h-full">
                    <NewOrderView
                        userId={userId}
                        onBack={onClose}
                        initialOrder={initialOrder}
                        readOnly={isReadOnly}
                        initialDate={initialDate || undefined}
                    />
                </div>
            </div>
        </div>
    );
};

export default OrdersModal;
