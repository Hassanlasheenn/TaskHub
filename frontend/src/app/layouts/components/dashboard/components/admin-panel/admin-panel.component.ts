import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { AdminService, IUserWithTodos } from "../../../../../core/services/admin.service";
import { LoaderService } from "../../../../../core/services/loader.service";
import { ToastService } from "../../../../../core/services/toast.service";
import { ITodoResponse } from "../../../../../core/interfaces/todo.interface";

@Component({
    selector: 'app-admin-panel',
    templateUrl: './admin-panel.component.html',
    styleUrls: ['./admin-panel.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class AdminPanelComponent implements OnInit, OnDestroy {
    private readonly _destroy$ = new Subject<void>();
    usersWithTodos: IUserWithTodos[] = [];
    expandedUsers: Set<number> = new Set();

    constructor(
        private readonly _adminService: AdminService,
        private readonly _loaderService: LoaderService,
        private readonly _toastService: ToastService
    ) {}

    ngOnInit(): void {
        this.loadUsersWithTodos();
    }

    loadUsersWithTodos(): void {
        this._loaderService.show();
        this._adminService.getUsersWithTodos()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (data) => {
                    this.usersWithTodos = data;
                    this._loaderService.hide();
                },
                error: (error) => {
                    this._loaderService.hide();
                    this._toastService.error(error?.error?.detail || 'Failed to load users and todos');
                }
            });
    }

    toggleUserExpansion(userId: number): void {
        const userData = this.usersWithTodos.find(u => u.user.id === userId);
        // Only allow expansion if user has todos
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

    getCompletedCount(todos: ITodoResponse[]): number {
        return todos.filter(t => t.completed).length;
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

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
