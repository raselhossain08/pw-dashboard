"use client";

import { useState, useEffect, useCallback } from "react";
import { AboutUsService, AboutUs } from "@/lib/services/about-us.service";
import { useToast } from "@/context/ToastContext";
import { cacheService, CacheKeys } from "@/lib/cache.service";

interface UseAboutUsResult {
  aboutUs: AboutUs | null;
  loading: boolean;
  saving: boolean;
  uploadProgress: number;
  error: string | null;
  fetchAboutUs: () => Promise<void>;
  createAboutUs: (data: Partial<AboutUs>) => Promise<AboutUs | null>;
  updateAboutUs: (id: string, data: Partial<AboutUs>) => Promise<AboutUs | null>;
  updateAboutUsWithUpload: (id: string, formData: FormData) => Promise<AboutUs | null>;
  deleteAboutUs: (id: string) => Promise<boolean>;
  exportAboutUs: (format: "json" | "pdf", id?: string) => Promise<void>;
  refreshAboutUs: () => Promise<void>;
}

export function useAboutUs(): UseAboutUsResult {
  const { push } = useToast();
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const fetchAboutUs = useCallback(async () => {
    // Check cache first
    const cacheKey = CacheKeys.aboutUs();
    const cached = cacheService.get<AboutUs>(cacheKey);

    if (cached) {
      setAboutUs(cached);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await AboutUsService.getDefaultAboutUs();
      if (response.success && response.data) {
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setAboutUs(data);
        // Cache the result for 5 minutes
        cacheService.set(cacheKey, data, 5 * 60 * 1000);
      } else {
        // Create default if none exists
        const createResponse = await AboutUsService.createAboutUs({
          headerSection: {
            title: "About Us",
            subtitle: "LEARN MORE ABOUT PERSONAL WINGS",
            image: "",
            imageAlt: "",
          },
          sections: [],
          seo: {
            title: "About Us | Personal Wings",
            description: "Learn about Personal Wings",
            keywords: [],
            canonicalUrl: "https://personalwings.com/about-us",
          },
        });
        if (createResponse.success && createResponse.data) {
          const data = Array.isArray(createResponse.data)
            ? createResponse.data[0]
            : createResponse.data;
          setAboutUs(data);
          // Cache the newly created data
          cacheService.set(cacheKey, data, 5 * 60 * 1000);
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch About Us page";
      setError(errorMessage);
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push]);

  const createAboutUs = useCallback(
    async (data: Partial<AboutUs>): Promise<AboutUs | null> => {
      setSaving(true);
      try {
        const response = await AboutUsService.createAboutUs(data);
        if (response.success && response.data) {
          const newAboutUs = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setAboutUs(newAboutUs);
          push({
            message: "About Us page created successfully!",
            type: "success",
          });
          return newAboutUs;
        }
        throw new Error(response.message || "Failed to create About Us page");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to create About Us page";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const updateAboutUs = useCallback(
    async (id: string, data: Partial<AboutUs>): Promise<AboutUs | null> => {
      setSaving(true);

      // Optimistic update
      const previousData = aboutUs;
      if (aboutUs) {
        const optimisticUpdate = { ...aboutUs, ...data };
        setAboutUs(optimisticUpdate);
      }

      try {
        const response = await AboutUsService.updateAboutUs(id, data);
        if (response.success && response.data) {
          const updated = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setAboutUs(updated);

          // Update cache with both default and ID keys
          const cacheKey = CacheKeys.aboutUs();
          cacheService.set(cacheKey, updated, 5 * 60 * 1000);
          if (id) {
            const cacheKeyWithId = CacheKeys.aboutUs(id);
            cacheService.set(cacheKeyWithId, updated, 5 * 60 * 1000);
          }

          push({
            message: "About Us page updated successfully!",
            type: "success",
          });
          return updated;
        }
        throw new Error(response.message || "Failed to update About Us page");
      } catch (err: any) {
        // Revert optimistic update on error
        if (previousData) {
          setAboutUs(previousData);
        }

        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update About Us page";
        push({
          message: errorMessage,
          type: "error",
        });
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push, aboutUs]
  );

  const updateAboutUsWithUpload = useCallback(
    async (id: string, formData: FormData): Promise<AboutUs | null> => {
      setSaving(true);
      setUploadProgress(0);
      try {
        const response = await AboutUsService.updateAboutUsWithUpload(
          id,
          formData,
          (progress) => {
            // Update progress in real-time
            setUploadProgress(progress);
          }
        );
        if (response.success && response.data) {
          const updated = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          setAboutUs(updated);

          // Update cache
          const cacheKey = CacheKeys.aboutUs();
          cacheService.set(cacheKey, updated, 5 * 60 * 1000);
          if (updated._id) {
            const cacheKeyWithId = CacheKeys.aboutUs(updated._id);
            cacheService.set(cacheKeyWithId, updated, 5 * 60 * 1000);
          }

          push({
            message: "About Us page updated successfully!",
            type: "success",
          });
          // Keep progress at 100% briefly before resetting
          setUploadProgress(100);
          setTimeout(() => setUploadProgress(0), 1000);
          return updated;
        }
        throw new Error(response.message || "Failed to update About Us page");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to update About Us page";
        push({
          message: errorMessage,
          type: "error",
        });
        setUploadProgress(0);
        return null;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const deleteAboutUs = useCallback(
    async (id: string): Promise<boolean> => {
      setSaving(true);
      try {
        const response = await AboutUsService.deleteAboutUs(id);
        if (response.success) {
          push({
            message: "About Us page deleted successfully!",
            type: "success",
          });
          return true;
        }
        throw new Error(response.message || "Failed to delete About Us page");
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to delete About Us page";
        push({
          message: errorMessage,
          type: "error",
        });
        return false;
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const exportAboutUs = useCallback(
    async (format: "json" | "pdf", id?: string): Promise<void> => {
      setSaving(true);
      try {
        await AboutUsService.exportAboutUs(format, id);
        push({
          message: `About Us page exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export About Us page";
        push({
          message: errorMessage,
          type: "error",
        });
      } finally {
        setSaving(false);
      }
    },
    [push]
  );

  const refreshAboutUs = useCallback(async () => {
    // Clear cache before fetching fresh data
    const cacheKey = CacheKeys.aboutUs();
    cacheService.delete(cacheKey);
    // Also clear cache with ID if aboutUs exists
    if (aboutUs?._id) {
      cacheService.delete(CacheKeys.aboutUs(aboutUs._id));
    }
    await fetchAboutUs();
  }, [fetchAboutUs, aboutUs]);

  useEffect(() => {
    fetchAboutUs();
  }, [fetchAboutUs]);

  return {
    aboutUs,
    loading,
    saving,
    uploadProgress,
    error,
    fetchAboutUs,
    createAboutUs,
    updateAboutUs,
    updateAboutUsWithUpload,
    deleteAboutUs,
    exportAboutUs,
    refreshAboutUs,
  };
}
