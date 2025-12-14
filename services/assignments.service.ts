import { apiClient } from "@/lib/api-client";

export interface Assignment {
  _id: string;
  course: string | { _id: string; title?: string };
  instructor: string | { _id: string; firstName?: string; lastName?: string };
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentDto {
  title: string;
  description: string;
  dueDate: string;
  maxPoints?: number;
  attachments?: string[];
  moduleId?: string;
}

export interface UpdateAssignmentDto {
  title?: string;
  description?: string;
  dueDate?: string;
  maxPoints?: number;
  attachments?: string[];
}

class AssignmentsService {
  async getCourseAssignments(courseId: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ assignments: Assignment[]; total: number }>(
      `/assignments/course/${courseId}`,
      { params }
    );
    return data;
  }

  async createAssignment(courseId: string, payload: CreateAssignmentDto) {
    const { data } = await apiClient.post<Assignment>(`/assignments/course/${courseId}`, payload);
    return data;
  }

  async updateAssignment(id: string, payload: UpdateAssignmentDto) {
    const { data } = await apiClient.patch<Assignment>(`/assignments/${id}`, payload);
    return data;
  }

  async deleteAssignment(id: string) {
    const { data } = await apiClient.delete(`/assignments/${id}`);
    return data;
  }

  async getAssignment(id: string) {
    const { data } = await apiClient.get<Assignment>(`/assignments/${id}`);
    return data;
  }

  async getAssignmentSubmissions(id: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get(`/assignments/${id}/submissions`, { params });
    return data;
  }

  async gradeSubmission(id: string, payload: { grade: number; feedback?: string }) {
    const { data } = await apiClient.post(`/assignments/submissions/${id}/grade`, payload);
    return data;
  }

  async getAssignmentStats(id: string) {
    const { data } = await apiClient.get(`/assignments/${id}/stats`);
    return data;
  }
}

export const assignmentsService = new AssignmentsService();
export default assignmentsService;
