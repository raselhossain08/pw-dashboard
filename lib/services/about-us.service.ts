import { getAccessToken } from "@/lib/cookies";

export interface HeaderSection {
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
}

export interface ContentSection {
  id: string;
  title: string;
  content: string; // HTML content
  image?: string;
  imageAlt?: string;
  isActive: boolean;
  order: number;
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

export interface TeamMember {
  id: string;
  name: string;
  position: string;
  image?: string;
  imageAlt?: string;
  bio?: string;
  certifications?: string;
  isActive: boolean;
  order: number;
}

export interface TeamSection {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  members: TeamMember[];
}

export interface Stat {
  value: string;
  label: string;
}

export interface StatsSection {
  isActive?: boolean;
  stats: Stat[];
}

export interface AboutUs {
  _id?: string;
  headerSection: HeaderSection;
  sections: ContentSection[];
  teamSection?: TeamSection;
  statsSection?: StatsSection;
  seo: SeoMeta;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AboutUsResponse {
  success: boolean;
  message: string;
  data?: AboutUs | AboutUs[];
}

export class AboutUsService {
  private static readonly API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  private static getAuthHeader() {
    const token = getAccessToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Helper to unwrap nested API responses
  private static unwrapResponse(response: any): AboutUsResponse {
    // Backend uses ResponseInterceptor that wraps controller responses
    // Structure: { success, message, data: { success, message, data: actualData }, meta }
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      return response.data; // Return the inner response
    }
    return response;
  }

  static async getActiveAboutUs(): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us/active`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return this.unwrapResponse(data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch active About Us page",
      };
    }
  }

  static async getAllAboutUs(): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return this.unwrapResponse(data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch About Us pages",
      };
    }
  }

  static async getDefaultAboutUs(): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us/default`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return this.unwrapResponse(data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch default About Us page",
      };
    }
  }

  static async getAboutUsById(id: string): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us/${id}`,
        {
          headers: this.getAuthHeader(),
          cache: "no-store",
        }
      );
      const data = await response.json();
      return this.unwrapResponse(data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to fetch About Us page",
      };
    }
  }

  static async createAboutUs(data: Partial<AboutUs>): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us`,
        {
          method: "POST",
          headers: this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );
      const responseData = await response.json();
      return this.unwrapResponse(responseData);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create About Us page",
      };
    }
  }

  static async updateAboutUs(
    id: string,
    data: Partial<AboutUs>
  ): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us/${id}`,
        {
          method: "PUT",
          headers: this.getAuthHeader(),
          body: JSON.stringify(data),
        }
      );
      const responseData = await response.json();
      return this.unwrapResponse(responseData);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update About Us page",
      };
    }
  }

  static async updateAboutUsWithUpload(
    id: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<AboutUsResponse> {
    try {
      const token = getAccessToken();

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Track upload progress
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable && onProgress) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });

        // Handle completion
        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const responseData = JSON.parse(xhr.responseText);
              resolve(this.unwrapResponse(responseData));
            } catch (error) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              resolve({
                success: false,
                message: errorData.message || "Failed to update About Us page with upload",
              });
            } catch {
              resolve({
                success: false,
                message: `HTTP Error: ${xhr.status}`,
              });
            }
          }
        });

        // Handle errors
        xhr.addEventListener("error", () => {
          resolve({
            success: false,
            message: "Network error occurred during upload",
          });
        });

        // Handle abort
        xhr.addEventListener("abort", () => {
          resolve({
            success: false,
            message: "Upload was cancelled",
          });
        });

        // Setup and send request
        xhr.open("PUT", `${this.API_BASE_URL}/cms/about-us/${id}/upload`);
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        }
        xhr.send(formData);
      });
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Failed to update About Us page with upload",
      };
    }
  }

  static async deleteAboutUs(id: string): Promise<AboutUsResponse> {
    try {
      const response = await fetch(
        `${this.API_BASE_URL}/cms/about-us/${id}`,
        {
          method: "DELETE",
          headers: this.getAuthHeader(),
        }
      );
      const data = await response.json();
      return this.unwrapResponse(data);
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete About Us page",
      };
    }
  }

  static async exportAboutUs(format: "json" | "pdf", id?: string): Promise<void> {
    try {
      const url = id
        ? `${this.API_BASE_URL}/cms/about-us/${id}/export?format=${format}`
        : `${this.API_BASE_URL}/cms/about-us/export?format=${format}`;

      const response = await fetch(url, {
        method: "GET",
        headers: this.getAuthHeader(),
      });

      if (!response.ok) {
        throw new Error("Failed to export About Us page");
      }

      const blob = await response.blob();
      const url_blob = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url_blob;
      link.download = `about-us-export_${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : "json"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url_blob);
    } catch (error: any) {
      throw new Error(error.message || "Failed to export About Us page");
    }
  }
}
