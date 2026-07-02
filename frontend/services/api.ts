const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '') + '/api/v1';

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  monthlyLimitBudget: number;
  projectedSpendingVelocity: number;
  topSpendingCategory: string;
  topSpendingMerchant: string;
}

export interface CategoryBreakdown {
  categoryName: string;
  color: string;
  icon: string;
  amount: number;
  percentage: number;
}

export interface Insight {
  id: string;
  insightType: 'ANOMALY' | 'SUBSCRIPTION' | 'SPENDING_DNA';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface UploadStatus {
  uploadId: string;
  fileName: string;
  fileSize: number;
  status: 'PENDING' | 'PARSING' | 'COMPLETED' | 'FAILED';
  recordCount: number;
  createdAt: string;
}

export interface TransactionDto {
  id: string;
  transactionDate: string;
  description: string;
  amount: number;
  balance: number;
  transactionType: 'DEBIT' | 'CREDIT';
  paymentMode: string;
  referenceNumber: string;
  merchantName: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  isInternalTransfer: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
}

export const api = {
  // Authentication Actions
  login: async (email: string, password: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Login failed' }));
      throw new Error(err.message || 'Invalid credentials');
    }
    return response.json();
  },

  register: async (email: string, password: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ message: 'Registration failed' }));
      throw new Error(err.message || 'Registration failed');
    }
    return response.json();
  },

  logout: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Logout failed');
    }
  },

  me: async (): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Not authenticated');
    }
    return response.json();
  },

  // Finance Actions
  getSummary: async (startDate?: string, endDate?: string): Promise<FinancialSummary> => {
    const url = new URL(`${API_BASE_URL}/analytics/summary`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch summary');
    }
    return response.json();
  },

  getCategoryBreakdowns: async (startDate?: string, endDate?: string): Promise<CategoryBreakdown[]> => {
    const url = new URL(`${API_BASE_URL}/analytics/categories`);
    if (startDate) url.searchParams.append('startDate', startDate);
    if (endDate) url.searchParams.append('endDate', endDate);
    
    const response = await fetch(url.toString(), { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch category breakdowns');
    }
    return response.json();
  },

  getInsights: async (): Promise<Insight[]> => {
    const response = await fetch(`${API_BASE_URL}/insights`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch insights');
    }
    return response.json();
  },

  getTransactions: async (): Promise<TransactionDto[]> => {
    const response = await fetch(`${API_BASE_URL}/transactions`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }
    return response.json();
  },

  markInsightRead: async (id: string): Promise<Insight> => {
    const response = await fetch(`${API_BASE_URL}/insights/${id}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to mark insight read');
    }
    return response.json();
  },

  triggerScan: async (): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/insights/scan`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to trigger scan');
    }
  },

  uploadStatement: async (file: File): Promise<UploadStatus> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`${API_BASE_URL}/uploads`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Failed to upload statement');
    }
    return response.json();
  },

  downloadPdfReport: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE_URL}/reports/pdf`, { credentials: 'include' });
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    return response.blob();
  },
};
