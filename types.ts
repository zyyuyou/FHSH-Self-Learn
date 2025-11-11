export enum Page {
    Login = 'login',
    Form = 'form',
    History = 'history',
    Home = 'home',
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

export interface Application {
    id: number;
    title: string;
    applyDateStart: string;
    applyDateEnd: string;
    status: ApplicationStatus;
    comment: string;
}