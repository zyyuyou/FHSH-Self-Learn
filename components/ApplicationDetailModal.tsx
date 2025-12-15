import React from 'react';
import { Application } from '../types';
import { GlassCard, GlassButton, GlassBadge, NoiseOverlay, NOISE_DATA_URI } from './ui/GlassUI';

interface ApplicationDetailModalProps {
    application: Application;
    onClose: () => void;
}

const DetailSection: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="mb-8">
        <h3 className="text-base font-semibold text-white mb-4 pb-3 border-b border-white/10 flex items-center gap-3">
            {icon}
            {title}
        </h3>
        {children}
    </div>
);

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose }) => {
    const statusVariant = application.status === '通過' ? 'success' : application.status === '未通過' ? 'danger' : 'warning';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-4xl overflow-hidden">
                <GlassCard className="p-0" glow="blue">
                    <NoiseOverlay />

                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center border border-white/10">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white">申請表詳細內容</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.1] hover:bg-white/[0.2] text-white/60 hover:text-white transition-all"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Content */}
                    <div className="relative z-0 p-8 overflow-y-auto max-h-[calc(90vh-140px)] bg-gradient-to-b from-black/10 to-transparent">
                        {/* Basic Info */}
                        <DetailSection
                            title="基本資訊"
                            icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        >
                            <GlassCard className="p-4 space-y-3" hover>
                                <div>
                                    <span className="text-sm text-white/60">計畫名稱</span>
                                    <p className="text-lg text-white/95 font-semibold">{application.title}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-white/60">申請日期</span>
                                        <p className="text-white/90">{application.applyDateStart}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-white/60">審核狀態</span>
                                        <div className="mt-1">
                                            <GlassBadge variant={statusVariant}>{application.status}</GlassBadge>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        </DetailSection>

                        {/* Members */}
                        {application.members && application.members.length > 0 && (
                            <DetailSection
                                title="組員資訊"
                                icon={<svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            >
                                <div className="space-y-4">
                                    {application.members.map((member, index) => (
                                        <GlassCard key={index} className="p-4" hover>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-sm border border-white/10">
                                                    {index === 0 ? '長' : index + 1}
                                                </span>
                                                <span className="font-semibold text-white">{index === 0 ? '組長' : `組員 ${index + 1}`}</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                                                {member.student_name && (
                                                    <div>
                                                        <span className="text-white/60">姓名</span>
                                                        <p className="text-white/90">{member.student_name}</p>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-white/60">學號</span>
                                                    <p className="text-white/90">{member.student_id}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">班級</span>
                                                    <p className="text-white/90">{member.student_class}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">座號</span>
                                                    <p className="text-white/90">{member.student_seat}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Motivation */}
                        {application.motivation && (
                            <DetailSection
                                title="學習動機"
                                icon={<svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.motivation}</p>
                                </GlassCard>
                            </DetailSection>
                        )}

                        {/* Learning Categories */}
                        {application.learning_categories && (
                            <DetailSection
                                title="學習類別"
                                icon={<svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
                            >
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(application.learning_categories)
                                        .filter(([_, selected]) => selected)
                                        .map(([category]) => (
                                            <GlassBadge key={category} variant="info">{category}</GlassBadge>
                                        ))}
                                    {application.learning_category_other && (
                                        <GlassBadge variant="default">其他：{application.learning_category_other}</GlassBadge>
                                    )}
                                </div>
                            </DetailSection>
                        )}

                        {/* References */}
                        {application.references && application.references.length > 0 && (
                            <DetailSection
                                title="學習方法(參考資料)"
                                icon={<svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                            >
                                <div className="space-y-4">
                                    {application.references.map((ref, index) => (
                                        <GlassCard key={index} className="p-4" hover>
                                            <div className="flex items-center gap-2 mb-3">
                                                <GlassBadge variant="info">資料 {index + 1}</GlassBadge>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                                <div>
                                                    <span className="text-white/60">書名</span>
                                                    <p className="text-white/90">{ref.book_title}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">作者</span>
                                                    <p className="text-white/90">{ref.author}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">出版社</span>
                                                    <p className="text-white/90">{ref.publisher}</p>
                                                </div>
                                                {ref.link && (
                                                    <div>
                                                        <span className="text-white/60">連結</span>
                                                        <a href={ref.link} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all block">
                                                            {ref.link}
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                            </DetailSection>
                        )}

                        {/* Expected Outcome */}
                        {application.expected_outcome && (
                            <DetailSection
                                title="預期成效"
                                icon={<svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.expected_outcome}</p>
                                </GlassCard>
                            </DetailSection>
                        )}

                        {/* Equipment Needs */}
                        {application.equipment_needs && (
                            <DetailSection
                                title="學習裝置需求"
                                icon={<svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.equipment_needs}</p>
                                </GlassCard>
                            </DetailSection>
                        )}

                        {/* Environment Needs */}
                        {application.env_needs && (
                            <DetailSection
                                title="學習環境需求"
                                icon={<svg className="w-5 h-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                            >
                                <div className="flex flex-wrap gap-3">
                                    {Object.entries(application.env_needs)
                                        .filter(([_, selected]) => selected)
                                        .map(([env]) => (
                                            <GlassBadge key={env} variant="default">{env}</GlassBadge>
                                        ))}
                                    {application.env_other && (
                                        <GlassBadge variant="default">其他：{application.env_other}</GlassBadge>
                                    )}
                                </div>
                            </DetailSection>
                        )}

                        {/* Plan Items */}
                        {application.plan_items && application.plan_items.length > 0 && (
                            <DetailSection
                                title="學習內容規劃"
                                icon={<svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                            >
                                <div className="space-y-4">
                                    {application.plan_items.map((item, index) => (
                                        <GlassCard key={index} className="p-4" hover>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-sm font-semibold text-white border border-white/10">
                                                    {index + 1}
                                                </span>
                                                <span className="text-white/70 text-sm">項次 {index + 1}</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                                <div>
                                                    <span className="text-white/60">日期</span>
                                                    <p className="text-white/90">{item.date}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">時數</span>
                                                    <p className="text-white/90">{item.hours} 小時</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3 text-sm">
                                                <div>
                                                    <span className="text-white/60">學習內容</span>
                                                    <p className="text-white/90 leading-relaxed">{item.content}</p>
                                                </div>
                                                <div>
                                                    <span className="text-white/60">檢核指標</span>
                                                    <p className="text-white/90 leading-relaxed">{item.metric}</p>
                                                </div>
                                            </div>
                                        </GlassCard>
                                    ))}
                                </div>
                                <div className="mt-4 text-right">
                                    <GlassBadge variant="info">
                                        總時數：{application.plan_items.reduce((sum, item) => sum + (Number(item.hours) || 0), 0)} 小時
                                    </GlassBadge>
                                </div>
                            </DetailSection>
                        )}

                        {/* Goals */}
                        {application.midterm_goal && (
                            <DetailSection
                                title="階段中(4周後)預計達成目標"
                                icon={<svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.midterm_goal}</p>
                                </GlassCard>
                            </DetailSection>
                        )}

                        {application.final_goal && (
                            <DetailSection
                                title="階段末(8周後)預計達成目標"
                                icon={<svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.final_goal}</p>
                                </GlassCard>
                            </DetailSection>
                        )}

                        {/* Presentation Format */}
                        {(application.presentation_formats || application.presentation_other) && (
                            <DetailSection
                                title="成果發表形式"
                                icon={<svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>}
                            >
                                <div className="flex flex-wrap gap-3">
                                    {application.presentation_formats && Object.entries(application.presentation_formats).map(([key, value]) =>
                                        value && <GlassBadge key={key} variant="default">{key}</GlassBadge>
                                    )}
                                    {application.presentation_other && (
                                        <GlassBadge variant="default">其他：{application.presentation_other}</GlassBadge>
                                    )}
                                </div>
                            </DetailSection>
                        )}

                        {/* Phone Agreement */}
                        {application.phone_agreement && (
                            <DetailSection
                                title="手機使用規範"
                                icon={<svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>}
                            >
                                <GlassBadge variant={application.phone_agreement === '同意' ? 'success' : 'danger'}>
                                    {application.phone_agreement}
                                </GlassBadge>
                            </DetailSection>
                        )}

                        {/* Signatures */}
                        {application.signatures && application.signatures.length > 0 && (
                            <DetailSection
                                title="簽章"
                                icon={<svg className="w-5 h-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>}
                            >
                                {/* 學生簽名 */}
                                {application.signatures.filter(sig => sig.type.includes('學生')).length > 0 && (
                                    <>
                                        <h4 className="text-sm font-medium text-white/80 mb-3">學生簽名</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                                            {application.signatures
                                                .filter(sig => sig.type.includes('學生'))
                                                .map((sig, index) => (
                                                    <GlassCard key={index} className="p-4" hover>
                                                        <p className="text-sm text-white/70 mb-2">{sig.type}</p>
                                                        {sig.image_url ? (
                                                            <img
                                                                src={sig.image_url}
                                                                alt={sig.type}
                                                                className="border border-white/10 rounded-lg max-h-24 w-full object-contain bg-white/5"
                                                            />
                                                        ) : (
                                                            <div className="text-white/30 text-sm text-center py-4 border border-white/10 rounded-lg bg-white/5">
                                                                未簽名
                                                            </div>
                                                        )}
                                                    </GlassCard>
                                                ))}
                                        </div>
                                    </>
                                )}
                                {/* 教師及管理人簽章 */}
                                {application.signatures.filter(sig => !sig.type.includes('學生')).length > 0 && (
                                    <>
                                        <h4 className="text-sm font-medium text-white/80 mb-3">教師及管理人簽章</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {application.signatures
                                                .filter(sig => !sig.type.includes('學生'))
                                                .map((sig, index) => (
                                                    <GlassCard key={index} className="p-4" hover>
                                                        <p className="text-sm text-white/70 mb-2">{sig.type}</p>
                                                        {sig.image_url ? (
                                                            <img
                                                                src={sig.image_url}
                                                                alt={sig.type}
                                                                className="border border-white/10 rounded-lg max-h-24 w-full object-contain bg-white/5"
                                                            />
                                                        ) : (
                                                            <div className="text-white/30 text-sm text-center py-4 border border-white/10 rounded-lg bg-white/5">
                                                                未簽章
                                                            </div>
                                                        )}
                                                    </GlassCard>
                                                ))}
                                        </div>
                                    </>
                                )}
                            </DetailSection>
                        )}

                        {/* Teacher Comment */}
                        {application.comment && (
                            <DetailSection
                                title="教師評語"
                                icon={<svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>}
                            >
                                <GlassCard className="p-4" hover>
                                    <p className="text-white/90 whitespace-pre-wrap leading-relaxed">{application.comment}</p>
                                </GlassCard>
                            </DetailSection>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="sticky bottom-0 z-10 flex justify-end p-5 border-t border-white/10 bg-white/[0.02] backdrop-blur-xl rounded-b-2xl overflow-hidden">
                        <GlassButton variant="primary" onClick={onClose}>
                            關閉
                        </GlassButton>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;
