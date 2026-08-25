export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
  sameSite?: boolean;
  mobile?: boolean;
}

export interface FeaturedProject {
  name: string;
  packageName: string;
  description: string;
  repositoryUrl: string;
  docsUrl: string;
}

export const SITE = {
  name: 'rdlabo.dev',
  tagline: 'Open-source tools for Ionic, Angular, and Capacitor.',
  description: 'Personal open source projects maintained by rdlabo.',
  docsUrl: 'https://docs.rdlabo.dev',
  supportUrl: 'https://docs.rdlabo.dev/support',
  sponsorUrl: 'https://github.com/sponsors/rdlabo?metadata_campaign=rdlabo-home',
  githubUrl: 'https://github.com/rdlabo-dev',
  zennUrl: 'https://zenn.dev/rdlabo',
  xUrl: 'https://x.com/rdlabo',
} as const;

export const NAV_LINKS: readonly NavLink[] = [
  { label: 'Articles', href: '/articles' },
  { label: 'Docs', href: SITE.docsUrl, sameSite: true },
  { label: 'Support', href: SITE.supportUrl, sameSite: true },
  { label: 'GitHub', href: SITE.githubUrl, external: true, mobile: false },
];

export const FEATURED_PROJECTS: readonly FeaturedProject[] = [
  {
    name: 'Capacitor Community Stripe',
    packageName: '@capacitor-community/stripe',
    description:
      'Native Stripe payments for Capacitor apps — PaymentSheet, Apple Pay, Google Pay, and web checkout from one codebase.',
    repositoryUrl: 'https://github.com/capacitor-community/stripe',
    docsUrl: 'https://docs.rdlabo.dev/projects/capacitor-stripe',
  },
  {
    name: 'Ionic Theme iOS26',
    packageName: '@rdlabo/ionic-theme-ios26',
    description:
      'Bring iOS 26 design, transitions, and Liquid Glass interactions to Ionic components with dark mode support.',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-ios26',
    docsUrl: 'https://docs.rdlabo.dev/projects/ionic-theme-ios26',
  },
  {
    name: 'Ionic Theme MD3',
    packageName: '@rdlabo/ionic-theme-md3',
    description:
      'Material Design 3 styling for Ionic applications, compatible with the iOS26 theme from a single HTML structure.',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-md3',
    docsUrl: 'https://docs.rdlabo.dev/projects/ionic-theme-md3',
  },
  {
    name: 'Angular CDK Scroll Strategies',
    packageName: '@rdlabo/ngx-cdk-scroll-strategies',
    description:
      'Dynamic item-size strategies for Angular CDK virtual scrolling, including reverse layouts and stable geometry.',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-library',
    docsUrl: 'https://docs.rdlabo.dev/projects/ngx-cdk-scroll-strategies',
  },
];
