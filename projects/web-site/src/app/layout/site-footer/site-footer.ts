import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { FooterSponsors } from '../../../../../docs/src/app/footer-sponsors/footer-sponsors';

import { NAV_LINKS, SITE } from '../../site-config';

@Component({
  selector: 'app-site-footer',
  imports: [RouterLink, FooterSponsors],
  templateUrl: './site-footer.html',
})
export class SiteFooter {
  protected readonly site = SITE;
  protected readonly navLinks = NAV_LINKS;
  protected readonly currentYear = new Date().getFullYear();
}
