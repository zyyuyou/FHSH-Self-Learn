import React from 'react';
import { Page, Application, UserRole } from '../types';
import { GlassCard, GlassButton, NoiseOverlay } from './ui/GlassUI';

interface HeaderProps {
    currentPage: Page;
    userRole: UserRole;
    navigateTo: (page: Page, appToEdit?: Application) => void;
    handleLogout: () => void;
    onChangePassword?: () => void;
}

const NavButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    page: Page;
    currentPage: Page;
    onClick: () => void;
}> = ({ label, icon, page, currentPage, onClick }) => {
    const isActive = currentPage === page;

    return (
        <button
            onClick={onClick}
            className={`
                relative flex-1 flex items-center justify-center gap-2 py-3 px-4
                rounded-xl font-medium text-sm sm:text-base
                transition-all duration-300
                ${isActive
                    ? 'bg-white/[0.15] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2),0_4px_20px_rgba(0,0,0,0.2)]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.08]'
                }
            `}
        >
            {icon}
            <span>{label}</span>
            {isActive && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full" />
            )}
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ currentPage, userRole, navigateTo, handleLogout, onChangePassword }) => {
    return (
        <header className="mb-6">
            {userRole === UserRole.Student ? (
                <GlassCard className="p-2" glow="subtle">
                    <nav className="flex items-center gap-2">
                        <NavButton
                            label="申請表填寫"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            }
                            page={Page.Form}
                            currentPage={currentPage}
                            onClick={() => navigateTo(Page.Form)}
                        />
                        <NavButton
                            label="歷史資訊"
                            icon={
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                            page={Page.History}
                            currentPage={currentPage}
                            onClick={() => navigateTo(Page.History)}
                        />
                    </nav>
                </GlassCard>
            ) : (
                <GlassCard className="p-5" glow="purple">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center border border-white/10">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">審核申請表</h1>
                            <p className="text-sm text-white/50">管理學生的自主學習計畫申請</p>
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 mt-4">
                {userRole === UserRole.Student && onChangePassword && (
                    <GlassButton
                        onClick={onChangePassword}
                        variant="default"
                        size="md"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                        更改密碼
                    </GlassButton>
                )}
                <GlassButton
                    onClick={handleLogout}
                    variant="danger"
                    size="md"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    登出
                </GlassButton>
            </div>
        </header>
    );
};

export default Header;
