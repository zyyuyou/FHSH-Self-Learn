import React, { useState, useCallback, useEffect } from 'react';
import { Page, User, Application } from './types';
import LoginPage from './components/LoginPage';
import ApplicationFormPage from './components/ApplicationFormPage';
import HistoryPage from './components/HistoryPage';
import Header from './components/Header';
import ChangePasswordModal from './components/ChangePasswordModal';
import GmailSettingsModal from './components/GmailSettingsModal';
import api from './services/api';
import { GlassBackground, NOISE_DATA_URI } from './components/ui/GlassUI';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);
    const [isGmailSettingsModalOpen, setIsGmailSettingsModalOpen] = useState<boolean>(false);
    const [isRestoring, setIsRestoring] = useState<boolean>(true);

    // 初始化時從 Cookie/localStorage 恢復登入狀態
    useEffect(() => {
        const restoreSession = () => {
            const token = api.getToken();
            const savedUser = api.getUser();

            if (token && savedUser) {
                // 恢復登入狀態
                const restoredUser: User = {
                    id: savedUser.id,
                    username: savedUser.username,
                    role: savedUser.role as 'student' | 'teacher',
                    studentId: savedUser.student_id,
                    studentName: savedUser.student_name,
                    className: savedUser.class_name,
                    seatNumber: savedUser.seat_number,
                    teacherName: savedUser.teacher_name,
                };
                setUser(restoredUser);
                setIsLoggedIn(true);
                setCurrentPage(restoredUser.role === 'student' ? Page.Form : Page.History);
            }
            setIsRestoring(false);
        };

        restoreSession();
    }, []);

    const handleLogin = useCallback((userData: User) => {
        setUser(userData);
        setIsLoggedIn(true);
        setCurrentPage(userData.role === 'student' ? Page.Form : Page.History);
    }, []);

    const handleLogout = useCallback(() => {
        api.logout();
        setUser(null);
        setIsLoggedIn(false);
        setCurrentPage(Page.Login);
        setEditingApplication(null);
    }, []);

    const navigateTo = useCallback((page: Page, appToEdit?: Application) => {
        if (page === Page.Form) {
            setEditingApplication(appToEdit || null);
        } else {
            setEditingApplication(null);
        }
        setCurrentPage(page);
    }, []);

    const handleChangePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        await api.changePassword(oldPassword, newPassword);
        alert('密碼更改成功！');
    }, []);

    const renderPage = () => {
        // 顯示恢復中的載入狀態
        if (isRestoring) {
            return (
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-white/60">載入中...</p>
                    </div>
                </div>
            );
        }

        if (!isLoggedIn || !user) {
            return <LoginPage onLogin={handleLogin} />;
        }
        switch (currentPage) {
            case Page.Form:
                return (
                    <ApplicationFormPage
                        applicationToEdit={editingApplication}
                        onSubmitSuccess={() => navigateTo(Page.History)}
                    />
                );
            case Page.History:
            case Page.Login:
            default:
                return (
                    <HistoryPage
                        userRole={user.role}
                        onEdit={(app) => navigateTo(Page.Form, app)}
                    />
                );
        }
    };

    return (
        <GlassBackground>
            <div className="min-h-screen font-sans selection:bg-blue-500/30">
                {isLoggedIn && user && (
                    <div className="max-w-4xl mx-auto px-4 pt-6">
                        <Header
                            currentPage={currentPage}
                            userRole={user.role}
                            navigateTo={navigateTo}
                            handleLogout={handleLogout}
                            onChangePassword={() => setIsChangePasswordModalOpen(true)}
                            onGmailSettings={() => setIsGmailSettingsModalOpen(true)}
                        />
                    </div>
                )}
                <div className={`${currentPage === Page.Form ? 'max-w-3xl' : 'max-w-4xl'} mx-auto px-4 pb-8`}>
                    <main>{renderPage()}</main>
                </div>
                {isChangePasswordModalOpen && (
                    <ChangePasswordModal
                        onClose={() => setIsChangePasswordModalOpen(false)}
                        onSave={handleChangePassword}
                    />
                )}
                {isGmailSettingsModalOpen && (
                    <GmailSettingsModal
                        onClose={() => setIsGmailSettingsModalOpen(false)}
                    />
                )}
            </div>
        </GlassBackground>
    );
};

export default App;
