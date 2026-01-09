import { cookieService } from "../cookie.service";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface HeaderSection {
  badge: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}

export interface Category {
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface FaqItem {
  question: string;
  answer: string;
  category: string;
  tags: string[];
  isActive?: boolean;
  order?: number;
}

export interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface Faqs {
  _id?: string;
  headerSection: HeaderSection;
  categories: Category[];
  faqs: FaqItem[];
  seoMeta: SeoMeta;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FaqsResponse {
  success: boolean;
  message: string;
  data?: Faqs;
}

export class FaqsService {
  private static async getAuthHeader() {
    const token = cookieService.get("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private static async request<T>(
    method: string,
    url: string,
    body?: unknown
  ): Promise<T> {
    const authHeader = await this.getAuthHeader();
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

    const headers: Record<string, string> = {
      ...(!isFormData && { "Content-Type": "application/json" }),
    };

    // Only add authorization header if token exists
    if (authHeader.Authorization) {
      headers.Authorization = authHeader.Authorization;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method,
        headers,
        credentials: "include",
        body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        console.error(`API Error [${method} ${url}]:`, result);
        throw new Error(result?.message || result?.error || `HTTP ${response.status}`);
      }

      // Backend has ResponseInterceptor that wraps responses:
      // Outer: { success, message: "Request successful", data: { ... } }
      // Inner (controller): { success, message, data: { actual data } }

      // Unwrap the nested structure and return controller response
      if (result && result.success && result.data) {
        return result.data as T;
      }

      return result as T;
    } catch (error: any) {
      console.error(`API Request Failed [${method} ${url}]:`, error.message);
      throw error;
    }
  }

  static async getActiveFaqs(): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("GET", "/cms/faqs/active");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch active FAQs",
      };
    }
  }

  static async getAllFaqs(): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("GET", "/cms/faqs");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch FAQs",
      };
    }
  }

  static async getDefaultFaqs(): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("GET", "/cms/faqs/default");
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch default FAQs",
      };
    }
  }

  static async getFaqsById(id: string): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("GET", `/cms/faqs/${id}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch FAQs",
      };
    }
  }

  static async createFaqs(data: Partial<Faqs>): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("POST", "/cms/faqs", data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create FAQs",
      };
    }
  }

  static async updateFaqs(id: string, data: Partial<Faqs>): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("PUT", `/cms/faqs/${id}`, data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update FAQs",
      };
    }
  }

  static async updateFaqsWithUpload(
    id: string,
    formData: FormData
  ): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("PUT", `/cms/faqs/${id}/upload`, formData);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update FAQs with upload",
      };
    }
  }

  static async deleteFaqs(id: string): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("DELETE", `/cms/faqs/${id}`);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete FAQs",
      };
    }
  }

  static async toggleActive(id: string): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("POST", `/cms/faqs/${id}/toggle-active`, {});
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to toggle active status",
      };
    }
  }

  static async duplicateFaqs(id: string): Promise<FaqsResponse> {
    try {
      return await this.request<FaqsResponse>("POST", `/cms/faqs/${id}/duplicate`, {});
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to duplicate FAQs",
      };
    }
  }

  static async exportFaqs(id: string, format: "json" | "pdf" = "json"): Promise<void> {
    const token = cookieService.get("token") || "";

    const res = await fetch(`${API_BASE_URL}/cms/faqs/${id}/export?format=${format}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to export FAQs');
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `faqs_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
