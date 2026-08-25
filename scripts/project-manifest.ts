export type Locale = 'en' | 'ja';

export interface LocalizedText {
  en: string;
  ja: string;
}

export interface ProjectPageDefinition {
  title: LocalizedText;
  section: LocalizedText;
  slug: string;
  file: string;
  /** Optional intent-focused document title for SEO `<title>` metadata. */
  seoTitle?: LocalizedText;
  /** Optional explicit content update date (`YYYY-MM-DD`) for sitemap `<lastmod>`. */
  updatedAt?: LocalizedText;
  demo?: {
    url: string;
    title: LocalizedText;
  };
}

export interface ProjectFeatureDefinition {
  title: LocalizedText;
  description: LocalizedText;
}

export type ProjectCategoryId =
  'translations' | 'capacitor-plugins' | 'frontend-tools' | 'developer-tools';

export interface ProjectCategoryDefinition {
  id: ProjectCategoryId;
  label: LocalizedText;
  description: LocalizedText;
  order: number;
}

export interface ProjectDefinition {
  id: string;
  slug: string;
  sourceDirectory: string;
  name: string;
  shortName: string;
  localizedShortName?: LocalizedText;
  packageName: string;
  repositoryUrl: string;
  /** Optional interactive demo linked from the project Overview. */
  demoUrl?: string;
  /** Hosted documentation URL for catalog-only projects that are not rendered by this portal. */
  hostedUrl?: string;
  category: ProjectCategoryId;
  icon: 'payments' | 'identity' | 'terminal' | 'ads' | 'lint' | 'server' | 'app' | 'theme' | 'docs';
  adapter?: 'capacitor-docs-json' | 'markdown';
  /** Immutable Git ref override for English guides (default: installed package tag). */
  englishDocsRef?: string;
  /** Optional intent-focused document title for the project landing page SEO `<title>`. */
  seoTitle?: LocalizedText;
  description: LocalizedText;
  headline: LocalizedText;
  overview: LocalizedText;
  featuresHeading: LocalizedText;
  features: readonly ProjectFeatureDefinition[];
  pages: readonly ProjectPageDefinition[];
}

const text = (en: string, ja: string): LocalizedText => ({ en, ja });
const ionicAngularLibraryDocsRef = '92b474cc5e6228969b72a38a71f3e5ae18c8e005';

export const projectCategoryDefinitions: readonly ProjectCategoryDefinition[] = [
  {
    id: 'translations',
    label: text('Documentation translations', 'ドキュメント翻訳'),
    description: text(
      'Authorized Japanese translations linked from the official open-source project websites.',
      '公式プロジェクトのWebサイトから案内されている公認日本語翻訳です。',
    ),
    order: 5,
  },
  {
    id: 'capacitor-plugins',
    label: text('Capacitor plugins', 'Capacitorプラグイン'),
    description: text(
      'Native payments, identity verification, social login, in-person payments, mobile ads, scanning, screenshot events, and printing for Capacitor applications.',
      'Capacitorアプリ向けのネイティブ決済、本人確認、ソーシャルログイン、対面決済、モバイル広告、スキャン、スクリーンショット検知、印刷を提供します。',
    ),
    order: 10,
  },
  {
    id: 'frontend-tools',
    label: text('Frontend tools', 'フロントエンドツール'),
    description: text(
      'Reusable Angular and Ionic application libraries and UI utilities.',
      'Angular・Ionicアプリ向けの再利用可能なアプリケーションライブラリとUIユーティリティです。',
    ),
    order: 20,
  },
  {
    id: 'developer-tools',
    label: text('Developer tools', '開発ツール'),
    description: text(
      'Backend infrastructure and code-quality tooling for TypeScript projects.',
      'TypeScriptプロジェクト向けのバックエンド基盤とコード品質ツールです。',
    ),
    order: 30,
  },
];
interface PageOptions {
  seoTitle?: LocalizedText;
  updatedAt?: LocalizedText;
  demo?: ProjectPageDefinition['demo'];
}

const page = (
  enTitle: string,
  jaTitle: string,
  slug: string,
  file: string,
  enSection: string,
  jaSection: string,
  options: PageOptions = {},
): ProjectPageDefinition => ({
  title: text(enTitle, jaTitle),
  section: text(enSection, jaSection),
  slug,
  file,
  ...options,
});

const groupPage = (object: string, slug: string): ProjectPageDefinition =>
  page(object, object, slug, `${slug}.md`, 'Guides', 'ガイド');

const interactiveDemo = (
  url: string,
  enTitle: string,
  jaTitle: string,
): NonNullable<ProjectPageDefinition['demo']> => {
  const parsed = new URL(url);
  if (
    parsed.origin !== 'https://rdlabo-ionic-angular-library.netlify.app' ||
    !parsed.pathname.startsWith('/main/')
  ) {
    throw new Error(`Untrusted interactive demo URL: ${url}`);
  }
  return { url: parsed.href, title: text(enTitle, jaTitle) };
};

const eslintRuleNames = [
  'component-property-use-readonly',
  'deny-constructor-di',
  'deny-element',
  'deny-overlay-create',
  'deny-soft-private-modifier',
  'implements-ionic-lifecycle',
  'ionic-attr-type-check',
  'no-component-method-except-lifecycle',
  'no-component-writable-signal',
  'no-reactive-forms',
  'no-template-driven-forms',
  'prefer-disable-handler',
  'prefer-ionic-standalone',
  'prefer-modal-launcher',
  'require-ion-item-group',
  'require-viewmodel',
  'restrict-try-block',
  'signal-use-as-signal-template',
  'signal-use-as-signal',
] as const;

const eslintRulePages = eslintRuleNames.map((ruleName) =>
  page(ruleName, ruleName, `rules/${ruleName}`, `rules/${ruleName}.md`, 'Rules', 'ルール'),
);

