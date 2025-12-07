import React, { useState, useCallback } from 'react';
import { Page, User, Application } from './types';
import LoginPage from './components/LoginPage';
import ApplicationFormPage from './components/ApplicationFormPage';
import HistoryPage from './components/HistoryPage';
import Header from './components/Header';
import ChangePasswordModal from './components/ChangePasswordModal';
import api from './services/api';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [user, setUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);
    const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState<boolean>(false);

    const handleLogin = useCallback((userData: User) => {
        setUser(userData);
        setIsLoggedIn(true);
        // 學生登入後預設到申請表填寫頁面，老師預設到歷史資訊頁面
        setCurrentPage(userData.role === 'student' ? Page.Form : Page.History);
    }, []);

    const handleLogout = useCallback(() => {
        api.logout(); // 清除 token 並重定向
        setUser(null);
        setIsLoggedIn(false);
        setCurrentPage(Page.Login);
        setEditingApplication(null);
    }, []);

    const navigateTo = useCallback((page: Page, appToEdit?: Application) => {
        if (page === Page.Form) {
            setEditingApplication(appToEdit || null);
        } else {
            // Clear editing state when navigating away from form to other pages
            setEditingApplication(null);
        }
        setCurrentPage(page);
    }, []);

    const handleChangePassword = useCallback(async (oldPassword: string, newPassword: string) => {
        await api.changePassword(oldPassword, newPassword);
        alert('密碼更改成功！');
    }, []);

    const renderPage = () => {
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
        <div className="min-h-screen bg-gray-100">
            {isLoggedIn && user && (
                <div className={`${currentPage === Page.Form || currentPage === Page.History ? 'max-w-4xl' : 'max-w-xl'} mx-auto px-4 pt-4`}>
                    <Header
                        currentPage={currentPage}
                        userRole={user.role}
                        navigateTo={navigateTo}
                        handleLogout={handleLogout}
                        onChangePassword={() => setIsChangePasswordModalOpen(true)}
                    />
                </div>
            )}
            <div className={`${currentPage === Page.Form ? 'max-w-3xl' : currentPage === Page.History ? 'max-w-4xl' : 'max-w-xl'} mx-auto p-4`}>
                <main>{renderPage()}</main>
            </div>
            {isChangePasswordModalOpen && (
                <ChangePasswordModal
                    onClose={() => setIsChangePasswordModalOpen(false)}
                    onSave={handleChangePassword}
                />
            )}
        </div>
    );
};

export default App;
