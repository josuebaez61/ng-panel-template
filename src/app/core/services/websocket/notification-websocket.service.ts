import { Injectable, inject, effect, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthState } from '../auth/auth-state';
import { Notification } from '@core/models';
import { environment } from '../../../../environments/environment';

/**
 * WebSocket service for real-time notifications
 * Connects to the backend notification gateway and handles real-time updates
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationWebSocketService {
  private readonly authState = inject(AuthState);
  private socket: Socket | null = null;
  private readonly isConnected = signal<boolean>(false);

  // Store callbacks to re-register after reconnection
  private notificationCallbacks = new Set<(notification: Notification) => void>();
  private unreadCountCallbacks = new Map<
    (count: number) => void,
    (data: { count: number }) => void
  >();

  // Public readonly signal for connection status
  public readonly connected = this.isConnected.asReadonly();

  constructor() {
    // Effect to handle connection/disconnection based on authentication state
    // Also handles reconnection when token changes (e.g., after refresh)
    effect(() => {
      const isAuthenticated = this.authState.isAuthenticated();
      const accessToken = this.authState.accessToken();

      if (isAuthenticated && accessToken) {
        // If already connected with a different token, disconnect first
        if (this.socket?.connected) {
          // Check if we need to reconnect with new token
          // For simplicity, always reconnect when token changes
          // The connect method will handle the case if already connected
          this.disconnect();
        }
        this.connect(accessToken);
      } else {
        this.disconnect();
      }
    });
  }

  /**
   * Connect to the WebSocket server
   */
  private connect(accessToken: string): void {
    if (this.socket?.connected) {
      return; // Already connected
    }

    // Disconnect existing socket if any
    this.disconnect();

    // Extract base URL from API URL (remove /api/v1)
    const baseUrl = environment.apiUrl.replace('/api/v1', '');

    // Connect to the notifications namespace
    this.socket = io(`${baseUrl}/notifications`, {
      auth: {
        token: accessToken,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    // Handle connection events
    this.socket.on('connect', () => {
      console.log('WebSocket connected to notifications');
      this.isConnected.set(true);

      // Subscribe to notifications after connection
      this.socket?.emit('subscribe');

      // Re-register all callbacks after reconnection
      this.notificationCallbacks.forEach((callback) => {
        this.socket?.on('notification', callback);
      });
      this.unreadCountCallbacks.forEach((socketCallback) => {
        this.socket?.on('unread_count', socketCallback);
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected.set(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected.set(false);
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  private disconnect(): void {
    if (this.socket) {
      this.socket.emit('unsubscribe');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected.set(false);
    }
  }

  /**
   * Listen for new notifications
   * @param callback Function to call when a notification is received
   * @returns Function to unsubscribe from the event
   */
  public onNotification(callback: (notification: Notification) => void): () => void {
    // Store callback for reconnection
    this.notificationCallbacks.add(callback);

    // Register listener if socket is connected
    if (this.socket?.connected) {
      this.socket.on('notification', callback);
    }

    // Return unsubscribe function
    return () => {
      this.notificationCallbacks.delete(callback);
      this.socket?.off('notification', callback);
    };
  }

  /**
   * Listen for unread count updates
   * @param callback Function to call when unread count is updated
   * @returns Function to unsubscribe from the event
   */
  public onUnreadCount(callback: (count: number) => void): () => void {
    // Create wrapper function for socket.io
    const socketCallback = (data: { count: number }) => {
      callback(data.count);
    };

    // Store callback mapping for reconnection
    this.unreadCountCallbacks.set(callback, socketCallback);

    // Register listener if socket is connected
    if (this.socket?.connected) {
      this.socket.on('unread_count', socketCallback);
    }

    // Return unsubscribe function
    return () => {
      const storedCallback = this.unreadCountCallbacks.get(callback);
      if (storedCallback) {
        this.socket?.off('unread_count', storedCallback);
        this.unreadCountCallbacks.delete(callback);
      }
    };
  }

  /**
   * Manually reconnect to the WebSocket server
   * Useful when token is refreshed
   */
  public reconnect(): void {
    const accessToken = this.authState.accessToken();
    if (accessToken) {
      this.connect(accessToken);
    }
  }
}
