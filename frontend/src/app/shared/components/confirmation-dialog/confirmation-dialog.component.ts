import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { ConfirmationDialogService, ConfirmationDialogConfig } from "../../../core/services/confirmation-dialog.service";

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class ConfirmationDialogComponent implements OnInit, OnDestroy {
    private readonly _destroy$ = new Subject<void>();
    
    title: string = 'Confirm Action';
    message: string = 'Are you sure you want to proceed?';
    confirmText: string = 'Confirm';
    cancelText: string = 'Cancel';
    confirmButtonClass: string = 'btn-danger';
    isVisible: boolean = false;

    constructor(private readonly _dialogService: ConfirmationDialogService) {}

    ngOnInit(): void {
        this._dialogService.getDialogConfig()
            .pipe(takeUntil(this._destroy$))
            .subscribe(config => {
                if (config) {
                    this.title = config.title || 'Confirm Action';
                    this.message = config.message;
                    this.confirmText = config.confirmText || 'Confirm';
                    this.cancelText = config.cancelText || 'Cancel';
                    this.confirmButtonClass = config.confirmButtonClass || 'btn-danger';
                    this.isVisible = true;
                } else {
                    this.isVisible = false;
                }
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }

    onConfirm(): void {
        this._dialogService.confirm();
    }

    onCancel(): void {
        this._dialogService.cancel();
    }

    onBackdropClick(event: MouseEvent): void {
        if ((event.target as HTMLElement).classList.contains('dialog-backdrop')) {
            this.onCancel();
        }
    }
}
