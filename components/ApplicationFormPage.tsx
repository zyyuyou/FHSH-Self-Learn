import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import SignaturePad from './SignaturePad';
import api from '../services/api';

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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-4">
            {title}
        </h2>
        {children}
    </div>
);

const InputField: React.FC<{
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    max?: string;
    error?: string;
    disabled?: boolean;
}> = ({ label, id, error, disabled, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <input
            id={id}
            {...props}
            disabled={disabled}
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                error ? 'border-red-500' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const TextAreaField: React.FC<{
    label: string;
    id: string;
    rows?: number;
    placeholder?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    error?: string;
}> = ({ label, id, rows = 3, error, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
        </label>
        <textarea
            id={id}
            rows={rows}
            {...props}
            className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const RadioGroup: React.FC<{
    legend: string;
    name: string;
    options: string[];
    selectedValue: string | null;
    onChange: (value: string) => void;
}> = ({ legend, name, options, selectedValue, onChange }) => (
    <fieldset className="mb-4">
        <legend className="block text-sm font-medium text-gray-700 mb-2">{legend}</legend>
        <div className="flex items-center space-x-4">
            {options.map((option) => (
                <div key={option} className="flex items-center">
                    <input
                        id={`${name}-${option}`}
                        name={name}
                        type="radio"
                        value={option}
                        checked={selectedValue === option}
                        onChange={(e) => onChange(e.target.value)}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label
                        htmlFor={`${name}-${option}`}
                        className="ml-2 block text-sm text-gray-900"
                    >
                        {option}
                    </label>
                </div>
            ))}
        </div>
    </fieldset>
);

const StudentInfo: React.FC<{
    title: string;
    memberIndex: number;
    memberData: Member;
    onChange: (index: number, field: keyof Member, value: string) => void;
    onStudentIdBlur: (index: number, studentId: string) => void;
}> = ({ title, memberIndex, memberData, onChange, onStudentIdBlur }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
                label="學號"
                id={`s-id-${memberIndex}`}
                value={memberData.studentId}
                onChange={(e) => onChange(memberIndex, 'studentId', e.target.value)}
                onBlur={(e) => onStudentIdBlur(memberIndex, e.target.value)}
            />
            <InputField
                label="姓名"
                id={`s-name-${memberIndex}`}
                value={memberData.studentName}
                onChange={(e) => {}}
                disabled
            />
            <InputField
                label="班級"
                id={`s-class-${memberIndex}`}
                value={memberData.studentClass}
                onChange={(e) => {}}
                disabled
            />
            <InputField
                label="座號"
                id={`s-seat-${memberIndex}`}
                value={memberData.studentSeat}
                onChange={(e) => {}}
                disabled
            />
        </div>
        <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">是否繳交過自主學習成果</p>
            <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={memberData.hasSubmitted === '是'}
                        onChange={() => onChange(memberIndex, 'hasSubmitted', memberData.hasSubmitted === '是' ? '' : '是')}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">是</span>
                </label>
                <label className="flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={memberData.hasSubmitted === '否'}
                        onChange={() => onChange(memberIndex, 'hasSubmitted', memberData.hasSubmitted === '否' ? '' : '否')}
                        className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">否</span>
                </label>
            </div>
        </div>
    </div>
);

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
    const [learningCategoriesChecked, setLearningCategoriesChecked] = useState<
        Record<string, boolean>
    >({});
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
        '組長簽名': null,
        '組長父母或監護人簽名': null,
        '組員1簽名': null,
        '組員1父母或監護人簽名': null,
        '組員2簽名': null,
        '組員2父母或監護人簽名': null,
        '指導教師簽章': null,
        '導師簽章': null,
        '空間裝置管理人簽章': null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const handleMemberChange = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const handleStudentIdBlur = async (index: number, studentId: string) => {
        if (!studentId.trim()) return;

        try {
            const response = await fetch(`http://localhost:8000/students/${studentId}`);
            if (response.ok) {
                const studentData = await response.json();
                const newMembers = [...members];
                newMembers[index] = {
                    ...newMembers[index],
                    studentId: studentId,
                    studentClass: studentData.class_name || '',
                    studentSeat: String(studentData.seat_number || ''),
                    studentName: studentData.name || '',
                };
                setMembers(newMembers);
            } else {
                // 如果找不到學生，清空其他欄位
                const newMembers = [...members];
                newMembers[index] = {
                    ...newMembers[index],
                    studentClass: '',
                    studentSeat: '',
                    studentName: '',
                };
                setMembers(newMembers);
                alert('找不到該學號的學生資料');
            }
        } catch (error) {
            console.error('查詢學生資料失敗:', error);
            alert('查詢學生資料失敗，請稍後再試');
        }
    };

    const handleLearningCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLearningCategoriesChecked((prev) => ({ ...prev, [name]: checked }));
    };

    const handleEnvNeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setEnvNeedsChecked((prev) => ({ ...prev, [name]: checked }));
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

    useEffect(() => {
        if (applicationToEdit) {
            setProjectTitle(applicationToEdit.title);
            // Here you would populate the rest of the form fields from applicationToEdit
        } else {
            // Clear fields for a new form
            setProjectTitle('');
            setMembers(
                Array(3)
                    .fill(null)
                    .map(() => ({
                        studentId: '',
                        studentClass: '',
                        studentSeat: '',
                        hasSubmitted: null,
                    }))
            );
            setMotivation('');
            setLearningCategoriesChecked({});
            setLearningCategoryOther('');
            setReferences([{ id: Date.now(), bookTitle: '', author: '', publisher: '', link: '' }]);
            setExpectedOutcome('');
            setEquipmentNeeds('');
            setEnvNeedsChecked({});
            setEnvOther('');
            setPlanItems(
                Array.from({ length: 9 }, (_, index) => ({
                    id: Date.now() + index,
                    date: '',
                    content: '',
                    hours: '',
                    metric: '',
                }))
            );
            setMidtermGoal('');
            setFinalGoal('');
            setPresentationFormats({});
            setPresentationOther('');
            setSignatures({
                '組長簽名': null,
                '組長父母或監護人簽名': null,
                '組員1簽名': null,
                '組員1父母或監護人簽名': null,
                '組員2簽名': null,
                '組員2父母或監護人簽名': null,
                '指導教師簽章': null,
                '導師簽章': null,
                '空間裝置管理人簽章': null,
            });
        }
    }, [applicationToEdit]);

    const addPlanItem = () => {
        if (planItems.length >= 9) {
            alert('學習內容規劃最多隻能新增9個項次');
            return;
        }
        setPlanItems([
            ...planItems,
            { id: Date.now(), date: '', content: '', hours: '', metric: '' },
        ]);
    };

    const removePlanItem = (id: number) => {
        setPlanItems(planItems.filter((item) => item.id !== id));
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

        // 驗證參考資料
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
            // 準備提交資料 - 轉換為後端期望的格式
            const currentDate = new Date().toISOString().split('T')[0]; // 當前日期
            const applicationData = {
                title: projectTitle,
                apply_date_start: currentDate, // 申請日期
                apply_date_end: currentDate, // 申請日期（相容後端欄位）
                members: members
                    .filter((m) => m.studentId || m.studentClass || m.studentSeat) // 只提交有資料的成員
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

            // 呼叫 API 建立申請表
            await api.createApplication(applicationData);

            setSubmitSuccess(true);
            alert('計畫已成功送出！請到歷史紀錄檢視');

            // 呼叫成功回撥，導航到歷史記錄頁面
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

    return (
        <form onSubmit={(e) => e.preventDefault()}>
            <Section title="自主學習計畫名稱">
                <InputField
                    label=""
                    id="project-title"
                    placeholder="請輸入計畫名稱"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    error={errors.projectTitle}
                />
            </Section>

            <Section title="學生資料 (小組至多3人,可共用1份)">
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
            </Section>

            <Section title="學習動機">
                <TextAreaField
                    label=""
                    id="motivation"
                    value={motivation}
                    onChange={(e) => setMotivation(e.target.value)}
                    placeholder="請描述您的學習動機..."
                    error={errors.motivation}
                />
            </Section>

            <Section title="學習類別">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {learningCategories.map((cat) => (
                        <div key={cat} className="flex items-center">
                            <input
                                id={cat}
                                name={cat}
                                type="checkbox"
                                checked={!!learningCategoriesChecked[cat]}
                                onChange={handleLearningCategoryChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor={cat} className="ml-2 block text-sm text-gray-900">
                                {cat}
                            </label>
                        </div>
                    ))}
                </div>
                <InputField
                    label="其他"
                    id="category-other"
                    placeholder="請說明"
                    value={learningCategoryOther}
                    onChange={(e) => setLearningCategoryOther(e.target.value)}
                />
                {errors.learningCategory && (
                    <p className="mt-2 text-sm text-red-600">{errors.learningCategory}</p>
                )}
            </Section>

            <Section title="學習方法(參考資料)">
                {references.map((ref, index) => (
                    <div key={ref.id} className="relative border rounded-lg p-4 mb-4 pr-12">
                        <h4 className="font-semibold text-gray-600 mb-2">參考資料 {index + 1}</h4>
                        <InputField
                            label="書名"
                            id={`ref-title-${ref.id}`}
                            value={ref.bookTitle}
                            onChange={(e) => handleReferenceChange(ref.id, 'bookTitle', e.target.value)}
                            placeholder="請輸入書名"
                            required
                        />
                        <InputField
                            label="作者"
                            id={`ref-author-${ref.id}`}
                            value={ref.author}
                            onChange={(e) => handleReferenceChange(ref.id, 'author', e.target.value)}
                            placeholder="請輸入作者"
                            required
                        />
                        <InputField
                            label="出版社"
                            id={`ref-publisher-${ref.id}`}
                            value={ref.publisher}
                            onChange={(e) => handleReferenceChange(ref.id, 'publisher', e.target.value)}
                            placeholder="請輸入出版社"
                            required
                        />
                        <InputField
                            label="連結（電子書籍或電子期刊請加放連結）"
                            id={`ref-link-${ref.id}`}
                            value={ref.link}
                            onChange={(e) => handleReferenceChange(ref.id, 'link', e.target.value)}
                            placeholder="https://..."
                        />
                        {references.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeReference(ref.id)}
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-2xl font-bold leading-none"
                            >
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addReference}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    + 新增參考資料
                </button>
                {errors.references && (
                    <p className="mt-2 text-sm text-red-600">{errors.references}</p>
                )}
            </Section>

            <Section title="預期成效">
                <TextAreaField
                    label="寫下本階段自主學習你預計達到什麼成果"
                    id="expected-outcome"
                    value={expectedOutcome}
                    onChange={(e) => setExpectedOutcome(e.target.value)}
                    placeholder="請描述您的預期成效..."
                    rows={4}
                    error={errors.expectedOutcome}
                />
            </Section>

            <Section title="學習裝置需求">
                <TextAreaField
                    label=""
                    id="equipment-needs"
                    value={equipmentNeeds}
                    onChange={(e) => setEquipmentNeeds(e.target.value)}
                    placeholder="請說明需要的學習裝置..."
                    rows={3}
                    error={errors.equipmentNeeds}
                />
            </Section>

            <Section title="學習環境需求">
                <h4 className="font-medium text-gray-600 mb-2">A. 圖書館場地</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {envNeeds.map((env) => (
                        <div key={env} className="flex items-center">
                            <input
                                id={env}
                                name={env}
                                type="checkbox"
                                checked={!!envNeedsChecked[env]}
                                onChange={handleEnvNeedChange}
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor={env} className="ml-2 block text-sm text-gray-900">
                                {env}
                            </label>
                        </div>
                    ))}
                </div>
                <InputField
                    label="B. 其他場地"
                    id="env-other"
                    placeholder="須徵得該場地管理者同意並簽名"
                    value={envOther}
                    onChange={(e) => setEnvOther(e.target.value)}
                />
                {errors.envNeeds && <p className="mt-2 text-sm text-red-600">{errors.envNeeds}</p>}
            </Section>

            <Section title="學習內容規劃 (至少需18小時)">
                <div className="max-h-[26rem] overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {planItems.map((item, index) => (
                        <div key={item.id} className="relative border border-gray-300 bg-white rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-gray-600 mb-2">項次 {index + 1}</h4>
                            <InputField
                                label="日期"
                                id={`plan-date-${item.id}`}
                                type="date"
                                value={item.date}
                                onChange={(e) => handlePlanItemChange(item.id, 'date', e.target.value)}
                                max="9999-12-31"
                            />
                            <TextAreaField
                                label="學習內容"
                                id={`plan-content-${item.id}`}
                                rows={2}
                                value={item.content}
                                onChange={(e) =>
                                    handlePlanItemChange(item.id, 'content', e.target.value)
                                }
                                placeholder="請描述學習內容"
                            />
                            <InputField
                                label="時數"
                                id={`plan-hours-${item.id}`}
                                type="number"
                                value={item.hours}
                                onChange={(e) => handlePlanItemChange(item.id, 'hours', e.target.value)}
                                placeholder="例如: 2"
                            />
                            <InputField
                                label="學生自訂檢核指標"
                                id={`plan-metric-${item.id}`}
                                value={item.metric}
                                onChange={(e) =>
                                    handlePlanItemChange(item.id, 'metric', e.target.value)
                                }
                                placeholder="例如: 完成第一章節練習"
                            />
                        </div>
                    ))}
                </div>
                {errors.planItems && (
                    <p className="mt-2 text-sm text-red-600">{errors.planItems}</p>
                )}
                {errors.planHours && (
                    <p className="mt-2 text-sm text-red-600">{errors.planHours}</p>
                )}
            </Section>

            <Section title="階段中(4周後)預計達成目標">
                <TextAreaField
                    label="從質和量兩方面寫下想達到之目標"
                    id="midterm-goal"
                    value={midtermGoal}
                    onChange={(e) => setMidtermGoal(e.target.value)}
                    placeholder="例如：質：能夠理解並說明...的原理；量：完成...頁PPT或...字書面報告"
                    rows={4}
                    error={errors.midtermGoal}
                />
            </Section>

            <Section title="階段末(8周後)預計達成目標">
                <TextAreaField
                    label="從質和量兩方面寫下想達到之目標"
                    id="final-goal"
                    value={finalGoal}
                    onChange={(e) => setFinalGoal(e.target.value)}
                    placeholder="例如：質：能夠獨立完成...；量：完成...頁PPT或...字書面報告，含...字心得(必填)"
                    rows={4}
                    error={errors.finalGoal}
                />
            </Section>

            <Section title="成果發表形式">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {['靜態展', '動態展'].map((format) => (
                        <div key={format} className="flex items-center">
                            <input
                                id={format}
                                name={format}
                                type="checkbox"
                                checked={!!presentationFormats[format]}
                                onChange={(e) =>
                                    setPresentationFormats((prev) => ({
                                        ...prev,
                                        [format]: e.target.checked,
                                    }))
                                }
                                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                            />
                            <label htmlFor={format} className="ml-2 block text-sm text-gray-900">
                                {format === '靜態展' ? '靜態展 (PPT、書面報告、心得、自我省思…等)' : '動態展 (直播、影片撥放、實際展示、演出…等)'}
                            </label>
                        </div>
                    ))}
                </div>
                <InputField
                    label="其他"
                    id="presentation-other"
                    placeholder="請說明"
                    value={presentationOther}
                    onChange={(e) => setPresentationOther(e.target.value)}
                />
                {errors.presentationFormat && (
                    <p className="mt-2 text-sm text-red-600">{errors.presentationFormat}</p>
                )}
            </Section>

            <Section title="手機使用規範">
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 leading-relaxed">
                        自主學習時間能自我管理規範，並遵守學校之規定，在自主學習時間開始至結束前不使用個人手機。若有需要搜尋網路資料，自行持學生證至圖書館借用平板電腦。
                    </p>
                </div>
                <RadioGroup
                    legend="是否同意以上規範"
                    name="phone-agreement"
                    options={['同意', '不同意']}
                    selectedValue={phoneAgreement}
                    onChange={(value) => setPhoneAgreement(value as '同意' | '不同意')}
                />
                {phoneAgreement === '不同意' && (
                    <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800 font-medium">
                            ⚠️ 勾選不同意者本次申請將改列彈性學習
                        </p>
                    </div>
                )}
                {errors.phoneAgreement && (
                    <p className="mt-2 text-sm text-red-600">{errors.phoneAgreement}</p>
                )}
            </Section>

            <Section title="簽章">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        '組長簽名',
                        '組長父母或監護人簽名',
                        '組員1簽名',
                        '組員1父母或監護人簽名',
                        '組員2簽名',
                        '組員2父母或監護人簽名',
                        '指導教師簽章',
                        '導師簽章',
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
            </Section>

            {submitError && (
                <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                    <p className="font-bold">提交失敗</p>
                    <p>{submitError}</p>
                </div>
            )}

            {submitSuccess && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                    <p className="font-bold">提交成功！</p>
                    <p>正在跳轉到歷史紀錄...</p>
                </div>
            )}

            <div className="mt-8">
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isSubmitting ? '提交中...' : '完成並儲存'}
                </button>
            </div>
        </form>
    );
};

export default ApplicationFormPage;
