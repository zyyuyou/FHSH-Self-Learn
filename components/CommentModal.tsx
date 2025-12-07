import React, { useState } from 'react';
import { Application, UserRole } from '../types';

interface CommentModalProps {
    application: Application;
    userRole: UserRole;
    onClose: () => void;
    onSave: (appId: string, comment: string) => void;
}

const CommentModal: React.FC<CommentModalProps> = ({ application, userRole, onClose, onSave }) => {
    const [comment, setComment] = useState(application.comment);
    const isTeacher = userRole === UserRole.Teacher;

    const handleSave = () => {
        onSave(application.id, comment);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-lg mx-auto">
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-500 text-sm">自主學習計畫名稱</h3>
                    <p className="text-xl font-bold text-gray-800">{application.title}</p>
                </div>

                <div className="mb-6">
                    <h3 className="font-bold text-gray-800 text-lg mb-2">
                        {isTeacher ? '評論' : '評語'}
                    </h3>
                    {isTeacher ? (
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={6}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            placeholder="請在此輸入評論..."
                        />
                    ) : (
                        <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-md min-h-[120px]">
                            {application.comment || '老師尚未提供評語。'}
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        {isTeacher ? '取消' : '關閉'}
                    </button>
                    {isTeacher && (
                        <button
                            onClick={handleSave}
                            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            完成並儲存
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommentModal;
