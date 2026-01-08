"use client";

import { useState, useEffect, useCallback } from "react";
import {
  modulesService,
  ModuleDto,
  CreateModuleDto,
  UpdateModuleDto,
} from "@/services/modules.service";
import { useToast } from "@/context/ToastContext";

export interface ModuleStats {
  totalModules: number;
  totalLessons: number;
  publishedLessons: number;
  averageCompletion: number;
  totalStudents: number;
  publishedModules: number;
  draftModules: number;
}

interface UseModulesResult {
  modules: ModuleDto[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  stats: ModuleStats | null;
  statsLoading: boolean;
  fetchModules: (params?: {
    courseId?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  getModule: (id: string) => Promise<ModuleDto | null>;
  createModule: (data: CreateModuleDto) => Promise<ModuleDto | null>;
  updateModule: (id: string, data: UpdateModuleDto) => Promise<ModuleDto | null>;
  deleteModule: (id: string) => Promise<boolean>;
  toggleModuleStatus: (id: string) => Promise<ModuleDto | null>;
  duplicateModule: (id: string) => Promise<ModuleDto | null>;
  getModuleStats: (id: string) => Promise<ModuleStats | null>;
  reorderModules: (courseId: string, moduleIds: string[]) => Promise<boolean>;
  bulkDeleteModules: (ids: string[]) => Promise<boolean>;
  bulkToggleStatus: (ids: string[]) => Promise<boolean>;
  refreshModules: () => Promise<void>;
}

export function useModules(): UseModulesResult {
  const { push } = useToast();
  const [modules, setModules] = useState<ModuleDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseModulesResult['pagination']>(null);
  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [statsLoading, setStatsLoading] = useState<boolean>(false);

  const fetchModules = useCallback(
    async (params: {
      courseId?: string;
      page?: number;
      limit?: number;
    } = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await modulesService.getAllModules(params);
        const modulesList = Array.isArray(response?.modules)
          ? response.modules
          : Array.isArray(response?.data?.modules)
            ? response.data.modules
            : Array.isArray(response)
              ? response
              : [];

        setModules(modulesList);
        const totalPages = params.limit
          ? Math.ceil((response?.total || modulesList.length) / params.limit)
          : 1;
        setPagination({
          page: params.page || 1,
          limit: params.limit || 20,
          total: response?.total || modulesList.length,
          totalPages,
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch modules";
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

  const getModule = useCallback(
    async (id: string): Promise<ModuleDto | null> => {
      try {
        const module = await modulesService.getModuleById(id);
        return module;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch module";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      }
    },
    [push]
  );

  const createModule = useCallback(
    async (data: CreateModuleDto): Promise<ModuleDto | null> => {
      setLoading(true);
      try {
        const newModule = await modulesService.createModule(data);
        setModules((prev) => [newModule, ...prev]);
        push({
          message: "Module created successfully!",
          type: "success",
        });
        return newModule;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create module";
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

  const updateModule = useCallback(
    async (id: string, data: UpdateModuleDto): Promise<ModuleDto | null> => {
      setLoading(true);
      try {
        const updatedModule = await modulesService.updateModule(id, data);
        setModules((prev) => prev.map((m) => (m._id === id || m.id === id ? updatedModule : m)));
        push({
          message: "Module updated successfully!",
          type: "success",
        });
        return updatedModule;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update module";
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

  const deleteModule = useCallback(
    async (id: string): Promise<boolean> => {
      setLoading(true);
      try {
        await modulesService.deleteModule(id);
        setModules((prev) => prev.filter((m) => m._id !== id && m.id !== id));
        push({
          message: "Module deleted successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete module";
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

  const toggleModuleStatus = useCallback(
    async (id: string): Promise<ModuleDto | null> => {
      setLoading(true);
      try {
        const updatedModule = await modulesService.toggleModuleStatus(id);
        setModules((prev) => prev.map((m) => (m._id === id || m.id === id ? updatedModule : m)));
        push({
          message: `Module ${updatedModule.status === "published" ? "published" : "unpublished"} successfully!`,
          type: "success",
        });
        return updatedModule;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle module status";
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

  const duplicateModule = useCallback(
    async (id: string): Promise<ModuleDto | null> => {
      setLoading(true);
      try {
        const duplicatedModule = await modulesService.duplicateModule(id);
        setModules((prev) => [duplicatedModule, ...prev]);
        push({
          message: "Module duplicated successfully!",
          type: "success",
        });
        return duplicatedModule;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to duplicate module";
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

  const getModuleStats = useCallback(
    async (id: string): Promise<ModuleStats | null> => {
      setStatsLoading(true);
      try {
        const statsData = await modulesService.getModuleStats(id) as ModuleStats;
        setStats(statsData);
        return statsData;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to fetch module stats";
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

  const reorderModules = useCallback(
    async (courseId: string, moduleIds: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await modulesService.reorderModules(courseId, moduleIds);
        push({
          message: "Modules reordered successfully!",
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to reorder modules";
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

  const bulkDeleteModules = useCallback(
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await modulesService.bulkDeleteModules(ids);
        setModules((prev) => prev.filter((m) => !ids.includes(m._id || m.id || "")));
        push({
          message: `${ids.length} module${ids.length > 1 ? "s" : ""} deleted successfully!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete modules";
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
    async (ids: string[]): Promise<boolean> => {
      setLoading(true);
      try {
        await modulesService.bulkToggleStatus(ids);
        await fetchModules();
        push({
          message: `Status updated for ${ids.length} module${ids.length > 1 ? "s" : ""}!`,
          type: "success",
        });
        return true;
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to toggle module status";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setLoading(false);
      }
    },
    [push, fetchModules]
  );

  const refreshModules = useCallback(async () => {
    await fetchModules();
  }, [fetchModules]);

  useEffect(() => {
    fetchModules();
  }, [fetchModules]);

  return {
    modules,
    loading,
    error,
    pagination,
    stats,
    statsLoading,
    fetchModules,
    getModule,
    createModule,
    updateModule,
    deleteModule,
    toggleModuleStatus,
    duplicateModule,
    getModuleStats,
    reorderModules,
    bulkDeleteModules,
    bulkToggleStatus,
    refreshModules,
  };
}
