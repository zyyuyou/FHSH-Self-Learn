import React, { useState, useEffect } from 'react';
import { Application } from '../types';
import SignaturePad from './SignaturePad';

interface ApplicationFormPageProps {
    applicationToEdit: Application | null;
}

interface Member {
    studentId: string;
    studentClass: string;
    studentSeat: string;
    hasSubmitted: '是' | '否' | null;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-800 border-b-2 border-blue-200 pb-2 mb-4">{title}</h2>
        {children}
    </div>
);

const InputField: React.FC<{ label: string; id: string; type?: string; placeholder?: string; required?: boolean; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; max?: string; error?: string; }> = ({ label, id, error, ...props }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`} />
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
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <textarea id={id} rows={rows} {...props} className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`} />
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
            {options.map(option => (
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
                    <label htmlFor={`${name}-${option}`} className="ml-2 block text-sm text-gray-900">{option}</label>
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
}> = ({ title, memberIndex, memberData, onChange }) => (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField label="學號" id={`s-id-${memberIndex}`} value={memberData.studentId} onChange={(e) => onChange(memberIndex, 'studentId', e.target.value)} />
            <InputField label="班級" id={`s-class-${memberIndex}`} value={memberData.studentClass} onChange={(e) => onChange(memberIndex, 'studentClass', e.target.value)} />
            <InputField label="座號" id={`s-seat-${memberIndex}`} value={memberData.studentSeat} onChange={(e) => onChange(memberIndex, 'studentSeat', e.target.value)} />
        </div>
        <RadioGroup
            legend="是否繳交過自主學習成果"
            name={`s-submitted-${memberIndex}`}
            options={['是', '否']}
            selectedValue={memberData.hasSubmitted}
            onChange={(value) => onChange(memberIndex, 'hasSubmitted', value as '是' | '否')}
        />
    </div>
);


interface PlanItem {
    id: number;
    date: string;
    content: string;
    hours: string;
    metric: string;
}

const ApplicationFormPage: React.FC<ApplicationFormPageProps> = ({ applicationToEdit }) => {
    const [projectTitle, setProjectTitle] = useState('');
    const [members, setMembers] = useState<Member[]>(() =>
        Array(3).fill(null).map(() => ({
            studentId: '',
            studentClass: '',
            studentSeat: '',
            hasSubmitted: null,
        }))
    );
    const [motivation, setMotivation] = useState('');
    const [learningCategoriesChecked, setLearningCategoriesChecked] = useState<Record<string, boolean>>({});
    const [learningCategoryOther, setLearningCategoryOther] = useState('');
    const [envNeedsChecked, setEnvNeedsChecked] = useState<Record<string, boolean>>({});
    const [envOther, setEnvOther] = useState('');
    const [planItems, setPlanItems] = useState<PlanItem[]>([{ id: Date.now(), date: '', content: '', hours: '', metric: '' }]);
    const [presentationFormat, setPresentationFormat] = useState<string | null>(null);
    const [presentationOther, setPresentationOther] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleMemberChange = (index: number, field: keyof Member, value: string) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);
    };

    const handleLearningCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setLearningCategoriesChecked(prev => ({ ...prev, [name]: checked }));
    };

    const handleEnvNeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setEnvNeedsChecked(prev => ({ ...prev, [name]: checked }));
    };

    const handlePlanItemChange = (id: number, field: keyof Omit<PlanItem, 'id'>, value: string) => {
        setPlanItems(planItems.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    useEffect(() => {
        if (applicationToEdit) {
            setProjectTitle(applicationToEdit.title);
            // Here you would populate the rest of the form fields from applicationToEdit
        } else {
            // Clear fields for a new form
            setProjectTitle('');
            setMembers(Array(3).fill(null).map(() => ({
                studentId: '',
                studentClass: '',
                studentSeat: '',
                hasSubmitted: null,
            })));
            setMotivation('');
            setLearningCategoriesChecked({});
            setLearningCategoryOther('');
            setEnvNeedsChecked({});
            setEnvOther('');
            setPlanItems([{ id: Date.now(), date: '', content: '', hours: '', metric: '' }]);
            setPresentationFormat(null);
            setPresentationOther('');
        }
    }, [applicationToEdit]);

    const addPlanItem = () => {
        setPlanItems([...planItems, { id: Date.now(), date: '', content: '', hours: '', metric: '' }]);
    };

    const removePlanItem = (id: number) => {
        setPlanItems(planItems.filter(item => item.id !== id));
    };

    const learningCategories = ["閱讀計畫", "專題研究", "技藝學習", "實作體驗", "志工服務", "藝文創作", "競賽準備", "課程延伸"];
    const envNeeds = ["自習室", "數位閱讀室", "雲端教室", "美力教室"];

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!projectTitle.trim()) {
            newErrors.projectTitle = '請輸入計畫名稱';
        }

        if (!motivation.trim()) {
            newErrors.motivation = '請描述您的學習動機';
        }

        const isLearningCategorySelected = Object.values(learningCategoriesChecked).some(v => v) || learningCategoryOther.trim() !== '';
        if (!isLearningCategorySelected) {
            newErrors.learningCategory = '請至少選擇一個學習類別';
        }

        const isEnvNeedSelected = Object.values(envNeedsChecked).some(v => v) || envOther.trim() !== '';
        if (!isEnvNeedSelected) {
            newErrors.envNeeds = '請至少選擇一個學習環境需求';
        }
        
        let totalHours = 0;
        let hasIncompletePlanItem = false;
        planItems.forEach(item => {
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

        if (!presentationFormat && !presentationOther.trim()) {
            newErrors.presentationFormat = '請選擇或說明成果發表形式';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            alert('計畫已成功送出！');
            // Handle successful submission
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Section title="自主學習計畫名稱">
                <InputField label="" id="project-title" placeholder="請輸入計畫名稱" value={projectTitle} onChange={e => setProjectTitle(e.target.value)} error={errors.projectTitle} />
            </Section>

            <Section title="學生資料 (小組至多3人,可共用1份)">
                <StudentInfo title="組長" memberIndex={0} memberData={members[0]} onChange={handleMemberChange} />
                <StudentInfo title="組員 1" memberIndex={1} memberData={members[1]} onChange={handleMemberChange} />
                <StudentInfo title="組員 2" memberIndex={2} memberData={members[2]} onChange={handleMemberChange} />
            </Section>

            <Section title="學習動機">
                <TextAreaField label="" id="motivation" value={motivation} onChange={e => setMotivation(e.target.value)} placeholder="請描述您的學習動機..." error={errors.motivation}/>
            </Section>
            
            <Section title="學習類別">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {learningCategories.map(cat => (
                         <div key={cat} className="flex items-center">
                            <input id={cat} name={cat} type="checkbox" checked={!!learningCategoriesChecked[cat]} onChange={handleLearningCategoryChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <label htmlFor={cat} className="ml-2 block text-sm text-gray-900">{cat}</label>
                        </div>
                    ))}
                </div>
                 <InputField label="其他" id="category-other" placeholder="請說明" value={learningCategoryOther} onChange={e => setLearningCategoryOther(e.target.value)} />
                 {errors.learningCategory && <p className="mt-2 text-sm text-red-600">{errors.learningCategory}</p>}
            </Section>
            
            <Section title="學習環境需求">
                <h4 className="font-medium text-gray-600 mb-2">A. 圖書館場地</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                   {envNeeds.map(env => (
                         <div key={env} className="flex items-center">
                            <input id={env} name={env} type="checkbox" checked={!!envNeedsChecked[env]} onChange={handleEnvNeedChange} className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded" />
                            <label htmlFor={env} className="ml-2 block text-sm text-gray-900">{env}</label>
                        </div>
                    ))}
                </div>
                <InputField label="B. 其他場地" id="env-other" placeholder="須徵得該場地管理者同意並簽名" value={envOther} onChange={e => setEnvOther(e.target.value)} />
                {errors.envNeeds && <p className="mt-2 text-sm text-red-600">{errors.envNeeds}</p>}
            </Section>

            <Section title="學習內容規劃 (至少需18小時)">
                {planItems.map((item, index) => (
                    <div key={item.id} className="relative border rounded-lg p-4 mb-4 pr-12">
                         <h4 className="font-semibold text-gray-600 mb-2">項次 {index + 1}</h4>
                        <InputField label="日期" id={`plan-date-${item.id}`} type="date" value={item.date} onChange={(e) => handlePlanItemChange(item.id, 'date', e.target.value)} max="9999-12-31"/>
                        <TextAreaField label="學習內容" id={`plan-content-${item.id}`} rows={2} value={item.content} onChange={(e) => handlePlanItemChange(item.id, 'content', e.target.value)} placeholder="請描述學習內容"/>
                        <InputField label="時數" id={`plan-hours-${item.id}`} type="number" value={item.hours} onChange={(e) => handlePlanItemChange(item.id, 'hours', e.target.value)} placeholder="例如: 2"/>
                        <InputField label="學生自訂檢核指標" id={`plan-metric-${item.id}`} value={item.metric} onChange={(e) => handlePlanItemChange(item.id, 'metric', e.target.value)} placeholder="例如: 完成第一章節練習"/>
                        {planItems.length > 1 && (
                             <button type="button" onClick={() => removePlanItem(item.id)} className="absolute top-3 right-3 text-red-500 hover:text-red-700 text-2xl font-bold leading-none">
                                &times;
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" onClick={addPlanItem} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">+ 新增項次</button>
                {errors.planItems && <p className="mt-2 text-sm text-red-600">{errors.planItems}</p>}
                {errors.planHours && <p className="mt-2 text-sm text-red-600">{errors.planHours}</p>}
            </Section>

            <Section title="成果發表形式">
                 <RadioGroup
                    legend="請選擇發表形式"
                    name="presentation-format"
                    options={['靜態展 (PPT、書面報告等)', '動態展 (影片、實際展示等)']}
                    selectedValue={presentationFormat}
                    onChange={setPresentationFormat}
                />
                 <InputField label="其他" id="presentation-other" placeholder="請說明" value={presentationOther} onChange={(e) => setPresentationOther(e.target.value)}/>
                 {errors.presentationFormat && <p className="mt-2 text-sm text-red-600">{errors.presentationFormat}</p>}
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
                        '空間設備管理人簽章'
                    ].map(sig => (
                        <SignaturePad key={sig} label={sig} />
                    ))}
                </div>
            </Section>

            <div className="mt-8">
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-transform transform hover:scale-105">
                    完成並儲存
                </button>
            </div>
        </form>
    );
};

export default ApplicationFormPage;