import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CURRENT_SPONSORS } from '../generated/sponsors.generated';

@Component({
  selector: 'app-footer-sponsors',
  templateUrl: './footer-sponsors.html',
  styleUrl: './footer-sponsors.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterSponsors {
  readonly supportUrl = input.required<string>();
  protected readonly sponsors = CURRENT_SPONSORS;
}
