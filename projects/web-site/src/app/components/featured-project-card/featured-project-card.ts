import { Component, input } from '@angular/core';

import { FeaturedProject } from '../../site-config';

@Component({
  selector: 'app-featured-project-card',
  template: `
    <a class="featured-project-card" [href]="project().docsUrl">
      <span class="featured-project-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M8 4h8l4 4v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3Z"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linejoin="round"
          />
          <path
            d="M16 4v4h4M8 13h8M8 17h5"
            stroke="currentColor"
            stroke-width="1.75"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <h3 class="featured-project-card__title">{{ project().name }}</h3>
      <p class="featured-project-card__package">{{ project().packageName }}</p>
      <p class="featured-project-card__description">{{ project().description }}</p>
      <span class="featured-project-card__cta">Read documentation</span>
    </a>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }

      .featured-project-card {
        display: flex;
        height: 100%;
        min-height: 16.25rem;
        flex-direction: column;
        padding: 1.75rem;
        border: 1px solid #e5d9d3;
        border-radius: 1.5rem;
        background: #fff;
        color: #292320;
        text-decoration: none;
        transition:
          transform 0.2s ease,
          border-color 0.2s ease,
          box-shadow 0.2s ease,
          background-color 0.2s ease,
          color 0.2s ease;
      }

      .featured-project-card:hover {
        border-color: #ea572a;
        box-shadow: 0 18px 50px rgba(72, 43, 30, 0.1);
        transform: translateY(-4px);
      }

      .featured-project-card:focus-visible {
        outline: 2px solid #ea572a;
        outline-offset: 4px;
      }

      .featured-project-card__icon {
        display: flex;
        width: 3.5rem;
        height: 3.5rem;
        align-items: center;
        justify-content: center;
        border-radius: 1rem;
        background: #fff0ea;
        color: #d64a23;
        transition:
          background-color 0.2s ease,
          color 0.2s ease;
      }

      .featured-project-card__icon svg {
        width: 1.5rem;
        height: 1.5rem;
      }

      .featured-project-card:hover .featured-project-card__icon {
        background: #ea572a;
        color: #fff;
      }

      .featured-project-card__title {
        margin: 1.75rem 0 0;
        font-size: 1.5rem;
        font-weight: 600;
        line-height: 1.2;
        letter-spacing: -0.035em;
      }

      .featured-project-card__package {
        margin: 0.5rem 0 0;
        font-family:
          ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
          monospace;
        font-size: 0.75rem;
        line-height: 1.25rem;
        color: #c44320;
      }

      .featured-project-card__description {
        flex: 1 1 auto;
        margin: 1rem 0 0;
        line-height: 1.75rem;
        color: #6f6661;
      }

      .featured-project-card__cta {
        margin-top: auto;
        padding-top: 1.75rem;
        font-size: 0.875rem;
        font-weight: 600;
        color: #c44320;
      }
    `,
  ],
})
export class FeaturedProjectCard {
  readonly project = input.required<FeaturedProject>();
}
