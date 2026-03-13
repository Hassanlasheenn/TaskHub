import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil } from "rxjs";
import { LoaderService } from "../../../core/services/loader.service";

@Component({
    selector: 'app-loader',
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss'],
    standalone: true,
    imports: [CommonModule],
})
export class LoaderComponent implements OnInit, OnDestroy {
    isLoading: boolean = false;
    private readonly _destroy$ = new Subject<void>();

    constructor(private readonly _loaderService: LoaderService) {}

    ngOnInit(): void {
        this._loaderService.isLoading$
            .pipe(takeUntil(this._destroy$))
            .subscribe(loading => {
                this.isLoading = loading;
                document.body.style.overflow = loading ? 'hidden' : '';
            });
    }

    ngOnDestroy(): void {
        this._destroy$.next();
        this._destroy$.complete();
        document.body.style.overflow = '';
    }
}

