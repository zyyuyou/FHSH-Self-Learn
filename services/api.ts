/**
 * API 服務模組 - 與 FastAPI 後端通訊
 *
 * 生產環境：透過 Nginx 反向代理訪問後端 (/api -> backend:8000)
 * 開發環境：直接訪問後端 (http://localhost:8000)
 */

// API 基礎配置
// 在 Docker 環境中，使用 /api 字首，由 Nginx 轉發到後端
// 在開發環境中，直接連線到 localhost:8000
const API_BASE_URL = import.meta.env.PROD ? '/api' : 'http://localhost:8000';
const TOKEN_KEY = 'auth_token';

// ==================== 型別定義 ====================

interface LoginRequest {
    username: string;
    password: string;
}

interface LoginResponse {
    access_token: string;
    token_type: string;
    user: {
        id: string;
        username: string;
        role: string;
        student_id?: string;
        student_name?: string;
        class_name?: string;
        seat_number?: number;
        teacher_name?: string;
    };
}

interface RegisterRequest {
    username: string;
    password: string;
    role: 'student' | 'teacher';
    student_id?: string;
    student_name?: string;
    class_name?: string;
    seat_number?: number;
    teacher_name?: string;
}

interface ApiError {
    detail: string;
}

// ==================== Token 管理 ====================

/**
 * 儲存 token 到 localStorage
 */
export const saveToken = (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * 獲取 token 從 localStorage
 */
export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
};

/**
 * 刪除 token 從 localStorage
 */
export const removeToken = (): void => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * 檢查是否已登入
 */
export const isAuthenticated = (): boolean => {
    return getToken() !== null;
};

// ==================== HTTP 請求封裝 ====================

/**
 * 通用的 fetch 封裝，自動新增 token
 */
const fetchAPI = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const token = getToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
    };

    // 如果有 token，新增到請求頭
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    // 如果是 401 錯誤，清除 token 並跳轉到登入頁
    if (response.status === 401) {
        removeToken();
        window.location.href = '/';
        throw new Error('未授權，請重新登入');
    }

    // 檢查響應的 Content-Type
    const contentType = response.headers.get('content-type');

    // 如果不是 JSON，說明後端返回了錯誤頁面
    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        throw new Error(`伺服器錯誤 (${response.status}): 返回了非 JSON 響應`);
    }

    // 解析響應
    const data = await response.json();

    // 如果請求失敗，丟擲錯誤
    if (!response.ok) {
        // 處理422驗證錯誤
        if (response.status === 422 && data.detail) {
            if (Array.isArray(data.detail)) {
                // Pydantic 驗證錯誤格式
                const errorMessages = data.detail.map((err: any) =>
                    `${err.loc.join('.')}: ${err.msg}`
                ).join('\n');
                throw new Error(`資料驗證失敗:\n${errorMessages}`);
            }
        }
        throw new Error((data as ApiError).detail || '請求失敗');
    }

    return data as T;
};

// ==================== 認證 API ====================

/**
 * 使用者登入
 */
export const login = async (username: string, password: string): Promise<LoginResponse> => {
    // 使用 JSON 格式傳送登入請求
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error((data as ApiError).detail || '登入失敗');
    }

    // 儲存 token
    saveToken(data.access_token);

    return data as LoginResponse;
};

/**
 * 使用者註冊
 */
export const register = async (userData: RegisterRequest): Promise<LoginResponse> => {
    return fetchAPI<LoginResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
    });
};

/**
 * 退出登入
 */
export const logout = (): void => {
    removeToken();
    window.location.href = '/';
};

/**
 * 更改密碼
 */
export const changePassword = async (oldPassword: string, newPassword: string): Promise<void> => {
    return fetchAPI('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
            old_password: oldPassword,
            new_password: newPassword,
        }),
    });
};

// ==================== 申請表 API ====================

/**
 * 建立申請表
 */
export const createApplication = async (applicationData: any): Promise<any> => {
    return fetchAPI('/applications/', {
        method: 'POST',
        body: JSON.stringify(applicationData),
    });
};

/**
 * 獲取申請表列表
 */
export const getApplications = async (params?: {
    skip?: number;
    limit?: number;
    status?: string;
}): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);

    const query = queryParams.toString();
    const endpoint = query ? `/applications/?${query}` : '/applications/';

    return fetchAPI(endpoint);
};

/**
 * 獲取申請表詳情
 */
export const getApplicationById = async (id: string): Promise<any> => {
    return fetchAPI(`/applications/${id}`);
};

/**
 * 更新申請表
 */
export const updateApplication = async (id: string, applicationData: any): Promise<any> => {
    return fetchAPI(`/applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify(applicationData),
    });
};

/**
 * 刪除申請表
 */
export const deleteApplication = async (id: string): Promise<void> => {
    return fetchAPI(`/applications/${id}`, {
        method: 'DELETE',
    });
};

/**
 * 稽覈申請表（教師功能）
 */
export const reviewApplication = async (
    id: string,
    reviewData: {
        status: string; // 後端期望中文狀態: "透過", "未透過", "審核中"
        comment?: string;
    }
): Promise<any> => {
    return fetchAPI(`/applications/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify(reviewData),
    });
};

/**
 * 匯出申請表為 PDF
 */
export const exportApplicationPDF = async (id: string): Promise<void> => {
    const token = getToken();
    if (!token) {
        throw new Error('未登入');
    }

    try {
        const response = await fetch(`${API_BASE_URL}/applications/${id}/export-pdf`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || '匯出 PDF 失敗');
        }

        // 獲取檔名（從 Content-Disposition header）
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = '自主學習申請表.pdf';
        if (contentDisposition) {
            const matches = /filename="(.+)"/.exec(contentDisposition);
            if (matches && matches[1]) {
                filename = matches[1];
            }
        }

        // 下載檔案
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    } catch (error: any) {
        throw new Error(error.message || '匯出 PDF 失敗');
    }
};

// ==================== 學生 API ====================

/**
 * 搜尋學生
 */
export const searchStudents = async (params: {
    class_name?: string;
    student_name?: string;
    student_id?: string;
}): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params.class_name) queryParams.append('class_name', params.class_name);
    if (params.student_name) queryParams.append('student_name', params.student_name);
    if (params.student_id) queryParams.append('student_id', params.student_id);

    return fetchAPI(`/students/search?${queryParams.toString()}`);
};

/**
 * 獲取學生詳情
 */
export const getStudentById = async (studentId: string): Promise<any> => {
    return fetchAPI(`/students/${studentId}`);
};

/**
 * 獲取所有學生列表
 */
export const getAllStudents = async (params?: {
    skip?: number;
    limit?: number;
}): Promise<any[]> => {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());

    const query = queryParams.toString();
    const endpoint = query ? `/students/?${query}` : '/students/';

    return fetchAPI(endpoint);
};

// ==================== 匯出所有 API ====================

const api = {
    // 認證
    login,
    register,
    logout,
    changePassword,

    // Token 管理
    saveToken,
    getToken,
    removeToken,
    isAuthenticated,

    // 申請表
    createApplication,
    getApplications,
    getApplicationById,
    updateApplication,
    deleteApplication,
    reviewApplication,
    exportApplicationPDF,

    // 學生
    searchStudents,
    getStudentById,
    getAllStudents,
};

export default api;
