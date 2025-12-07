import React, { useState } from 'react';
import { GlassModal, GlassInput, GlassButton, GlassAlert } from './ui/GlassUI';

interface ChangePasswordModalProps {
    onClose: () => void;
    onSave: (oldPassword: string, newPassword: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose, onSave }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('請填寫所有欄位');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('新密碼與確認密碼不一致');
            return;
        }

        if (newPassword.length < 6) {
            setError('新密碼長度至少需要6個字元');
            return;
        }

        if (oldPassword === newPassword) {
            setError('新密碼不能與舊密碼相同');
            return;
        }

        setLoading(true);
        try {
            await onSave(oldPassword, newPassword);
            onClose();
        } catch (err: any) {
            setError(err.message || '更改密碼失敗');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassModal isOpen={true} onClose={onClose} title="更改密碼" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <GlassInput
                    label="舊密碼"
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    disabled={loading}
                    placeholder="請輸入目前的密碼"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    }
                />

                <GlassInput
                    label="新密碼"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    disabled={loading}
                    placeholder="請輸入新密碼 (至少6個字元)"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>
                    }
                />

                <GlassInput
                    label="確認新密碼"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    placeholder="請再次輸入新密碼"
                    icon={
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />

                {error && (
                    <GlassAlert variant="error">
                        {error}
                    </GlassAlert>
                )}

                <div className="flex justify-end gap-3 pt-4">
                    <GlassButton
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        取消
                    </GlassButton>
                    <GlassButton
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        loading={loading}
                    >
                        {loading ? '更改中...' : '確認更改'}
                    </GlassButton>
                </div>
            </form>
        </GlassModal>
    );
};

export default ChangePasswordModal;
