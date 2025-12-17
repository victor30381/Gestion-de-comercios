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
        <header className="bg-brand-beige border-b border-[#E5DCD3] p-4 md:p-6 flex justify-between items-center sticky top-0 z-40">
            <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden text-brand-brown hover:bg-brand-brown/10 p-2 rounded-lg"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>

                <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-brown">
                    {title}
                </h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Empty right side or add notifications later */}
            </div>
        </header>
    );
};

export default Header;
