import { Component, Output, EventEmitter, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { trackById } from "../../../../../shared/helpers/trackByFn.helper";

export type TodoStatus = 'all' | 'new' | 'inProgress' | 'paused' | 'done';

@Component({
    selector: 'app-status-filter',
    templateUrl: './status-filter.component.html',
    styleUrls: ['./status-filter.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class StatusFilterComponent {
    @Input() activeStatus: TodoStatus = 'all';
    @Output() statusChange = new EventEmitter<TodoStatus>();
    trackById = trackById;

    statuses: { value: TodoStatus; label: string }[] = [
        { value: 'all', label: 'All' },
        { value: 'new', label: 'New' },
        { value: 'inProgress', label: 'In Progress' },
        { value: 'paused', label: 'Paused' },
        { value: 'done', label: 'Done' }
    ];

    onStatusChange(event: Event): void {
        const target = event.target as HTMLSelectElement;
        const status = target.value as TodoStatus;
        this.activeStatus = status;
        this.statusChange.emit(status);
    }
}
