import { Component, Output, EventEmitter, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
    selector: 'app-search-bar',
    templateUrl: './search-bar.component.html',
    styleUrls: ['./search-bar.component.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class SearchBarComponent {
    @Input() placeholder: string = 'Search todos...';
    @Output() searchChange = new EventEmitter<string>();
    
    searchQuery: string = '';

    onSearchChange(): void {
        this.searchChange.emit(this.searchQuery);
    }

    clearSearch(): void {
        this.searchQuery = '';
        this.searchChange.emit('');
    }
}

