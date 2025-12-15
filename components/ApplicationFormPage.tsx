import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Application } from '../types';
import SignaturePad from './SignaturePad';
import api from '../services/api';
import {
    GlassCard,
    GlassInput,
    GlassTextarea,
    GlassButton,
    GlassCheckbox,
    GlassRadio,
    GlassSection,
    GlassAlert,
    GlassBadge,
} from './ui/GlassUI';

interface ApplicationFormPageProps {
    applicationToEdit: Application | null;
    onSubmitSuccess?: () => void;
}

interface Member {
    studentId: string;
    studentClass: string;
    studentSeat: string;
    studentName: string;
    hasSubmitted: string;
}

interface PlanItem {
    id: number;
    date: string;
    content: string;
    hours: string;
    metric: string;
}

interface Reference {
    id: number;
    bookTitle: string;
    author: string;
    publisher: string;
    link: string;
}

// Student Info Component with Glass styling
const StudentInfo: React.FC<{
    title: string;
    memberIndex: number;
    memberData: Member;
    onChange: (index: number, field: keyof Member, value: string) => void;
    onStudentIdBlur: (index: number, studentId: string) => void;
}> = ({ title, memberIndex, memberData, onChange, onStudentIdBlur }) => (
    <GlassCard className="p-5 mb-4">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-sm border border-white/10">
                {memberIndex === 0 ? '長' : memberIndex}
            </span>
            {title}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
                label="學號"
                id={`s-id-${memberIndex}`}
                value={memberData.studentId}
                onChange={(e) => onChange(memberIndex, 'studentId', e.target.value)}
                onBlur={(e) => onStudentIdBlur(memberIndex, e.target.value)}
                placeholder="輸入學號後自動帶入資料"
            />
            <GlassInput
                label="姓名"
                id={`s-name-${memberIndex}`}
                value={memberData.studentName}
                onChange={() => {}}
                disabled
                placeholder="自動帶入"
            />
            <GlassInput
                label="班級"
                id={`s-class-${memberIndex}`}
                value={memberData.studentClass}
                onChange={() => {}}
                disabled
                placeholder="自動帶入"
            />
            <GlassInput
                label="座號"
                id={`s-seat-${memberIndex}`}
                value={memberData.studentSeat}
                onChange={() => {}}
                disabled
                placeholder="自動帶入"
            />
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-white/70 mb-3">是否繳交過自主學習成果</p>
            <div className="flex items-center gap-6">
                <GlassCheckbox
                    label="是"
                    checked={memberData.hasSubmitted === '是'}
                    onChange={() => onChange(memberIndex, 'hasSubmitted', memberData.hasSubmitted === '是' ? '' : '是')}
                />
                <GlassCheckbox
                    label="否"
                    checked={memberData.hasSubmitted === '否'}
                    onChange={() => onChange(memberIndex, 'hasSubmitted', memberData.hasSubmitted === '否' ? '' : '否')}
                />
            </div>
        </div>
    </GlassCard>
);

