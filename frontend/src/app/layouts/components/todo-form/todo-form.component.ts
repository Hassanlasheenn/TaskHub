import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormGroup } from "@angular/forms";
import { DynamicFormComponent } from "../../../shared/components/dynamic-form/dynamic-form.component";
import { ReactiveFormService } from "../../../shared/services/reactive-form.service";
import { IFieldControl } from "../../../shared/interfaces/IFieldControl.interface";
import { InputTypes } from "../../../shared/enums/input-types.enum";
import { ValidatorTypes } from "../../../shared/enums/validator-types.enum";
import { ITodoCreate } from "../../../core/services/todo.service";

@Component({
    selector: 'app-todo-form',
    templateUrl: './todo-form.component.html',
    styleUrls: ['./todo-form.component.scss'],
    standalone: true,
    imports: [CommonModule, DynamicFormComponent],
})
export class TodoFormComponent implements OnInit {
    @Output() submitTodo = new EventEmitter<ITodoCreate>();
    @Output() cancel = new EventEmitter<void>();

    form: FormGroup = new FormGroup({});
    isSubmitted: boolean = false;
    errorSummary: string | null = null;

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
    ];

    priorities: { value: 'low' | 'medium' | 'high'; label: string; icon: string; color: string }[] = [
        { value: 'low', label: 'Low', icon: 'bi-arrow-down', color: '#28a745' },
        { value: 'medium', label: 'Medium', icon: 'bi-dash', color: '#ffc107' },
        { value: 'high', label: 'High', icon: 'bi-arrow-up', color: '#dc3545' },
    ];

    selectedPriority: 'low' | 'medium' | 'high' = 'medium';

    constructor(private readonly _formService: ReactiveFormService) {}

    ngOnInit(): void {
        this.form = this._formService.initializeForm(this.fields);
    }

    selectPriority(priority: 'low' | 'medium' | 'high'): void {
        this.selectedPriority = priority;
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.isSubmitted = true;
            return;
        }

        const todo: ITodoCreate = {
            title: this.form.get('title')?.value,
            description: this.form.get('description')?.value || undefined,
            priority: this.selectedPriority
        };

        this.submitTodo.emit(todo);
    }

    onCancel(): void {
        this.cancel.emit();
    }

    resetForm(): void {
        this.form.reset();
        this.selectedPriority = 'medium';
        this.isSubmitted = false;
        this.errorSummary = null;
    }
}

