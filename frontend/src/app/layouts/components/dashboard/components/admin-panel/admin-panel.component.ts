import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Subject, takeUntil, debounceTime } from "rxjs";
import { AdminService, IUserWithTodos } from "../../../../../core/services/admin.service";
import { LoaderService } from "../../../../../core/services/loader.service";
import { ToastService } from "../../../../../core/services/toast.service";
import { NotificationService } from "../../../../../core/services/notification.service";
import { AuthService } from "../../../../../auth/services/auth.service";
import { ITodoResponse } from "../../../../../core/interfaces/todo.interface";
import { LayoutPaths } from "../../../../enums/layout-paths.enum";
import { trackById } from "../../../../../shared/helpers/trackByFn.helper";

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss'],
    standalone: true,
    imports: [CommonModule, RouterLink]
})
export class AdminPanelComponent implements OnInit, OnDestroy {
    readonly layoutPaths = LayoutPaths;
    private readonly _destroy$ = new Subject<void>();
    usersWithTodos: IUserWithTodos[] = [];
    private originalTodosMap: Map<number, ITodoResponse[]> = new Map();
    expandedUsers: Set<number> = new Set();
    private hasLoadedData: boolean = false;
    trackById = trackById;

    constructor(
        private readonly _adminService: AdminService,
        private readonly _loaderService: LoaderService,
        private readonly _toastService: ToastService,
        private readonly _notificationService: NotificationService,
        private readonly _authService: AuthService
    ) {}

    ngOnInit(): void {
        this._authService.currentUserData$
            .pipe(takeUntil(this._destroy$))
            .subscribe((userData) => {
                if (userData && this._authService.isAdmin() && !this.hasLoadedData) {
                    this.hasLoadedData = true;
                    this.loadUsersWithTodos();
                }
            });
        
        this._notificationService.notificationEvents$
            .pipe(
                debounceTime(300),
                takeUntil(this._destroy$)
            )
            .subscribe((notification) => {
                if (notification.todo_id) {
                    this.loadUsersWithTodos();
                }
            });
    }

    loadUsersWithTodos(): void {
        this._loaderService.show();
        this._adminService.getUsersWithTodos()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (data) => {
                    this.originalTodosMap.clear();
                    data.forEach(userData => {
                        this.originalTodosMap.set(userData.user.id, userData.todos);
                    });
                    
                    this.usersWithTodos = data.map(userData => ({
                        ...userData,
                        todos: userData.todos.filter(todo => todo.status !== 'done'),
                        todo_count: userData.todos.filter(todo => todo.status !== 'done').length
                    }));
                    this._loaderService.hide();
                },
                error: (error) => {
                    this._loaderService.hide();
                    this._toastService.error(error?.error?.detail || 'Failed to load users and todos');
                }
            });
    }

    trackByUserId(index: number, item: IUserWithTodos): number {
        return item.user.id;
    }

    toggleUserExpansion(userId: number): void {
        const userData = this.usersWithTodos.find(u => u.user.id === userId);
        if (!userData || userData.todos.length === 0) {
            return;
        }
        
        if (this.expandedUsers.has(userId)) {
            this.expandedUsers.delete(userId);
        } else {
            this.expandedUsers.add(userId);
        }
    }

    isUserExpanded(userId: number): boolean {
        return this.expandedUsers.has(userId);
    }

    getCompletedCount(userId: number): number {
        const originalTodos = this.originalTodosMap.get(userId);
        if (!originalTodos) return 0;
        return originalTodos.filter(t => t.status === 'done').length;
    }

    getPriorityClass(priority: string): string {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            case 'low':
                return 'priority-low';
            default:
                return '';
        }
    }

    getDueDateUrgencyClass(dateString?: string): string {
        if (!dateString) return '';
        
        const dueDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const diffTime = dueDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays <= 3) return 'urgency-high';
        if (diffDays <= 10) return 'urgency-medium';
        return 'urgency-low';
    }

    formatDate(dateString?: string): { date: string; day: string; time: string } | null {
        if (!dateString) return null;
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return null;

        return {
            date: date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            day: date.toLocaleDateString(undefined, { weekday: 'long' }),
            time: date.toLocaleTimeString(undefined, { 
                hour: '2-digit', 
                minute: '2-digit' 
            })
        };
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
