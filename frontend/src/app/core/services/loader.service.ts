import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {
    private readonly _isLoading$ = new BehaviorSubject<boolean>(false);
    private _loadingCount = 0;

    get isLoading$(): Observable<boolean> {
        return this._isLoading$.asObservable();
    }

    show(): void {
        this._loadingCount++;
        this._isLoading$.next(true);
    }

    hide(): void {
        this._loadingCount--;
        if (this._loadingCount <= 0) {
            this._loadingCount = 0;
            this._isLoading$.next(false);
        }
    }

    forceHide(): void {
        this._loadingCount = 0;
        this._isLoading$.next(false);
    }
}

