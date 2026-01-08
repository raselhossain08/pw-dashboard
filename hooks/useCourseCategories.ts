"use client";

import { useState, useEffect, useCallback } from "react";
import {
  courseCategoriesService,
  CourseCategory,
  CreateCategoryDto,
  UpdateCategoryDto,
  GetCategoriesParams,
} from "@/services/course-categories.service";
import { useToast } from "@/context/ToastContext";

export interface CategoryStats {
  totalCategories: number;
  activeCategories: number;
  inactiveCategories: number;
  totalCourses: number;
  averageCoursesPerCategory: number;
}

interface UseCourseCategoriesResult {
  categories: CourseCategory[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: CategoryStats | null;
  statsLoading: boolean;
  fetchCategories: (params?: GetCategoriesParams) => Promise<void>;
  getCategory: (id: string) => Promise<CourseCategory | null>;
  createCategory: (data: CreateCategoryDto) => Promise<CourseCategory | null>;
  updateCategory: (slug: string, data: UpdateCategoryDto) => Promise<CourseCategory | null>;
  deleteCategory: (slug: string) => Promise<boolean>;
  toggleCategoryStatus: (slug: string) => Promise<CourseCategory | null>;
  duplicateCategory: (slug: string) => Promise<CourseCategory | null>;
  getCategoryStats: () => Promise<CategoryStats | null>;
  bulkDeleteCategories: (slugs: string[]) => Promise<boolean>;
  bulkToggleStatus: (slugs: string[]) => Promise<boolean>;
  exportCategories: (format: "csv" | "xlsx" | "pdf", params?: { isActive?: boolean }) => Promise<void>;
  refreshCategories: () => Promise<void>;
}

export function useCourseCategories(): UseCourseCategoriesResult {
  const { push } = useToast();
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCourseCategoriesResult['pagination']>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const fetchCategories = useCallback(
    async (params: GetCategoriesParams = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await courseCategoriesService.getAllCategories(params);
        const categoriesList = response?.data?.categories || [];
        setCategories(categoriesList);
        const totalPages = params.limit
          ? Math.ceil((response?.data?.total || categoriesList.length) / params.limit)
          : 1;
        setPagination({
          page: params.page || 1,
          limit: params.limit || 10,
          total: response?.data?.total || categoriesList.length,
          totalPages,
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch categories";
        setError(errorMessage);
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const getCategory = useCallback(
    async (id: string): Promise<CourseCategory | null> => {
      try {
        const category = await courseCategoriesService.getCategoryById(id);
        return category;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch category";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createCategory = useCallback(
    async (data: CreateCategoryDto): Promise<CourseCategory | null> => {
      setLoading(true);
      try {
        const newCategory = await courseCategoriesService.createCategory(data);
        setCategories((prev) => [newCategory, ...prev]);
        push({
          message: "Category created successfully!",
          type: "success",
        });
        return newCategory;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create category";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const updateCategory = useCallback(
    async (slug: string, data: UpdateCategoryDto): Promise<CourseCategory | null> => {
      setLoading(true);
      try {
        const updatedCategory = await courseCategoriesService.updateCategory(slug, data);
        setCategories((prev) => prev.map((c) => (c.slug === slug ? updatedCategory : c)));
        push({
          message: "Category updated successfully!",
          type: "success",
        });
        return updatedCategory;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update category";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const deleteCategory = useCallback(
    async (slug: string): Promise<boolean> => {
      setLoading(true);
      try {
        await courseCategoriesService.deleteCategory(slug);
        setCategories((prev) => prev.filter((c) => c.slug !== slug));
        push({
          message: "Category deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete category";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const toggleCategoryStatus = useCallback(
    async (slug: string): Promise<CourseCategory | null> => {
      setLoading(true);
      try {
        const updatedCategory = await courseCategoriesService.toggleCategoryStatus(slug);
        setCategories((prev) => {
          const category = prev.find((c) => c.slug === slug);
          if (!category) {
            return prev;
          }
          return prev.map((c) => (c.slug === slug ? updatedCategory : c));
        });
        push({
          message: `Category ${updatedCategory.isActive ? "activated" : "deactivated"} successfully!`,
          type: "success",
        });
        return updatedCategory;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle category status";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const duplicateCategory = useCallback(
    async (slug: string): Promise<CourseCategory | null> => {
      setLoading(true);
      try {
        const duplicatedCategory = await courseCategoriesService.duplicateCategory(slug);
        setCategories((prev) => [duplicatedCategory, ...prev]);
        push({
          message: "Category duplicated successfully!",
          type: "success",
        });
        return duplicatedCategory;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate category";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const getCategoryStats = useCallback(
    async (): Promise<CategoryStats | null> => {
      setStatsLoading(true);
      try {
        const statsData = await courseCategoriesService.getCategoryStats();
        const normalizedStats: CategoryStats = {
          totalCategories: statsData.totalCategories || 0,
          activeCategories: statsData.activeCategories || 0,
          inactiveCategories: statsData.inactiveCategories || 0,
          totalCourses: statsData.totalCourses || 0,
          averageCoursesPerCategory: statsData.averageCoursesPerCategory || 0,
        };
        setStats(normalizedStats);
        return normalizedStats;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch category stats";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setStatsLoading(false);
      }
    },
    [push]
  );

  const bulkDeleteCategories = useCallback(
    async (slugs: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await courseCategoriesService.bulkDeleteCategories(slugs);
        setCategories((prev) => prev.filter((c) => !slugs.includes(c.slug)));
        push({
          message: `${slugs.length} categor${slugs.length > 1 ? "ies" : "y"} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete categories";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const bulkToggleStatus = useCallback(
    async (slugs: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await courseCategoriesService.bulkToggleStatus(slugs);
        await fetchCategories();
        push({
          message: `Status updated for ${slugs.length} categor${slugs.length > 1 ? "ies" : "y"}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle category status";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchCategories]
  );

  const exportCategories = useCallback(
    async (format: "csv" | "xlsx" | "pdf", params?: { isActive?: boolean }): Promise<void> => {
      setLoading(true);
      try {
        await courseCategoriesService.exportCategories(format, params);
        push({
          message: `Categories exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export categories";
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    },
    [push]
  );

  const refreshCategories = useCallback(async () => {
    await fetchCategories();
  }, [fetchCategories]);

  // Only fetch categories once on mount
  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run on mount

  return {
    categories,
    loading,
    error,
    pagination,
    stats,
    statsLoading,
    fetchCategories,
    getCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
    duplicateCategory,
    getCategoryStats,
    bulkDeleteCategories,
    bulkToggleStatus,
    exportCategories,
    refreshCategories,
  };
}
