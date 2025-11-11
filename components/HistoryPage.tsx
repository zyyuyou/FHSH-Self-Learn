import React, { useState, useMemo, useCallback } from 'react';
import { Application, ApplicationStatus, UserRole } from '../types';
import CommentModal from './CommentModal';

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = "px-3 py-1 text-sm font-semibold rounded-full text-white";
    const statusClasses = {
        [ApplicationStatus.Passed]: 'bg-green-500',
        [ApplicationStatus.NotPassed]: 'bg-red-500',
        [ApplicationStatus.Pending]: 'bg-yellow-500',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const TeacherActions: React.FC<{ application: Application, onStatusChange: (id: number, status: ApplicationStatus) => void }> = ({ application, onStatusChange }) => (
    <div className="mt-4">
        <h4 className="font-semibold text-gray-600 mb-2">處理狀態</h4>
        <div className="flex items-center space-x-4">
            <div className="flex items-center">
                <input 
                    type="radio" 
                    id={`passed-${application.id}`} 
                    name={`status-${application.id}`} 
                    checked={application.status === ApplicationStatus.Passed}
                    onChange={() => onStatusChange(application.id, ApplicationStatus.Passed)}
                    className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                />
                <label htmlFor={`passed-${application.id}`} className="ml-2 text-green-700">通過</label>
            </div>
             <div className="flex items-center">
                <input 
                    type="radio" 
                    id={`not-passed-${application.id}`} 
                    name={`status-${application.id}`} 
                    checked={application.status === ApplicationStatus.NotPassed}
                    onChange={() => onStatusChange(application.id, ApplicationStatus.NotPassed)}
                    className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <label htmlFor={`not-passed-${application.id}`} className="ml-2 text-red-700">未通過</label>
            </div>
        </div>
    </div>
);

const ApplicationCard: React.FC<{ application: Application; userRole: UserRole; onShowComment: (app: Application) => void; onStatusChange: (id: number, status: ApplicationStatus) => void; onEdit: (app: Application) => void; }> = ({ application, userRole, onShowComment, onStatusChange, onEdit }) => {
    const buttonLabel = '歷史資訊';
    return (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 transition-shadow hover:shadow-lg">
            <div className="space-y-3">
                <div>
                    <h3 className="font-semibold text-gray-500 text-sm">自主學習計畫名稱</h3>
                    <p className="text-lg font-bold text-gray-800">{application.title}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-500 text-sm">開放申請時間</h3>
                    <p className="text-gray-700">{application.applyDateStart} ~ {application.applyDateEnd}</p>
                </div>
                 <div>
                    <h3 className="font-semibold text-gray-500 text-sm">處理狀態</h3>
                    <StatusBadge status={application.status} />
                </div>
                {userRole === UserRole.Teacher && <TeacherActions application={application} onStatusChange={onStatusChange} />}
            </div>
            <div className="flex items-center justify-end space-x-2 mt-6 border-t pt-4">
                <button onClick={() => onEdit(application)} className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700">{buttonLabel}</button>
                <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">匯出成PDF</button>
                <button onClick={() => onShowComment(application)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
                    {userRole === UserRole.Teacher ? '評論' : '評語'}
                </button>
            </div>
        </div>
    );
};

interface HistoryPageProps {
    userRole: UserRole;
    onEdit: (app: Application) => void;
}

const HistoryPage: React.FC<HistoryPageProps> = ({ userRole, onEdit }) => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({ year: '', month: '', day: '', status: '' });

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const appDate = new Date(app.applyDateStart.split(' ')[0]);
            const yearMatch = !filters.year || appDate.getFullYear().toString() === filters.year;
            const monthMatch = !filters.month || (appDate.getMonth() + 1).toString() === filters.month;
            const dayMatch = !filters.day || appDate.getDate().toString() === filters.day;
            const statusMatch = !filters.status || app.status === filters.status;
            return yearMatch && monthMatch && dayMatch && statusMatch;
        });
    }, [applications, filters]);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (['year', 'month', 'day'].includes(name)) {
            if (!/^\d*$/.test(value)) {
                return; 
            }
        }
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleShowComment = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApp(null);
    };

    const handleSaveComment = (appId: number, comment: string) => {
        setApplications(apps => apps.map(app => app.id === appId ? {...app, comment} : app));
        handleCloseModal();
    };
    
    const handleStatusChange = (id: number, status: ApplicationStatus) => {
        setApplications(apps => apps.map(app => app.id === id ? {...app, status} : app));
    };

    return (
        <div>
            {userRole === UserRole.Teacher && (
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <h2 className="font-bold text-lg mb-3">篩選</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                        <input type="text" inputMode="numeric" maxLength={4} name="year" placeholder="年" value={filters.year} onChange={handleFilterChange} className="p-2 border rounded-md"/>
                        <input type="text" inputMode="numeric" maxLength={2} name="month" placeholder="月" value={filters.month} onChange={handleFilterChange} className="p-2 border rounded-md"/>
                        <input type="text" inputMode="numeric" maxLength={2} name="day" placeholder="日" value={filters.day} onChange={handleFilterChange} className="p-2 border rounded-md"/>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="col-span-2 sm:col-span-2 p-2 border rounded-md">
                            <option value="">全部狀態</option>
                            <option value={ApplicationStatus.Passed}>通過</option>
                            <option value={ApplicationStatus.NotPassed}>未通過</option>
                            <option value={ApplicationStatus.Pending}>審核中</option>
                        </select>
                    </div>
                </div>
            )}
            <div>
                {filteredApplications.length > 0 ? filteredApplications.map(app => (
                    <ApplicationCard 
                        key={app.id} 
                        application={app} 
                        userRole={userRole} 
                        onShowComment={handleShowComment}
                        onStatusChange={handleStatusChange}
                        onEdit={onEdit}
                    />
                )) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">尚無任何申請紀錄。</p>
                    </div>
                )}
            </div>
            {isModalOpen && selectedApp && (
                <CommentModal 
                    application={selectedApp} 
                    userRole={userRole}
                    onClose={handleCloseModal}
                    onSave={handleSaveComment}
                />
            )}
        </div>
    );
};

export default HistoryPage;