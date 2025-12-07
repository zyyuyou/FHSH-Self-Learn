import React from 'react';
import { Application } from '../types';

interface ApplicationDetailModalProps {
    application: Application;
    onClose: () => void;
}

const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({ application, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-4xl mx-auto my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6 sticky top-0 bg-white py-4 border-b z-10">
                    <h2 className="text-2xl font-bold text-gray-800">申請表詳細內容</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* 基本資訊 */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">基本資訊</h3>
                    <div className="space-y-2">
                        <div>
                            <span className="font-semibold text-gray-600">計畫名稱：</span>
                            <span className="text-gray-800">{application.title}</span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">申請日期：</span>
                            <span className="text-gray-800">
                                {application.applyDateStart}
                            </span>
                        </div>
                        <div>
                            <span className="font-semibold text-gray-600">審核狀態：</span>
                            <span className={`px-2 py-1 rounded ${
                                application.status === '透過'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === '未透過'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                            }`}>
                                {application.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 組員資訊 */}
                {application.members && application.members.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">組員資訊</h3>
                        <div className="space-y-3">
                            {application.members.map((member, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <div className="font-semibold text-gray-700">
                                        {index === 0 ? '組長' : `組員 ${index}`}
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                                        {member.student_name && (
                                            <div>
                                                <span className="text-gray-600">姓名：</span>
                                                {member.student_name}
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-gray-600">學號：</span>
                                            {member.student_id}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">班級：</span>
                                            {member.student_class}
                                        </div>
                                        <div>
                                            <span className="text-gray-600">座號：</span>
                                            {member.student_seat}
                                        </div>
                                        {member.has_submitted && (
                                            <div>
                                                <span className="text-gray-600">繳交過成果：</span>
                                                {member.has_submitted}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 學習動機 */}
                {application.motivation && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習動機</h3>
                        <p className="text-gray-800 whitespace-pre-wrap">{application.motivation}</p>
                    </div>
                )}

                {/* 學習類別 */}
                {application.learning_categories && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習類別</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(application.learning_categories)
                                .filter(([_, selected]) => selected)
                                .map(([category, _]) => (
                                    <span
                                        key={category}
                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                    >
                                        {category}
                                    </span>
                                ))}
                            {application.learning_category_other && (
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    其他：{application.learning_category_other}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 學習方法(參考資料) */}
                {application.references && application.references.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習方法(參考資料)</h3>
                        <div className="space-y-3">
                            {application.references.map((ref, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <div className="font-semibold text-gray-700 mb-2">參考資料 {index + 1}</div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">書名：</span>
                                            <span className="text-gray-800">{ref.book_title}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">作者：</span>
                                            <span className="text-gray-800">{ref.author}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">出版社：</span>
                                            <span className="text-gray-800">{ref.publisher}</span>
                                        </div>
                                        {ref.link && (
                                            <div>
                                                <span className="text-gray-600 font-medium">連結：</span>
                                                <a
                                                    href={ref.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline break-all"
                                                >
                                                    {ref.link}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 預期成效 */}
                {application.expected_outcome && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">預期成效</h3>
                        <p className="text-gray-800 whitespace-pre-wrap bg-green-50 p-3 rounded">
                            {application.expected_outcome}
                        </p>
                    </div>
                )}

                {/* 學習裝置需求 */}
                {application.equipment_needs && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習裝置需求</h3>
                        <p className="text-gray-800 whitespace-pre-wrap bg-orange-50 p-3 rounded">
                            {application.equipment_needs}
                        </p>
                    </div>
                )}

                {/* 學習環境需求 */}
                {application.env_needs && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習環境需求</h3>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(application.env_needs)
                                .filter(([_, selected]) => selected)
                                .map(([env, _]) => (
                                    <span
                                        key={env}
                                        className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                                    >
                                        {env}
                                    </span>
                                ))}
                            {application.env_other && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                    其他：{application.env_other}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* 學習內容規劃 */}
                {application.plan_items && application.plan_items.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">學習內容規劃</h3>
                        <div className="space-y-3">
                            {application.plan_items.map((item, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                    <div className="font-semibold text-gray-700 mb-2">項次 {index + 1}</div>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 font-medium">日期：</span>
                                            {item.date}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 font-medium">時數：</span>
                                            {item.hours} 小時
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600 font-medium">學習內容：</span>
                                            <p className="mt-1">{item.content}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <span className="text-gray-600 font-medium">檢核指標：</span>
                                            <p className="mt-1">{item.metric}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 text-right font-semibold text-gray-700">
                            總時數：
                            {application.plan_items.reduce((sum, item) => sum + (Number(item.hours) || 0), 0)} 小時
                        </div>
                    </div>
                )}

                {/* 階段中(4周後)預計達成目標 */}
                {application.midterm_goal && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">階段中(4周後)預計達成目標</h3>
                        <p className="text-gray-800 whitespace-pre-wrap bg-blue-50 p-3 rounded">
                            {application.midterm_goal}
                        </p>
                    </div>
                )}

                {/* 階段末(8周後)預計達成目標 */}
                {application.final_goal && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">階段末(8周後)預計達成目標</h3>
                        <p className="text-gray-800 whitespace-pre-wrap bg-indigo-50 p-3 rounded">
                            {application.final_goal}
                        </p>
                    </div>
                )}

                {/* 成果發表形式 */}
                {(application.presentation_formats || application.presentation_other) && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">成果發表形式</h3>
                        <div>
                            {application.presentation_formats && Object.entries(application.presentation_formats).map(([key, value]) =>
                                value && (
                                    <div key={key} className="mb-1">
                                        <span className="text-gray-800">✓ {key}</span>
                                    </div>
                                )
                            )}
                            {application.presentation_other && (
                                <div className="mt-2">
                                    <span className="text-gray-600">其他說明：</span>
                                    <span className="text-gray-800">{application.presentation_other}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* 手機使用規範 */}
                {application.phone_agreement && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">手機使用規範</h3>
                        <p className="text-gray-800">
                            <span className={`px-3 py-1 rounded ${
                                application.phone_agreement === '同意'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                            }`}>
                                {application.phone_agreement}
                            </span>
                        </p>
                    </div>
                )}

                {/* 簽章 */}
                {application.signatures && application.signatures.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">簽章</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {application.signatures.map((sig, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                                    <div className="font-semibold text-gray-700 mb-2">{sig.type}</div>
                                    {sig.image_url ? (
                                        <img
                                            src={sig.image_url}
                                            alt={sig.type}
                                            className="border rounded-md max-h-32 w-full object-contain bg-white"
                                        />
                                    ) : (
                                        <div className="text-gray-400 text-sm text-center py-4">未簽章</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 教師評語 */}
                {application.comment && (
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-3 border-b pb-2">教師評語</h3>
                        <p className="text-gray-800 whitespace-pre-wrap bg-yellow-50 p-3 rounded">
                            {application.comment}
                        </p>
                    </div>
                )}

                <div className="flex justify-end mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        關閉
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailModal;