const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ applicationToEdit, onSubmitSuccess }) => {
    const [projectTitle, setProjectTitle] = useState('');
    const [members, setMembers] = useState<Member[]>(() =>
        Array(3)
            .fill(null)
            .map(() => ({
                studentId: '',
                studentClass: '',
                studentSeat: '',
                studentName: '',
                hasSubmitted: '',
            }))
    );
    const [motivation, setMotivation] = useState('');
    const [learningCategoriesChecked, setLearningCategoriesChecked] = useState<Record<string, boolean>>({});
    const [learningCategoryOther, setLearningCategoryOther] = useState('');
    const [references, setReferences] = useState<Reference[]>([
        { id: Date.now(), bookTitle: '', author: '', publisher: '', link: '' },
    ]);
    const [expectedOutcome, setExpectedOutcome] = useState('');
    const [equipmentNeeds, setEquipmentNeeds] = useState('');
    const [envNeedsChecked, setEnvNeedsChecked] = useState<Record<string, boolean>>({});
    const [envOther, setEnvOther] = useState('');
    const [planItems, setPlanItems] = useState<PlanItem[]>(
        Array.from({ length: 9 }, (_, index) => ({
            id: Date.now() + index,
            date: '',
            content: '',
            hours: '',
            metric: '',
        }))
    );
    const [midtermGoal, setMidtermGoal] = useState('');
    const [finalGoal, setFinalGoal] = useState('');
    const [presentationFormats, setPresentationFormats] = useState<{[key: string]: boolean}>({});
    const [presentationOther, setPresentationOther] = useState('');
    const [phoneAgreement, setPhoneAgreement] = useState<'同意' | '不同意' | null>(null);
    const [signatures, setSignatures] = useState<Record<string, string | null>>({
        '學生 1 簽名': null,
        '學生 2 簽名': null,
        '學生 3 簽名': null,
        '指導教師簽章': null,
        '空間裝置管理人簽章': null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // 草稿相關狀態（改為手動儲存，不再自動儲存）
    const [draftLoaded, setDraftLoaded] = useState(false);
    const [draftSaveStatus, setDraftSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // 編輯模式狀態
    const [editingApplicationId, setEditingApplicationId] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);

    const learningCategories = [
        '閱讀計畫',
        '專題研究',
        '技藝學習',
        '實作體驗',
        '志工服務',
        '藝文創作',
        '競賽準備',
        '課程延伸',
    ];
    const envNeeds = ['自習室', '數位閱讀室', '雲端教室', '美力教室'];

    // 收集當前表單資料
    const collectFormData = useCallback(() => {
        return {
            projectTitle,
            members,
            motivation,
            learningCategoriesChecked,
            learningCategoryOther,
            references,
            expectedOutcome,
            equipmentNeeds,
            envNeedsChecked,
            envOther,
            planItems,
            midtermGoal,
            finalGoal,
            presentationFormats,
            presentationOther,
            phoneAgreement,
            signatures,
        };
    }, [projectTitle, members, motivation, learningCategoriesChecked, learningCategoryOther,
        references, expectedOutcome, equipmentNeeds, envNeedsChecked, envOther, planItems,
        midtermGoal, finalGoal, presentationFormats, presentationOther, phoneAgreement, signatures]);

    // 從資料恢復表單
    const restoreFormData = useCallback((data: any) => {
        if (data.projectTitle !== undefined) setProjectTitle(data.projectTitle);
        if (data.members !== undefined) setMembers(data.members);
        if (data.motivation !== undefined) setMotivation(data.motivation);
        if (data.learningCategoriesChecked !== undefined) setLearningCategoriesChecked(data.learningCategoriesChecked);
        if (data.learningCategoryOther !== undefined) setLearningCategoryOther(data.learningCategoryOther);
        if (data.references !== undefined) setReferences(data.references);
        if (data.expectedOutcome !== undefined) setExpectedOutcome(data.expectedOutcome);
        if (data.equipmentNeeds !== undefined) setEquipmentNeeds(data.equipmentNeeds);
        if (data.envNeedsChecked !== undefined) setEnvNeedsChecked(data.envNeedsChecked);
        if (data.envOther !== undefined) setEnvOther(data.envOther);
        if (data.planItems !== undefined) setPlanItems(data.planItems);
        if (data.midtermGoal !== undefined) setMidtermGoal(data.midtermGoal);
        if (data.finalGoal !== undefined) setFinalGoal(data.finalGoal);
        if (data.presentationFormats !== undefined) setPresentationFormats(data.presentationFormats);
        if (data.presentationOther !== undefined) setPresentationOther(data.presentationOther);
        if (data.phoneAgreement !== undefined) setPhoneAgreement(data.phoneAgreement);
        if (data.signatures !== undefined) setSignatures(data.signatures);
    }, []);

    // 從 Application 物件恢復表單（用於編輯已提交的申請表）
    const restoreFromApplication = useCallback((app: Application) => {
        setProjectTitle(app.title || '');

        // 轉換 members 格式
        const newMembers = Array(3).fill(null).map((_, i) => {
            const member = app.members?.[i];
            return member ? {
                studentId: member.student_id || '',
                studentClass: member.student_class || '',
                studentSeat: member.student_seat || '',
                studentName: member.student_name || '',
                hasSubmitted: member.has_submitted || '',
            } : {
                studentId: '',
                studentClass: '',
                studentSeat: '',
                studentName: '',
                hasSubmitted: '',
            };
        });
        setMembers(newMembers);

        setMotivation(app.motivation || '');
        setLearningCategoriesChecked(app.learning_categories || {});
        setLearningCategoryOther(app.learning_category_other || '');

        // 轉換 references 格式
        const newRefs = (app.references || []).map((ref: any, i: number) => ({
            id: Date.now() + i,
            bookTitle: ref.book_title || '',
            author: ref.author || '',
            publisher: ref.publisher || '',
            link: ref.link || '',
        }));
        setReferences(newRefs.length > 0 ? newRefs : [{ id: Date.now(), bookTitle: '', author: '', publisher: '', link: '' }]);

        setExpectedOutcome(app.expected_outcome || '');
        setEquipmentNeeds(app.equipment_needs || '');
        setEnvNeedsChecked(app.env_needs || {});
        setEnvOther(app.env_other || '');

        // 轉換 plan_items 格式
        const newPlanItems = (app.plan_items || []).map((item: any, i: number) => ({
            id: Date.now() + i,
            date: item.date || '',
            content: item.content || '',
            hours: item.hours || '',
            metric: item.metric || '',
        }));
        // 確保至少有9個項次
        while (newPlanItems.length < 9) {
            newPlanItems.push({
                id: Date.now() + newPlanItems.length,
                date: '',
                content: '',
                hours: '',
                metric: '',
            });
        }
        setPlanItems(newPlanItems);

        setMidtermGoal(app.midterm_goal || '');
        setFinalGoal(app.final_goal || '');
        setPresentationFormats(app.presentation_formats || {});
        setPresentationOther(app.presentation_other || '');
        setPhoneAgreement(app.phone_agreement as '同意' | '不同意' | null);

        // 轉換 signatures 格式
        const newSignatures: Record<string, string | null> = {
            '學生 1 簽名': null,
            '學生 2 簽名': null,
            '學生 3 簽名': null,
            '指導教師簽章': null,
            '空間裝置管理人簽章': null,
        };
        (app.signatures || []).forEach((sig: any) => {
            if (sig.type in newSignatures) {
                newSignatures[sig.type] = sig.image_url || null;
            }
        });
        setSignatures(newSignatures);
    }, []);

    // 手動儲存草稿（只在點擊按鈕時觸發）
    const saveDraftToServer = useCallback(async () => {
        // 如果是編輯模式，不儲存草稿
        if (isEditMode) return;

        try {
            setDraftSaveStatus('saving');
            const formData = collectFormData();
            await api.saveDraft(formData);
            setDraftSaveStatus('saved');
            // 3秒後重設狀態
            setTimeout(() => setDraftSaveStatus('idle'), 3000);
        } catch (error) {
            console.error('儲存草稿失敗:', error);
            setDraftSaveStatus('error');
            setTimeout(() => setDraftSaveStatus('idle'), 3000);
        }
    }, [collectFormData, isEditMode]);

    // 載入草稿
    const loadDraft = useCallback(async () => {
        try {
            const draft = await api.getDraft();
            if (draft && draft.form_data) {
                restoreFormData(draft.form_data);
                setDraftLoaded(true);
            }
        } catch (error: any) {
            // 404 表示沒有草稿，不是錯誤
            if (!error.message?.includes('404') && !error.message?.includes('沒有儲存的草稿')) {
                console.error('載入草稿失敗:', error);
            }
        }
    }, [restoreFormData]);

    // 重置表單
    const resetForm = useCallback(() => {
        setProjectTitle('');
        setMembers(Array(3).fill(null).map(() => ({
            studentId: '',
            studentClass: '',
            studentSeat: '',
            studentName: '',
            hasSubmitted: '',
        })));
        setMotivation('');
        setLearningCategoriesChecked({});
        setLearningCategoryOther('');
        setReferences([{ id: Date.now(), bookTitle: '', author: '', publisher: '', link: '' }]);
        setExpectedOutcome('');
        setEquipmentNeeds('');
        setEnvNeedsChecked({});
        setEnvOther('');
        setPlanItems(Array.from({ length: 9 }, (_, index) => ({
            id: Date.now() + index,
            date: '',
            content: '',
            hours: '',
            metric: '',
        })));
        setMidtermGoal('');
        setFinalGoal('');
        setPresentationFormats({});
        setPresentationOther('');
        setPhoneAgreement(null);
        setSignatures({
            '學生 1 簽名': null,
            '學生 2 簽名': null,
            '學生 3 簽名': null,
            '指導教師簽章': null,
            '空間裝置管理人簽章': null,
        });
        setErrors({});
        setEditingApplicationId(null);
        setIsEditMode(false);
    }, []);

    // 初始化：載入草稿或編輯的申請表
    useEffect(() => {
        const initForm = async () => {
            if (applicationToEdit) {
                // 編輯已有的申請表
                setIsEditMode(true);
                setEditingApplicationId(applicationToEdit.id);

                // 獲取完整的申請表資料
                try {
                    const fullApp = await api.getApplicationById(applicationToEdit.id);
                    restoreFromApplication(fullApp);
                } catch (error) {
                    console.error('載入申請表失敗:', error);
                    alert('載入申請表失敗，請重試');
                }
            } else {
                // 新建申請表：嘗試載入草稿
                resetForm();
                await loadDraft();
            }
        };

        initForm();
    }, [applicationToEdit, loadDraft, resetForm, restoreFromApplication]);

    // 在新建模式下，標記為草稿已載入（用於顯示儲存按鈕）
    useEffect(() => {
        if (!applicationToEdit) {
            const timer = setTimeout(() => {
                setDraftLoaded(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [applicationToEdit]);

    const handleMemberChange = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const handleStudentIdBlur = async (index: number, studentId: string) => {
        const trimmedStudentId = studentId.trim();
        if (!trimmedStudentId) return;

        try {
            const studentData = await api.getStudentById(trimmedStudentId);
            const newMembers = [...members];
            newMembers[index] = {
                ...newMembers[index],
                studentId: trimmedStudentId,
                studentClass: studentData.class_name || '',
                studentSeat: String(studentData.seat_number || ''),
                studentName: studentData.name || '',
            };
            setMembers(newMembers);
        } catch (error: any) {
            console.error('查詢學生資料失敗:', error);
            const newMembers = [...members];
            newMembers[index] = {
                ...newMembers[index],
                studentClass: '',
                studentSeat: '',
                studentName: '',
            };
            setMembers(newMembers);
            if (error.message?.includes('學生不存在') || error.message?.includes('404')) {
                alert('找不到該學號的學生資料');
            } else {
                alert('查詢學生資料失敗，請稍後再試');
            }
        }
    };

    const handleLearningCategoryChange = (category: string, checked: boolean) => {
        setLearningCategoriesChecked((prev) => ({ ...prev, [category]: checked }));
    };

    const handleEnvNeedChange = (env: string, checked: boolean) => {
        setEnvNeedsChecked((prev) => ({ ...prev, [env]: checked }));
    };

    const handlePlanItemChange = (id: number, field: keyof Omit<PlanItem, 'id'>, value: string) => {
        setPlanItems(
            planItems.map((item) => (item.id === id ? { ...item, [field]: value } : item))
        );
    };

    const handleReferenceChange = (id: number, field: keyof Omit<Reference, 'id'>, value: string) => {
        setReferences(
            references.map((ref) => (ref.id === id ? { ...ref, [field]: value } : ref))
        );
    };

    const addReference = () => {
        setReferences([
            ...references,
            { id: Date.now(), bookTitle: '', author: '', publisher: '', link: '' },
        ]);
    };

    const removeReference = (id: number) => {
        setReferences(references.filter((ref) => ref.id !== id));
    };

    const handleSignatureChange = (label: string, value: string | null) => {
        setSignatures((prev) => ({ ...prev, [label]: value }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!projectTitle.trim()) {
            newErrors.projectTitle = '請輸入計畫名稱';
        }

        if (!motivation.trim()) {
            newErrors.motivation = '請描述您的學習動機';
        }

        const isLearningCategorySelected =
            Object.values(learningCategoriesChecked).some((v) => v) ||
            learningCategoryOther.trim() !== '';
        if (!isLearningCategorySelected) {
            newErrors.learningCategory = '請至少選擇一個學習類別';
        }

        let hasIncompleteReference = false;
        references.forEach((ref) => {
            if (!ref.bookTitle.trim() || !ref.author.trim() || !ref.publisher.trim()) {
                hasIncompleteReference = true;
            }
        });
        if (hasIncompleteReference) {
            newErrors.references = '請完整填寫參考資料的書名、作者、出版社（連結為選填）';
        }

        if (!expectedOutcome.trim()) {
            newErrors.expectedOutcome = '請填寫預期成效';
        }

        if (!equipmentNeeds.trim()) {
            newErrors.equipmentNeeds = '請填寫學習裝置需求';
        }

        const isEnvNeedSelected =
            Object.values(envNeedsChecked).some((v) => v) || envOther.trim() !== '';
        if (!isEnvNeedSelected) {
            newErrors.envNeeds = '請至少選擇一個學習環境需求';
        }

        let totalHours = 0;
        let hasIncompletePlanItem = false;
        planItems.forEach((item) => {
            if (!item.date || !item.content.trim() || !item.hours.trim() || !item.metric.trim()) {
                hasIncompletePlanItem = true;
            }
            totalHours += Number(item.hours) || 0;
        });

        if (hasIncompletePlanItem) {
            newErrors.planItems = '請完整填寫學習內容規劃的每個項次，所有欄位皆為必填';
        }

        if (totalHours < 18) {
            newErrors.planHours = `總時數不足18小時 (目前 ${totalHours} 小時)`;
        }

        if (!midtermGoal.trim()) {
            newErrors.midtermGoal = '請填寫階段中(4周後)預計達成目標';
        }

        if (!finalGoal.trim()) {
            newErrors.finalGoal = '請填寫階段末(8周後)預計達成目標';
        }

        if (!Object.values(presentationFormats).some(v => v) && !presentationOther.trim()) {
            newErrors.presentationFormat = '請至少選擇一個成果發表形式或填寫其他說明';
        }

        if (!phoneAgreement) {
            newErrors.phoneAgreement = '請選擇是否同意手機使用規範';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const currentDate = new Date().toISOString().split('T')[0];
            const applicationData = {
                title: projectTitle,
                apply_date_start: currentDate,
                apply_date_end: currentDate,
                members: members
                    .filter((m) => m.studentId || m.studentClass || m.studentSeat)
                    .map((m) => ({
                        student_id: m.studentId,
                        student_class: m.studentClass,
                        student_seat: m.studentSeat,
                        student_name: m.studentName,
                        has_submitted: m.hasSubmitted || '否',
                    })),
                motivation,
                learning_categories: learningCategoriesChecked,
                learning_category_other: learningCategoryOther,
                references: references.map((ref) => ({
                    book_title: ref.bookTitle,
                    author: ref.author,
                    publisher: ref.publisher,
                    link: ref.link || null,
                })),
                expected_outcome: expectedOutcome,
                equipment_needs: equipmentNeeds,
                env_needs: envNeedsChecked,
                env_other: envOther,
                plan_items: planItems.map((item) => ({
                    date: item.date,
                    content: item.content,
                    hours: item.hours,
                    metric: item.metric,
                })),
                midterm_goal: midtermGoal,
                final_goal: finalGoal,
                presentation_formats: presentationFormats,
                presentation_other: presentationOther,
                phone_agreement: phoneAgreement,
                signatures: Object.entries(signatures)
                    .filter(([_, value]) => value !== null)
                    .map(([type, image_url]) => ({
                        type,
                        image_url,
                    })),
            };

            if (isEditMode && editingApplicationId) {
                // 更新已有的申請表
                await api.updateApplication(editingApplicationId, applicationData);
                setSubmitSuccess(true);
                alert('申請表已更新！狀態已重設為「審核中」，請等待教師審核');
            } else {
                // 建立新申請表
                await api.createApplication(applicationData);
                // 提交成功後刪除草稿
                try {
                    await api.deleteDraft();
                } catch (e) {
                    // 忽略刪除草稿失敗
                }
                setSubmitSuccess(true);
                alert('計畫已成功送出！請到歷史紀錄檢視');
            }

            if (onSubmitSuccess) {
                setTimeout(() => {
                    onSubmitSuccess();
                }, 1000);
            }
        } catch (error) {
            console.error('提交失敗:', error);
            setSubmitError(error instanceof Error ? error.message : '提交失敗，請重試');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 手動儲存當前進度（只有點擊按鈕時才儲存）
    const handleSaveProgress = useCallback(async () => {
        if (isEditMode) {
            alert('編輯模式下無法儲存進度，請直接提交申請表');
            return;
        }
        await saveDraftToServer();
    }, [isEditMode, saveDraftToServer]);

    // Calculate total hours
    const totalHours = planItems.reduce((sum, item) => sum + (Number(item.hours) || 0), 0);

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            {/* 編輯模式提示 */}
            {isEditMode && (
                <GlassAlert variant="warning" className="mb-6">
                    <p className="font-bold">編輯模式</p>
                    <p>您正在編輯已提交的申請表。修改後狀態將重設為「審核中」。</p>
                </GlassAlert>
            )}

            {/* 儲存進度按鈕（只在非編輯模式顯示） */}
            {!isEditMode && (
                <div className="mb-6 flex items-center justify-end gap-3">
                    {/* 儲存狀態提示 */}
                    {draftSaveStatus === 'saving' && (
                        <div className="flex items-center gap-2 text-sm text-white/60">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>正在儲存...</span>
                        </div>
                    )}
                    {draftSaveStatus === 'saved' && (
                        <div className="flex items-center gap-2 text-sm text-green-400">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span>進度已儲存</span>
                        </div>
                    )}
                    {draftSaveStatus === 'error' && (
                        <span className="text-sm text-red-400">儲存失敗，請重試</span>
                    )}

                    {/* 儲存當前進度按鈕 */}
                    <GlassButton
                        variant="default"
                        size="sm"
                        onClick={handleSaveProgress}
                        disabled={draftSaveStatus === 'saving'}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                        </svg>
                        儲存當前進度
                    </GlassButton>
                </div>
            )}

            {/* Project Title */}
            <GlassSection title="自主學習計畫名稱">
                <GlassInput
                    id="project-title"
                    placeholder="請輸入計畫名稱"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    error={errors.projectTitle}
                />
            </GlassSection>

            {/* Student Info */}
            <GlassSection title="學生資料 (小組至多3人,可共用1份)">
                <StudentInfo
                    title="組長"
                    memberIndex={0}
                    memberData={members[0]}
                    onChange={handleMemberChange}
                    onStudentIdBlur={handleStudentIdBlur}
                />
                <StudentInfo
                    title="組員 1"
                    memberIndex={1}
                    memberData={members[1]}
                    onChange={handleMemberChange}
                    onStudentIdBlur={handleStudentIdBlur}
                />
                <StudentInfo
                    title="組員 2"
                    memberIndex={2}
                    memberData={members[2]}
                    onChange={handleMemberChange}
                    onStudentIdBlur={handleStudentIdBlur}
                />
            </GlassSection>

            {/* Motivation */}
            <GlassSection title="學習動機">
                <GlassTextarea
                    id="motivation"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="請描述您的學習動機..."
                    rows={4}
                    error={errors.motivation}
                />
            </GlassSection>

            {/* Learning Categories */}
            <GlassSection title="學習類別">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {learningCategories.map((cat) => (
                        <GlassCheckbox
                            key={cat}
                            label={cat}
                            checked={!!learningCategoriesChecked[cat]}
                            onChange={(checked) => handleLearningCategoryChange(cat, checked)}
                        />
                    ))}
                </div>
                <GlassInput
                    label="其他"
                    id="category-other"
                    placeholder="請說明"
                    value={learningCategoryOther}
                    onChange={(e) => setLearningCategoryOther(e.target.value)}
                />
                {errors.learningCategory && (
                    <p className="mt-2 text-sm text-red-400">{errors.learningCategory}</p>
                )}
            </GlassSection>

            {/* References */}
            <GlassSection title="學習方法(參考資料)">
                {references.map((ref, index) => (
                    <GlassCard key={ref.id} className="p-5 mb-4 relative">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-white/80 flex items-center gap-2">
                                <GlassBadge variant="info">資料 {index + 1}</GlassBadge>
                            </h4>
                            {references.length > 1 && (
                                <GlassButton
                                    variant="danger"
                                    size="icon"
                                    onClick={() => removeReference(ref.id)}
                                    className="!rounded-lg !w-8 !h-8"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </GlassButton>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <GlassInput
                                label="書名"
                                id={`ref-title-${ref.id}`}
                                value={ref.bookTitle}
                                onChange={(e) => handleReferenceChange(ref.id, 'bookTitle', e.target.value)}
                                placeholder="請輸入書名"
                            />
                            <GlassInput
                                label="作者"
                                id={`ref-author-${ref.id}`}
                                value={ref.author}
                                onChange={(e) => handleReferenceChange(ref.id, 'author', e.target.value)}
                                placeholder="請輸入作者"
                            />
                            <GlassInput
                                label="出版社"
                                id={`ref-publisher-${ref.id}`}
                                value={ref.publisher}
                                onChange={(e) => handleReferenceChange(ref.id, 'publisher', e.target.value)}
                                placeholder="請輸入出版社"
                            />
                            <GlassInput
                                label="連結 (選填)"
                                id={`ref-link-${ref.id}`}
                                value={ref.link}
                                onChange={(e) => handleReferenceChange(ref.id, 'link', e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    </GlassCard>
                ))}
                <GlassButton variant="ghost" onClick={addReference} className="mt-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    新增參考資料
                </GlassButton>
                {errors.references && (
                    <p className="mt-2 text-sm text-red-400">{errors.references}</p>
                )}
            </GlassSection>

            {/* Expected Outcome */}
            <GlassSection title="預期成效">
                <GlassTextarea
                    label="寫下本階段自主學習你預計達到什麼成果"
                    id="expected-outcome"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    placeholder="請描述您的預期成效..."
                    rows={4}
                    error={errors.expectedOutcome}
                />
            </GlassSection>

            {/* Equipment Needs */}
            <GlassSection title="學習裝置需求">
                <GlassTextarea
                    id="equipment-needs"
                    value={equipmentNeeds}
                    onChange={(e) => setEquipmentNeeds(e.target.value)}
                    placeholder="請說明需要的學習裝置..."
                    rows={3}
                    error={errors.equipmentNeeds}
                />
            </GlassSection>

            {/* Environment Needs */}
            <GlassSection title="學習環境需求">
                <h4 className="font-medium text-white/70 mb-3">A. 圖書館場地</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {envNeeds.map((env) => (
                        <GlassCheckbox
                            key={env}
                            label={env}
                            checked={!!envNeedsChecked[env]}
                            onChange={(checked) => handleEnvNeedChange(env, checked)}
                        />
                    ))}
                </div>
                <GlassInput
                    label="B. 其他場地"
                    id="env-other"
                    placeholder="須徵得該場地管理者同意並簽名"
                    value={envOther}
                    onChange={(e) => setEnvOther(e.target.value)}
                />
                {errors.envNeeds && <p className="mt-2 text-sm text-red-400">{errors.envNeeds}</p>}
            </GlassSection>

            {/* Learning Plan */}
            <GlassSection title="學習內容規劃 (至少需18小時)">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-white/70">目前總時數：</span>
                    <GlassBadge variant={totalHours >= 18 ? 'success' : 'warning'}>
                        {totalHours} / 18 小時
                    </GlassBadge>
                </div>
                <div className="max-h-[32rem] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                    {planItems.map((item, index) => (
                        <GlassCard key={item.id} className="p-5">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center text-sm font-semibold text-white border border-white/10">
                                    {index + 1}
                                </span>
                                <span className="text-white/70 text-sm">項次 {index + 1}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <GlassInput
                                    label="日期"
                                    id={`plan-date-${item.id}`}
                                    type="date"
                                    value={item.date}
                                    onChange={(e) => handlePlanItemChange(item.id, 'date', e.target.value)}
                                />
                                <GlassInput
                                    label="時數"
                                    id={`plan-hours-${item.id}`}
                                    type="number"
                                    value={item.hours}
                                    onChange={(e) => handlePlanItemChange(item.id, 'hours', e.target.value)}
                                    onWheel={(e) => (e.target as HTMLElement).blur()}
                                    placeholder="例如: 2"
                                />
                            </div>
                            <GlassTextarea
                                label="學習內容"
                                id={`plan-content-${item.id}`}
                                rows={2}
                                value={item.content}
                                onChange={(e) => handlePlanItemChange(item.id, 'content', e.target.value)}
                                placeholder="請描述學習內容"
                            />
                            <GlassInput
                                label="學生自訂檢核指標"
                                id={`plan-metric-${item.id}`}
                                value={item.metric}
                                onChange={(e) => handlePlanItemChange(item.id, 'metric', e.target.value)}
                                placeholder="例如: 完成第一章節練習"
                            />
                        </GlassCard>
                    ))}
                </div>
                {errors.planItems && (
                    <GlassAlert variant="error" className="mt-4">{errors.planItems}</GlassAlert>
                )}
                {errors.planHours && (
                    <GlassAlert variant="warning" className="mt-4">{errors.planHours}</GlassAlert>
                )}
            </GlassSection>

            {/* Midterm Goal */}
            <GlassSection title="階段中(4周後)預計達成目標">
                <GlassTextarea
                    label="從質和量兩方面寫下想達到之目標"
                    id="midterm-goal"
                    value={midtermGoal}
                    onChange={(e) => setMidtermGoal(e.target.value)}
                    placeholder="例如：質：能夠理解並說明...的原理；量：完成...頁PPT或...字書面報告"
                    rows={4}
                    error={errors.midtermGoal}
                />
            </GlassSection>

            {/* Final Goal */}
            <GlassSection title="階段末(8周後)預計達成目標">
                <GlassTextarea
                    label="從質和量兩方面寫下想達到之目標"
                    id="final-goal"
                    value={finalGoal}
                    onChange={(e) => setFinalGoal(e.target.value)}
                    placeholder="例如：質：能夠獨立完成...；量：完成...頁PPT或...字書面報告，含...字心得(必填)"
                    rows={4}
                    error={errors.finalGoal}
                />
            </GlassSection>

            {/* Presentation Format */}
            <GlassSection title="成果發表形式">
                <div className="space-y-4 mb-4">
                    <GlassCheckbox
                        label="靜態展 (PPT、書面報告、心得、自我省思…等)"
                        checked={!!presentationFormats['靜態展']}
                        onChange={(checked) => setPresentationFormats((prev) => ({ ...prev, '靜態展': checked }))}
                    />
                    <GlassCheckbox
                        label="動態展 (直播、影片撥放、實際展示、演出…等)"
                        checked={!!presentationFormats['動態展']}
                        onChange={(checked) => setPresentationFormats((prev) => ({ ...prev, '動態展': checked }))}
                    />
                </div>
                <GlassInput
                    label="其他"
                    id="presentation-other"
                    placeholder="請說明"
                    value={presentationOther}
                    onChange={(e) => setPresentationOther(e.target.value)}
                />
                {errors.presentationFormat && (
                    <p className="mt-2 text-sm text-red-400">{errors.presentationFormat}</p>
                )}
            </GlassSection>

            {/* Phone Agreement */}
            <GlassSection title="手機使用規範">
                <GlassCard className="p-4 mb-4">
                    <p className="text-sm text-white/70 leading-relaxed">
                        自主學習時間能自我管理規範，並遵守學校之規定，在自主學習時間開始至結束前不使用個人手機。若有需要搜尋網路資料，自行持學生證至圖書館借用平板電腦。
                    </p>
                </GlassCard>
                <div className="flex items-center gap-6 mb-4">
                    <GlassRadio
                        label="同意"
                        name="phone-agreement"
                        checked={phoneAgreement === '同意'}
                        onChange={() => setPhoneAgreement('同意')}
                    />
                    <GlassRadio
                        label="不同意"
                        name="phone-agreement"
                        checked={phoneAgreement === '不同意'}
                        onChange={() => setPhoneAgreement('不同意')}
                    />
                </div>
                {phoneAgreement === '不同意' && (
                    <GlassAlert variant="warning">
                        勾選不同意者本次申請將改列彈性學習
                    </GlassAlert>
                )}
                {errors.phoneAgreement && (
                    <p className="mt-2 text-sm text-red-400">{errors.phoneAgreement}</p>
                )}
            </GlassSection>

            {/* Signatures */}
            <GlassSection title="簽章">
                <p className="text-sm text-white/60 mb-4">
                    請所有學生成員簽名，並取得指導教師及空間裝置管理人的簽章
                </p>
                {/* 學生簽名區塊 */}
                <h4 className="text-sm font-medium text-white/80 mb-3">學生簽名</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {[
                        '學生 1 簽名',
                        '學生 2 簽名',
                        '學生 3 簽名',
                    ].map((sig) => (
                        <SignaturePad
                            key={sig}
                            label={sig}
                            value={signatures[sig]}
                            onChange={(value) => handleSignatureChange(sig, value)}
                        />
                    ))}
                </div>
                {/* 教師/管理人簽章區塊 */}
                <h4 className="text-sm font-medium text-white/80 mb-3">教師及管理人簽章</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        '指導教師簽章',
                        '空間裝置管理人簽章',
                    ].map((sig) => (
                        <SignaturePad
                            key={sig}
                            label={sig}
                            value={signatures[sig]}
                            onChange={(value) => handleSignatureChange(sig, value)}
                        />
                    ))}
                </div>
            </GlassSection>

            {/* Submit Section */}
            {submitError && (
                <GlassAlert variant="error" className="mb-6">
                    <p className="font-bold">提交失敗</p>
                    <p>{submitError}</p>
                </GlassAlert>
            )}

            {submitSuccess && (
                <GlassAlert variant="success" className="mb-6">
                    <p className="font-bold">提交成功！</p>
                    <p>正在跳轉到歷史紀錄...</p>
                </GlassAlert>
            )}

            <GlassButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
            >
                {isSubmitting ? '提交中...' : isEditMode ? '更新申請表' : '完成並儲存'}
            </GlassButton>
        </form>
    );
};

export default ApplicationFormPage;
