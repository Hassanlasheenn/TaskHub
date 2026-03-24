import { Injectable, inject, Inject, PLATFORM_ID } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private title = inject(Title);
  private meta = inject(Meta);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  private readonly DEFAULT_TITLE = 'Taskrr - Your Central Platform for Task Management';
  private readonly DEFAULT_DESCRIPTION = 'Manage your tasks efficiently with Taskrr. The ultimate task management tool for individuals and teams.';
  private readonly DEFAULT_KEYWORDS = 'task management, todo list, productivity, project management, team collaboration';

  constructor(@Inject(DOCUMENT) private doc: Document) {}

  init() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateMetaTags();
    });
  }

  updateMetaTags(config?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
  }) {
    const title = config?.title ? `${config.title} | Taskrr` : this.DEFAULT_TITLE;
    const description = config?.description || this.DEFAULT_DESCRIPTION;
    const keywords = config?.keywords || this.DEFAULT_KEYWORDS;
    const image = config?.image || 'https://taskrr.app/assets/og-image.png'; // Update with real URL if available
    const url = config?.url || `https://taskrr.app${this.router.url}`;
    const type = config?.type || 'website';

    this.title.setTitle(title);

    // Standard Meta Tags
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ name: 'keywords', content: keywords });

    // Canonical Link
    this.updateCanonicalLink(url);

    // Open Graph / Facebook
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: type });

    // Twitter
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });
  }

  setStructuredData(data: any) {
    if (isPlatformBrowser(this.platformId)) {
      const script = this.doc.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(data);
      this.doc.head.appendChild(script);
    }
  }

  private updateCanonicalLink(url: string) {
    if (isPlatformBrowser(this.platformId)) {
      let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
      if (!link) {
        link = this.doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.doc.head.appendChild(link);
      }
      link.setAttribute('href', url);
    }
  }
}
