import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './layouts/components/header/header.component';
import { LoaderComponent } from './shared/components/loader/loader.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { PosthogService } from './core/services';
import { SeoService } from './core/services/seo.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, LoaderComponent, ToastComponent, ConfirmationDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private readonly _posthogService = inject(PosthogService);
  private readonly _router = inject(Router);
  private readonly _seoService = inject(SeoService);

  ngOnInit(): void {
    this._seoService.init();
    this._seoService.setStructuredData({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'Taskrr',
      'url': 'https://taskrr.app',
      'description': 'Manage your tasks efficiently with Taskrr. The ultimate task management tool for individuals and teams.',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': 'https://taskrr.app/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    });

    this._router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this._posthogService.capturePageView();
    });
  }
}
