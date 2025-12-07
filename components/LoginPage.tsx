import React, { useState, useMemo } from 'react';
import { User } from '../types';
import api from '../services/api';

interface LoginPageProps {
    onLogin: (user: User) => void;
}

const FormInput: React.FC<{
    label: string;
    type?: string;
    id: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, type = 'text', id, value, onChange }) => (
    <div className="flex items-center mb-5">
        <label
            htmlFor={id}
            className="w-16 sm:w-20 text-base sm:text-lg font-medium text-gray-700 shrink-0"
        >
            {label}
        </label>
        <input
            type={type}
            id={id}
            value={value}
            onChange={onChange}
            className="w-full py-2.5 px-4 bg-gray-200 rounded-full border-transparent focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-300 transition"
        />
    </div>
);

const LoginCard: React.FC<{
    title: string;
    children: React.ReactNode;
    onConfirm: () => void;
    confirmLabel: string;
    isDisabled: boolean;
}> = ({ title, children, onConfirm, confirmLabel, isDisabled }) => (
    <section className="mb-10">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-5">{title}</h2>
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
            {children}
            <button
                onClick={onConfirm}
                disabled={isDisabled}
                className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
                {confirmLabel}
            </button>
        </div>
    </section>
);

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

    return (
        <div className="py-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center mb-10">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                    臺北市立復興高階中學
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mt-1">自主學習計畫 學生申請系統</p>
            </div>

            <LoginCard
                title="學生登入"
                onConfirm={handleStudentLogin}
                confirmLabel={studentLoading ? '登入中...' : '學生登入'}
                isDisabled={isStudentLoginDisabled}
            >
                <FormInput
                    label="帳號"
                    id="student-account"
                    value={studentAccount}
                    onChange={(e) => setStudentAccount(e.target.value)}
                />
                <FormInput
                    label="密碼"
                    type="password"
                    id="student-password"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                />
                {studentError && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {studentError}
                    </div>
                )}
            </LoginCard>

            <LoginCard
                title="教師登入"
                onConfirm={handleTeacherLogin}
                confirmLabel={teacherLoading ? '登入中...' : '教師登入'}
                isDisabled={isTeacherLoginDisabled}
            >
                <FormInput
                    label="帳號"
                    id="teacher-account"
                    value={teacherAccount}
                    onChange={(e) => setTeacherAccount(e.target.value)}
                />
                <FormInput
                    label="密碼"
                    type="password"
                    id="teacher-password"
                    value={teacherPassword}
                    onChange={(e) => setTeacherPassword(e.target.value)}
                />
                {teacherError && (
                    <div className="mt-3 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                        {teacherError}
                    </div>
                )}
            </LoginCard>
        </div>
    );
};

export default LoginPage;
