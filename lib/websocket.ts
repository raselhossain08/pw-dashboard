/**
 * WebSocket Service for Real-time Updates
 * Provides real-time communication between dashboard and backend
 */

import { io, Socket } from 'socket.io-client';

export type WebSocketEventType = 
  | 'about-section:updated'
  | 'about-section:created'
  | 'about-section:deleted'
  | 'about-section:status-changed';

export interface WebSocketEvent {
  type: WebSocketEventType;
  data: any;
  timestamp: string;
  userId?: string;
}

export type WebSocketCallback = (event: WebSocketEvent) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<WebSocketCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  private readonly WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

  /**
   * Initialize WebSocket connection
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket?.connected) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        return;
      }

      this.isConnecting = true;
     

      try {
        this.socket = io(this.WS_URL, {
          auth: token ? { token } : undefined,
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: this.reconnectDelay,
          reconnectionAttempts: this.maxReconnectAttempts,
          timeout: 10000,
        });

        this.setupEventListeners(resolve, reject);
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Setup socket event listeners
   */
  private setupEventListeners(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      this.reconnectAttempts = 0;
      this.isConnecting = false;
      resolve();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.isConnecting = false;
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[WebSocket] Max reconnection attempts reached');
        reject(new Error('Failed to establish WebSocket connection'));
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.isConnecting = false;

      if (reason === 'io server disconnect') {
        // Server initiated disconnect, reconnect manually
        setTimeout(() => {
          this.connect();
        }, this.reconnectDelay);
      }
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });

    // Listen for CMS events
    this.socket.on('cms:update', (event: WebSocketEvent) => {
      console.log('[WebSocket] CMS update received:', event);
      this.notifyListeners(event.type, event);
    });

    // Specific about-section events
    this.socket.on('about-section:updated', (data) => {
      this.notifyListeners('about-section:updated', {
        type: 'about-section:updated',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('about-section:created', (data) => {
      this.notifyListeners('about-section:created', {
        type: 'about-section:created',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('about-section:deleted', (data) => {
      this.notifyListeners('about-section:deleted', {
        type: 'about-section:deleted',
        data,
        timestamp: new Date().toISOString(),
      });
    });

    this.socket.on('about-section:status-changed', (data) => {
      this.notifyListeners('about-section:status-changed', {
        type: 'about-section:status-changed',
        data,
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Subscribe to WebSocket events
   */
  on(eventType: WebSocketEventType, callback: WebSocketCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);
    console.log(`[WebSocket] Subscribed to ${eventType}`);

    // Return unsubscribe function
    return () => {
      this.off(eventType, callback);
    };
  }

  /**
   * Unsubscribe from WebSocket events
   */
  off(eventType: WebSocketEventType, callback: WebSocketCallback): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
      console.log(`[WebSocket] Unsubscribed from ${eventType}`);

      if (listeners.size === 0) {
        this.listeners.delete(eventType);
      }
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(eventType: WebSocketEventType, event: WebSocketEvent): void {
    const listeners = this.listeners.get(eventType);
    if (listeners && listeners.size > 0) {
      console.log(`[WebSocket] Notifying ${listeners.size} listeners for ${eventType}`);
      listeners.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('[WebSocket] Error in listener callback:', error);
        }
      });
    }
  }

  /**
   * Emit an event to the server
   */
  emit(eventType: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn('[WebSocket] Cannot emit, not connected');
      return;
    }

    console.log(`[WebSocket] Emitting ${eventType}:`, data);
    this.socket.emit(eventType, data);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[WebSocket] Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
      this.isConnecting = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    connecting: boolean;
    reconnectAttempts: number;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

/**
 * React Hook for WebSocket events
 */
export function useWebSocket() {
  if (typeof window === 'undefined') {
    return {
      connect: async () => {},
      disconnect: () => {},
      on: () => () => {},
      emit: () => {},
      isConnected: () => false,
      getStatus: () => ({
        connected: false,
        connecting: false,
        reconnectAttempts: 0,
      }),
    };
  }

  return {
    connect: (token?: string) => websocketService.connect(token),
    disconnect: () => websocketService.disconnect(),
    on: (eventType: WebSocketEventType, callback: WebSocketCallback) =>
      websocketService.on(eventType, callback),
    emit: (eventType: string, data: any) => websocketService.emit(eventType, data),
    isConnected: () => websocketService.isConnected(),
    getStatus: () => websocketService.getStatus(),
  };
}

export default websocketService;



