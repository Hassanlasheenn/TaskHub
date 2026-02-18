import { Injectable, OnDestroy, NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject, takeUntil, BehaviorSubject, interval } from "rxjs";
import { API_URLS } from "../../api.global";
import { INotificationResponse, INotificationListResponse } from "../interfaces/notification.interface";
import { AuthService } from "../../auth/services/auth.service";

@Injectable({
    providedIn: 'root',
})
export class NotificationService implements OnDestroy {
    private readonly _destroy$ = new Subject<void>();
    private ws: WebSocket | null = null;
    
    private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
    private connectionTimeoutRef: ReturnType<typeof setTimeout> | null = null;
    private pollingInterval: ReturnType<typeof setInterval> | null = null;
    private intervalValue: ReturnType<typeof setInterval> | null = null;

    private isConnecting: boolean = false;
    private retryCount: number = 0;

    private readonly _notifications$ = new BehaviorSubject<INotificationResponse[]>([]);
    private readonly _unreadCount$ = new BehaviorSubject<number>(0);
    private readonly _notificationEvents$ = new Subject<INotificationResponse>();
    
    public notifications$ = this._notifications$.asObservable();
    public unreadCount$ = this._unreadCount$.asObservable();
    public notificationEvents$ = this._notificationEvents$.asObservable();

    constructor(
        private readonly _http: HttpClient,
        private readonly _authService: AuthService,
        private readonly _ngZone: NgZone
    ) {
        this.checkAndConnect();
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        this.disconnect(true);
    }

    private checkAndConnect(): void {
        let lastUserId: number | null = null;
        
        this._ngZone.runOutsideAngular(() => {
            interval(1000).pipe(takeUntil(this._destroy$)).subscribe(() => {
                const userId = this._authService.getCurrentUserId();
                const isAuthenticated = this._authService.isAuthenticated();
                
                if (lastUserId !== null && userId !== lastUserId && this.ws) {
                    this.disconnect(true);
                }
                
                if (isAuthenticated && userId && !this.ws && !this.isConnecting) {
                    this.initializeWebSocket();
                    lastUserId = userId;
                } else if (!isAuthenticated && this.ws) {
                    this.disconnect(true);
                    lastUserId = null;
                } else if (isAuthenticated && userId) {
                    lastUserId = userId;
                }
            });
        });
    }

