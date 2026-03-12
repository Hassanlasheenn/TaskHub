import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private readonly _toggleNavSidebar$ = new Subject<void>();
    toggleNavSidebar$ = this._toggleNavSidebar$.asObservable();

    toggleNavSidebar(): void {
        this._toggleNavSidebar$.next();
    }
}