export const projectDefinitions: readonly ProjectDefinition[] = [
  {
    id: 'ionic-docs',
    slug: 'ionic-docs',
    sourceDirectory: 'ionic-docs',
    name: 'Ionic Framework Japanese Documentation',
    shortName: 'Ionic Docs 日本語版',
    localizedShortName: text('Ionic Docs Japanese', 'Ionic Docs 日本語版'),
    packageName: 'Authorized Japanese translation',
    repositoryUrl: 'https://github.com/ionic-jp/ionic-docs',
    hostedUrl: 'https://ionicframework.jp/docs/',
    category: 'translations',
    icon: 'docs',
    adapter: 'markdown',
    description: text(
      'Authorized Japanese translation of the Ionic Framework documentation, linked from the official site.',
      'Ionic公式サイトから案内されている、Ionic Frameworkドキュメントの公認日本語翻訳。',
    ),
    headline: text(
      'Authorized Japanese documentation for Ionic Framework',
      'Ionic Frameworkの公認日本語ドキュメント',
    ),
    overview: text(
      'This portal hosts the authorized Japanese overview linked from ionicframework.com, covering the Web UI toolkit, cross-platform goals, and framework integrations.',
      'ionicframework.comから案内されている公認日本語翻訳の概要として、Web UI toolkit、クロスプラットフォーム、フレームワーク連携を紹介します。',
    ),
    featuresHeading: text('Highlights', '主なポイント'),
    features: [
      {
        title: text('Web UI toolkit', 'Web UI toolkit'),
        description: text(
          'Build performant mobile UX with HTML, CSS, and JavaScript components.',
          'HTML・CSS・JavaScriptのコンポーネントで、高性能なモバイルUXを構築します。',
        ),
      },
      {
        title: text('Cross-platform', 'Cross-platform'),
        description: text(
          'Ship one codebase to iOS, Android, and the mobile web.',
          'ひとつのコードベースからiOS、Android、モバイルWebへ配信します。',
        ),
      },
      {
        title: text('Framework integrations', 'Framework integrations'),
        description: text(
          'Use Ionic with Angular, React, Vue, or as standalone Web Components.',
          'Angular、React、Vue、またはスタンドアロンのWeb Componentsとして利用できます。',
        ),
      },
    ],
    pages: [],
  },
  {
    id: 'capacitor-docs',
    slug: 'capacitor-docs',
    sourceDirectory: 'capacitor-docs',
    name: 'Capacitor Japanese Documentation',
    shortName: 'Capacitor Docs 日本語版',
    localizedShortName: text('Capacitor Docs Japanese', 'Capacitor Docs 日本語版'),
    packageName: 'Authorized Japanese translation',
    repositoryUrl: 'https://github.com/ionic-jp/capacitor-docs',
    hostedUrl: 'https://capacitorjs.jp/docs',
    category: 'translations',
    icon: 'docs',
    adapter: 'markdown',
    description: text(
      'Authorized Japanese translation of the Capacitor documentation, linked from the official site.',
      '公式サイトから案内されている、Capacitorドキュメントの公認日本語翻訳。',
    ),
    headline: text(
      'Authorized Japanese documentation for Capacitor',
      'Capacitorの公認日本語ドキュメント',
    ),
    overview: text(
      'This portal hosts the authorized Japanese overview linked from the official documentation, covering the native runtime, native SDK access, and web-first workflow.',
      '公式ドキュメントから案内されている公認日本語翻訳の概要として、ネイティブランタイム、ネイティブSDKアクセス、Webファーストのワークフローを紹介します。',
    ),
    featuresHeading: text('Highlights', '主なポイント'),
    features: [
      {
        title: text('Native runtime', 'Native runtime'),
        description: text(
          'Run modern web apps natively on iOS, Android, and beyond.',
          'モダンなWebアプリをiOS、Androidをはじめとするプラットフォームでネイティブ実行します。',
        ),
      },
      {
        title: text('Native SDK access', 'Native SDK access'),
        description: text(
          'Reach device features through a consistent Plugin API when you need it.',
          '必要なときに一貫したPlugin API経由でデバイス機能へアクセスします。',
        ),
      },
      {
        title: text('Web-first workflow', 'Web-first workflow'),
        description: text(
          'Keep a web-first development flow without giving up native capabilities.',
          'ネイティブ機能を犠牲にせず、Webファーストの開発フローを維持します。',
        ),
      },
    ],
    pages: [],
  },
  {
    id: 'ionic-angular-kit',
    slug: 'ionic-angular-kit',
    sourceDirectory: 'ionic-angular-kit',
    name: 'rdlabo Ionic Angular Kit',
    shortName: 'Ionic Angular Kit',
    packageName: '@rdlabo/ionic-angular-kit',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-library',
    englishDocsRef: ionicAngularLibraryDocsRef,
    category: 'frontend-tools',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Shared application infrastructure for Ionic Angular projects.',
      'Ionic Angularプロジェクト向けの共有アプリケーション基盤。',
    ),
    headline: text(
      'Build consistent, resilient Ionic Angular applications',
      '一貫性と耐障害性を備えたIonic Angularアプリを構築する',
    ),
    overview: text(
      'Compose typed storage, overlays, authentication, HTTP policy, realtime connections, offline replicas, themes, reviews, printing, Firebase, and Live Updates from focused entry points.',
      '型安全なStorage、Overlay、認証、HTTPポリシー、Realtime接続、Offline Replica、Theme、Review、印刷、Firebase、Live Updateを用途別エントリポイントから構成します。',
    ),
    featuresHeading: text('Application infrastructure', '提供するアプリケーション基盤'),
    features: [
      {
        title: text('Storage and overlays', 'Storage・Overlay'),
        description: text(
          'Prevent lost writes and present typed Ionic modals, popovers, toasts, and alerts.',
          '書き込み損失を防ぎ、型安全なIonic Modal、Popover、Toast、Alertを表示します。',
        ),
      },
      {
        title: text('Authentication and HTTP', '認証・HTTP'),
        description: text(
          'Share route guards, access capability state, auth headers, safe retries, and error hooks.',
          'Route Guard、アクセス権限状態、認証Header、安全なretry、error hookを共有します。',
        ),
      },
      {
        title: text('Offline and realtime', 'Offline・Realtime'),
        description: text(
          'Coordinate scoped local replicas, durable outboxes, reconnecting WebSockets, and resync.',
          'スコープ付きLocal Replica、Durable Outbox、WebSocket再接続、再同期を連携します。',
        ),
      },
      {
        title: text('Optional native features', '任意のNative機能'),
        description: text(
          'Add theme, review, printing, Firebase authentication, and Live Update support by subpath.',
          'Theme、Review、印刷、Firebase認証、Live Updateをsubpath単位で追加します。',
        ),
      },
    ],
    pages: [
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
      ),
      page(
        'Storage and Overlays',
        'Storage・Overlay',
        'storage-overlays',
        'storage-overlays.md',
        'Guide',
        'ガイド',
      ),
      page('Authentication and HTTP', '認証・HTTP', 'auth-http', 'auth-http.md', 'Guide', 'ガイド'),
      page(
        'Offline and Realtime',
        'Offline・Realtime',
        'offline-realtime',
        'offline-realtime.md',
        'Guide',
        'ガイド',
      ),
      page(
        'Optional Features',
        '任意機能',
        'optional-features',
        'optional-features.md',
        'Reference',
        'リファレンス',
      ),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ionic-angular-photo-editor',
    slug: 'ionic-angular-photo-editor',
    sourceDirectory: 'ionic-angular-photo-editor',
    name: 'rdlabo Ionic Angular Photo Editor',
    shortName: 'Ionic Angular Photo Editor',
    packageName: '@rdlabo/ionic-angular-photo-editor',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-library',
    englishDocsRef: ionicAngularLibraryDocsRef,
    demoUrl: 'https://rdlabo-ionic-angular-library.netlify.app/main/photo-editor',
    category: 'frontend-tools',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Photo editing and viewing flows for Ionic Angular and Capacitor applications.',
      'Ionic Angular・Capacitorアプリ向けの写真編集・閲覧フロー。',
    ),
    headline: text('Edit and review photos in Ionic modals', 'Ionic Modalで写真を編集・確認する'),
    overview: text(
      'Load photos from camera or album, crop and edit images, and present a configurable photo viewer from one Ionic Angular package.',
      'カメラやアルバムから写真を読み込み、切り抜き・編集し、設定可能な写真Viewerを1つのIonic Angularパッケージから利用できます。',
    ),
    featuresHeading: text('Photo workflow', '写真ワークフロー'),
    features: [
      {
        title: text('Camera and album', 'カメラ・アルバム'),
        description: text(
          'Load and resize photos through Capacitor Camera and browser file input flows.',
          'Capacitor Cameraとブラウザのファイル入力から写真を読み込み、リサイズします。',
        ),
      },
      {
        title: text('Editor modal', 'Editor Modal'),
        description: text(
          'Crop and edit images with configurable square requirements and labels.',
          '正方形切り抜き要件やラベルを設定して画像を編集します。',
        ),
      },
      {
        title: text('Viewer modal', 'Viewer Modal'),
        description: text(
          'Browse multiple images with optional deletion, circular display, and safe-area support.',
          '削除、円形表示、Safe Area対応を設定して複数画像を閲覧します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page('Theme', 'テーマ', 'theme', 'theme.md', 'Guides', 'ガイド'),
      page(
        'PhotoFileService',
        'PhotoFileService',
        'photo-file',
        'photo-file.md',
        'Guides',
        'ガイド',
      ),
      page('Photo Editor', 'Photo Editor', 'editor', 'editor.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/photo-editor',
          'Interactive Photo Editor demo',
          'Photo Editorの操作デモ',
        ),
      }),
      page('Photo Viewer', 'Photo Viewer', 'viewer', 'viewer.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/photo-editor',
          'Interactive Photo Viewer demo',
          'Photo Viewerの操作デモ',
        ),
      }),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ionic-angular-scroll-header',
    slug: 'ionic-angular-scroll-header',
    sourceDirectory: 'ionic-angular-scroll-header',
    name: 'rdlabo Ionic Angular Scroll Header',
    shortName: 'Ionic Angular Scroll Header',
    packageName: '@rdlabo/ionic-angular-scroll-header',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-library',
    englishDocsRef: ionicAngularLibraryDocsRef,
    demoUrl: 'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header',
    category: 'frontend-tools',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Scroll-aware header directives for Ionic and Angular CDK viewports.',
      'Ionic・Angular CDK viewport向けのScroll連動Header Directive。',
    ),
    headline: text(
      'Build headers that respond to content scrolling',
      'Scrollに追従するHeaderを実装する',
    ),
    overview: text(
      'Hide and reveal Ionic headers for IonContent and CDK virtual scrolling while preserving safe-area and native-header layouts.',
      'Safe AreaとNative Headerレイアウトを維持しながら、IonContentとCDK Virtual Scrollに応じてIonic Headerを表示・非表示にします。',
    ),
    featuresHeading: text('Header behavior', 'Header動作'),
    features: [
      {
        title: text('IonContent scrolling', 'IonContent Scroll'),
        description: text(
          'Attach scroll-aware behavior directly to Ionic content.',
          'Ionic ContentへScroll連動動作を直接追加します。',
        ),
      },
      {
        title: text('CDK virtual scrolling', 'CDK Virtual Scroll'),
        description: text(
          'Coordinate headers with Angular CDK virtual viewports.',
          'Angular CDKのVirtual ViewportとHeaderを連携します。',
        ),
      },
      {
        title: text('Safe-area layouts', 'Safe Area Layout'),
        description: text(
          'Support hidden safe-area headers and always-visible native headers.',
          'Safe Area用の非表示Headerと常時表示Native Headerを扱います。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page('IonContent', 'IonContent', 'ion-content', 'ion-content.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header',
          'Interactive IonContent scroll header demo',
          'IonContent Scroll Headerの操作デモ',
        ),
      }),
      page(
        'Virtual Scroll',
        'Virtual Scroll',
        'virtual-scroll',
        'virtual-scroll.md',
        'Guides',
        'ガイド',
        {
          demo: interactiveDemo(
            'https://rdlabo-ionic-angular-library.netlify.app/main/virtual-scroll-header',
            'Interactive virtual scroll header demo',
            'Virtual Scroll Headerの操作デモ',
          ),
        },
      ),
      page('Safe Area', 'Safe Area', 'safe-area', 'safe-area.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ngx-cdk-scroll-strategies',
    slug: 'ngx-cdk-scroll-strategies',
    sourceDirectory: 'ngx-cdk-scroll-strategies',
    name: 'rdlabo Angular CDK Scroll Strategies',
    shortName: 'Angular CDK Scroll Strategies',
    packageName: '@rdlabo/ngx-cdk-scroll-strategies',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-library',
    englishDocsRef: ionicAngularLibraryDocsRef,
    demoUrl: 'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies',
    category: 'frontend-tools',
    icon: 'app',
    adapter: 'markdown',
    seoTitle: text(
      'Angular CDK Virtual Scroll: Variable Item Heights | rdlabo',
      'Angular CDK Virtual Scrollの可変アイテム高さ対応 | rdlabo',
    ),
    description: text(
      'Use Angular CDK virtual scroll with variable or dynamic item heights. Supply exact per-item sizes for stable lists, chat UIs, and reverse scrolling.',
      'Angular CDK Virtual Scrollで可変・動的なItem Heightに対応。Itemごとの正確なSizeにより、List、Chat UI、Reverse Scrollを安定させます。',
    ),
    headline: text(
      'Angular CDK virtual scroll with variable item heights',
      'Angular CDK Virtual Scrollを可変Item Heightに対応',
    ),
    overview: text(
      'Supply known or measured per-item heights instead of a fixed itemSize or autosize estimation. Get exact scroll geometry, programmatic scrolling, and reverse chat layouts.',
      '固定のitemSizeやautosizeによる推定の代わりに、既知または計測したItemごとの高さを指定します。正確なScroll Geometry、Programmatic Scroll、Chat形式のReverse Layoutを実現します。',
    ),
    featuresHeading: text('Variable-height virtual scrolling', '可変高さのVirtual Scroll'),
    features: [
      {
        title: text('Variable item heights', '可変Item Height'),
        description: text(
          'Give every list item its own known or measured pixel height.',
          '各List Itemに、既知または計測した個別のPixel Heightを指定します。',
        ),
      },
      {
        title: text('Exact scroll geometry', '正確なScroll Geometry'),
        description: text(
          'Avoid average-size estimation when calculating ranges and index offsets.',
          'RangeとIndex Offsetの計算で、平均Item Sizeによる推定を避けます。',
        ),
      },
      {
        title: text('Reverse virtual scroll', 'Reverse Virtual Scroll'),
        description: text(
          'Support chat-style reverse layouts and logical index scrolling.',
          'Chat形式のReverse Layoutと論理Index Scrollに対応します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        seoTitle: text(
          'Angular CDK Variable Height Virtual Scroll Setup | rdlabo',
          'Angular CDK可変高さVirtual Scrollの導入方法 | rdlabo',
        ),
        updatedAt: text('2026-08-25', '2026-08-25'),
      }),
      page('Simple Usage', 'シンプルな使い方', 'simple', 'simple.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Angular CDK Virtual Scroll: Variable Height Example | rdlabo',
          'Angular CDK Virtual Scrollの可変高さサンプル | rdlabo',
        ),
        updatedAt: text('2026-08-25', '2026-08-25'),
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/simple',
          'Interactive simple virtual scroll demo',
          'Simple Virtual Scrollの操作デモ',
        ),
      }),
      page('Advanced Usage', '応用的な使い方', 'advanced', 'advanced.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Angular CDK Virtual Scroll: Dynamic Item Height | rdlabo',
          'Angular CDK Virtual Scrollで動的なItem Heightを計測 | rdlabo',
        ),
        updatedAt: text('2026-08-25', '2026-08-25'),
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/advanced',
          'Interactive advanced virtual scroll demo',
          'Advanced Virtual Scrollの操作デモ',
        ),
      }),
      page('Reverse Scroll', 'リバーススクロール', 'reverse', 'reverse.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Angular CDK Reverse Virtual Scroll for Chat UIs | rdlabo',
          'Angular CDK Reverse Virtual ScrollでChat UIを実装 | rdlabo',
        ),
        updatedAt: text('2026-08-25', '2026-08-25'),
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-strategies/reverse',
          'Interactive reverse virtual scroll demo',
          'Reverse Virtual Scrollの操作デモ',
        ),
      }),
      page('FAQ', 'FAQ', 'faq', 'faq.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Angular CDK Virtual Scroll: Autosize vs Variable Height',
          'Angular CDK Virtual Scrollのautosizeと可変高さの違い',
        ),
        updatedAt: text('2026-08-25', '2026-08-25'),
      }),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ionic-theme-ios26',
    slug: 'ionic-theme-ios26',
    sourceDirectory: 'ionic-theme-ios26',
    name: 'rdlabo Ionic Theme iOS26',
    shortName: 'Ionic Theme iOS26',
    packageName: '@rdlabo/ionic-theme-ios26',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-ios26',
    // v9.0.0 predates the Overview pick marker; pin the immutable docs commit that added it.
    englishDocsRef: 'e3605fd371ee96d1cb11e62638948e141aa7718f',
    demoUrl: 'https://ionic-theme-ios26.rdlabo.dev/',
    category: 'frontend-tools',
    icon: 'theme',
    adapter: 'markdown',
    description: text(
      'iOS 26 design styling for Ionic applications.',
      'Ionicアプリ向けのiOS 26デザインスタイル。',
    ),
    headline: text('Bring iOS 26 design to Ionic apps', 'IonicアプリにiOS 26デザインを取り入れる'),
    overview: text(
      'Apply iOS 26 CSS, transitions, and Liquid Glass interactions to Ionic components, with dark mode and selective migration support.',
      'IonicコンポーネントへiOS 26のCSS、トランジション、Liquid Glassインタラクションを適用し、ダークモードと段階的な移行にも対応します。',
    ),
    featuresHeading: text('Theme capabilities', 'テーマの機能'),
    features: [
      {
        title: text('iOS 26 CSS and design', 'iOS 26のCSSとデザイン'),
        description: text(
          'Restyle Ionic components to follow the latest iOS 26 design language.',
          'Ionicコンポーネントを最新のiOS 26デザイン言語に合わせて再スタイルします。',
        ),
      },
      {
        title: text('Transitions and Liquid Glass', 'トランジションとLiquid Glass'),
        description: text(
          'Use iOS-oriented navigation animations and Liquid Glass interaction effects.',
          'iOS向けのナビゲーションアニメーションとLiquid Glassのインタラクション効果を利用します。',
        ),
      },
      {
        title: text('Dark mode and selective migration', 'ダークモードと段階的移行'),
        description: text(
          'Adopt dark-mode styles and migrate component by component when needed.',
          '必要に応じてダークモードスタイルを導入し、コンポーネント単位で移行できます。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page(
        'Using ion-item-group',
        'ion-item-groupの使用方法',
        'using-ion-item-group',
        'using-ion-item-group.md',
        'Guides',
        'ガイド',
      ),
      page('Features', '機能', 'features', 'features.md', 'Guides', 'ガイド'),
      page(
        'Special markup and classes',
        '特別なマークアップとクラス',
        'special-markup',
        'special-markup.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Experimental Animation',
        '実験的なアニメーション',
        'experimental-animation',
        'experimental-animation.md',
        'Guides',
        'ガイド',
      ),
      page('iOS 18', 'iOS 18', 'ios-18', 'ios-18.md', 'Guides', 'ガイド'),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ionic-theme-md3',
    slug: 'ionic-theme-md3',
    sourceDirectory: 'ionic-theme-md3',
    name: 'rdlabo Ionic Theme Material Design 3',
    shortName: 'Ionic Theme MD3',
    packageName: '@rdlabo/ionic-theme-md3',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-md3',
    // v9.0.0 predates the Overview pick marker; pin the immutable docs commit that added it.
    englishDocsRef: '7f337d0d8711fcbf9d3e6b1590b6863cc9b0992c',
    demoUrl: 'https://ionic-theme-md3.rdlabo.dev/',
    category: 'frontend-tools',
    icon: 'theme',
    adapter: 'markdown',
    description: text(
      'Material Design 3 styling for Ionic applications.',
      'Ionicアプリ向けのMaterial Design 3スタイル。',
    ),
    headline: text(
      'Bring Material Design 3 to Ionic apps',
      'IonicアプリにMaterial Design 3を取り入れる',
    ),
    overview: text(
      'Apply Material Design 3 styling to Ionic while keeping markup compatible with the iOS 26 theme and shared transition animations.',
      'iOS 26テーマと共通のマークアップ互換性を保ちつつ、IonicへMaterial Design 3スタイルとトランジションアニメーションを適用します。',
    ),
    featuresHeading: text('Theme capabilities', 'テーマの機能'),
    features: [
      {
        title: text('Material Design 3 styling', 'Material Design 3スタイル'),
        description: text(
          'Update Ionic components to follow Material Design 3 guidelines.',
          'IonicコンポーネントをMaterial Design 3ガイドラインに合わせて更新します。',
        ),
      },
      {
        title: text('iOS 26-compatible markup', 'iOS 26互換マークアップ'),
        description: text(
          'Share one HTML structure with `@rdlabo/ionic-theme-ios26` across platforms.',
          'プラットフォームをまたぎ `@rdlabo/ionic-theme-ios26` と同じHTML構造を共有します。',
        ),
      },
      {
        title: text('Transition animation', 'トランジションアニメーション'),
        description: text(
          'Configure MD3 navigation transitions for non-iOS platforms.',
          '非iOSプラットフォーム向けにMD3のナビゲーショントランジションを設定します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Documentation', 'ドキュメント'),
      page(
        'Special markup',
        '特別なマークアップ',
        'special-markup',
        'special-markup.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Using ion-item-group',
        'ion-item-groupの使用方法',
        'using-ion-item-group',
        'using-ion-item-group.md',
        'Guides',
        'ガイド',
      ),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'ionic-angular-collect-icons',
    slug: 'ionic-angular-collect-icons',
    sourceDirectory: 'ionic-angular-collect-icons',
    name: 'rdlabo Ionic Angular Collect Icons',
    shortName: 'Ionic Angular Collect Icons',
    packageName: '@rdlabo/ionic-angular-collect-icons',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-angular-collect-icons',
    // The translated migration guide follows this reviewed immutable docs revision.
    englishDocsRef: '3786a8a70cfa9f02e225ccba35d1b43f1fbdb78d',
    category: 'frontend-tools',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Automate ionIcons collection and export for Ionic Angular projects.',
      'Ionic Angularプロジェクト向けのionIcons収集・エクスポート自動化。',
    ),
    headline: text(
      'Collect used ionIcons before production builds',
      '本番ビルド前に使用中のionIconsを収集する',
    ),
    overview: text(
      'Group unique ionIcons in a project and generate an export file—register all icons during development, then collect icons used in templates before production builds.',
      'プロジェクト内のionIconsを一意にまとめエクスポート用ファイルを生成します。開発時は全アイコンを登録し、本番ビルド前にテンプレートで使われているアイコンを収集します。',
    ),
    featuresHeading: text('Icon workflow', 'アイコンワークフロー'),
    features: [
      {
        title: text('Template collection', 'テンプレート収集'),
        description: text(
          'Scan templates and generate a unique ionIcons export before production builds.',
          'テンプレートを走査し、本番ビルド前に一意なionIconsエクスポートを生成します。',
        ),
      },
      {
        title: text('Development convenience', '開発時の利便性'),
        description: text(
          'Register all icons with addIcons during development for stress-free iteration.',
          '開発時はaddIconsに全アイコンを登録し、ストレスなく反復できます。',
        ),
      },
      {
        title: text('Initialize CLI', '初期化CLI'),
        description: text(
          'Wire addIcons automatically with --initialize and remove per-component calls.',
          '--initializeでaddIconsを自動配線し、コンポーネント単位の呼び出しを削除します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page('Initialize', '初期化', 'initialize', 'initialize.md', 'Guides', 'ガイド'),
      page('Usage', '使い方', 'usage', 'usage.md', 'Guides', 'ガイド'),
      page('CLI Options', 'CLI オプション', 'options', 'options.md', 'Guides', 'ガイド'),
      page('FAQ', 'FAQ', 'faq', 'faq.md', 'Guides', 'ガイド'),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('CLI API', 'CLI API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'workers-hono-kit',
    slug: 'workers-hono-kit',
    sourceDirectory: 'workers-hono-kit',
    name: 'rdlabo Workers Hono Kit',
    shortName: 'Workers Hono Kit',
    packageName: '@rdlabo/workers-hono-kit',
    repositoryUrl: 'https://github.com/rdlabo-dev/workers-hono-kit',
    // The portal documents the reviewed post-release guide set at this immutable revision.
    englishDocsRef: '66c1fdfd9aa606a21f8fe2c34adbb56dc9bb4fac',
    category: 'developer-tools',
    icon: 'server',
    adapter: 'markdown',
    description: text(
      'Infrastructure building blocks for Hono APIs on Cloudflare Workers.',
      'Cloudflare Workers上のHono API向けインフラストラクチャ部品集。',
    ),
    headline: text(
      'Build consistent Hono APIs on Cloudflare Workers',
      'Cloudflare Workers上のHono APIを一貫した構成で実装する',
    ),
    overview: text(
      'Compose validation, authentication, errors, observability, data access, queues, realtime connections, offline replicas, and test infrastructure from focused entry points.',
      '検証、認証、エラー、可観測性、データアクセス、Queue、Realtime接続、Offline Replica、テスト基盤を用途別エントリポイントから構成します。',
    ),
    featuresHeading: text('Infrastructure areas', '提供するインフラ領域'),
    features: [
      {
        title: text('HTTP and auth', 'HTTP・認証'),
        description: text(
          'Standardize validation, Firebase authentication, errors, maintenance, and response finalization.',
          '検証、Firebase認証、エラー、メンテナンス、レスポンス確定を標準化します。',
        ),
      },
      {
        title: text('Workers data layer', 'Workersデータ層'),
        description: text(
          'Use Hyperdrive, Drizzle, MySQL helpers, deadlock retry, and JST business-time primitives.',
          'Hyperdrive、Drizzle、MySQL helper、deadlock retry、JST business-timeを利用します。',
        ),
      },
      {
        title: text('Realtime and offline', 'Realtime・Offline'),
        description: text(
          'Share Durable Object WebSocket patterns and table-agnostic offline replica contracts.',
          'Durable Object WebSocketパターンとテーブル非依存のOffline Replica契約を共有します。',
        ),
      },
      {
        title: text('Testing and operations', 'テスト・運用'),
        description: text(
          'Reuse database fixtures, service fakes, performance logging, queues, and operational CLIs.',
          'DB fixture、service fake、性能ログ、Queue、運用CLIを再利用します。',
        ),
      },
    ],
    pages: [
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
      ),
      page('HTTP and Authentication', 'HTTP・認証', 'http-auth', 'http-auth.md', 'Guide', 'ガイド'),
      page('Data Layer', 'データ層', 'data-layer', 'data-layer.md', 'Guide', 'ガイド'),
      page(
        'Realtime and Offline',
        'Realtime・Offline',
        'realtime-offline',
        'realtime-offline.md',
        'Guide',
        'ガイド',
      ),
      page(
        'Testing and Operations',
        'テスト・運用',
        'testing-operations',
        'testing-operations.md',
        'Reference',
        'リファレンス',
      ),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'eslint-plugin-rules',
    slug: 'eslint-plugin-rules',
    sourceDirectory: 'eslint-plugin-rules',
    name: 'rdlabo ESLint Plugin Rules',
    shortName: 'ESLint Plugin Rules',
    packageName: '@rdlabo/eslint-plugin-rules',
    repositoryUrl: 'https://github.com/rdlabo-dev/eslint-plugin-rules',
    // The Japanese migration guide follows this reviewed immutable docs revision.
    englishDocsRef: 'f405c0e67b208756bde6b79ff704f42f26e748a6',
    category: 'developer-tools',
    icon: 'lint',
    adapter: 'markdown',
    description: text(
      'Opinionated Angular, Ionic, and TypeScript rules for maintainable applications.',
      '保守しやすいアプリケーションのためのAngular・Ionic・TypeScript向けESLintルール集。',
    ),
    headline: text(
      'Keep Angular and Ionic architecture consistent',
      'Angular・Ionicの設計規約を一貫させる',
    ),
    overview: text(
      'Adopt a flat-config preset or select individual rules for Signals, component boundaries, Ionic overlays, forms, and safe asynchronous code.',
      'Flat Configプリセットまたは個別ルールを使い、Signal、Component境界、Ionic Overlay、フォーム、非同期コードの規約を自動検査します。',
    ),
    featuresHeading: text('What the plugin covers', 'プラグインが検査する領域'),
    features: [
      {
        title: text('Angular Signals', 'Angular Signals'),
        description: text(
          'Catch Signals used as plain values in TypeScript and templates.',
          'TypeScriptとテンプレートでSignalを通常値として誤用するケースを検出します。',
        ),
      },
      {
        title: text('Component boundaries', 'Component境界'),
        description: text(
          'Enforce ViewModel ownership, readonly properties, and lifecycle contracts.',
          'ViewModel所有、readonlyプロパティ、ライフサイクル契約を検査します。',
        ),
      },
      {
        title: text('Ionic interaction', 'Ionic操作'),
        description: text(
          'Standardize overlays, standalone imports, attribute bindings, and double-tap prevention.',
          'Overlay、standalone import、属性バインディング、二重操作防止を標準化します。',
        ),
      },
      {
        title: text('Framework-independent TypeScript', '汎用TypeScript'),
        description: text(
          'Use the /typescript entry point for rules that do not load Angular or Ionic.',
          'AngularやIonicを読み込まないルールは/typescriptエントリポイントから利用できます。',
        ),
      },
    ],
    pages: [
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
      ),
      page('Configuration', '設定', 'configuration', 'configuration.md', 'Guide', 'ガイド'),
      page('Migration', '移行', 'migration', 'migration.md', 'Guide', 'ガイド'),
      page('Rules', 'ルール一覧', 'rules', 'rules.md', 'Reference', 'リファレンス'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
      ...eslintRulePages,
    ],
  },
  {
    id: 'capacitor-docgen',
    slug: 'capacitor-docgen',
    sourceDirectory: 'capacitor-docgen',
    name: 'rdlabo Capacitor Docgen',
    shortName: 'Docgen',
    packageName: '@rdlabo/capacitor-docgen',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-docgen',
    // v0.4.1 predates the portal guide; pin the reviewed immutable docs revision.
    englishDocsRef: 'e8c125387d9ccc86ee19a73bc915df35926c8244',
    category: 'developer-tools',
    icon: 'docs',
    adapter: 'markdown',
    description: text(
      'Upstream-compatible Capacitor documentation generator with interface inheritance.',
      'interface継承に対応した、本家互換のCapacitorドキュメント生成CLI。',
    ),
    headline: text(
      'Generate Capacitor plugin docs with inherited interfaces',
      '継承したinterfaceを含めてCapacitorプラグインドキュメントを生成する',
    ),
    overview: text(
      'Keep the upstream docgen CLI, placeholders, output helpers, and exported functions while expanding inherited interface members into generated documentation.',
      '本家docgenのCLI、placeholder、出力helper、export functionを維持しつつ、継承したinterface memberを生成ドキュメントへ展開します。',
    ),
    featuresHeading: text('Why use the fork', 'forkを使う理由'),
    features: [
      {
        title: text('Upstream-compatible CLI', '本家互換CLI'),
        description: text(
          'Keep the same docgen binary, flags, placeholders, output commands, and exported functions as @capacitor/docgen.',
          '@capacitor/docgenと同じdocgenバイナリ、flag、placeholder、出力command、export functionを維持します。',
        ),
      },
      {
        title: text('Interface inheritance', 'interface継承'),
        description: text(
          'Resolve TypeScript extends clauses and append inherited methods and properties, including on the primary API.',
          'TypeScriptのextends句を解決し、primary APIを含む継承method・propertyを生成ドキュメントへ追加します。',
        ),
      },
    ],
    pages: [
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
      ),
      page(
        'Differences from Upstream',
        '本家との差分',
        'upstream-differences',
        'upstream-differences.md',
        'Comparison',
        '比較',
      ),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'stripe',
    slug: 'capacitor-stripe',
    sourceDirectory: 'stripe',
    name: 'Capacitor Community Stripe',
    shortName: 'Stripe',
    packageName: '@capacitor-community/stripe',
    repositoryUrl: 'https://github.com/capacitor-community/stripe',
    category: 'capacitor-plugins',
    icon: 'payments',
    description: text(
      'Native Stripe payments for Capacitor applications.',
      'Capacitor アプリで Stripe のネイティブ決済を利用するためのプラグイン。',
    ),
    headline: text(
      'Accept Stripe payments in Capacitor apps',
      'CapacitorアプリでStripe決済を受け付ける',
    ),
    overview: text(
      'Present native PaymentSheet and PaymentFlow, accept Apple Pay and Google Pay, and integrate payments on the web from the same Capacitor codebase.',
      '同じCapacitorコードベースからネイティブのPaymentSheetとPaymentFlow、Apple Pay、Google Pay、Web決済を利用できます。',
    ),
    featuresHeading: text('What you can build', '実装できること'),
    features: [
      {
        title: text('PaymentSheet', 'PaymentSheet'),
        description: text(
          'Collect payment in a single native flow with PaymentIntent or SetupIntent.',
          'PaymentIntentまたはSetupIntentを使い、ひとつのネイティブフローで支払いを受け付けます。',
        ),
      },
      {
        title: text('PaymentFlow', 'PaymentFlow'),
        description: text(
          'Collect payment details first, then confirm after an intermediate step in your app.',
          '先に支払い情報を収集し、アプリ内の確認ステップを挟んでから確定します。',
        ),
      },
      {
        title: text('Apple Pay', 'Apple Pay'),
        description: text(
          'Present Apple Pay for instant checkout where it is available.',
          '対応環境でApple Payによるすばやい決済を表示します。',
        ),
      },
      {
        title: text('Google Pay', 'Google Pay'),
        description: text(
          'Present Google Pay for instant checkout where it is available.',
          '対応環境でGoogle Payによるすばやい決済を表示します。',
        ),
      },
      {
        title: text('Web integration', 'Web連携'),
        description: text(
          'Use the same plugin APIs with web frameworks and browsers alongside native apps.',
          'ネイティブアプリと同じプラグインAPIをWebフレームワークやブラウザでも利用します。',
        ),
      },
    ],
    pages: [
      page(
        'Configuration',
        '設定',
        'configuration',
        'configuration.md',
        'Quickstart',
        'クイックスタート',
      ),
      page(
        'Vanilla JS',
        'Vanilla JS',
        'vanilla-js',
        'vanilla-js.md',
        'Quickstart',
        'クイックスタート',
      ),
      page('Angular', 'Angular', 'angular', 'angular.md', 'Quickstart', 'クイックスタート'),
      page('React', 'React', 'react', 'react.md', 'Quickstart', 'クイックスタート'),
      page(
        'Event Listeners',
        'イベントリスナー',
        'learn/event-listeners',
        'learn/event-listeners.md',
        'Learn',
        '学ぶ',
      ),
      page(
        'Server Integration',
        'サーバー連携',
        'server-integration',
        'server-integration.md',
        'Learn',
        '学ぶ',
      ),
      page('Initialize', '初期化', 'initialize', 'initialize.md', 'Methods', 'メソッド'),
      page(
        'PaymentSheet',
        'PaymentSheet',
        'payment-sheet',
        'payment-sheet.md',
        'Methods',
        'メソッド',
        {
          seoTitle: text(
            'Capacitor Stripe PaymentSheet API | rdlabo',
            'Capacitor Stripe PaymentSheet API リファレンス | rdlabo',
          ),
        },
      ),
      page('PaymentFlow', 'PaymentFlow', 'payment-flow', 'payment-flow.md', 'Methods', 'メソッド'),
      page('Apple Pay', 'Apple Pay', 'apple-pay', 'apple-pay.md', 'Methods', 'メソッド'),
      page('Google Pay', 'Google Pay', 'google-pay', 'google-pay.md', 'Methods', 'メソッド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'stripe-identity',
    slug: 'capacitor-stripe-identity',
    sourceDirectory: 'stripe-identity',
    name: 'Capacitor Community Stripe Identity',
    shortName: 'Stripe Identity',
    packageName: '@capacitor-community/stripe-identity',
    repositoryUrl: 'https://github.com/capacitor-community/stripe',
    category: 'capacitor-plugins',
    icon: 'identity',
    description: text(
      'Stripe Identity SDK bindings for Capacitor applications.',
      'Capacitor アプリで Stripe Identity の本人確認を表示するプラグイン。',
    ),
    headline: text(
      'Present Stripe Identity verification in Capacitor apps',
      'CapacitorアプリでStripe Identityの本人確認を表示する',
    ),
    overview: text(
      "Present Stripe's identity verification sheet on native platforms and the web. Your app listens for result events; Stripe performs the verification.",
      'ネイティブとWebでStripeの本人確認シートを表示します。アプリは結果イベントを受け取り、本人確認はStripeが実行します。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Identity Verification Sheet', '本人確認シート'),
        description: text(
          'Create and present the verification sheet after your backend supplies the required session credentials.',
          'バックエンドから必要なセッション認証情報を受け取り、Capacitorから本人確認シートを作成・表示します。',
        ),
      },
      {
        title: text('Native and web', 'ネイティブとWeb'),
        description: text(
          'Use one API across platforms, including supported browser integrations.',
          'プラットフォーム共通のAPIを使用し、対応ブラウザにも統合します。',
        ),
      },
      {
        title: text('Result events', '結果イベント'),
        description: text(
          'Register listeners before presenting the sheet so verification outcomes are not missed.',
          '結果を取りこぼさないよう、シート表示前に本人確認結果のリスナーを登録します。',
        ),
      },
    ],
    pages: [
      page(
        'Configuration',
        '設定',
        'configuration',
        'configuration.md',
        'Quickstart',
        'クイックスタート',
      ),
      page(
        'Identity Verification Sheet',
        '本人確認シート',
        'identity-verification-sheet',
        'identity-verification-sheet.md',
        'Guide',
        'ガイド',
      ),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'stripe-terminal',
    slug: 'capacitor-stripe-terminal',
    sourceDirectory: 'stripe-terminal',
    name: 'Capacitor Community Stripe Terminal',
    shortName: 'Stripe Terminal',
    packageName: '@capacitor-community/stripe-terminal',
    repositoryUrl: 'https://github.com/capacitor-community/stripe',
    category: 'capacitor-plugins',
    icon: 'terminal',
    description: text(
      'Stripe Terminal SDK bindings for Capacitor applications.',
      'Capacitor アプリで Stripe Terminal の対面決済を利用するプラグイン。',
    ),
    headline: text(
      'Collect in-person payments with Stripe Terminal',
      'Stripe Terminalで対面決済を受け付ける',
    ),
    overview: text(
      'Discover and connect readers, collect and confirm PaymentIntents, and respond to reader events, including Tap to Pay where supported.',
      'リーダーの探索と接続、PaymentIntentの収集と確定、画面・状態・入力・ソフトウェア更新イベントを処理します。対応環境ではTap to Payも利用できます。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('In-person payments', '対面決済'),
        description: text(
          'Collect a payment method on a connected reader and confirm the PaymentIntent.',
          '接続したリーダーで支払い方法を収集し、PaymentIntentを確定します。',
        ),
      },
      {
        title: text('Reader discovery', 'リーダーの探索'),
        description: text(
          'Discover nearby or simulated readers, then connect before collecting payment details.',
          '近くのリーダーまたはシミュレーションリーダーを探索し、支払い情報を収集する前に接続します。',
        ),
      },
      {
        title: text('Reader events', 'リーダーイベント'),
        description: text(
          'Handle display, status, input, and software update events during checkout.',
          '会計中の画面、状態、入力、ソフトウェア更新イベントを処理します。',
        ),
      },
      {
        title: text('Tap to Pay', 'Tap to Pay'),
        description: text(
          'Connect with Tap to Pay on devices and configurations that support it.',
          '対応する端末と設定でTap to Payへ接続します。',
        ),
      },
    ],
    pages: [
      page(
        'Configuration',
        '設定',
        'configuration',
        'configuration.md',
        'Quickstart',
        'クイックスタート',
      ),
      page(
        'Collect a Payment',
        '支払いを受け付ける',
        'collect-a-payment',
        'collect-a-payment.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Reader Lifecycle',
        'リーダーのライフサイクル',
        'reader-lifecycle',
        'reader-lifecycle.md',
        'Guides',
        'ガイド',
      ),
      page('Tap to Pay', 'Tap to Pay', 'tap-to-pay', 'tap-to-pay.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'admob',
    slug: 'capacitor-admob',
    sourceDirectory: 'admob',
    name: 'Capacitor Community AdMob',
    shortName: 'AdMob',
    packageName: '@capacitor-community/admob',
    repositoryUrl: 'https://github.com/capacitor-community/admob',
    // v8.1.0 does not publish the guide tree; pin the reviewed immutable docs revision.
    englishDocsRef: '7e4b1ddb943ab0dd5a8e46ea10b26af699bd73cb',
    category: 'capacitor-plugins',
    icon: 'ads',
    seoTitle: text(
      'Capacitor AdMob Plugin Documentation | rdlabo',
      'Capacitor AdMob プラグイン ドキュメント | rdlabo',
    ),
    description: text(
      'Native Google AdMob ads for Capacitor applications.',
      'Capacitor アプリで Google AdMob のネイティブ広告を表示するプラグイン。',
    ),
    headline: text(
      'Monetize Capacitor apps with Google AdMob',
      'Google AdMobでCapacitorアプリを収益化する',
    ),
    overview: text(
      'Initialize Google Mobile Ads, manage privacy consent, and present native ad formats on iOS and Android.',
      'Google Mobile Adsの初期化、プライバシー同意の管理、iOS・Androidでのネイティブ広告表示を行います。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Banner ads', 'バナー広告'),
        description: text(
          'Place adaptive or fixed-size banners at the top or bottom of the native view.',
          'ネイティブビューの上部または下部に、アダプティブまたは固定サイズのバナーを表示します。',
        ),
      },
      {
        title: text('Full-screen ads', 'フルスクリーン広告'),
        description: text(
          'Prepare and show interstitial, rewarded, and rewarded interstitial ads.',
          'インタースティシャル、リワード、リワード付きインタースティシャル広告を準備して表示します。',
        ),
      },
      {
        title: text('App open ads', 'アプリ起動時広告'),
        description: text(
          'Load and present ads when users bring your app to the foreground.',
          'ユーザーがアプリをフォアグラウンドに戻したときに広告をロードして表示します。',
        ),
      },
      {
        title: text('Consent controls', '同意管理'),
        description: text(
          'Use Google UMP and iOS tracking authorization APIs before requesting ads.',
          '広告のリクエスト前にGoogle UMPとiOSのトラッキング許可APIを使います。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page(
        'Initialize',
        '初期化',
        'configuration',
        'configuration.md',
        'Quickstart',
        'クイックスタート',
      ),
      page('Consent', '同意管理', 'consent', 'consent.md', 'Guides', 'ガイド'),
      page('Banner Ads', 'バナー広告', 'banner', 'banner.md', 'Ad formats', '広告フォーマット'),
      page(
        'Interstitial Ads',
        'インタースティシャル広告',
        'interstitial',
        'interstitial.md',
        'Ad formats',
        '広告フォーマット',
      ),
      page(
        'Rewarded Ads',
        'リワード広告',
        'rewarded',
        'rewarded.md',
        'Ad formats',
        '広告フォーマット',
      ),
      page(
        'App Open Ads',
        'アプリ起動時広告',
        'app-open',
        'app-open.md',
        'Ad formats',
        '広告フォーマット',
      ),
      page('Ad Events', '広告イベント', 'events', 'events.md', 'Guides', 'ガイド'),
      page('Testing', 'テスト', 'testing', 'testing.md', 'Guides', 'ガイド'),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
    ],
  },
  {
    id: 'facebook-login',
    slug: 'capacitor-facebook-login',
    sourceDirectory: 'facebook-login',
    name: 'Capacitor Community Facebook Login',
    shortName: 'Facebook Login',
    packageName: '@capacitor-community/facebook-login',
    repositoryUrl: 'https://github.com/capacitor-community/facebook-login',
    category: 'capacitor-plugins',
    icon: 'identity',
    adapter: 'markdown',
    description: text(
      'Native Facebook Login and App Events for Capacitor applications.',
      'CapacitorアプリでFacebook LoginとApp Eventsを利用するためのプラグイン。',
    ),
    headline: text(
      'Add Facebook authentication to Capacitor apps',
      'CapacitorアプリにFacebook認証を追加する',
    ),
    overview: text(
      'Sign users in with the native Meta SDKs or Facebook JavaScript SDK, request profile data, and log App Events across Android, iOS, and Web.',
      'Android・iOSのネイティブMeta SDKまたはFacebook JavaScript SDKでユーザーを認証し、プロフィール取得とApp Eventsの記録を行います。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Facebook authentication', 'Facebook認証'),
        description: text(
          'Log in, log out, inspect the current token, and renew data access.',
          'ログイン、ログアウト、現在のトークン取得、データアクセスの再認証を行います。',
        ),
      },
      {
        title: text('Profile requests', 'プロフィール取得'),
        description: text(
          'Request permitted profile fields from the Facebook Graph API.',
          'Facebook Graph APIから許可されたプロフィール項目を取得します。',
        ),
      },
      {
        title: text('App Events', 'App Events'),
        description: text(
          'Log custom events and configure automatic event and advertiser settings.',
          'カスタムイベントを記録し、自動イベントと広告主向け設定を構成します。',
        ),
      },
      {
        title: text('Native and web', 'ネイティブとWeb'),
        description: text(
          'Use one Capacitor API across Android, iOS, and Web.',
          'Android・iOS・Webで共通のCapacitor APIを利用します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page('Configuration', '設定', 'configuration', 'configuration.md', 'Guides', 'ガイド'),
      page('Authentication', '認証', 'authentication', 'authentication.md', 'Guides', 'ガイド'),
      page('App Events', 'App Events', 'app-events', 'app-events.md', 'Guides', 'ガイド'),
    ],
  },
  {
    id: 'capacitor-codescanner',
    slug: 'capacitor-codescanner',
    sourceDirectory: 'capacitor-codescanner',
    name: 'rdlabo Capacitor Code Scanner',
    shortName: 'Code Scanner',
    packageName: '@rdlabo/capacitor-codescanner',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-codescanner',
    // v8.0.3 predates the portal guide; pin the reviewed immutable docs revision.
    englishDocsRef: 'c0c9b2e15d41e44a83569e574f0300dc67e46767',
    category: 'capacitor-plugins',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Barcode and QR scanning for Capacitor through a native modal.',
      'ネイティブモーダルでバーコード・QRコードをスキャンするCapacitorプラグイン。',
    ),
    headline: text(
      'Scan codes in a native modal without touching web assets',
      'Webアセットを操作せずネイティブモーダルでコードをスキャンする',
    ),
    overview: text(
      'Present a modal scanner, listen for catch events, and configure the detection area and continuous multi-scan—without manipulating web assets.',
      'モーダルでスキャナーを表示し、検出イベントを受け取り、検出エリアと連続マルチスキャンを設定できます。Webアセットの操作は不要です。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Modal scanning', 'モーダルスキャン'),
        description: text(
          'Open a native modal and scan inside it so web assets do not need to change.',
          'ネイティブモーダルを開きその中でスキャンするため、Webアセットの変更は不要です。',
        ),
      },
      {
        title: text('Continuous multi-scan', '連続マルチスキャン'),
        description: text(
          'Keep scanning successive codes with isMulti mode.',
          'isMultiモードでコードを連続スキャンできます。',
        ),
      },
      {
        title: text('Light and feedback', 'ライトとフィードバック'),
        description: text(
          'Use automatic light control, vibration, and visible detection highlighting.',
          '自動ライト制御、バイブレーション、検出エリアの視覚表示を使います。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      groupPage('CodeScanner', 'code-scanner'),
    ],
  },
  {
    id: 'capacitor-screenshot-event',
    slug: 'capacitor-screenshot-event',
    sourceDirectory: 'capacitor-screenshot-event',
    name: 'rdlabo Capacitor Screenshot Event',
    shortName: 'Screenshot Event',
    packageName: '@rdlabo/capacitor-screenshot-event',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-screenshot-event',
    // v8.0.0 predates the portal guide; pin the reviewed immutable docs revision.
    englishDocsRef: 'dbd409d0f9e0e13907f37f8cd664ae9c367c2c8c',
    category: 'capacitor-plugins',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Notify Capacitor apps when the user takes a screenshot.',
      'ユーザーがスクリーンショットを撮ったことをCapacitorアプリへ通知するプラグイン。',
    ),
    headline: text('React when users take screenshots', 'ユーザーのスクリーンショットに反応する'),
    overview: text(
      'Start watching for screenshot events and handle userDidTakeScreenshot callbacks from Capacitor.',
      'スクリーンショット監視を開始し、CapacitorからuserDidTakeScreenshotコールバックを処理します。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Start watching', '監視開始'),
        description: text(
          'Call startWatchEvent to begin listening for screenshot activity.',
          'startWatchEventを呼び出し、スクリーンショットの監視を開始します。',
        ),
      },
      {
        title: text('Screenshot listener', 'スクリーンショットリスナー'),
        description: text(
          'Handle userDidTakeScreenshot when the user captures the screen.',
          'ユーザーが画面を撮影したときにuserDidTakeScreenshotを処理します。',
        ),
      },
      {
        title: text('Stop watching', '監視停止'),
        description: text(
          'Call removeWatchEvent when screenshot monitoring is no longer needed.',
          '監視が不要になったらremoveWatchEventを呼び出します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      groupPage('ScreenshotEvent', 'screenshot-event'),
    ],
  },
  {
    id: 'capacitor-printer',
    slug: 'capacitor-printer',
    sourceDirectory: 'capacitor-printer',
    name: 'rdlabo Capacitor Printer',
    shortName: 'Printer',
    packageName: '@rdlabo/capacitor-printer',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-printer',
    // v8.0.1 predates the portal guides; pin the reviewed immutable docs revision.
    englishDocsRef: 'ba3e9caaabf64f0933a918079ce7ad36a9eea18b',
    category: 'capacitor-plugins',
    icon: 'terminal',
    adapter: 'markdown',
    description: text(
      'Native printing for files and WebView content in Capacitor apps.',
      'CapacitorアプリでファイルとWebView内容をネイティブ印刷するプラグイン。',
    ),
    headline: text(
      'Present the system print UI from Capacitor',
      'Capacitorからシステム印刷UIを表示する',
    ),
    overview: text(
      'Print a file or the current WebView through the platform printing interface on Android and iOS.',
      'AndroidとiOSの印刷UIを通じて、ファイルまたは現在のWebViewを印刷します。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Print files', 'ファイル印刷'),
        description: text(
          'Present the printing UI for a file path or local URL on Android and iOS.',
          'AndroidとiOSでファイルパスまたはローカルURLの印刷UIを表示します。',
        ),
      },
      {
        title: text('Print WebView', 'WebView印刷'),
        description: text(
          'Present the printing UI for the current WebView content.',
          '現在のWebView内容の印刷UIを表示します。',
        ),
      },
      {
        title: text('Safe file lifecycle', '安全なファイルライフサイクル'),
        description: text(
          'Await printFile until the OS no longer needs the source, then delete it safely.',
          'OSがソースを必要としなくなるまでprintFileを待ち、その後安全に削除できます。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      groupPage('PDF', 'pdf'),
      groupPage('Web', 'web'),
    ],
  },
  {
    id: 'capacitor-brotherprint',
    slug: 'capacitor-brotherprint',
    sourceDirectory: 'capacitor-brotherprint',
    name: 'rdlabo Capacitor Brother Print',
    shortName: 'Brother Print',
    packageName: '@rdlabo/capacitor-brotherprint',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-brotherprint',
    // v8.1.1 predates the portal guides; pin the reviewed immutable docs revision.
    englishDocsRef: 'b877460a79c1d671603c7af9d59201841ffa891f',
    category: 'capacitor-plugins',
    icon: 'terminal',
    adapter: 'markdown',
    description: text(
      'Native Brother Print SDK bindings for Capacitor on iOS and Android.',
      'iOS・Android向けのネイティブBrother Print SDKをCapacitorから利用するプラグイン。',
    ),
    headline: text(
      'Print to Brother label printers from Capacitor',
      'CapacitorからBrotherラベルプリンターへ印刷する',
    ),
    overview: text(
      'Search Brother printers over USB, Wi-Fi, Bluetooth, or BLE and print images to supported QL and TD models.',
      'USB・Wi-Fi・Bluetooth・BLEでBrotherプリンターを検索し、対応するQL・TDモデルへ画像を印刷します。',
    ),
    featuresHeading: text('What you can do', 'できること'),
    features: [
      {
        title: text('Printer discovery', 'プリンター探索'),
        description: text(
          'Search nearby Brother printers by port and receive availability events.',
          'ポート指定でBrotherプリンターを探索し、利用可能イベントを受け取ります。',
        ),
      },
      {
        title: text('Image printing', '画像印刷'),
        description: text(
          'Send base64 images with model, label, and channel settings to printImage.',
          'モデル・ラベル・チャネル設定付きのbase64画像をprintImageへ送ります。',
        ),
      },
      {
        title: text('Print lifecycle events', '印刷ライフサイクルイベント'),
        description: text(
          'Listen for print success, communication failure, and print error outcomes.',
          '印刷成功、通信失敗、印刷エラーの結果をリスナーで受け取ります。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート'),
      page('Installation', 'インストール', 'installation', 'installation.md', 'Guides', 'ガイド'),
      groupPage('Search', 'search'),
      groupPage('Print', 'print'),
      groupPage('Events', 'events'),
    ],
  },
];

export const localize = (value: LocalizedText, locale: Locale): string => value[locale];
