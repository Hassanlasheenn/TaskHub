import { CommonModule, isPlatformBrowser } from "@angular/common";
import { Component, Input, OnChanges, OnDestroy, Output, EventEmitter, PLATFORM_ID, inject } from "@angular/core";
import { animate, state, style, transition, trigger } from "@angular/animations";

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    standalone: true,
    imports: [CommonModule],
    animations: [
        trigger('slideInOut', [
            state('void', style({ transform: '{{initialTransform}}' }), { params: { initialTransform: 'translateX(100%)' } }),
            state('*', style({ transform: 'none' })),
            transition('void => *', [
                animate('300ms ease-out')
            ]),
            transition('* => void', [
                animate('300ms ease-in', style({ transform: '{{exitTransform}}' }))
            ], { params: { exitTransform: 'translateX(100%)' } })
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
export class SidebarComponent implements OnChanges, OnDestroy {
    @Input() isOpen: boolean = false;
    @Input() title: string = '';
    @Input() width: string = '400px';
    @Input() position: 'left' | 'right' = 'right';
    @Output() closed = new EventEmitter<void>();

    private readonly _platformId = inject(PLATFORM_ID);

    ngOnChanges(): void {
        this.updateBodyScrollLock();
    }

    get animationParams() {
        return {
            value: this.isOpen,
            params: {
                initialTransform: this.position === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
                exitTransform: this.position === 'right' ? 'translateX(100%)' : 'translateX(-100%)'
            }
        };
    }

    ngOnDestroy(): void {
        this.setBodyScrollLock(false);
    }

    private updateBodyScrollLock(): void {
        this.setBodyScrollLock(this.isOpen);
    }

    private setBodyScrollLock(lock: boolean): void {
        if (!isPlatformBrowser(this._platformId)) return;

        const overflow = lock ? 'hidden' : '';
        document.documentElement.style.overflow = overflow;
        document.body.style.overflow = overflow;
        const pageWrapper = document.querySelector('.page-wrapper');
        if (pageWrapper instanceof HTMLElement) {
            pageWrapper.style.overflow = overflow;
        }
    }

    onClose(): void {
        this.setBodyScrollLock(false);
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
