"use client";

import { useState, useEffect, useCallback } from 'react';
import { contactService } from '@/lib/services/contact.service';
import type { Contact, UpdateContactDto } from '@/lib/services/contact.service';
import { useToast } from '@/context/ToastContext';

interface UseContactResult {
    contact: Contact | null;
    loading: boolean;
    saving: boolean;
    uploadProgress: number;
    error: string | null;
    fetchContact: () => Promise<void>;
    updateContact: (data: UpdateContactDto) => Promise<Contact | null>;
    updateContactWithUpload: (formData: FormData) => Promise<Contact | null>;
    toggleActive: () => Promise<Contact | null>;
    duplicateContact: () => Promise<Contact | null>;
    exportContact: (format: "json" | "pdf") => Promise<void>;
    refreshContact: () => Promise<void>;
}

export function useContact(): UseContactResult {
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { push } = useToast();

    const fetchContact = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await contactService.getDefault();
            setContact(data);
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to fetch contact';
            setError(errorMessage);
            push({ message: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    }, [push]);

    useEffect(() => {
        fetchContact();
    }, [fetchContact]);

    const updateContact = useCallback(async (data: UpdateContactDto): Promise<Contact | null> => {
        if (!contact?._id) {
            push({ message: 'No contact data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const updated = await contactService.update(contact._id, data);
            setContact(updated);
            push({ message: 'Contact updated successfully', type: 'success' });
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update contact';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [contact, push]);

    const updateContactWithUpload = useCallback(async (formData: FormData): Promise<Contact | null> => {
        if (!contact?._id) {
            push({ message: 'No contact data found', type: 'error' });
            return null;
        }

        setSaving(true);
        setUploadProgress(0);
        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 100);

            // Note: The service layer doesn't have updateWithUpload, so we'll use axios directly
            const axios = (await import('@/lib/axios')).default;
            const response = await axios.put(`/cms/contact/${contact._id}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent: any) => {
                    if (progressEvent.total) {
                        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        setUploadProgress(progress);
                    }
                },
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            const responseData = response.data as any;
            const updated = responseData.data?.data || responseData.data || responseData;
            setContact(updated);
            push({ message: 'Contact updated successfully with image', type: 'success' });
            setTimeout(() => setUploadProgress(0), 1000);
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update contact';
            push({ message: errorMessage, type: 'error' });
            setUploadProgress(0);
            return null;
        } finally {
            setSaving(false);
        }
    }, [contact, push]);

    const toggleActive = useCallback(async (): Promise<Contact | null> => {
        if (!contact?._id) {
            push({ message: 'No contact data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const updated = await contactService.toggleActive(contact._id);
            setContact(updated);
            push({
                message: `Contact ${updated.isActive ? 'activated' : 'deactivated'}`,
                type: 'success'
            });
            return updated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to toggle active status';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [contact, push]);

    const duplicateContact = useCallback(async (): Promise<Contact | null> => {
        if (!contact?._id) {
            push({ message: 'No contact data found', type: 'error' });
            return null;
        }

        setSaving(true);
        try {
            const duplicated = await contactService.duplicate(contact._id);
            setContact(duplicated);
            push({ message: 'Contact duplicated successfully!', type: 'success' });
            return duplicated;
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to duplicate contact';
            push({ message: errorMessage, type: 'error' });
            return null;
        } finally {
            setSaving(false);
        }
    }, [contact, push]);

    const exportContact = useCallback(async (format: "json" | "pdf"): Promise<void> => {
        if (!contact?._id) {
            push({ message: 'No contact data found', type: 'error' });
            return;
        }

        setSaving(true);
        try {
            await contactService.export(contact._id, format);
            push({ message: `Contact exported successfully as ${format.toUpperCase()}!`, type: 'success' });
        } catch (err: any) {
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to export contact';
            push({ message: errorMessage, type: 'error' });
        } finally {
            setSaving(false);
        }
    }, [contact, push]);

    const refreshContact = useCallback(async () => {
        await fetchContact();
    }, [fetchContact]);

    return {
        contact,
        loading,
        saving,
        uploadProgress,
        error,
        fetchContact,
        updateContact,
        updateContactWithUpload,
        toggleActive,
        duplicateContact,
        exportContact,
        refreshContact,
    };
}
