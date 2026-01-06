import { Component, HostListener, OnInit, OnDestroy } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";
import { NgIf } from "@angular/common";
import { filter, Subject, takeUntil } from "rxjs";
import { AuthService } from "../../../auth/services";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    standalone: true,
    styleUrls: ['./header.component.scss'],
    imports: [NgIf]
})
export class HeaderComponent implements OnInit, OnDestroy {
    private readonly _destroy$ = new Subject<void>();
    isDropdownOpen = false;
    isAuthenticated = false;
    userEmail: string = '';

    constructor(
        private readonly _authService: AuthService,
        private readonly _router: Router
    ) {}

    ngOnInit(): void {
        this.checkAuthentication();
        
        this._router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                takeUntil(this._destroy$)
            )
            .subscribe(() => {
                this.checkAuthentication();
            });
    }

    private checkAuthentication(): void {
        this.isAuthenticated = this._authService.isAuthenticated();
        
        if (this.isAuthenticated) {
            const userData = this._authService.getCurrentUserData();
            this.userEmail = userData?.email || '';
        } else {
            this.userEmail = '';
        }
    }

    toggleDropdown(): void {
        this.isDropdownOpen = !this.isDropdownOpen;
    }

    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent): void {
        const target = event.target as HTMLElement;
        if (!target.closest('.dropdown')) {
            this.isDropdownOpen = false;
        }
    }

    onProfile(): void {
        this.isDropdownOpen = false;
        // Profile page navigation will be implemented later
    }

    onLogout(): void {
        this.isDropdownOpen = false;
        this.isAuthenticated = false;
        this.userEmail = '';
        this._authService.logout().subscribe({
            next: () => {
                this._router.navigate(['/login']);
            },
            error: () => {
                this._router.navigate(['/login']);
            }
        });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}