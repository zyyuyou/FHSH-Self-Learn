import React from 'react';
import { Page, Application, UserRole } from '../types';

interface HeaderProps {
    currentPage: Page;
    userRole: UserRole;
    navigateTo: (page: Page, appToEdit?: Application) => void;
    handleLogout: () => void;
    onChangePassword?: () => void;
}

const NavButton: React.FC<{
    label: string;
    page: Page;
    currentPage: Page;
    onClick: () => void;
}> = ({ label, page, currentPage, onClick }) => {
    const isActive = currentPage === page;
    const baseClasses =
        'flex-1 py-2.5 px-4 text-center rounded-full transition-all duration-300 font-medium text-sm sm:text-base shadow-sm';
    const activeClasses = 'bg-blue-600 text-white shadow-md';
    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-200';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
        >
            {label}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentPage, userRole, navigateTo, handleLogout, onChangePassword }) => {
    return (
        <header className="mb-6">
            {userRole === UserRole.Student ? (
                <nav className="flex items-center justify-between gap-2 sm:gap-4 p-1 bg-gray-200 rounded-full">
                    <NavButton
                        label="申請表填寫"
                        page={Page.Form}
                        currentPage={currentPage}
                        onClick={() => navigateTo(Page.Form)}
                    />
                    <NavButton
                        label="歷史資訊"
                        page={Page.History}
                        currentPage={currentPage}
                        onClick={() => navigateTo(Page.History)}
                    />
                </nav>
            ) : (
                <div className="p-4 bg-white rounded-xl shadow-md">
                    <h1 className="text-xl font-bold text-gray-800">審核申請表</h1>
                </div>
            )}
            <div className="text-right mt-4 space-x-3">
                {userRole === UserRole.Student && onChangePassword && (
                    <button
                        onClick={onChangePassword}
                        className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm font-medium"
                    >
                        更改密碼
                    </button>
                )}
                <button
                    onClick={handleLogout}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm font-medium"
                >
                    登出
                </button>
            </div>
        </header>
    );
};

export default Header;
