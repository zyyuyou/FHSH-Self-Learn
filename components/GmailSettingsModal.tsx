import React, { useState, useEffect } from 'react';
import { GlassModal, GlassInput, GlassButton, GlassAlert } from './ui/GlassUI';
import api from '../services/api';

interface GmailSettingsModalProps {
    onClose: () => void;
}

const GmailSettingsModal: React.FC<GmailSettingsModalProps> = ({ onClose }) => {
    const [gmailUser, setGmailUser] = useState('');
    const [gmailAppPassword, setGmailAppPassword] = useState('');
    const [isConfigured, setIsConfigured] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // 載入現有設定
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await api.getGmailSettings();
                setGmailUser(settings.gmail_user || '');
                setIsConfigured(settings.is_configured);
            } catch (err: any) {
                console.error('載入 Gmail 設定失敗:', err);
            } finally {
                setInitialLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // 驗證 Gmail 格式
        if (gmailUser && !gmailUser.includes('@')) {
            setError('請輸入有效的 Gmail 帳號');
            return;
        }

        // 如果填寫了 Gmail，App Password 也必須填寫
        if (gmailUser && !gmailAppPassword && !isConfigured) {
            setError('請輸入 Gmail 應用程式密碼');
            return;
        }

        setLoading(true);
        try {
            const updateData: { gmail_user?: string; gmail_app_password?: string } = {};

            // 如果 Gmail 為空，清除設定
            if (!gmailUser) {
                updateData.gmail_user = '';
                updateData.gmail_app_password = '';
            } else {
                updateData.gmail_user = gmailUser;
                // 只有在輸入了新密碼時才更新
                if (gmailAppPassword) {
                    updateData.gmail_app_password = gmailAppPassword;
                }
            }

            const result = await api.updateGmailSettings(updateData);
            setIsConfigured(result.is_configured);
            setGmailAppPassword(''); // 清除密碼欄位

            if (result.is_configured) {
                setSuccess('Gmail 設定已儲存，審核結果將會自動發送郵件通知學生。');
            } else {
                setSuccess('Gmail 設定已清除，審核結果將不會發送郵件通知。');
            }
        } catch (err: any) {
            setError(err.message || '儲存設定失敗');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.updateGmailSettings({
                gmail_user: '',
                gmail_app_password: '',
            });
            setGmailUser('');
            setGmailAppPassword('');
            setIsConfigured(false);
            setSuccess('Gmail 設定已清除');
        } catch (err: any) {
            setError(err.message || '清除設定失敗');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <GlassModal isOpen={true} onClose={onClose} title="Gmail 郵件通知設定" size="md">
                <div className="flex items-center justify-center py-8">
                    <svg className="animate-spin h-8 w-8 text-blue-400" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                </div>
            </GlassModal>
        );
    }

    return (
        <GlassModal isOpen={true} onClose={onClose} title="Gmail 郵件通知設定" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* 說明區塊 */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-white/70">
                            <p className="font-medium text-white/90 mb-1">請填寫 Gmail，以利寄送郵件通知學生。</p>
                            <p>當您審核學生的自主學習申請表時，系統會自動發送審核結果通知到學生的信箱。</p>
                            <p className="mt-2 text-white/50">如果未填寫，則不會發送郵件通知。</p>
                        </div>
                    </div>
                </div>

                {/* 目前狀態 */}
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl ${isConfigured ? 'bg-green-500/10 border border-green-500/20' : 'bg-yellow-500/10 border border-yellow-500/20'}`}>
                    {isConfigured ? (
                        <>
                            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-green-400 text-sm font-medium">郵件通知已啟用</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span className="text-yellow-400 text-sm font-medium">郵件通知未設定</span>
                        </>
                    )}
                </div>

                <GlassInput
                    label="Gmail 帳號"
                    type="email"
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                    disabled={loading}
                    placeholder="example@gmail.com"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                />

                <GlassInput
                    label={isConfigured ? "Gmail 應用程式密碼（如需更新請填寫）" : "Gmail 應用程式密碼"}
                    type="password"
                    value={gmailAppPassword}
                    onChange={(e) => setGmailAppPassword(e.target.value)}
                    disabled={loading}
                    placeholder={isConfigured ? "保持空白則不更新密碼" : "請輸入 16 位應用程式密碼"}
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    }
                />

                {/* 如何取得應用程式密碼的說明 */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                    <details className="group">
                        <summary className="flex items-center gap-2 cursor-pointer text-sm text-white/60 hover:text-white/80 transition-colors">
                            <svg className="w-4 h-4 group-open:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            如何取得 Gmail 應用程式密碼？
                        </summary>
                        <div className="mt-3 text-sm text-white/50 space-y-2 pl-6">
                            <p>1. 前往 Google 帳戶設定</p>
                            <p>2. 選擇「安全性」</p>
                            <p>3. 在「登入 Google」區塊中選擇「應用程式密碼」</p>
                            <p>4. 選擇「郵件」和「其他」裝置</p>
                            <p>5. 點擊「產生」並複製 16 位密碼</p>
                            <p className="text-yellow-400/70 mt-2">注意：需要先開啟兩步驟驗證才能使用應用程式密碼</p>
                        </div>
                    </details>
                </div>

                {error && (
                    <GlassAlert variant="error">
                        {error}
                    </GlassAlert>
                )}

                {success && (
                    <GlassAlert variant="success">
                        {success}
                    </GlassAlert>
                )}

                <div className="flex justify-between gap-3 pt-4">
                    <div>
                        {isConfigured && (
                            <GlassButton
                                type="button"
                                variant="danger"
                                onClick={handleClear}
                                disabled={loading}
                            >
                                清除設定
                            </GlassButton>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <GlassButton
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            關閉
                        </GlassButton>
                        <GlassButton
                            type="submit"
                            variant="primary"
                            disabled={loading}
                            loading={loading}
                        >
                            {loading ? '儲存中...' : '儲存設定'}
                        </GlassButton>
                    </div>
                </div>
            </form>
        </GlassModal>
    );
};

export default GmailSettingsModal;
