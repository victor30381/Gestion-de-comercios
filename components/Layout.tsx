import React, { useState } from 'react';
import { User } from 'firebase/auth';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
    user: User | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onLogout: () => void;
    onOpenCalculator: () => void;
    onOpenOrders: () => void;
    onOpenStock: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, setActiveTab, onLogout, onOpenCalculator, onOpenOrders, onOpenStock }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const getTitle = () => {
        switch (activeTab) {
            case 'dashboard': return 'Dashboard';
            case 'calculator': return 'Calculadora Maestra';
            case 'orders': return 'Gestión de Pedidos';
            case 'stock': return 'Control de Stock';
            default: return 'Dashboard';
        }
    };

    return (
        <div className="flex h-screen bg-brand-beige overflow-hidden">
            <Sidebar
                isOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                onOpenCalculator={onOpenCalculator}
                onOpenOrders={onOpenOrders}
                onOpenStock={onOpenStock}
                user={user}
                onLogout={onLogout}
            />

            <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
                <Header
                    user={user}
                    title={getTitle()}
                    onLogout={onLogout}
                    toggleSidebar={toggleSidebar}
                />

                <main className="flex-1 overflow-y-auto w-full p-4 md:p-8 bg-brand-beige">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
