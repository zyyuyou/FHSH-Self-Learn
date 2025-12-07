import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Application, ApplicationStatus, UserRole } from '../types';
import CommentModal from './CommentModal';
import ApplicationDetailModal from './ApplicationDetailModal';
import api from '../services/api';

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const baseClasses = 'px-3 py-1 text-sm font-semibold rounded-full text-white';
    const statusClasses = {
        [ApplicationStatus.Passed]: 'bg-green-500',
        [ApplicationStatus.NotPassed]: 'bg-red-500',
        [ApplicationStatus.Pending]: 'bg-yellow-500',
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const TeacherActions: React.FC<{
    application: Application;
    onStatusChange: (id: number, status: ApplicationStatus) => void;
}> = ({ application, onStatusChange }) => (
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
                <label htmlFor={`passed-${application.id}`} className="ml-2 text-green-700">
                    透過
                </label>
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
                <label htmlFor={`not-passed-${application.id}`} className="ml-2 text-red-700">
                    未透過
                </label>
            </div>
        </div>
    </div>
);

const ApplicationCard: React.FC<{
    application: Application;
    userRole: UserRole;
    onShowComment: (app: Application) => void;
    onStatusChange: (id: string, status: ApplicationStatus) => void;
    onShowDetail: (app: Application) => void;
    onExportPDF: (app: Application) => void;
}> = ({ application, userRole, onShowComment, onStatusChange, onShowDetail, onExportPDF }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 transition-shadow hover:shadow-lg">
            <div className="space-y-3">
                <div>
                    <h3 className="font-semibold text-gray-500 text-sm">自主學習計畫名稱</h3>
                    <p className="text-lg font-bold text-gray-800">{application.title}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm">提交者學號</h3>
                        <p className="text-gray-700">{application.submitter_student_id}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm">申請日期</h3>
                        <p className="text-gray-700">
                            {application.applyDateStart}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-semibold text-gray-500 text-sm mb-2">處理狀態</h3>
                        <StatusBadge status={application.status} />
                    </div>
                    {userRole === UserRole.Teacher && (
                        <div>
                            <TeacherActions application={application} onStatusChange={onStatusChange} />
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-6 border-t pt-4">
                <button
                    onClick={() => onShowDetail(application)}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700"
                >
                    檢視詳情
                </button>
                <button
                    onClick={() => onExportPDF(application)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    匯出成PDF
                </button>
                <button
                    onClick={() => onShowComment(application)}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
                >
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
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailApp, setDetailApp] = useState<Application | null>(null);
    const [filters, setFilters] = useState({ year: '', month: '', day: '', status: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 獲取申請表列表
    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getApplications();
                // 轉換後端資料格式為前端格式
                const transformedApps = data.map((app: any) => ({
                    id: app.id, // 保持字串格式的 MongoDB ObjectId
                    title: app.title,
                    applyDateStart: app.apply_date_start || app.created_at?.split('T')[0] || '',
                    applyDateEnd: app.apply_date_end || '',
                    status: app.status as ApplicationStatus,
                    comment: app.comment || '',
                    submitter_student_id: app.submitter_student_id || '',
                }));
                setApplications(transformedApps);
            } catch (err) {
                console.error('獲取申請表失敗:', err);
                setError(err instanceof Error ? err.message : '獲取申請表失敗');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []); // 空依賴陣列，僅在元件掛載時執行一次

    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const appDate = new Date(app.applyDateStart.split(' ')[0]);
            const yearMatch = !filters.year || appDate.getFullYear().toString() === filters.year;
            const monthMatch =
                !filters.month || (appDate.getMonth() + 1).toString() === filters.month;
            const dayMatch = !filters.day || appDate.getDate().toString() === filters.day;
            const statusMatch = !filters.status || app.status === filters.status;
            return yearMatch && monthMatch && dayMatch && statusMatch;
        });
    }, [applications, filters]);

    const handleFilterChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            if (['year', 'month', 'day'].includes(name)) {
                if (!/^\d*$/.test(value)) {
                    return;
                }
            }
            setFilters((prev) => ({ ...prev, [name]: value }));
        },
        []
    );

    const handleShowComment = (app: Application) => {
        setSelectedApp(app);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedApp(null);
    };

    const handleShowDetail = async (app: Application) => {
        try {
            // 獲取完整的申請表詳情
            const fullApp = await api.getApplicationById(app.id.toString());
            // 轉換後端資料格式
            const transformedApp: Application = {
                id: fullApp.id,  // 保持字串格式
                title: fullApp.title,
                applyDateStart: fullApp.apply_date_start,
                applyDateEnd: fullApp.apply_date_end,
                status: fullApp.status as ApplicationStatus,
                comment: fullApp.comment || '',
                members: fullApp.members || [],
                motivation: fullApp.motivation || '',
                learning_categories: fullApp.learning_categories || {},
                learning_category_other: fullApp.learning_category_other || '',
                references: fullApp.references || [],
                expected_outcome: fullApp.expected_outcome || '',
                equipment_needs: fullApp.equipment_needs || '',
                env_needs: fullApp.env_needs || {},
                env_other: fullApp.env_other || '',
                plan_items: fullApp.plan_items || [],
                midterm_goal: fullApp.midterm_goal || '',
                final_goal: fullApp.final_goal || '',
                presentation_formats: fullApp.presentation_formats || {},
                presentation_other: fullApp.presentation_other || '',
                phone_agreement: fullApp.phone_agreement || '',
                signatures: fullApp.signatures || [],
                submitter_id: fullApp.submitter_id,
                submitter_student_id: fullApp.submitter_student_id,
                created_at: fullApp.created_at,
                updated_at: fullApp.updated_at,
            };
            setDetailApp(transformedApp);
            setIsDetailModalOpen(true);
        } catch (err) {
            console.error('獲取申請表詳情失敗:', err);
            alert('獲取詳情失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setDetailApp(null);
    };

    const handleSaveComment = async (appId: string, comment: string) => {
        try {
            // 呼叫後端 API 儲存評論
            // 後端期望的狀態值是中文: "透過", "未透過", "審核中"
            await api.reviewApplication(appId, {
                status:
                    selectedApp?.status === ApplicationStatus.Passed
                        ? ApplicationStatus.Passed
                        : selectedApp?.status === ApplicationStatus.NotPassed
                          ? ApplicationStatus.NotPassed
                          : ApplicationStatus.Passed,
                comment,
            });
            // 更新本地狀態
            setApplications((apps) =>
                apps.map((app) => (app.id === appId ? { ...app, comment } : app))
            );
            handleCloseModal();
        } catch (err) {
            console.error('儲存評論失敗:', err);
            alert('儲存評論失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
        }
    };

    const handleExportPDF = async (app: Application) => {
        try {
            // 呼叫 API 匯出 PDF
            await api.exportApplicationPDF(app.id);
        } catch (err) {
            console.error('匯出 PDF 失敗:', err);
            alert('匯出 PDF 失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
        }
    };

    const handleStatusChange = async (id: string, status: ApplicationStatus) => {
        try {
            // 後端期望的狀態值就是前端的 ApplicationStatus 列舉值（中文）
            await api.reviewApplication(id, {
                status: status,
            });

            // 更新本地狀態
            setApplications((apps) =>
                apps.map((app) => (app.id === id ? { ...app, status } : app))
            );
        } catch (err) {
            console.error('更新狀態失敗:', err);
            alert('更新狀態失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
        }
    };

    return (
        <div>
            {userRole === UserRole.Teacher && (
                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <h2 className="font-bold text-lg mb-3">篩選</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            name="year"
                            placeholder="年"
                            value={filters.year}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            name="month"
                            placeholder="月"
                            value={filters.month}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md"
                        />
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            name="day"
                            placeholder="日"
                            value={filters.day}
                            onChange={handleFilterChange}
                            className="p-2 border rounded-md"
                        />
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                            className="col-span-2 sm:col-span-2 p-2 border rounded-md"
                        >
                            <option value="">全部狀態</option>
                            <option value={ApplicationStatus.Passed}>透過</option>
                            <option value={ApplicationStatus.NotPassed}>未透過</option>
                            <option value={ApplicationStatus.Pending}>審核中</option>
                        </select>
                    </div>
                </div>
            )}

            {loading && (
                <div className="text-center py-10 bg-white rounded-lg shadow-md">
                    <p className="text-gray-500">載入中...</p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-6">
                    <p className="font-bold">載入失敗</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && (
                <div>
                    {filteredApplications.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {filteredApplications.map((app) => (
                                <ApplicationCard
                                    key={app.id}
                                    application={app}
                                    userRole={userRole}
                                    onShowComment={handleShowComment}
                                    onStatusChange={handleStatusChange}
                                    onShowDetail={handleShowDetail}
                                    onExportPDF={handleExportPDF}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-lg shadow-md">
                            <p className="text-gray-500">尚無任何申請紀錄。</p>
                        </div>
                    )}
                </div>
            )}
            {isModalOpen && selectedApp && (
                <CommentModal
                    application={selectedApp}
                    userRole={userRole}
                    onClose={handleCloseModal}
                    onSave={handleSaveComment}
                />
            )}
            {isDetailModalOpen && detailApp && (
                <ApplicationDetailModal
                    application={detailApp}
                    onClose={handleCloseDetailModal}
                />
            )}
        </div>
    );
};

export default HistoryPage;
