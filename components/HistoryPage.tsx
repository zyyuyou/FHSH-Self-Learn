import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Application, ApplicationStatus, UserRole } from '../types';
import CommentModal from './CommentModal';
import ApplicationDetailModal from './ApplicationDetailModal';
import api from '../services/api';
import {
    GlassCard,
    GlassButton,
    GlassInput,
    GlassSelect,
    GlassBadge,
    GlassRadio,
    GlassAlert,
} from './ui/GlassUI';

const StatusBadge: React.FC<{ status: ApplicationStatus }> = ({ status }) => {
    const variants: Record<ApplicationStatus, 'success' | 'danger' | 'warning'> = {
        [ApplicationStatus.Passed]: 'success',
        [ApplicationStatus.NotPassed]: 'danger',
        [ApplicationStatus.Pending]: 'warning',
    };
    return <GlassBadge variant={variants[status]}>{status}</GlassBadge>;
};

const TeacherActions: React.FC<{
    application: Application;
    onStatusChange: (id: string, status: ApplicationStatus) => void;
}> = ({ application, onStatusChange }) => (
    <div className="mt-4 pt-4 border-t border-white/10">
        <h4 className="font-medium text-white/70 mb-3 text-sm">處理狀態</h4>
        <div className="flex items-center gap-4">
            <GlassRadio
                label="透過"
                name={`status-${application.id}`}
                checked={application.status === ApplicationStatus.Passed}
                onChange={() => onStatusChange(application.id, ApplicationStatus.Passed)}
            />
            <GlassRadio
                label="未透過"
                name={`status-${application.id}`}
                checked={application.status === ApplicationStatus.NotPassed}
                onChange={() => onStatusChange(application.id, ApplicationStatus.NotPassed)}
            />
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
        <GlassCard className="p-6" hover glow="subtle">
            {/* Header with Status */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{application.title}</h3>
                    <p className="text-sm text-white/50">計畫名稱</p>
                </div>
                <StatusBadge status={application.status} />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <p className="text-xs text-white/40 mb-1">提交者學號</p>
                    <p className="text-sm text-white/80">{application.submitter_student_id}</p>
                </div>
                <div>
                    <p className="text-xs text-white/40 mb-1">申請日期</p>
                    <p className="text-sm text-white/80">{application.applyDateStart}</p>
                </div>
            </div>

            {/* Teacher Actions */}
            {userRole === UserRole.Teacher && (
                <TeacherActions application={application} onStatusChange={onStatusChange} />
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 mt-4 pt-4 border-t border-white/10">
                <GlassButton
                    variant="default"
                    size="sm"
                    onClick={() => onShowDetail(application)}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    檢視
                </GlassButton>
                <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={() => onExportPDF(application)}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    PDF
                </GlassButton>
                <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => onShowComment(application)}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {userRole === UserRole.Teacher ? '評論' : '評語'}
                </GlassButton>
            </div>
        </GlassCard>
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

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await api.getApplications();
                const transformedApps = data.map((app: any) => ({
                    id: app.id,
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
    }, []);

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
            const fullApp = await api.getApplicationById(app.id.toString());
            const transformedApp: Application = {
                id: fullApp.id,
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
            await api.reviewApplication(appId, {
                status:
                    selectedApp?.status === ApplicationStatus.Passed
                        ? ApplicationStatus.Passed
                        : selectedApp?.status === ApplicationStatus.NotPassed
                          ? ApplicationStatus.NotPassed
                          : ApplicationStatus.Passed,
                comment,
            });
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
            await api.exportApplicationPDF(app.id);
        } catch (err) {
            console.error('匯出 PDF 失敗:', err);
            alert('匯出 PDF 失敗: ' + (err instanceof Error ? err.message : '未知錯誤'));
        }
    };

    const handleStatusChange = async (id: string, status: ApplicationStatus) => {
        try {
            await api.reviewApplication(id, {
                status: status,
            });

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
            {/* Filters for Teachers */}
            {userRole === UserRole.Teacher && (
                <GlassCard className="p-5 mb-6" glow="subtle">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center border border-white/10">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="font-bold text-white">篩選條件</h2>
                            <p className="text-sm text-white/50">依日期或狀態篩選申請表</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <GlassInput
                            type="text"
                            inputMode="numeric"
                            maxLength={4}
                            name="year"
                            placeholder="年"
                            value={filters.year}
                            onChange={handleFilterChange}
                        />
                        <GlassInput
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            name="month"
                            placeholder="月"
                            value={filters.month}
                            onChange={handleFilterChange}
                        />
                        <GlassInput
                            type="text"
                            inputMode="numeric"
                            maxLength={2}
                            name="day"
                            placeholder="日"
                            value={filters.day}
                            onChange={handleFilterChange}
                        />
                        <div className="col-span-2">
                            <GlassSelect
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                                options={[
                                    { value: '', label: '全部狀態' },
                                    { value: ApplicationStatus.Passed, label: '透過' },
                                    { value: ApplicationStatus.NotPassed, label: '未透過' },
                                    { value: ApplicationStatus.Pending, label: '審核中' },
                                ]}
                            />
                        </div>
                    </div>
                </GlassCard>
            )}

            {/* Loading State */}
            {loading && (
                <GlassCard className="p-10 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <svg className="animate-spin h-10 w-10 text-blue-400" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <p className="text-white/60">載入中...</p>
                    </div>
                </GlassCard>
            )}

            {/* Error State */}
            {error && (
                <GlassAlert variant="error" className="mb-6">
                    <p className="font-bold">載入失敗</p>
                    <p>{error}</p>
                </GlassAlert>
            )}

            {/* Applications Grid */}
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
                        <GlassCard className="p-10 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <p className="text-white/50">尚無任何申請紀錄</p>
                            </div>
                        </GlassCard>
                    )}
                </div>
            )}

            {/* Modals */}
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
