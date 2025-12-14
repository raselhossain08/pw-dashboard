import { apiClient } from "@/lib/api-client";

export type QuestionType =
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "essay"
  | "fill_in_blank";

export type QuizQuestion = {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer?: string | string[];
  points: number;
  explanation?: string;
  order: number;
};

export type QuizDto = {
  _id: string;
  title: string;
  description?: string;
  course: string | { _id: string; title?: string };
  instructor: string | { _id: string; firstName?: string; lastName?: string };
  lesson?: string | { _id: string; title?: string };
  questions: QuizQuestion[];
  totalPoints: number;
  passingScore: number;
  duration: number;
  attemptsAllowed: number;
  shuffleQuestions: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  availableFrom?: string;
  availableUntil?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateQuizPayload = {
  title: string;
  description?: string;
  courseId: string;
  lessonId?: string;
  moduleId?: string;
  questions: Omit<QuizQuestion, "id">[];
  passingScore: number;
  duration: number;
  attemptsAllowed?: number;
  shuffleQuestions?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
};

export type UpdateQuizPayload = Partial<CreateQuizPayload> & {
  questions?: QuizQuestion[];
};

class QuizzesService {
  async getAllQuizzes(params: {
    courseId?: string;
    lessonId?: string;
    page?: number;
    limit?: number;
  } = {}) {
    const { data } = await apiClient.get<{ quizzes: QuizDto[]; total: number }>(
      "/quizzes",
      { params }
    );
    return data;
  }

  async getQuiz(id: string) {
    const { data } = await apiClient.get<QuizDto>(`/quizzes/${id}`);
    return data;
  }

  async createQuiz(payload: CreateQuizPayload) {
    const { data } = await apiClient.post<QuizDto>("/quizzes", payload);
    return data;
  }

  async updateQuiz(id: string, payload: UpdateQuizPayload) {
    const { data } = await apiClient.patch<QuizDto>(`/quizzes/${id}`, payload);
    return data;
  }

  async deleteQuiz(id: string) {
    const { data } = await apiClient.delete<{ message: string }>(`/quizzes/${id}`);
    return data;
  }

  async startQuiz(id: string) {
    const { data } = await apiClient.post<{ submissionId: string }>(
      `/quizzes/${id}/start`
    );
    return data;
  }

  async submitQuiz(
    id: string,
    submissionId: string,
    payload: { answers: { questionId: string; answer: string | string[] }[]; timeSpent?: number }
  ) {
    const { data } = await apiClient.post(`/quizzes/${id}/submit/${submissionId}`, payload);
    return data;
  }

  async getMySubmissions(params: { quizId?: string; page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ submissions: any[]; total: number }>(
      "/quizzes/my-submissions",
      { params }
    );
    return data;
  }

  async getQuizSubmissions(id: string, params: { page?: number; limit?: number } = {}) {
    const { data } = await apiClient.get<{ submissions: any[]; total: number; stats: any }>(
      `/quizzes/${id}/submissions`,
      { params }
    );
    return data;
  }

  async getQuizStats(id: string) {
    const { data } = await apiClient.get(`/quizzes/${id}/stats`);
    return data;
  }
}

export const quizzesService = new QuizzesService();
export default quizzesService;

