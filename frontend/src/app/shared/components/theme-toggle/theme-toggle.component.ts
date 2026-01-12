import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { ThemeService, ThemeMode } from "../../../core/services/theme.service";

@Component({
    selector: 'app-theme-toggle',
    templateUrl: './theme-toggle.component.html',
    styleUrls: ['./theme-toggle.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class ThemeToggleComponent implements OnInit, OnDestroy {
    currentTheme: ThemeMode = 'light';
    private readonly _destroy$ = new Subject<void>();

    constructor(private readonly _themeService: ThemeService) {}

    ngOnInit(): void {
        this._themeService.theme$
            .pipe(takeUntil(this._destroy$))
            .subscribe(theme => {
                this.currentTheme = theme;
            });
    }

    toggleTheme(): void {
        this._themeService.toggleTheme();
    }

    get isDarkMode(): boolean {
        return this.currentTheme === 'dark';
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
    }
}
