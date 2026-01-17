import { Component, Output, EventEmitter, Input } from "@angular/core";
import { CommonModule } from "@angular/common";

export type QuickFilterType = 'all' | 'today' | 'thisWeek';

@Component({
    selector: 'app-quick-filters',
    templateUrl: './quick-filters.component.html',
    styleUrls: ['./quick-filters.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class QuickFiltersComponent {
    @Input() activeFilter: QuickFilterType = 'all';
    @Output() filterChange = new EventEmitter<QuickFilterType>();

    filters: { type: QuickFilterType; label: string; icon: string }[] = [
        { type: 'all', label: 'All', icon: 'bi-list-ul' },
        { type: 'today', label: 'Today', icon: 'bi-calendar-check' },
        { type: 'thisWeek', label: 'This Week', icon: 'bi-calendar-week' }
    ];

    onFilterClick(filterType: QuickFilterType): void {
        this.activeFilter = filterType;
        this.filterChange.emit(filterType);
    }
}

