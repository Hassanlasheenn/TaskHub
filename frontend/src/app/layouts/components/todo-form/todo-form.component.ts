import { Component, Output, EventEmitter, OnInit, Input, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { FormGroup } from "@angular/forms";
import { DynamicFormComponent } from "../../../shared/components/dynamic-form/dynamic-form.component";
import { ReactiveFormService } from "../../../shared/services/reactive-form.service";
import { IFieldControl } from "../../../shared/interfaces/IFieldControl.interface";
import { InputTypes } from "../../../shared/enums/input-types.enum";
import { ValidatorTypes } from "../../../shared/enums/validator-types.enum";
import { ITodoCreate, ITodoUpdate } from "../../../core/interfaces/todo.interface";
import { ITodo } from "../todo-list/todo-list.component";
import { UserService } from "../../../core/services/user.service";
import { IUserListResponse } from "../../../auth/interfaces";
import { Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../auth/services/auth.service";

type PriorityLevel = 'low' | 'medium' | 'high';

@Component({
    selector: 'app-todo-form',
    templateUrl: './todo-form.component.html',
    styleUrls: ['./todo-form.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, DynamicFormComponent],
})
export class TodoFormComponent implements OnInit, OnDestroy {
    @Input() editingTodo: ITodo | null = null;
    @Output() submitTodo = new EventEmitter<ITodoCreate>();
    @Output() updateTodo = new EventEmitter<{ id: number; data: ITodoUpdate }>();
    @Output() cancel = new EventEmitter<void>();

    private readonly _destroy$ = new Subject<void>();
    form: FormGroup = new FormGroup({});
    isSubmitted: boolean = false;
    errorSummary: string | null = null;
    isEditMode: boolean = false;
    users: IUserListResponse[] = [];
    selectedUserId: number | null = null;
    isAdmin: boolean = false;

    fields: IFieldControl[] = [
        {
            label: 'Title',
            type: InputTypes.TEXT,
            formControlName: 'title',
            placeholder: 'Enter todo title',
            value: '',
            required: true,
            validations: [
                { type: ValidatorTypes.REQUIRED, message: 'Title is required' },
                { type: ValidatorTypes.MINLENGTH, message: 'Title must be at least 3 characters', value: 3 }
            ],
        },
        {
            label: 'Description',
            type: InputTypes.TEXT,
            formControlName: 'description',
            placeholder: 'Enter description (optional)',
            value: '',
            required: false,
            validations: [],
        },
        {
            label: 'Assign To',
            type: InputTypes.DROPDOWN,
            formControlName: 'assigned_to_user_id',
            placeholder: 'Select user',
            value: null,
            required: false,
            validations: [],
            options: [],
        },
    ];

    priorities: { value: PriorityLevel; label: string; icon: string; color: string }[] = [
        { value: 'low', label: 'Low', icon: 'bi-arrow-down', color: '#28a745' },
        { value: 'medium', label: 'Medium', icon: 'bi-dash', color: '#ffc107' },
        { value: 'high', label: 'High', icon: 'bi-arrow-up', color: '#dc3545' },
    ];

    selectedPriority: PriorityLevel = 'medium';
    selectedCategory: string = 'Other';
    customCategory: string = '';
    isOtherCategory: boolean = false;
    isCompleted: boolean = false;
    availableCategories: string[] = ['Work', 'Personal', 'Shopping', 'Health', 'Learning', 'Other'];

    constructor(
        private readonly _formService: ReactiveFormService,
        private readonly _userService: UserService,
        private readonly _authService: AuthService
    ) {}

    ngOnInit(): void {
        this.isAdmin = this._authService.isAdmin();
        this.updateFieldsBasedOnRole();
        this.form = this._formService.initializeForm(this.fields);
            
        if (this.isAdmin) {
            this.loadUsers();
        }
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    updateFieldsBasedOnRole(): void {
        if (!this.isAdmin) {
            this.fields = this.fields.filter(f => f.formControlName !== 'assigned_to_user_id');
        }
    }

    loadUsers(): void {
        if (!this.isAdmin) {
            return;
        }
        
        this._userService.getUsersWithRoleUser()
            .pipe(takeUntil(this._destroy$))
            .subscribe({
                next: (users) => {
                    this.users = users;
                    this.updateUserDropdownField();
                    
                    if (!this.form.get('assigned_to_user_id')) {
                        this.form = this._formService.initializeForm(this.fields);
                    }
                    
                    if (this.isEditMode && this.editingTodo) {
                        this.populateFormData(this.editingTodo);
                    }
                },
                error: (error) => {
                    console.error('Failed to load users:', error);
                }
            });
    }

    updateUserDropdownField(): void {
        const userFieldIndex = this.fields.findIndex(f => f.formControlName === 'assigned_to_user_id');
        if (userFieldIndex !== -1) {
            this.fields[userFieldIndex].options = this.users.map(user => ({ key: user.id, value: user.username }));
        }
    }

    selectPriority(priority: PriorityLevel): void {
        this.selectedPriority = priority;
    }

    selectCategory(category: string): void {
        if (category === 'Other') {
            if (this.selectedCategory === 'Other') {
                this.isOtherCategory = false;
                this.selectedCategory = '';
                this.customCategory = '';
            } else {
                this.isOtherCategory = true;
                this.selectedCategory = 'Other';
                this.customCategory = '';
            }
        } else {
            this.isOtherCategory = false;
            this.selectedCategory = this.selectedCategory === category ? '' : category;
            this.customCategory = '';
        }
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.isSubmitted = true;
            return;
        }

        if (this.isOtherCategory && !this.customCategory.trim()) {
            this.errorSummary = 'Please enter a custom category name';
            this.isSubmitted = true;
            return;
        }

        let categoryToUse: string | undefined = undefined;
        if (this.isOtherCategory && this.customCategory.trim()) {
            categoryToUse = this.customCategory.trim();
        } else if (this.selectedCategory && this.selectedCategory !== 'Other') {
            categoryToUse = this.selectedCategory;
        } else if (this.selectedCategory === 'Other' && !this.isOtherCategory) {
            categoryToUse = 'Other';
        }

        const assignedUserId = this.isAdmin ? (this.form.get('assigned_to_user_id')?.value || null) : null;
        const todoData: ITodoCreate = {
            title: this.form.get('title')?.value,
            description: this.form.get('description')?.value || undefined,
            priority: this.selectedPriority,
            category: categoryToUse,
            assigned_to_user_id: assignedUserId
        };

        if (this.isEditMode && this.editingTodo) {
            const updateData: ITodoUpdate = {
                title: todoData.title,
                description: todoData.description,
                priority: todoData.priority,
                category: todoData.category,
                completed: this.isCompleted,
                assigned_to_user_id: todoData.assigned_to_user_id
            };
            this.updateTodo.emit({ 
                id: this.editingTodo.id, 
                data: updateData
            });
        } else {
            this.submitTodo.emit(todoData);
        }
    }

    onCancel(): void {
        this.cancel.emit();
    }

    resetForm(): void {
        this.form.reset();
        this.selectedPriority = 'medium';
        this.selectedCategory = 'Other';
        this.customCategory = '';
        this.isOtherCategory = false;
        this.isCompleted = false;
        this.isSubmitted = false;
        this.errorSummary = null;
        this.isEditMode = false;
        this.editingTodo = null;
        this.selectedUserId = null;
    }

    populateForm(todo: ITodo): void {
        this.isEditMode = true;
        this.editingTodo = todo;
        this.selectedUserId = todo.assigned_to_user_id || null;
        
        // Ensure users are loaded before populating form
        if (this.users.length === 0) {
            // Users not loaded yet, wait for them - loadUsers will call populateFormData
            this.loadUsers();
            return;
        }
        
        // Users already loaded, populate form data directly
        this.populateFormData(todo);
    }

    private populateFormData(todo: ITodo): void {
        // Ensure form has all controls
        if (this.isAdmin && !this.form.get('assigned_to_user_id')) {
            this.form = this._formService.initializeForm(this.fields);
        }
        
        // Update dropdown options if admin
        if (this.isAdmin) {
            this.updateUserDropdownField();
        }
        
        const formValue: any = {
            title: todo.title,
            description: todo.description || ''
        };
        
        // Only include assigned_to_user_id if admin
        if (this.isAdmin) {
            formValue.assigned_to_user_id = todo.assigned_to_user_id || null;
        }
        
        this.form.patchValue(formValue);
        this.selectedPriority = todo.priority;
        
        if (todo.category) {
            if (this.availableCategories.includes(todo.category)) {
                this.selectedCategory = todo.category;
                this.isOtherCategory = false;
                this.customCategory = '';
            } else {
                this.selectedCategory = 'Other';
                this.isOtherCategory = true;
                this.customCategory = todo.category;
            }
        } else {
            this.selectedCategory = 'Other';
            this.isOtherCategory = false;
            this.customCategory = '';
        }
        
        this.isCompleted = todo.completed;
    }

    toggleCompleted(): void {
        this.isCompleted = !this.isCompleted;
    }
}

