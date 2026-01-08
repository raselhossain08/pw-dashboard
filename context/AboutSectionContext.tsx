"use client";

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import type { AboutSection, UpdateAboutSectionDto } from '@/lib/types/about-section';
import { aboutSectionService } from '@/services/about-section.service';
import { useToast } from '@/context/ToastContext';
import { useWebSocket } from '@/lib/websocket';
import type { WebSocketEvent } from '@/lib/websocket';

/**
 * State Management Context for About Section
 * Provides centralized state management with WebSocket integration
 */

// Action Types
type ActionType =
  | 'SET_LOADING'
  | 'SET_SAVING'
  | 'SET_ABOUT_SECTION'
  | 'SET_ERROR'
  | 'SET_UPLOAD_PROGRESS'
  | 'UPDATE_FIELD'
  | 'RESET_STATE';

// State Interface
interface AboutSectionState {
  aboutSection: AboutSection | null;
  loading: boolean;
  saving: boolean;
  uploadProgress: number;
  error: string | null;
  lastUpdated: string | null;
  isRealTimeEnabled: boolean;
}

// Action Interface
interface Action {
  type: ActionType;
  payload?: any;
}

// Context Value Interface
interface AboutSectionContextValue {
  state: AboutSectionState;
  actions: {
    fetchAboutSection: () => Promise<void>;
    updateAboutSection: (data: UpdateAboutSectionDto) => Promise<void>;
    updateAboutSectionWithMedia: (formData: FormData) => Promise<void>;
    toggleActive: () => Promise<void>;
    duplicateAboutSection: () => Promise<void>;
    exportAboutSection: (format: 'json' | 'pdf') => Promise<void>;
    refreshAboutSection: () => Promise<void>;
    resetError: () => void;
    enableRealTime: () => void;
    disableRealTime: () => void;
  };
}

// Initial State
const initialState: AboutSectionState = {
  aboutSection: null,
  loading: true,
  saving: false,
  uploadProgress: 0,
  error: null,
  lastUpdated: null,
  isRealTimeEnabled: false,
};

// Reducer Function
function aboutSectionReducer(state: AboutSectionState, action: Action): AboutSectionState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_ABOUT_SECTION':
      return {
        ...state,
        aboutSection: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        saving: false,
      };

    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };

    case 'UPDATE_FIELD':
      if (!state.aboutSection) return state;
      return {
        ...state,
        aboutSection: {
          ...state.aboutSection,
          ...action.payload,
        },
      };

    case 'RESET_STATE':
      return initialState;

    default:
      return state;
  }
}

// Create Context
const AboutSectionContext = createContext<AboutSectionContextValue | undefined>(undefined);

/**
 * About Section Provider Component
 */
