import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [CommonModule],
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ transform: 'translateX(100%)' }),
                animate('300ms ease-out', style({ transform: 'translateX(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in', style({ transform: 'translateX(100%)' }))
            ])
        ]),
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms ease-out', style({ opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ opacity: 0 }))
            ])
        ])
    ]
})
export class SidebarComponent implements OnInit, OnDestroy {
    @Input() isOpen: boolean = false;
    @Input() title: string = '';
    @Input() width: string = '400px';
    @Output() closed = new EventEmitter<void>();

    ngOnInit(): void {
        if (this.isOpen) {
            document.body.style.overflow = 'hidden';
        }
    }

    ngOnDestroy(): void {
        document.body.style.overflow = '';
    }

    onClose(): void {
        document.body.style.overflow = '';
        this.closed.emit();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('sidebar-backdrop')) {
            this.onClose();
        }
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Escape') {
            this.onClose();
        }
    }
}

