import React from 'react';
import { User } from 'firebase/auth';

interface HeaderProps {
    user: User | null;
    title: string;
    onLogout: () => void;
    toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, title, onLogout, toggleSidebar }) => {
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
                {/* Empty right side or add notifications later */}
            </div>
        </header>
    );
};

export default Header;