export function AboutSectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(aboutSectionReducer, initialState);
  const { push } = useToast();
  const { on: onWebSocket, isConnected } = useWebSocket();
  const isSubscribed = useRef(false);

  /**
   * Fetch about section data
   */
  const fetchAboutSection = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const data = await aboutSectionService.getAboutSection();
      dispatch({ type: 'SET_ABOUT_SECTION', payload: data });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to fetch about section';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      push({ message: errorMessage, type: 'error' });
    }
  }, [push]);

  /**
   * Update about section
   */
  const updateAboutSection = useCallback(
    async (data: UpdateAboutSectionDto) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        const updated = await aboutSectionService.updateAboutSection(data);
        dispatch({ type: 'SET_ABOUT_SECTION', payload: updated });
        push({ message: 'About section updated successfully', type: 'success' });
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to update about section';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        push({ message: errorMessage, type: 'error' });
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },
    [push]
  );

  /**
   * Update about section with media upload
   */
  const updateAboutSectionWithMedia = useCallback(
    async (formData: FormData) => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 });

        const response = await aboutSectionService.updateAboutSectionWithMedia(
          formData,
          (progress) => {
            dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress });
          }
        );

        dispatch({ type: 'SET_ABOUT_SECTION', payload: response.data });
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 });
        push({ message: 'About section updated successfully', type: 'success' });
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to update about section';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: 0 });
        push({ message: errorMessage, type: 'error' });
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },
    [push]
  );

  /**
   * Toggle active status
   */
  const toggleActive = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      const updated = await aboutSectionService.toggleActive();
      dispatch({ type: 'SET_ABOUT_SECTION', payload: updated });
      push({
        message: `About section ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
        type: 'success',
      });
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to toggle status';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      push({ message: errorMessage, type: 'error' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [push]);

  /**
   * Duplicate about section
   */
  const duplicateAboutSection = useCallback(async () => {
    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      await aboutSectionService.duplicateAboutSection();
      push({ message: 'About section duplicated successfully', type: 'success' });
      await fetchAboutSection();
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to duplicate about section';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      push({ message: errorMessage, type: 'error' });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [push, fetchAboutSection]);

  /**
   * Export about section
   */
  const exportAboutSection = useCallback(
    async (format: 'json' | 'pdf') => {
      try {
        dispatch({ type: 'SET_SAVING', payload: true });
        await aboutSectionService.exportAboutSection(format);
        push({
          message: `About section exported as ${format.toUpperCase()} successfully`,
          type: 'success',
        });
      } catch (error: any) {
        const errorMessage = error?.message || 'Failed to export about section';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        push({ message: errorMessage, type: 'error' });
      } finally {
        dispatch({ type: 'SET_SAVING', payload: false });
      }
    },
    [push]
  );

  /**
   * Refresh about section
   */
  const refreshAboutSection = useCallback(async () => {
    await fetchAboutSection();
  }, [fetchAboutSection]);

  /**
   * Reset error state
   */
  const resetError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  /**
   * Enable real-time updates
   */
  const enableRealTime = useCallback(() => {
    if (!isSubscribed.current && isConnected()) {
      const handleUpdate = (event: WebSocketEvent) => {
        console.log('[AboutSection] Real-time update received:', event);
        
        if (event.data) {
          dispatch({ type: 'SET_ABOUT_SECTION', payload: event.data });
          push({
            message: 'About section updated by another user',
            type: 'info',
          });
        }
      };

      const unsubscribe = onWebSocket('about-section:updated', handleUpdate);
      isSubscribed.current = true;

      // Store unsubscribe function for cleanup
      return () => {
        unsubscribe();
        isSubscribed.current = false;
      };
    }
  }, [isConnected, onWebSocket, push]);

  /**
   * Disable real-time updates
   */
  const disableRealTime = useCallback(() => {
    isSubscribed.current = false;
  }, []);

  /**
   * Initial data fetch
   */
  useEffect(() => {
    fetchAboutSection();
  }, [fetchAboutSection]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      dispatch({ type: 'RESET_STATE' });
    };
  }, []);

  const contextValue: AboutSectionContextValue = {
    state,
    actions: {
      fetchAboutSection,
      updateAboutSection,
      updateAboutSectionWithMedia,
      toggleActive,
      duplicateAboutSection,
      exportAboutSection,
      refreshAboutSection,
      resetError,
      enableRealTime,
      disableRealTime,
    },
  };

  return (
    <AboutSectionContext.Provider value={contextValue}>
      {children}
    </AboutSectionContext.Provider>
  );
}

/**
 * Hook to use About Section Context
 */
export function useAboutSectionContext(): AboutSectionContextValue {
  const context = useContext(AboutSectionContext);
  
  if (!context) {
    throw new Error('useAboutSectionContext must be used within AboutSectionProvider');
  }
  
  return context;
}

/**
 * HOC to wrap component with AboutSectionProvider
 */
export function withAboutSectionProvider<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithAboutSectionProvider(props: P) {
    return (
      <AboutSectionProvider>
        <Component {...props} />
      </AboutSectionProvider>
    );
  };
}

export default AboutSectionContext;


