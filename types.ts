export enum Page {
    Login = 'login',
    Form = 'form',
    History = 'history',
}

export enum UserRole {
    Student = 'student',
    Teacher = 'teacher',
}

export enum ApplicationStatus {
    Passed = '通過',
    NotPassed = '未通過',
    Pending = '審核中',
}

export interface User {
    id: string;
    username: string;
    role: UserRole;
    student_id?: string;
    student_name?: string;
    class_name?: string;
    seat_number?: number;
    teacher_name?: string;
}

export interface Member {
    student_id: string;
    student_class: string;
    student_seat: string;
    student_name?: string;
    has_submitted?: string;
}

export interface PlanItem {
    date: string;
    content: string;
    hours: string;
    metric: string;
}

export interface Reference {
    book_title: string;
    author: string;
    publisher: string;
    link?: string;
}

export interface Signature {
    type: string;
    image_url?: string;
}

export interface Application {
    id: string;  // MongoDB ObjectId 是字串，不是數字
    title: string;
    applyDateStart: string;
    applyDateEnd: string;
    status: ApplicationStatus;
    comment: string;
    // 完整欄位
    members?: Member[];
    motivation?: string;
    learning_categories?: Record<string, boolean>;
    learning_category_other?: string;
    // 新增：學習方法(參考資料)
    references?: Reference[];
    // 新增：預期成效
    expected_outcome?: string;
    // 新增：學習裝置需求
    equipment_needs?: string;
    env_needs?: Record<string, boolean>;
    env_other?: string;
    plan_items?: PlanItem[];
    // 新增：階段中(4周後)預計達成目標
    midterm_goal?: string;
    // 新增：階段末(8周後)預計達成目標
    final_goal?: string;
    presentation_formats?: Record<string, boolean>;
    presentation_other?: string;
    phone_agreement?: string;
    signatures?: Signature[];
    submitter_id?: string;
    submitter_student_id?: string;
    created_at?: string;
    updated_at?: string;
}
