import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { trainingService, type TrainingProgram, type CreateTrainingProgramDto, type UpdateTrainingProgramDto, type ProgramEnrollment, type ProgramStats } from "@/services/training.service";
import { useToast } from "@/context/ToastContext";

/**
 * Hook to fetch all training programs with filters
 */
export function useTrainingPrograms(params?: {
    page?: number;
    limit?: number;
    search?: string;
    level?: string;
    instructor?: string;
    isPublished?: boolean;
}) {
    return useQuery({
        queryKey: ["training-programs", params],
        queryFn: () => trainingService.getAllPrograms(params),
    });
}

/**
 * Hook to fetch a single training program by ID
 */
export function useTrainingProgram(id: string | undefined) {
    return useQuery({
        queryKey: ["training-program", id],
        queryFn: () => trainingService.getProgramById(id!),
        enabled: !!id,
    });
}

/**
 * Hook to create a new training program
 */
export function useCreateProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (data: CreateTrainingProgramDto) => trainingService.createProgram(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            push({ message: "Training program created successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to create training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to update a training program
 */
export function useUpdateProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateTrainingProgramDto }) =>
            trainingService.updateProgram(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            queryClient.invalidateQueries({ queryKey: ["training-program", variables.id] });
            push({ message: "Training program updated successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to update training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to delete a training program
 */
export function useDeleteProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (id: string) => trainingService.deleteProgram(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            push({ message: "Training program deleted successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to delete training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to publish a training program
 */
export function usePublishProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (id: string) => trainingService.publishProgram(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            queryClient.invalidateQueries({ queryKey: ["training-program", id] });
            push({ message: "Training program published successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to publish training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to unpublish a training program
 */
export function useUnpublishProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (id: string) => trainingService.unpublishProgram(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            queryClient.invalidateQueries({ queryKey: ["training-program", id] });
            push({ message: "Training program unpublished successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to unpublish training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to duplicate a training program
 */
export function useDuplicateProgram() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (id: string) => trainingService.duplicateProgram(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            push({ message: "Training program duplicated successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to duplicate training program",
                type: "error",
            });
        },
    });
}

/**
 * Hook to toggle program status
 */
export function useToggleProgramStatus() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (id: string) => trainingService.toggleStatus(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            queryClient.invalidateQueries({ queryKey: ["training-program", id] });
            push({ message: "Program status toggled successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to toggle program status",
                type: "error",
            });
        },
    });
}

/**
 * Hook to enroll a student in a program
 */
export function useEnrollStudent() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: ({ programId, studentId }: { programId: string; studentId: string }) =>
            trainingService.enrollStudent(programId, studentId),
        onSuccess: (_, { programId }) => {
            queryClient.invalidateQueries({ queryKey: ["program-enrollments", programId] });
            queryClient.invalidateQueries({ queryKey: ["program-stats", programId] });
            push({ message: "Student enrolled successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to enroll student",
                type: "error",
            });
        },
    });
}

/**
 * Hook to get program enrollments
 */
export function useProgramEnrollments(
    programId: string | undefined,
    params?: {
        status?: string;
        page?: number;
        limit?: number;
    }
) {
    return useQuery<{ data: ProgramEnrollment[]; total: number }>({
        queryKey: ["program-enrollments", programId, params],
        queryFn: () => trainingService.getProgramEnrollments(programId!, params),
        enabled: !!programId,
    });
}

/**
 * Hook to get student enrollments
 */
export function useStudentEnrollments(studentId: string | undefined) {
    return useQuery({
        queryKey: ["student-enrollments", studentId],
        queryFn: () => trainingService.getStudentEnrollments(studentId!),
        enabled: !!studentId,
    });
}

/**
 * Hook to update student progress
 */
export function useUpdateProgress() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: ({
            programId,
            studentId,
            courseId,
            score,
        }: {
            programId: string;
            studentId: string;
            courseId: string;
            score?: number;
        }) => trainingService.updateProgress(programId, studentId, courseId, { score }),
        onSuccess: (_, { programId, studentId }) => {
            queryClient.invalidateQueries({ queryKey: ["student-progress", programId, studentId] });
            queryClient.invalidateQueries({ queryKey: ["program-enrollments", programId] });
            queryClient.invalidateQueries({ queryKey: ["program-stats", programId] });
            push({ message: "Progress updated successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to update progress",
                type: "error",
            });
        },
    });
}

/**
 * Hook to get student progress
 */
export function useStudentProgress(programId: string | undefined, studentId: string | undefined) {
    return useQuery<ProgramEnrollment>({
        queryKey: ["student-progress", programId, studentId],
        queryFn: () => trainingService.getStudentProgress(programId!, studentId!),
        enabled: !!programId && !!studentId,
    });
}

/**
 * Hook to get program statistics
 */
export function useProgramStats(programId: string | undefined) {
    return useQuery({
        queryKey: ["program-stats", programId],
        queryFn: () => trainingService.getProgramStats(programId!),
        enabled: !!programId,
    });
}

/**
 * Hook to bulk delete programs
 */
export function useBulkDeletePrograms() {
    const queryClient = useQueryClient();
    const { push } = useToast();

    return useMutation({
        mutationFn: (ids: string[]) => trainingService.bulkDelete(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["training-programs"] });
            push({ message: "Programs deleted successfully", type: "success" });
        },
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to delete programs",
                type: "error",
            });
        },
    });
}

/**
 * Hook to upload thumbnail
 */
export function useUploadThumbnail() {
    const { push } = useToast();

    return useMutation({
        mutationFn: (file: File) => trainingService.uploadThumbnail(file),
        onError: (error: any) => {
            push({
                message: error?.response?.data?.message || "Failed to upload thumbnail",
                type: "error",
            });
        },
    });
}