    private initializeWebSocket(): void {
        const userId = this._authService.getCurrentUserId();
        const token = this._authService.getToken();
        
        if (!userId || !token || this.isConnecting || this.ws) {
            return;
        }

        this.isConnecting = true;
        const wsUrl = API_URLS.notifications.websocket(userId);
        const wsTokenUrl = `${wsUrl}?token=${token}`;
        
        try {
            this.ws = new WebSocket(wsTokenUrl);
            
            this.connectionTimeoutRef = setTimeout(() => {
                if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
                    this.ws.close();
                    this.isConnecting = false;
                    if (!this.pollingInterval) {
                        this.startPolling();
                    }
                }
            }, 5000);
            
            this.ws.onopen = () => {
                if (this.connectionTimeoutRef) clearTimeout(this.connectionTimeoutRef);
                this.isConnecting = false;
                this.retryCount = 0;
                
                this.stopPolling();
                this._ngZone.run(() => this.loadNotifications(true));
                this.startInterval();
            };
            
            this.ws.onmessage = (event: MessageEvent) => {
                if(event.data === "pong") return;
                
                try {
                    const notification: INotificationResponse = JSON.parse(event.data);
                    this._ngZone.run(() => this.addNotification(notification));
                } catch (error) {
                    // Silently ignore JSON parse errors to keep console clean
                }
            };
            
            this.ws.onerror = (event: Event) => {
                if (this.connectionTimeoutRef) clearTimeout(this.connectionTimeoutRef);
                this.isConnecting = false;
                if (!this.pollingInterval) {
                    this.startPolling();
                }
            };
            
            this.ws.onclose = (event: CloseEvent) => {
                if (this.connectionTimeoutRef) clearTimeout(this.connectionTimeoutRef);
                this.stopInterval();
                this.ws = null;
                this.isConnecting = false;
                
                if (!this.pollingInterval) {
                    this.startPolling();
                }
                
                const shouldReconnect = this._authService.isAuthenticated() && 
                    event.code !== 1000 && 
                    event.code !== 1001 && 
                    event.code !== 1008 && 
                    event.code !== 4001 && 
                    event.code !== 4003 && 
                    event.code !== 4004;
                
                if (shouldReconnect) {
                    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
                    
                    const delay = Math.min(30000, 1000 * Math.pow(2, this.retryCount));
                    this.retryCount++; 
                    
                    this.reconnectTimeout = setTimeout(() => {
                        if (this._authService.isAuthenticated() && !this.ws && !this.isConnecting) {
                            this.initializeWebSocket();
                        }
                    }, delay);
                }
            };
        } catch (error) {
            this.isConnecting = false;
            if (!this.pollingInterval) {
                this.startPolling();
            }
        }
    }

    private addNotification(notification: INotificationResponse): void {
        const currentUserId = this._authService.getCurrentUserId();
        if (!currentUserId || notification.user_id !== currentUserId) {
            return; 
        }
        
        const current = this._notifications$.value;
        const exists = current.some(n => n.id === notification.id);
        
        if (!exists) {
            this._notifications$.next([notification, ...current]);
            
            if (!notification.is_read) {
                this._unreadCount$.next(this._unreadCount$.value + 1);
            }
            this._notificationEvents$.next(notification);
        }
    }

    getNotifications(skip: number = 0, limit: number = 100): Observable<INotificationListResponse> {
        return this._http
            .get<INotificationListResponse>(`${API_URLS.notifications.getNotifications}?skip=${skip}&limit=${limit}`, {
                withCredentials: true
            })
            .pipe(takeUntil(this._destroy$));
    }

    markAsRead(notificationId: number): Observable<INotificationResponse> {
        return this._http
            .put<INotificationResponse>(
                API_URLS.notifications.markAsRead(notificationId),
                {},
                { withCredentials: true }
            )
            .pipe(takeUntil(this._destroy$));
    }

    markAllAsRead(): Observable<{ message: string }> {
        return this._http
            .put<{ message: string }>(
                API_URLS.notifications.markAllAsRead,
                {},
                { withCredentials: true }
            )
            .pipe(takeUntil(this._destroy$));
    }

    deleteNotification(notificationId: number): Observable<{ message: string }> {
        return this._http
            .delete<{ message: string }>(
                API_URLS.notifications.deleteNotification(notificationId),
                { withCredentials: true }
            )
            .pipe(takeUntil(this._destroy$));
    }

    loadNotifications(silent: boolean = false): void {
        const currentUserId = this._authService.getCurrentUserId();
        if (!currentUserId) {
            this._notifications$.next([]);
            this._unreadCount$.next(0);
            return;
        }
        
        this.getNotifications().subscribe({
            next: (response) => {
                const currentUserId = this._authService.getCurrentUserId();
                const filteredNotifications = response.notifications.filter(
                    n => n.user_id === currentUserId
                );
                
                const currentNotifications = this._notifications$.value;
                const currentIds = new Set(currentNotifications.map(n => n.id));
                
                const newlyAddedNotifications = filteredNotifications.filter(n => !currentIds.has(n.id));
                
                if (!silent) {
                    newlyAddedNotifications.forEach(notification => {
                        this._notificationEvents$.next(notification);
                    });
                }
                
                this._notifications$.next(filteredNotifications);
                this._unreadCount$.next(response.unread_count);
            },
            error: () => {}
        });
    }

    connectWebSocket(): void {
        if (!this.ws && !this.isConnecting) {
            this.initializeWebSocket();
        }
    }

    private startInterval(): void {
        this.stopInterval();
        this._ngZone.runOutsideAngular(() => {
            this.intervalValue = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send("ping");
                }
            }, 30000);
        });
    }

    private stopInterval(): void {
        if (this.intervalValue) {
            clearInterval(this.intervalValue);
            this.intervalValue = null;
        }
    }

    disconnect(isLogout: boolean = false): void {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (this.connectionTimeoutRef) {
            clearTimeout(this.connectionTimeoutRef);
            this.connectionTimeoutRef = null;
        }
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        this.isConnecting = false;
        this.stopPolling();
        this.stopInterval();
        
        if (isLogout) {
            this._notifications$.next([]);
            this._unreadCount$.next(0);
            this.retryCount = 0;
        }
    }

    private startPolling(): void {
        if (this.pollingInterval) {
            return;
        }
        this._ngZone.runOutsideAngular(() => {
            this.pollingInterval = setInterval(() => {
                if (this._authService.isAuthenticated()) {
                    this._ngZone.run(() => this.loadNotifications(true));
                } else {
                    this.stopPolling();
                }
            }, 10000);
        });
    }

    private stopPolling(): void {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }
}