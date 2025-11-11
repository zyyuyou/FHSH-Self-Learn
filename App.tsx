import React, { useState, useCallback } from 'react';
import { Page, UserRole, Application } from './types';
import LoginPage from './components/LoginPage';
import ApplicationFormPage from './components/ApplicationFormPage';
import HistoryPage from './components/HistoryPage';
import Header from './components/Header';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [editingApplication, setEditingApplication] = useState<Application | null>(null);

    const handleLogin = useCallback((role: UserRole) => {
        setUserRole(role);
        setIsLoggedIn(true);
        setCurrentPage(Page.History);
    }, []);

    const handleLogout = useCallback(() => {
        setUserRole(null);
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

    const renderPage = () => {
        if (!isLoggedIn) {
            return <LoginPage onLogin={handleLogin} />;
        }
        switch (currentPage) {
            case Page.Form:
                return <ApplicationFormPage applicationToEdit={editingApplication} />;
            case Page.Home:
            case Page.History:
                return <HistoryPage userRole={userRole!} onEdit={(app) => navigateTo(Page.Form, app)} />;
            case Page.Login:
            default:
                 return <HistoryPage userRole={userRole!} onEdit={(app) => navigateTo(Page.Form, app)} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="max-w-xl mx-auto p-4">
                {isLoggedIn && <Header currentPage={currentPage} navigateTo={navigateTo} handleLogout={handleLogout} />}
                <main>{renderPage()}</main>
            </div>
        </div>
    );
};

export default App;