import axios from '@/lib/axios'
import type { Events, CreateEventsDto, UpdateEventsDto } from '@/lib/types/events'

export const eventsService = {
    async getEvents() {
        const res = await axios.get<{ data: Events }>('/cms/home/events')
        return res.data.data || res.data
    },

    async updateEvents(data: UpdateEventsDto) {
        const res = await axios.put<{ data: Events }>('/cms/home/events', data)
        return (res.data as any).data || res.data
    },

    async updateEventsWithMedia(
        formData: FormData,
        onUploadProgress?: (progress: number) => void
    ) {
        const res = await axios.put<{ data: Events; message: string }>(
            '/cms/home/events/upload',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        onUploadProgress?.(progress)
                    }
                },
            }
        )
        return res.data
    },

    async createEvents(data: CreateEventsDto) {
        const res = await axios.post<{ data: Events }>('/cms/home/events', data)
        return res.data.data || res.data
    },

    async exportEvents(format: "json" | "pdf") {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

        // Get token from cookies
        let token = ''
        try {
            const { cookieService } = await import('@/lib/cookie.service')
            token = cookieService.get('token') || ''
        } catch {
            // Fallback to localStorage if cookie service not available
            if (typeof window !== 'undefined') {
                token = localStorage.getItem('token') || ''
            }
        }

        const res = await fetch(`${API_BASE_URL}/cms/home/events/export?format=${format}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        })

        if (!res.ok) {
            throw new Error('Failed to export events')
        }

        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `events-export_${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'json'}`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
    },
}
