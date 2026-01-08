"use client"

import { useState, useEffect, useCallback } from 'react'
import { aboutSectionService } from '@/services/about-section.service'
import type { AboutSection, UpdateAboutSectionDto } from '@/lib/types/about-section'
import { useToast } from '@/context/ToastContext'

interface UseAboutSectionResult {
    aboutSection: AboutSection | null
    loading: boolean
    saving: boolean
    uploadProgress: number
    error: string | null
    fetchAboutSection: () => Promise<void>
    updateAboutSection: (data: UpdateAboutSectionDto) => Promise<AboutSection | null>
    updateAboutSectionWithMedia: (formData: FormData) => Promise<AboutSection | null>
    toggleActive: () => Promise<AboutSection | null>
    duplicateAboutSection: () => Promise<AboutSection | null>
    exportAboutSection: (format: "json" | "pdf") => Promise<void>
    refreshAboutSection: () => Promise<void>
}

export function useAboutSection(): UseAboutSectionResult {
    const [aboutSection, setAboutSection] = useState<AboutSection | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const { push } = useToast()

    const fetchAboutSection = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await aboutSectionService.getAboutSection()
            console.log('🔍 Fetched About Section Data:', data)
            console.log('🔍 isActive value:', data?.isActive, 'Type:', typeof data?.isActive)
            setAboutSection(data)
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch about section data.'
            setError(errorMessage)
            push({ message: errorMessage, type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [push])

    useEffect(() => {
        fetchAboutSection()
    }, [fetchAboutSection])

    const updateAboutSection = useCallback(async (data: UpdateAboutSectionDto): Promise<AboutSection | null> => {
        setSaving(true)
        try {
            const updated = await aboutSectionService.updateAboutSection(data)
            setAboutSection(updated)
            push({ message: 'About section updated successfully', type: 'success' })
            return updated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update about section'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const updateAboutSectionWithMedia = useCallback(async (formData: FormData): Promise<AboutSection | null> => {
        setSaving(true)
        setUploadProgress(0)
        try {
            const response = await aboutSectionService.updateAboutSectionWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            )
            setAboutSection(response.data ?? null)
            push({ message: response.message || 'About section updated successfully', type: 'success' })
            setUploadProgress(0)
            return response.data ?? null
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update about section with media'
            push({ message: errorMessage, type: 'error' })
            setUploadProgress(0)
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const toggleActive = useCallback(async (): Promise<AboutSection | null> => {
        setSaving(true)
        try {
            const updated = await aboutSectionService.toggleActive()
            setAboutSection(updated)
            push({
                message: updated.isActive
                    ? 'About section activated successfully'
                    : 'About section deactivated successfully',
                type: 'success'
            })
            return updated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle about section status'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const duplicateAboutSection = useCallback(async (): Promise<AboutSection | null> => {
        setSaving(true)
        try {
            const duplicated = await aboutSectionService.duplicateAboutSection()
            push({ message: 'About section duplicated successfully!', type: 'success' })
            return duplicated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate about section'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const exportAboutSection = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        setSaving(true)
        try {
            await aboutSectionService.exportAboutSection(format)
            push({ message: `About section exported successfully as ${format.toUpperCase()}!`, type: 'success' })
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export about section'
            push({ message: errorMessage, type: 'error' })
        } finally {
            setSaving(false)
        }
    }, [push])

    const refreshAboutSection = useCallback(async () => {
        await fetchAboutSection()
    }, [fetchAboutSection])

    return {
        aboutSection,
        loading,
        saving,
        uploadProgress,
        error,
        fetchAboutSection,
        updateAboutSection,
        updateAboutSectionWithMedia,
        toggleActive,
        duplicateAboutSection,
        exportAboutSection,
        refreshAboutSection,
    }
}
