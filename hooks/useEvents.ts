"use client"

import { useState, useEffect, useCallback } from 'react'
import { eventsService } from '@/services/events.service'
import type { Events, UpdateEventsDto } from '@/lib/types/events'
import { useToast } from '@/context/ToastContext'

interface UseEventsResult {
    events: Events | null
    loading: boolean
    saving: boolean
    uploadProgress: number
    error: string | null
    fetchEvents: () => Promise<void>
    updateEvents: (data: UpdateEventsDto) => Promise<Events | null>
    updateEventsWithMedia: (formData: FormData) => Promise<Events | null>
    exportEvents: (format: "json" | "pdf") => Promise<void>
    refreshEvents: () => Promise<void>
}

export function useEvents(): UseEventsResult {
    const [events, setEvents] = useState<Events | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const { push } = useToast()

    const fetchEvents = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await eventsService.getEvents()
            setEvents(data)
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch events data.'
            setError(errorMessage)
            push({ message: errorMessage, type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [push])

    useEffect(() => {
        fetchEvents()
    }, [fetchEvents])

    const updateEvents = useCallback(async (data: UpdateEventsDto): Promise<Events | null> => {
        setSaving(true)
        try {
            const updated = await eventsService.updateEvents(data)
            setEvents(updated)
            push({ message: 'Events updated successfully', type: 'success' })
            return updated
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update events'
            push({ message: errorMessage, type: 'error' })
            return null
        } finally {
            setSaving(false)
        }
    }, [push])

    const updateEventsWithMedia = useCallback(async (formData: FormData): Promise<Events | null> => {
        setSaving(true)
        setUploadProgress(0)
        try {
            const response = await eventsService.updateEventsWithMedia(
                formData,
                (progress) => setUploadProgress(progress)
            )
            const eventsData = response?.data || response
            setEvents(eventsData)
            push({ message: response?.message || 'Events updated successfully with media', type: 'success' })
            setUploadProgress(0)
            return eventsData
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update events with media'
            push({ message: errorMessage, type: 'error' })
            setUploadProgress(0)
            return null
        } finally {
            setSaving(false)
        }
    }, [push])



    const exportEvents = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        setSaving(true)
        try {
            await eventsService.exportEvents(format)
            push({ message: `Events exported successfully as ${format.toUpperCase()}!`, type: 'success' })
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export events'
            push({ message: errorMessage, type: 'error' })
        } finally {
            setSaving(false)
        }
    }, [push])

    const refreshEvents = useCallback(async () => {
        await fetchEvents()
    }, [fetchEvents])

    return {
        events,
        loading,
        saving,
        uploadProgress,
        error,
        fetchEvents,
        updateEvents,
        updateEventsWithMedia,
        exportEvents,
        refreshEvents,
    }
}
