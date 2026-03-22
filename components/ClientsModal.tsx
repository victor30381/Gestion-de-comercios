import React from 'react';
import ClientsView from './ClientsView';

interface ClientsModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const ClientsModal: React.FC<ClientsModalProps> = ({ isOpen, onClose, userId }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
            {/* Backdrop click handler */}
            <div className="absolute inset-0" onClick={onClose}></div>

            {/* Modal Container */}
            <div className="relative w-full max-w-2xl glass-card-strong rounded-2xl shadow-2xl flex flex-col animate-fade-in-up p-8 max-h-[90vh] overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-brand-brown/40 hover:text-brand-brown hover:bg-brand-brown/5 rounded-full transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <ClientsView
                    userId={userId}
                    onBack={onClose}
                />
            </div>
        </div>
    );
};

export default ClientsModal;
