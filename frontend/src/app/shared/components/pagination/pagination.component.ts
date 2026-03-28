import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.component.html',
    styleUrls: ['./pagination.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class PaginationComponent implements OnChanges {
    @Input() currentPage: number = 1;
    @Input() pageSize: number = 5;
    @Input() totalItems: number = 0;

    @Output() pageChange = new EventEmitter<number>();
    @Output() pageSizeChange = new EventEmitter<number>();

    @Input() pageSizeOptions: number[] = [5, 10];
    pages: Array<number | null> = [];

    get isDisabled(): boolean {
        return this.totalItems < 5;
    }

    get totalPages(): number {
        return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    }

    get startItem(): number {
        return Math.min((this.currentPage - 1) * this.pageSize + 1, this.totalItems);
    }

    get endItem(): number {
        return Math.min(this.currentPage * this.pageSize, this.totalItems);
    }

    ngOnChanges(): void {
        this.pages = this._buildPages();
    }

    private _buildPages(): Array<number | null> {
        const total = this.totalPages;
        if (total <= 7) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }
        const cur = this.currentPage;
        if (cur <= 4) return [1, 2, 3, 4, 5, null, total];
        if (cur >= total - 3) return [1, null, total - 4, total - 3, total - 2, total - 1, total];
        return [1, null, cur - 1, cur, cur + 1, null, total];
    }

    onPageChange(page: number): void {
        if (page < 1 || page > this.totalPages || page === this.currentPage) return;
        this.pageChange.emit(page);
    }

    onSizeChange(size: number): void {
        if (size === this.pageSize) return;
        this.pageSizeChange.emit(size);
    }
}
