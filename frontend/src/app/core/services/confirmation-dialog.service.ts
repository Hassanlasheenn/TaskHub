import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { first } from "rxjs/operators";

export interface ConfirmationDialogConfig {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmButtonClass?: string;
}

export interface ConfirmationDialogResult {
    confirmed: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {
    private dialogSubject = new Subject<ConfirmationDialogConfig | null>();
    private resultSubject = new Subject<ConfirmationDialogResult>();

    show(config: ConfirmationDialogConfig): Observable<ConfirmationDialogResult> {
        this.dialogSubject.next(config);
        // Use first() to ensure the observable completes after the first emission
        // This prevents multiple subscriptions from receiving the same result
        return this.resultSubject.asObservable().pipe(first());
    }

    getDialogConfig(): Observable<ConfirmationDialogConfig | null> {
        return this.dialogSubject.asObservable();
    }

    confirm(): void {
        this.resultSubject.next({ confirmed: true });
        this.dialogSubject.next(null);
    }

    cancel(): void {
        this.resultSubject.next({ confirmed: false });
        this.dialogSubject.next(null);
    }
}
