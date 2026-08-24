import { Component, input } from '@angular/core';

@Component({
  selector: 'app-oss-resource-links',
  template: `
    <nav aria-label="Resources">
      <ul class="oss-resource-links__list">
        <li>
          <a class="oss-resource-links__link" [href]="supportHref()">
            <svg
              class="oss-resource-links__icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3A6 6 0 0 1 12 5.09 6 6 0 0 1 16.5 3C19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35Z"
              />
            </svg>
            Support my OSS
          </a>
        </li>
        <li>
          <a
            class="oss-resource-links__link external-link"
            href="https://zenn.dev/rdlabo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              class="oss-resource-links__icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M7 5h10v14H7V5Z"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linejoin="round"
              />
              <path
                d="M9 9h6M9 12h6M9 15h4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
              />
            </svg>
            Zenn
          </a>
        </li>
        <li>
          <a
            class="oss-resource-links__link external-link"
            href="https://x.com/rdlabo"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              class="oss-resource-links__icon"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644Z"
              />
            </svg>
            X / @rdlabo
          </a>
        </li>
      </ul>
    </nav>
  `,
  styles: `
    :host {
      display: block;
    }

    .oss-resource-links__list {
      display: grid;
      gap: 0.65rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .oss-resource-links__link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: #333;
      font-size: 0.82rem;
      font-weight: 400;
      line-height: 1.25rem;
      text-decoration: none;
    }

    .oss-resource-links__link:hover,
    .oss-resource-links__link:focus-visible {
      color: var(--site-accent-strong, #c44320);
    }

    .oss-resource-links__link:focus-visible {
      border-radius: 0.125rem;
      outline: 2px solid var(--site-accent, #ea572a);
      outline-offset: 2px;
    }

    .oss-resource-links__icon {
      width: 0.875rem;
      height: 0.875rem;
      flex-shrink: 0;
    }
  `,
})
export class OssResourceLinksComponent {
  readonly supportHref = input('/support');
}
