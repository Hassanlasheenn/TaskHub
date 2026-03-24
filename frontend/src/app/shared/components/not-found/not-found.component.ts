import { CommonModule } from "@angular/common";
import { Component, OnInit, inject } from "@angular/core";
import { SeoService } from "../../../core/services/seo.service";

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    standalone: true,
    imports: [CommonModule]
})
export class NotFoundComponent implements OnInit {
    private readonly _seoService = inject(SeoService);

    ngOnInit(): void {
        this._seoService.updateMetaTags({
            title: '404 - Page Not Found',
            description: 'The page you are looking for does not exist on Taskrr.'
        });
    }
}