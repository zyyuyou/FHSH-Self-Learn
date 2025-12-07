import React, { useState } from 'react';
import { Application, UserRole } from '../types';
import { GlassModal, GlassTextarea, GlassButton, GlassCard } from './ui/GlassUI';

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
        <GlassModal
            isOpen={true}
            onClose={onClose}
            title={isTeacher ? '教師評論' : '查看評語'}
            size="lg"
        >
            {/* Application Info */}
            <GlassCard className="p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-white/40">計畫名稱</p>
                        <p className="text-lg font-semibold text-white">{application.title}</p>
                    </div>
                </div>
            </GlassCard>

            {/* Comment Section */}
            <div className="mb-6">
                <h3 className="font-medium text-white/70 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {isTeacher ? '評論內容' : '教師評語'}
                </h3>

                {isTeacher ? (
                    <GlassTextarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={6}
                        placeholder="請在此輸入評論..."
                    />
                ) : (
                    <GlassCard className="p-4 min-h-[150px]">
                        {application.comment ? (
                            <p className="text-white/80 whitespace-pre-wrap">{application.comment}</p>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-white/40">
                                <svg className="w-12 h-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p>老師尚未提供評語</p>
                            </div>
                        )}
                    </GlassCard>
                )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <GlassButton
                    variant="ghost"
                    onClick={onClose}
                >
                    {isTeacher ? '取消' : '關閉'}
                </GlassButton>
                {isTeacher && (
                    <GlassButton
                        variant="primary"
                        onClick={handleSave}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        完成並儲存
                    </GlassButton>
                )}
            </div>
        </GlassModal>
    );
};

export default CommentModal;
