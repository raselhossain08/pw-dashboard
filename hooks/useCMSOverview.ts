"use client";

import { useState, useEffect, useCallback } from "react";
import { cmsOverviewService, CMSOverviewStats, CMSSection } from "@/services/cms-overview.service";
import { useToast } from "@/context/ToastContext";
import { useBanners } from "@/hooks/useBanner";
import { useAboutSection } from "@/hooks/useAboutSection";
import { useEvents } from "@/hooks/useEvents";
import { useTestimonials } from "@/hooks/useTestimonials";
import { useBlog } from "@/hooks/useBlog";

interface UseCMSOverviewResult {
  stats: CMSOverviewStats | null;
  sections: CMSSection[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  fetchOverview: () => Promise<void>;
  refreshOverview: () => Promise<void>;
  exportCMSData: (format: "json" | "csv") => Promise<void>;
}

export function useCMSOverview(): UseCMSOverviewResult {
  const { push } = useToast();
  const [stats, setStats] = useState<CMSOverviewStats | null>(null);
  const [sections, setSections] = useState<CMSSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Use existing hooks for real-time data
  const { banners, loading: bannersLoading } = useBanners();
  const { aboutSection, loading: aboutLoading } = useAboutSection();
  const { events, loading: eventsLoading } = useEvents();
  const { testimonials, loading: testimonialsLoading } = useTestimonials();
  const { blog, loading: blogLoading } = useBlog();

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Try to fetch from backend, fallback to aggregating from hooks
      try {
        const backendStats = await cmsOverviewService.getOverviewStats();
        const backendSections = await cmsOverviewService.getSections();
        setStats(backendStats);
        setSections(backendSections);
      } catch (backendError) {
        // Fallback to aggregating from hooks
        const aggregatedStats: CMSOverviewStats = {
          banners: {
            total: banners?.length || 0,
            active: banners?.filter((b: any) => b.isActive)?.length || 0,
            inactive: banners?.filter((b: any) => !b.isActive)?.length || 0,
          },
          events: {
            total: events?.events?.length || 0,
            active: events?.events?.length || 0,
            inactive: 0,
          },
          testimonials: {
            total: testimonials?.testimonials?.length || 0,
            active: testimonials?.testimonials?.length || 0,
            inactive: 0,
          },
          blogPosts: {
            total: blog?.blogs?.length || 0,
            published: blog?.blogs?.filter((b: any) => b.status === "published")?.length || 0,
            draft: blog?.blogs?.filter((b: any) => b.status === "draft")?.length || 0,
          },
          aboutSection: {
            isActive: aboutSection?.isActive || false,
            hasContent: !!aboutSection,
          },
          pages: {
            aboutUs: true, // Assume configured if we can access it
            contact: true,
            faqs: true,
            privacyPolicy: true,
            refundPolicy: true,
            termsConditions: true,
          },
          header: {
            configured: true,
          },
          footer: {
            configured: true,
          },
        };

        const aggregatedSections: CMSSection[] = [
          {
            id: "home-banner",
            label: "Home Banner",
            href: "/cms/home/banner",
            icon: "PlayCircle",
            status: bannersLoading
              ? "loading"
              : banners && banners.length > 0
                ? "configured"
                : "empty",
            category: "home",
            hasContent: (banners?.length || 0) > 0,
          },
          {
            id: "about-section",
            label: "About Section",
            href: "/cms/home/about-section",
            icon: "Heart",
            status: aboutLoading
              ? "loading"
              : aboutSection?.isActive
                ? "active"
                : "inactive",
            category: "home",
            hasContent: !!aboutSection,
          },
          {
            id: "events",
            label: "Events",
            href: "/cms/home/events",
            icon: "Calendar",
            status: eventsLoading
              ? "loading"
              : (events?.events?.length || 0) > 0
                ? "configured"
                : "empty",
            category: "home",
            hasContent: (events?.events?.length || 0) > 0,
          },
          {
            id: "testimonials",
            label: "Testimonials",
            href: "/cms/home/testimonials",
            icon: "MessageSquare",
            status: testimonialsLoading
              ? "loading"
              : (testimonials?.testimonials?.length || 0) > 0
                ? "configured"
                : "empty",
            category: "home",
            hasContent: (testimonials?.testimonials?.length || 0) > 0,
          },
          {
            id: "blog",
            label: "Blog",
            href: "/cms/home/blog",
            icon: "Newspaper",
            status: blogLoading
              ? "loading"
              : blog?.isActive
                ? "active"
                : "inactive",
            category: "home",
            hasContent: (blog?.blogs?.length || 0) > 0,
          },
          {
            id: "header",
            label: "Header",
            href: "/cms/header",
            icon: "Image",
            status: "manage",
            category: "navigation",
            hasContent: true,
          },
          {
            id: "footer",
            label: "Footer",
            href: "/cms/footer",
            icon: "Image",
            status: "manage",
            category: "navigation",
            hasContent: true,
          },
          {
            id: "about-us",
            label: "About Us",
            href: "/cms/about-us",
            icon: "Users",
            status: "manage",
            category: "pages",
            hasContent: true,
          },
          {
            id: "contact",
            label: "Contact Page",
            href: "/cms/contact",
            icon: "MessageSquare",
            status: "manage",
            category: "pages",
            hasContent: true,
          },
          {
            id: "faqs",
            label: "FAQs",
            href: "/cms/faqs",
            icon: "CircleHelp",
            status: "manage",
            category: "pages",
            hasContent: true,
          },
          {
            id: "privacy-policy",
            label: "Privacy Policy",
            href: "/cms/privacy-policy",
            icon: "ShieldCheck",
            status: "manage",
            category: "policies",
            hasContent: true,
          },
          {
            id: "refund-policy",
            label: "Refund Policy",
            href: "/cms/refund-policy",
            icon: "ShieldCheck",
            status: "manage",
            category: "policies",
            hasContent: true,
          },
          {
            id: "terms-conditions",
            label: "Terms & Conditions",
            href: "/cms/terms-conditions",
            icon: "ShieldCheck",
            status: "manage",
            category: "policies",
            hasContent: true,
          },
        ];

        setStats(aggregatedStats);
        setSections(aggregatedSections);
      }
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Failed to fetch CMS overview";
      setError(errorMessage);
      push({
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [push, banners, aboutSection, events, testimonials, blog, bannersLoading, aboutLoading, eventsLoading, testimonialsLoading, blogLoading]);

  const refreshOverview = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOverview();
      push({
        message: "CMS overview refreshed successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Failed to refresh overview:", err);
    } finally {
      setRefreshing(false);
    }
  }, [fetchOverview, push]);

  const exportCMSData = useCallback(
    async (format: "json" | "csv"): Promise<void> => {
      try {
        await cmsOverviewService.exportCMSData(format);
        push({
          message: `CMS data exported successfully as ${format.toUpperCase()}!`,
          type: "success",
        });
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || "Failed to export CMS data";
        push({
          message: errorMessage,
          type: "error",
        });
      }
    },
    [push]
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    stats,
    sections,
    loading,
    error,
    refreshing,
    fetchOverview,
    refreshOverview,
    exportCMSData,
  };
}
