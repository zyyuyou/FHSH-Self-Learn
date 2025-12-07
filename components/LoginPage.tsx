import React, { useState, useMemo } from 'react';
import { User } from '../types';
import api from '../services/api';
import { GlassCard, GlassInput, GlassButton, GlassAlert, NoiseOverlay, NOISE_DATA_URI } from './ui/GlassUI';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const LoginCard: React.FC<{
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    onConfirm: () => void;
    confirmLabel: string;
    isDisabled: boolean;
    error: string | null;
    accentColor: 'blue' | 'purple';
}> = ({ title, subtitle, icon, children, onConfirm, confirmLabel, isDisabled, error, accentColor }) => {
    const gradients = {
        blue: 'from-blue-500/20 to-cyan-500/20',
        purple: 'from-purple-500/20 to-pink-500/20',
    };

    const buttonVariant = accentColor === 'blue' ? 'primary' : 'primary';

    return (
        <GlassCard className="p-8 mb-8" hover glow={accentColor === 'blue' ? 'blue' : 'purple'}>
            {/* Accent gradient at top */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradients[accentColor]} rounded-t-2xl`} />

            <div className="flex items-center gap-4 mb-6">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradients[accentColor]} flex items-center justify-center backdrop-blur-xl border border-white/10`}>
                    {icon}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{title}</h2>
                    <p className="text-sm text-white/50">{subtitle}</p>
                </div>
            </div>

            <div className="space-y-4">
                {children}
            </div>

            {error && (
                <GlassAlert variant="error" className="mt-4">
                    {error}
                </GlassAlert>
            )}

            <GlassButton
                onClick={onConfirm}
                disabled={isDisabled}
                variant={buttonVariant}
                size="lg"
                className="w-full mt-6"
            >
                {confirmLabel}
            </GlassButton>
        </GlassCard>
    );
};

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [studentAccount, setStudentAccount] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
    const [studentLoading, setStudentLoading] = useState(false);
    const [studentError, setStudentError] = useState<string | null>(null);

    const [teacherAccount, setTeacherAccount] = useState('');
    const [teacherPassword, setTeacherPassword] = useState('');
    const [teacherLoading, setTeacherLoading] = useState(false);
    const [teacherError, setTeacherError] = useState<string | null>(null);

    const isStudentLoginDisabled = useMemo(() => {
        return !studentAccount || !studentPassword || studentLoading;
    }, [studentAccount, studentPassword, studentLoading]);

    const isTeacherLoginDisabled = useMemo(() => {
        return !teacherAccount || !teacherPassword || teacherLoading;
    }, [teacherAccount, teacherPassword, teacherLoading]);

    const handleStudentLogin = async () => {
        setStudentLoading(true);
        setStudentError(null);
        try {
            const response = await api.login(studentAccount, studentPassword);
            onLogin(response.user);
        } catch (error) {
            setStudentError(error instanceof Error ? error.message : '登入失敗');
        } finally {
            setStudentLoading(false);
        }
    };

    const handleTeacherLogin = async () => {
        setTeacherLoading(true);
        setTeacherError(null);
        try {
            const response = await api.login(teacherAccount, teacherPassword);
            onLogin(response.user);
        } catch (error) {
            setTeacherError(error instanceof Error ? error.message : '登入失敗');
        } finally {
            setTeacherLoading(false);
        }
    };

    const handleStudentKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isStudentLoginDisabled) {
            handleStudentLogin();
        }
    };

    const handleTeacherKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !isTeacherLoginDisabled) {
            handleTeacherLogin();
        }
    };

    return (
        <div className="py-8 px-4">
            {/* Hero Section */}
            <div className="text-center mb-12">
                <GlassCard className="p-8 mb-8" glow="blue">
                    <div className="relative">
                        {/* School Logo/Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center backdrop-blur-xl border border-white/20">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/70 mb-2">
                            臺北市立復興高級中學
                        </h1>
                        <p className="text-lg sm:text-xl text-white/60">
                            自主學習計畫 學生申請系統
                        </p>

                        {/* Decorative elements */}
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl" />
                    </div>
                </GlassCard>
            </div>

            {/* Login Cards */}
            <div className="space-y-6">
                <LoginCard
                    title="學生登入"
                    subtitle="使用學號登入系統"
                    icon={
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    }
                    onConfirm={handleStudentLogin}
                    confirmLabel={studentLoading ? '登入中...' : '學生登入'}
                    isDisabled={isStudentLoginDisabled}
                    error={studentError}
                    accentColor="blue"
                >
                    <GlassInput
                        label="帳號"
                        id="student-account"
                        value={studentAccount}
                        onChange={(e) => setStudentAccount(e.target.value)}
                        onKeyDown={handleStudentKeyDown}
                        placeholder="請輸入學號"
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />
                    <GlassInput
                        label="密碼"
                        type="password"
                        id="student-password"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        onKeyDown={handleStudentKeyDown}
                        placeholder="請輸入密碼"
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />
                </LoginCard>

                <LoginCard
                    title="教師登入"
                    subtitle="使用教師帳號登入"
                    icon={
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    }
                    onConfirm={handleTeacherLogin}
                    confirmLabel={teacherLoading ? '登入中...' : '教師登入'}
                    isDisabled={isTeacherLoginDisabled}
                    error={teacherError}
                    accentColor="purple"
                >
                    <GlassInput
                        label="帳號"
                        id="teacher-account"
                        value={teacherAccount}
                        onChange={(e) => setTeacherAccount(e.target.value)}
                        onKeyDown={handleTeacherKeyDown}
                        placeholder="請輸入教師帳號"
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        }
                    />
                    <GlassInput
                        label="密碼"
                        type="password"
                        id="teacher-password"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        onKeyDown={handleTeacherKeyDown}
                        placeholder="請輸入密碼"
                        icon={
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        }
                    />
                </LoginCard>
            </div>

            {/* Footer */}
            <div className="text-center mt-8 text-white/30 text-sm">
                <p>Copyright 2024 FHSH. All rights reserved.</p>
            </div>
        </div>
    );
};

export default LoginPage;
