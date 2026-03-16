import React from 'react';
import logoAK from '../assets/logo-ak.jpg';
import { User } from 'firebase/auth';
import { useTheme } from './ThemeContext';

interface SidebarProps {
    isOpen: boolean;
    toggleSidebar: () => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenCalculator: () => void;
    onOpenOrders: () => void;
    onOpenStock: () => void;
    user: User | null;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, activeTab, setActiveTab, onOpenCalculator, onOpenOrders, onOpenStock, user, onLogout }) => {
    const { profileName } = useTheme();

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
        fixed top-0 left-0 h-full w-72 bg-brand-beige border-r border-[#E5DCD3] z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static
      `}>
                <div className="p-8 flex flex-col h-full">
                    {/* Logo Area */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4 bg-white">
                            <img src={logoAK} alt="Alternativa Keto Logo" className="w-full h-full object-cover" />
                        </div>

                        {/* User Profile Section */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 text-brand-brown mb-1">
                                <div className="h-6 w-6 rounded-full bg-brand-accent/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="font-bold text-lg">Hola, {profileName || user?.displayName?.split(' ')[0] || 'Anto'}</span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-sm text-brand-brown/70 hover:text-brand-brown underline hover:font-medium transition-all"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        <button
                            onClick={() => { setActiveTab('dashboard'); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${activeTab === 'dashboard'
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Dashboard</span>
                        </button>

                        <button
                            onClick={() => { onOpenCalculator(); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${false 
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                             <div className={`p-2 rounded-xl transition-colors ${false ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Calculadora Maestra</span>
                        </button>

                        <button
                            onClick={() => { onOpenOrders(); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${false 
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${false ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Gestión de Pedidos</span>
                        </button>

                        <button
                            onClick={() => { onOpenStock(); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${false
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${false ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Control de Stock</span>
                        </button>

                        <button
                            onClick={() => { setActiveTab('finances'); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${activeTab === 'finances'
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                             <div className={`p-2 rounded-xl transition-colors ${activeTab === 'finances' ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Finanzas</span>
                        </button>

                        {/* Divider before settings */}
                        <div className="pt-2 mt-2 border-t border-brand-brown/10"></div>

                        <button
                            onClick={() => { setActiveTab('profile'); if (window.innerWidth < 768) toggleSidebar(); }}
                            className={`w-full text-left p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 group
                                ${activeTab === 'profile'
                                    ? 'bg-brand-brown text-white shadow-xl shadow-brand-brown/20 font-bold translate-x-1'
                                    : 'bg-transparent text-brand-brown hover:bg-white hover:shadow-sm hover:translate-x-1 border border-transparent hover:border-brand-brown/10'
                                }`}
                        >
                             <div className={`p-2 rounded-xl transition-colors ${activeTab === 'profile' ? 'bg-white/20' : 'bg-brand-brown/5 group-hover:bg-brand-brown/10'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="font-serif tracking-wide text-[15px]">Mi Perfil</span>
                        </button>
                    </nav>

                    <div className="text-center text-xs text-brand-brown/40 font-serif mt-auto">
                        &copy; 2025 KetoCost Bakery
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
