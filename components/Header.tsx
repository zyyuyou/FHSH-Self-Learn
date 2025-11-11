import React from 'react';
import { Page, Application } from '../types';

interface HeaderProps {
    currentPage: Page;
    navigateTo: (page: Page, appToEdit?: Application) => void;
    handleLogout: () => void;
}

const NavButton: React.FC<{
    label: string;
    page: Page;
    currentPage: Page;
    onClick: () => void;
}> = ({ label, page, currentPage, onClick }) => {
    const isActive = currentPage === page;
    const baseClasses = "flex-1 py-2.5 px-4 text-center rounded-full transition-all duration-300 font-medium text-sm sm:text-base shadow-sm";
    const activeClasses = "bg-blue-600 text-white shadow-md";
    const inactiveClasses = "bg-white text-gray-700 hover:bg-gray-200";

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
            {label}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ currentPage, navigateTo, handleLogout }) => {
    return (
        <header className="mb-6">
            <nav className="flex items-center justify-between gap-2 sm:gap-4 p-1 bg-gray-200 rounded-full">
                <NavButton label="系統首頁" page={Page.Home} currentPage={currentPage} onClick={() => navigateTo(Page.Home)} />
                <NavButton label="申請表填寫" page={Page.Form} currentPage={currentPage} onClick={() => navigateTo(Page.Form)} />
                <NavButton label="歷史資訊" page={Page.History} currentPage={currentPage} onClick={() => navigateTo(Page.History)} />
            </nav>
            <div className="text-right mt-2">
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    登出
                </button>
            </div>
        </header>
    );
};

export default Header;