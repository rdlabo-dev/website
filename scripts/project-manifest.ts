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
  /** Optional intent-focused summary for SEO description metadata. */
  seoDescription?: LocalizedText;
  /** Optional explicit content update date (`YYYY-MM-DD`) for sitemap `<lastmod>`. */
  updatedAt?: LocalizedText;
  /**
   * When true, English generation reads this page from the portal local filesystem
   * (same path layout as Japanese) instead of fetching GitHub English sources.
   * Edit links use the portal path (`fromPackage: false`).
   */
  localEnglishSource?: boolean;
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
  /** Optional landing-page guide priorities; sidebar order remains unchanged. */
  entryGuideSlugs?: readonly string[];
  /** Hosted documentation URL for catalog-only projects that are not rendered by this portal. */
  hostedUrl?: string;
  category: ProjectCategoryId;
  icon: 'payments' | 'identity' | 'terminal' | 'ads' | 'lint' | 'server' | 'app' | 'theme' | 'docs';
  adapter?: 'capacitor-docs-json' | 'markdown';
  /** Immutable Git ref override for English guides (default: installed package tag). */
  englishDocsRef?: string;
  releaseTagPrefix?: string;
  englishDocsEditBranch?: string;
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
const ionicAngularLibraryDocsRef = 'daf7864a1bc7c0a7b4376811ec3429270d319974';

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
      'Native payments, identity verification, social login, in-person payments, mobile ads, scanning, screenshot events, printing, and on-device AI for Capacitor applications.',
      'Capacitorアプリ向けのネイティブ決済、本人確認、ソーシャルログイン、対面決済、モバイル広告、スキャン、スクリーンショット検知、印刷、オンデバイスAIを提供します。',
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
      'Cloudflare Workers libraries and code-quality tools for TypeScript.',
      'Cloudflare Workers向けライブラリとTypeScriptのコード品質ツールです。',
    ),
    order: 30,
  },
];
interface PageOptions {
  seoTitle?: LocalizedText;
  seoDescription?: LocalizedText;
  updatedAt?: LocalizedText;
  localEnglishSource?: boolean;
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

const groupPage = (
  object: string,
  slug: string,
  options: PageOptions = {},
): ProjectPageDefinition => page(object, object, slug, `${slug}.md`, 'Guides', 'ガイド', options);

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
  'initialize-timezone-at-module-scope',
  'ionic-attr-type-check',
  'no-component-method-except-lifecycle',
  'no-component-writable-signal',
  'no-implicit-timezone',
  'no-reactive-forms',
  'no-template-driven-forms',
  'prefer-disable-handler',
  'prefer-ionic-standalone',
  'prefer-modal-launcher',
  'require-ion-error-text',
  'require-ion-item-group',
  'require-viewmodel',
  'restrict-try-block',
  'signal-use-as-signal-template',
  'signal-use-as-signal',
] as const;

const eslintRulePages = eslintRuleNames.map((ruleName) =>
  page(ruleName, ruleName, `rules/${ruleName}`, `rules/${ruleName}.md`, 'Rules', 'ルール', {
    ...([
      'require-ion-error-text',
      'initialize-timezone-at-module-scope',
      'no-implicit-timezone',
    ].includes(ruleName)
      ? { updatedAt: text('2026-09-06', '2026-09-06') }
      : {}),
  }),
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
    englishDocsRef: 'daf7864a1bc7c0a7b4376811ec3429270d319974',
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
      'Save typed preferences, open modals with typed results, and connect Ionic controls to Angular Signal Forms. Add authentication and native features as your app grows.',
      '型安全な設定の保存、戻り値に型が付くモーダル、IonicとAngular Signal Formsの連携から始められます。認証やNative機能は必要に応じて追加できます。',
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
        title: text('Signal Forms', 'Signal Forms'),
        description: text(
          'Connect Ionic controls to Angular Signal Forms with validation messages and field state.',
          'Ionicの入力欄をAngular Signal Formsに接続し、検証メッセージとフィールドの状態を連携します。',
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
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Storage and Overlays',
        'Storage・Overlay',
        'storage-overlays',
        'storage-overlays.md',
        'Guide',
        'ガイド',
      ),
      page('Forms', 'フォーム', 'forms', 'forms.md', 'Guide', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
        seoTitle: text(
          'Angular Signal Forms for Ionic Controls | rdlabo',
          'Ionic向けAngular Signal Forms | rdlabo',
        ),
        seoDescription: text(
          'Adapt Angular 22 Signal Forms to Ionic controls with automatic errorText, localized validation messages, and state classes.',
          'Angular 22 Signal FormsをIonic controlへ統合し、errorTextの自動設定、validation messageの多言語化、state classを利用する方法を解説します。',
        ),
      }),
      page(
        'Check your Kit integration with ESLint',
        'ESLintでKitの使い方をチェック',
        'eslint',
        'eslint.md',
        'Guide',
        'ガイド',
        {
          seoTitle: text(
            'Check Ionic Angular Kit integration with ESLint | rdlabo',
            'Ionic Angular Kitの使い方をESLintでチェック | rdlabo',
          ),
          seoDescription: text(
            'Configure ESLint checks for Ionic Angular Kit modal launchers, async action handlers, and Signal Forms error text.',
            'Ionic Angular Kitのモーダル起動、非同期操作、Signal Formsのエラー表示をESLintで検査する設定と例を紹介します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Authentication and HTTP',
        '認証・HTTP',
        'auth-http',
        'auth-http.md',
        'Guide',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Offline and Realtime',
        'Offline・Realtime',
        'offline-realtime',
        'offline-realtime.md',
        'Guide',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'PhotoFileService',
        'PhotoFileService',
        'photo-file',
        'photo-file.md',
        'Guides',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page('Photo Editor', 'Photo Editor', 'editor', 'editor.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/photo-editor',
          'Interactive Photo Editor demo',
          'Photo Editorの操作デモ',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Photo Viewer', 'Photo Viewer', 'viewer', 'viewer.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/photo-editor',
          'Interactive Photo Viewer demo',
          'Photo Viewerの操作デモ',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Theme', 'テーマ', 'theme', 'theme.md', 'Guides', 'ガイド'),
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('IonContent', 'IonContent', 'ion-content', 'ion-content.md', 'Guides', 'ガイド', {
        demo: interactiveDemo(
          'https://rdlabo-ionic-angular-library.netlify.app/main/scroll-header',
          'Interactive IonContent scroll header demo',
          'IonContent Scroll Headerの操作デモ',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
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
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Safe Area', 'Safe Area', 'safe-area', 'safe-area.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Ionic Safe Area with Scroll-Aware Headers | rdlabo',
          'IonicのSafe AreaとScroll連動Header | rdlabo',
        ),
        seoDescription: text(
          'Configure hidden safe-area headers and always-visible native headers with @rdlabo/ionic-angular-scroll-header for Ionic content layouts.',
          'Ionic・Angular CDKのScroll連動Headerで、Safe Area用の非表示Headerと常時表示するNative Headerを設定する方法を解説します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Simple Usage', 'シンプルな使い方', 'simple', 'simple.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Angular CDK Virtual Scroll: Variable Height Example | rdlabo',
          'Angular CDK Virtual Scrollの可変高さサンプル | rdlabo',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
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
        updatedAt: text('2026-09-06', '2026-09-06'),
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
        updatedAt: text('2026-09-06', '2026-09-06'),
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
    id: 'ionic-theme-ios27',
    slug: 'ionic-theme-ios27',
    sourceDirectory: 'ionic-theme-ios27',
    name: 'rdlabo Ionic Theme iOS27',
    shortName: 'Ionic Theme iOS27',
    packageName: '@rdlabo/ionic-theme-ios27',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-ios27',
    englishDocsRef: '2ad5b0e84f9755ab3e806c3925ccd9e719e4512b',
    demoUrl: 'https://ionic-theme-ios27.rdlabo.dev/',
    releaseTagPrefix: 'ios27-v',
    category: 'frontend-tools',
    icon: 'theme',
    adapter: 'markdown',
    description: text(
      'iOS 27 design styling for Ionic applications (release candidate).',
      'Ionicアプリ向けのiOS 27デザインスタイル（RC版）。',
    ),
    headline: text('Bring iOS 27 design to Ionic apps', 'IonicアプリにiOS 27デザインを取り入れる'),
    overview: text(
      'Apply iOS 27 CSS, transitions, and Liquid Glass interactions to Ionic components. Versions before 1.0.0 are release candidates and may include breaking changes.',
      'IonicコンポーネントへiOS 27のCSS、トランジション、Liquid Glassインタラクションを適用します。1.0.0まではRC版で、互換性のない変更が入る場合があります。',
    ),
    featuresHeading: text('Theme capabilities', 'テーマの機能'),
    features: [
      {
        title: text('iOS 27 CSS and design', 'iOS 27のCSSとデザイン'),
        description: text(
          'Restyle Ionic components to follow the latest iOS 27 design language.',
          'Ionicコンポーネントを最新のiOS 27デザイン言語に合わせて再スタイルします。',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-10', '2026-09-10'),
      }),
      page(
        'Using ion-item-group',
        'ion-item-groupの使用方法',
        'using-ion-item-group',
        'using-ion-item-group.md',
        'Guides',
        'ガイド',
        { updatedAt: text('2026-09-10', '2026-09-10') },
      ),
      page(
        'Special markup and classes',
        '特別なマークアップとクラス',
        'special-markup',
        'special-markup.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Keep lists consistent with ESLint',
        'ESLintでリストの構造を整える',
        'eslint',
        'eslint.md',
        'Guides',
        'ガイド',
        {
          seoTitle: text(
            'Check Ionic iOS 27 list markup with ESLint | rdlabo',
            'Ionic iOS 27のリスト構造をESLintで検査 | rdlabo',
          ),
          seoDescription: text(
            'Catch missing item groups in Ionic Angular templates with a focused ESLint rule for the iOS 27 theme.',
            'iOS 27テーマ向けのESLintルールで、Ionic Angularテンプレートのリストグループ漏れを検出します。',
          ),
          updatedAt: text('2026-09-10', '2026-09-10'),
        },
      ),
      page('Features', '機能', 'features', 'features.md', 'Guides', 'ガイド'),
      page(
        'Experimental Animation',
        '実験的なアニメーション',
        'experimental-animation',
        'experimental-animation.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Adaptive iOS themes',
        'iOSテーマの切り替え',
        'ios-adaptive',
        'ios-adaptive.md',
        'Guides',
        'ガイド',
      ),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        localEnglishSource: true,
      }),
    ],
  },
  {
    id: 'ionic-theme-ios26',
    slug: 'ionic-theme-ios26',
    sourceDirectory: 'ionic-theme-ios26',
    name: 'rdlabo Ionic Theme iOS26',
    shortName: 'Ionic Theme iOS26',
    packageName: '@rdlabo/ionic-theme-ios26',
    repositoryUrl: 'https://github.com/rdlabo-dev/ionic-theme-ios27',
    englishDocsRef: 'f187d7f74b30b6de6fa7522bf215549c540c6c9b',
    englishDocsEditBranch: 'ios26',
    demoUrl: 'https://ionic-theme-ios26.rdlabo.dev/',
    releaseTagPrefix: 'ios26-v',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'Using ion-item-group',
        'ion-item-groupの使用方法',
        'using-ion-item-group',
        'using-ion-item-group.md',
        'Guides',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Special markup and classes',
        '特別なマークアップとクラス',
        'special-markup',
        'special-markup.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Keep lists consistent with ESLint',
        'ESLintでリストの構造を整える',
        'eslint',
        'eslint.md',
        'Guides',
        'ガイド',
        {
          seoTitle: text(
            'Check Ionic iOS 26 list markup with ESLint | rdlabo',
            'Ionic iOS 26のリスト構造をESLintで検査 | rdlabo',
          ),
          seoDescription: text(
            'Catch missing item groups in Ionic Angular templates with a focused ESLint rule for the iOS 26 theme.',
            'iOS 26テーマ向けのESLintルールで、Ionic Angularテンプレートのリストグループ漏れを検出します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Features', '機能', 'features', 'features.md', 'Guides', 'ガイド'),
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
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        localEnglishSource: true,
      }),
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
    demoUrl: 'https://ionic-theme-md3.rdlabo.dev/',
    englishDocsRef: 'aebdda0880eaf9bed201796a456b0ff0b8677a5e',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Documentation', 'ドキュメント', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'Using ion-item-group',
        'ion-item-groupの使用方法',
        'using-ion-item-group',
        'using-ion-item-group.md',
        'Guides',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Special markup',
        '特別なマークアップ',
        'special-markup',
        'special-markup.md',
        'Guides',
        'ガイド',
      ),
      page(
        'Keep lists consistent with ESLint',
        'ESLintでリストの構造を整える',
        'eslint',
        'eslint.md',
        'Guides',
        'ガイド',
        {
          seoTitle: text(
            'Check Ionic Material Design 3 lists with ESLint | rdlabo',
            'Ionic Material Design 3のリスト構造をESLintで検査 | rdlabo',
          ),
          seoDescription: text(
            'Check Ionic Angular list grouping for the Material Design 3 theme with ESLint, locally and in CI.',
            'Material Design 3テーマのIonic Angularリスト構造を、ESLintでローカルとCIから検査します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        localEnglishSource: true,
      }),
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
    englishDocsRef: 'c38d732e0973c979e174ce4c7c06f8c9ae608faa',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Initialize', '初期化', 'initialize', 'initialize.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Usage', '使い方', 'usage', 'usage.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('CLI Options', 'CLI オプション', 'options', 'options.md', 'Guides', 'ガイド'),
      page('FAQ', 'FAQ', 'faq', 'faq.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
      page('CLI API', 'CLI API', 'api', 'api.md', 'Reference', 'リファレンス'),
    ],
  },
  {
    id: 'workers-timezone',
    slug: 'workers-timezone',
    sourceDirectory: 'workers-timezone',
    name: 'rdlabo Workers Timezone',
    shortName: 'Workers Timezone',
    packageName: '@rdlabo/workers-timezone',
    repositoryUrl: 'https://github.com/rdlabo-dev/workers-hono-kit',
    // Reviewed runnable guides; API package versions remain pinned independently.
    englishDocsRef: 'fe1bf936e26027aca63ae196988cc071b0ac164e',
    seoTitle: text(
      'Cloudflare Workers timezone utilities + ESLint | rdlabo',
      'Cloudflare Workersのタイムゾーン・日時変換とESLint | rdlabo',
    ),
    category: 'developer-tools',
    icon: 'server',
    adapter: 'markdown',
    description: text(
      'IANA timezone conversion and calendar helpers for Cloudflare Workers, paired with ESLint checks for implicit Date and Intl timezone usage.',
      'Cloudflare WorkersのIANAタイムゾーン変換と日付計算。ESLintと組み合わせ、Date・Intlの暗黙のタイムゾーン依存を検出します。',
    ),
    headline: text('Timezone conversion for Cloudflare Workers', 'Cloudflare Workersの日時変換'),
    overview: text(
      'Convert dates with explicit IANA timezones. Pair with @rdlabo/eslint-plugin-rules to catch implicit timezone dependencies in Date and Intl.',
      'IANAタイムゾーンを指定して日時を変換。@rdlabo/eslint-plugin-rulesと組み合わせ、Date・Intlの暗黙のタイムゾーン依存を検出します。',
    ),
    featuresHeading: text('Calendar building blocks', 'カレンダー処理の基本機能'),
    features: [
      {
        title: text('IANA timezones', 'IANAタイムゾーン'),
        description: text(
          'Convert between UTC instants and timezone-local wall clocks.',
          'UTCの時刻とタイムゾーンごとのローカル時刻を相互変換します。',
        ),
      },
      {
        title: text('Calendar boundaries', '日付の境界'),
        description: text(
          'Handle daylight-saving overlaps, skipped clocks, and calendar-day arithmetic.',
          '夏時間の重複・欠落とカレンダー日付の加算を扱います。',
        ),
      },
    ],
    pages: [
      page(
        'Try conversions and lint',
        '日時変換とlintを試す',
        'quickstart',
        'quickstart.md',
        'Quickstart',
        'クイックスタート',
        {
          seoTitle: text(
            'Cloudflare Workers timezone + ESLint quickstart | rdlabo',
            'Cloudflare Workersの日時変換とESLintを試す | rdlabo',
          ),
          seoDescription: text(
            'Try IANA timezone conversions for Cloudflare Workers locally, then detect implicit Date and Intl timezone usage with ESLint.',
            'Cloudflare Workers向けのIANAタイムゾーン変換をローカルで実行。ESLintでDate・Intlの暗黙のタイムゾーン依存を検出・修正します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        seoTitle: text(
          'Cloudflare Workers timezone library: setup | rdlabo',
          'Cloudflare Workersのタイムゾーン設定・導入 | rdlabo',
        ),
        seoDescription: text(
          'Set up workers-timezone for Cloudflare Workers: initialize an IANA timezone, convert UTC and local dates, and enable the companion ESLint preset.',
          'Cloudflare Workersにworkers-timezoneを導入。IANAタイムゾーンの初期化、UTCとローカル日時の変換、併用するESLint presetの設定を紹介します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'Catch timezone bugs with ESLint',
        'ESLintで日時のバグを防ぐ',
        'eslint',
        'eslint.md',
        'Guides',
        'ガイド',
        {
          seoTitle: text(
            'Catch Cloudflare Workers timezone bugs with ESLint | rdlabo',
            'Cloudflare Workersの日時のバグをESLintで防ぐ | rdlabo',
          ),
          seoDescription: text(
            'Pair workers-timezone with typed ESLint checks to detect host-local Date and Intl operations and request-scoped initialization in Cloudflare Workers.',
            'Cloudflare Workersのworkers-timezoneに型情報付きESLintを併用し、Date・Intlの暗黙のタイムゾーン依存とリクエスト内の初期化を検出します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Timezones and calendar dates',
        'タイムゾーンと日付',
        'timezones',
        'timezones.md',
        'Guides',
        'ガイド',
        {
          seoTitle: text(
            'Cloudflare Workers: timezones, dates and DST | rdlabo',
            'Cloudflare Workersのタイムゾーン・日付計算・夏時間 | rdlabo',
          ),
          seoDescription: text(
            'Handle local dates and daylight saving time in Cloudflare Workers with IANA timezones, calendar-day arithmetic, and explicit conversion policies.',
            'Cloudflare WorkersでIANAタイムゾーンを指定し、ローカル日付・日付加算・夏時間の重複と欠落を扱う方法を解説します。',
          ),
        },
      ),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers timezone migration guide | rdlabo',
          'Cloudflare Workersの日時処理をworkers-timezoneへ移行 | rdlabo',
        ),
        seoDescription: text(
          'Migrate Cloudflare Workers date handling to workers-timezone. Update imports and review changes to historical offsets, invalid dates, and DST behavior.',
          'Cloudflare Workersの日時処理をworkers-timezoneへ移行。import変更、過去のUTCオフセット、不正日付、夏時間の動作変更を確認できます。',
        ),
      }),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        seoTitle: text(
          'Cloudflare Workers timezone API reference | rdlabo',
          'Cloudflare Workers向け日時変換APIリファレンス | rdlabo',
        ),
        seoDescription: text(
          'API reference for workers-timezone on Cloudflare Workers: initialization, IANA timezones, local date conversion, and calendar helpers.',
          'Cloudflare Workers向けworkers-timezoneのAPI。初期化、IANAタイムゾーン、ローカル日時変換、カレンダー処理の関数と型を確認できます。',
        ),
      }),
    ],
  },
  {
    id: 'workers-mysql',
    slug: 'workers-mysql',
    sourceDirectory: 'workers-mysql',
    name: 'rdlabo Workers MySQL',
    shortName: 'Workers MySQL',
    packageName: '@rdlabo/workers-mysql',
    repositoryUrl: 'https://github.com/rdlabo-dev/workers-hono-kit',
    // Reviewed runnable guides; API package versions remain pinned independently.
    englishDocsRef: 'fe1bf936e26027aca63ae196988cc071b0ac164e',
    seoTitle: text(
      'Cloudflare Workers MySQL + Hyperdrive library | rdlabo',
      'Cloudflare WorkersのMySQL・Hyperdrive連携 | rdlabo',
    ),
    category: 'developer-tools',
    icon: 'server',
    adapter: 'markdown',
    description: text(
      'MySQL access for Cloudflare Workers with Hyperdrive, primary/replica routing, deadlock retries, and Drizzle integration.',
      'Cloudflare WorkersのMySQL接続基盤。Hyperdrive、primary/replica、デッドロック再試行、Drizzle連携を提供します。',
    ),
    headline: text(
      'MySQL and Hyperdrive for Cloudflare Workers',
      'Cloudflare WorkersのMySQL・Hyperdrive連携',
    ),
    overview: text(
      'MySQL access through Hyperdrive, with primary/replica routing, deadlock retries, and Drizzle integration.',
      'Hyperdrive経由のMySQL接続、primary/replicaの使い分け、デッドロック再試行、Drizzle連携を提供します。',
    ),
    featuresHeading: text('Database building blocks', 'データベースの基本機能'),
    features: [
      {
        title: text('Hyperdrive runtime', 'Hyperdriveランタイム'),
        description: text(
          'Use invocation-scoped connections and explicit primary/replica read paths.',
          '呼び出し単位の接続と明示的なprimary/replicaの読み取り経路を利用します。',
        ),
      },
      {
        title: text('Optional Drizzle integration', '任意のDrizzle連携'),
        description: text(
          'Keep schemas in the application and share one Drizzle type identity.',
          'スキーマをアプリで管理し、Drizzleの型を同じ依存から共有します。',
        ),
      },
      {
        title: text('Tooling boundaries', 'ツールの境界'),
        description: text(
          'Keep migration and destructive test helpers separate from Worker bundles.',
          '移行処理や破壊的テストヘルパーをWorkerのバンドルから分離します。',
        ),
      },
    ],
    pages: [
      page(
        'Run your first query',
        '最初のクエリを実行する',
        'quickstart',
        'quickstart.md',
        'Quickstart',
        'クイックスタート',
        {
          seoTitle: text(
            'Cloudflare Workers MySQL: local query to Hyperdrive | rdlabo',
            'Cloudflare WorkersのMySQL入門：ローカルからHyperdriveへ | rdlabo',
          ),
          seoDescription: text(
            'Run a local MySQL query with workers-mysql, then use a Hyperdrive binding in Cloudflare Workers. Includes setup, code, and expected output.',
            'workers-mysqlでローカルMySQLのクエリを実行し、Cloudflare WorkersのHyperdrive接続へ進みます。設定・コード・実行結果を掲載。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        seoTitle: text(
          'Cloudflare Workers MySQL library: setup | rdlabo',
          'Cloudflare WorkersのMySQLライブラリを導入する | rdlabo',
        ),
        seoDescription: text(
          'Install workers-mysql for Cloudflare Workers. Configure nodejs_compat and choose Hyperdrive runtime, Drizzle, or migration and testing entry points.',
          'Cloudflare Workersにworkers-mysqlを導入。nodejs_compat設定と、Hyperdrive・Drizzle・移行・テスト用エントリポイントを紹介します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Runtime', 'ランタイム', 'runtime', 'runtime.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers MySQL connections with Hyperdrive | rdlabo',
          'Cloudflare WorkersとHyperdriveのMySQL接続管理 | rdlabo',
        ),
        seoDescription: text(
          'Manage Cloudflare Workers MySQL connections with Hyperdrive, primary/replica routing, transactions, and deadlock retries using workers-mysql.',
          'workers-mysqlでCloudflare WorkersのMySQL接続を管理。Hyperdrive、primary/replica、transaction、デッドロック再試行を解説します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Drizzle and dates', 'Drizzleと日付', 'drizzle', 'drizzle.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers MySQL: Drizzle and date handling | rdlabo',
          'Cloudflare WorkersのMySQL・Drizzleと日時の扱い | rdlabo',
        ),
        seoDescription: text(
          'Use Drizzle with MySQL on Cloudflare Workers. Configure ORM integration and fixed +09:00 storage helpers separately from IANA display timezones.',
          'Cloudflare WorkersのMySQLでDrizzleを利用。ORM連携と固定+09:00の保存ヘルパーを、表示用IANAタイムゾーンと分けて解説します。',
        ),
      }),
      page('Migrations and testing', '移行とテスト', 'tooling', 'tooling.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers MySQL: migrations and testing | rdlabo',
          'Cloudflare Workers向けMySQLのマイグレーションとテスト | rdlabo',
        ),
        seoDescription: text(
          'Run Node.js migration and database test tooling for Cloudflare Workers MySQL projects. Keep these tools separate from the Worker runtime.',
          'Cloudflare WorkersのMySQLプロジェクト向けに、Node.jsで動かすマイグレーションとDBテストツールの設定・使い方を解説します。',
        ),
      }),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers MySQL package migration | rdlabo',
          'Cloudflare WorkersのDB処理をworkers-mysqlへ移行 | rdlabo',
        ),
        seoDescription: text(
          'Move database imports from workers-hono-kit to workers-mysql for Cloudflare Workers, including Hyperdrive runtime and the Hono adapter.',
          'Cloudflare WorkersのDB処理をworkers-hono-kitからworkers-mysqlへ移行。import、Hyperdriveランタイム、Hono adapterを整理します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        seoTitle: text(
          'Cloudflare Workers MySQL API reference | rdlabo',
          'Cloudflare Workers向けMySQL APIリファレンス | rdlabo',
        ),
        seoDescription: text(
          'API reference for workers-mysql: Cloudflare Workers Hyperdrive connections, transactions, retries, Drizzle integration, and Node.js tooling.',
          'Cloudflare Workers向けworkers-mysqlのAPI。Hyperdrive接続、transaction、再試行、Drizzle連携、Node.jsツールの関数と型を掲載。',
        ),
      }),
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
    // Reviewed runnable guides; API package versions remain pinned independently.
    englishDocsRef: 'fe1bf936e26027aca63ae196988cc071b0ac164e',
    seoTitle: text(
      'Hono for Cloudflare Workers: API toolkit | rdlabo',
      'Cloudflare WorkersのHono API開発ツールキット | rdlabo',
    ),
    category: 'developer-tools',
    icon: 'server',
    adapter: 'markdown',
    description: text(
      'Build Hono APIs on Cloudflare Workers with validation, Firebase authentication, JSON errors, queues, and testing helpers.',
      'Cloudflare WorkersのHono API向けに、バリデーション、Firebase認証、JSONエラー、Queue、テストヘルパーを提供します。',
    ),
    headline: text(
      'Hono API helpers for Cloudflare Workers',
      'Cloudflare WorkersのHono API開発を支える',
    ),
    overview: text(
      'Compose Hono APIs with shared validation, authentication, JSON errors, queues, and test helpers.',
      'バリデーション、認証、JSONエラー、Queue、テストヘルパーを組み合わせてHono APIを構築できます。',
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
          'Connect standalone MySQL and timezone packages through the Hono container adapter.',
          '独立したMySQL・タイムゾーンパッケージをHonoコンテナーアダプターと組み合わせます。',
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
        'Try a Hono API locally',
        'Hono APIをローカルで試す',
        'quickstart',
        'quickstart.md',
        'Quickstart',
        'クイックスタート',
        {
          seoTitle: text(
            'Cloudflare Workers Hono API: local quickstart | rdlabo',
            'Cloudflare Workers向けHono APIをローカルで試す | rdlabo',
          ),
          seoDescription: text(
            'Try workers-hono-kit for Cloudflare Workers locally with Hono app.request. Verify a health response, weak ETags, and JSON errors.',
            'Cloudflare Workers向けworkers-hono-kitをHonoのapp.requestで試します。health応答、weak ETag、JSONエラーをローカルで確認できます。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
        {
          seoTitle: text(
            'Cloudflare Workers Hono Kit: installation and setup | rdlabo',
            'Cloudflare WorkersのHono Kit：インストールと設定 | rdlabo',
          ),
          seoDescription: text(
            'Install workers-hono-kit for Hono APIs on Cloudflare Workers. Choose entry points for HTTP, authentication, queues, and testing.',
            'Cloudflare WorkersのHono APIにworkers-hono-kitを導入。HTTP、認証、Queue、テストに必要なエントリポイントを紹介します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'HTTP and Authentication',
        'HTTP・認証',
        'http-auth',
        'http-auth.md',
        'Guide',
        'ガイド',
        {
          seoTitle: text(
            'Cloudflare Workers Hono: validation and Firebase auth | rdlabo',
            'Cloudflare WorkersのHono：バリデーションとFirebase認証 | rdlabo',
          ),
          seoDescription: text(
            'Build Hono APIs on Cloudflare Workers with validation, Firebase authentication, consistent JSON errors, and response finalization helpers.',
            'Cloudflare WorkersのHono APIでバリデーション、Firebase認証、共通JSONエラー、レスポンス確定のヘルパーを利用する方法を解説します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('Data Layer', 'データ層', 'data-layer', 'data-layer.md', 'Guide', 'ガイド', {
        seoTitle: text(
          'Cloudflare Workers Hono: MySQL and Hyperdrive | rdlabo',
          'Cloudflare WorkersのHonoとMySQL・Hyperdrive連携 | rdlabo',
        ),
        seoDescription: text(
          'Connect Hono request containers to workers-mysql on Cloudflare Workers. Use the Hyperdrive adapter, timezone helpers, and database retry utilities.',
          'Cloudflare WorkersのHonoコンテナーとworkers-mysqlを接続。Hyperdrive adapter、日時ヘルパー、DB再試行の使い方を解説します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'Realtime and Offline',
        'Realtime・Offline',
        'realtime-offline',
        'realtime-offline.md',
        'Guide',
        'ガイド',
        {
          seoTitle: text(
            'Cloudflare Workers Hono: WebSockets and offline sync | rdlabo',
            'Cloudflare WorkersのHono：WebSocketとオフライン同期 | rdlabo',
          ),
          seoDescription: text(
            'Use Durable Object WebSocket patterns and offline replica contracts with workers-hono-kit for Cloudflare Workers applications.',
            'Cloudflare Workers向けworkers-hono-kitのDurable Object WebSocketパターンと、オフラインレプリカ・同期の契約を解説します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Testing and Operations',
        'テスト・運用',
        'testing-operations',
        'testing-operations.md',
        'Reference',
        'リファレンス',
        {
          seoTitle: text(
            'Cloudflare Workers Hono: testing, queues and logging | rdlabo',
            'Cloudflare WorkersのHono：テスト・Queue・ログ | rdlabo',
          ),
          seoDescription: text(
            'Test and operate Hono APIs on Cloudflare Workers with service fakes, database fixtures, Queue error logging, and operational CLIs.',
            'Cloudflare WorkersのHono APIをテスト・運用。service fake、DB fixture、Queueのエラーログ、運用CLIの使い方を紹介します。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        seoTitle: text(
          'Cloudflare Workers Hono Kit API reference | rdlabo',
          'Cloudflare Workers Hono Kit APIリファレンス | rdlabo',
        ),
        seoDescription: text(
          'API reference for workers-hono-kit on Cloudflare Workers: HTTP, Firebase auth, database adapters, queues, realtime, and testing helpers.',
          'Cloudflare Workers向けworkers-hono-kitのAPI。HTTP、Firebase認証、DB adapter、Queue、Realtime、テストのエントリポイントを掲載。',
        ),
        localEnglishSource: true,
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
    // Reviewed runnable guides; API package versions remain pinned independently.
    englishDocsRef: '4f7aa80c5bfd443b53fe746e66fcaf07375da275',
    category: 'developer-tools',
    icon: 'lint',
    adapter: 'markdown',
    description: text(
      'Opinionated Angular, Ionic, TypeScript, and Cloudflare Workers rules for maintainable applications.',
      '保守しやすいアプリケーションのためのAngular・Ionic・TypeScript・Cloudflare Workers向けESLintルール集。',
    ),
    headline: text(
      'See code conventions work before code review',
      'コード規約をレビュー前に実行できる検査にする',
    ),
    overview: text(
      'ESLint presets for Angular/Ionic conventions, Workers error boundaries, and timezone-safe code.',
      'Angular・Ionicの設計規約、Workersのエラー境界、日時処理を検査するESLint presetを提供します。',
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
          'Use the /typescript entry point for Workers error-boundary and timezone presets without loading Angular or Ionic.',
          'AngularやIonicを読み込まず、/typescriptからWorkersのエラー境界・タイムゾーンpresetを利用できます。',
        ),
      },
    ],
    pages: [
      page(
        'Try detection and autofix',
        '検出と自動修正を試す',
        'quickstart',
        'quickstart.md',
        'Quickstart',
        'クイックスタート',
        {
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Getting Started',
        'はじめに',
        'getting-started',
        'getting-started.md',
        'Guide',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page('Configuration', '設定', 'configuration', 'configuration.md', 'Guide', 'ガイド', {
        seoTitle: text(
          'Configure Angular and Ionic ESLint Rules | rdlabo',
          'Angular・Ionic向けESLintルールの設定 | rdlabo',
        ),
        seoDescription: text(
          'Configure @rdlabo/eslint-plugin-rules with flat config presets for Angular, Ionic, or framework-independent TypeScript projects.',
          '@rdlabo/eslint-plugin-rulesのFlat Configを使い、Angular・Ionic・汎用TypeScript向けのESLintプリセットを設定します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Rules', 'ルール一覧', 'rules', 'rules.md', 'Reference', 'リファレンス', {
        seoTitle: text(
          'Angular, Ionic, and TypeScript ESLint Rules | rdlabo',
          'Angular・Ionic・TypeScript向けESLintルール一覧 | rdlabo',
        ),
        seoDescription: text(
          'Browse every @rdlabo/eslint-plugin-rules rule for Angular Signals, Ionic components, component boundaries, forms, and safe asynchronous code.',
          'Angular Signal、Ionic Component、Component境界、フォーム、安全な非同期処理を検査する@rdlabo/eslint-plugin-rulesのルール一覧です。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Migration', '移行', 'migration', 'migration.md', 'Guide', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('API', 'API', 'api', 'api.md', 'Reference', 'リファレンス', {
        localEnglishSource: true,
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
    englishDocsRef: 'bcec66c8cedd896bc0ecb620c2f95875d372328e',
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
      'Generate Markdown and JSON from TypeScript interfaces and JSDoc, including inherited members, using the familiar docgen command.',
      '使い慣れたdocgenコマンドで、TypeScriptのinterfaceとJSDocからMarkdown・JSONを生成。継承したメンバーも出力に含めます。',
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
        { updatedAt: text('2026-09-06', '2026-09-06') },
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
    entryGuideSlugs: ['vanilla-js', 'server-integration', 'payment-sheet'],
    slug: 'capacitor-stripe',
    sourceDirectory: 'stripe',
    name: 'Capacitor Community Stripe',
    shortName: 'Stripe',
    packageName: '@capacitor-community/stripe',
    repositoryUrl: 'https://github.com/capacitor-community/stripe',
    category: 'capacitor-plugins',
    icon: 'payments',
    seoTitle: text(
      'Capacitor Stripe Plugin Documentation | rdlabo',
      'Capacitor Stripe プラグイン ドキュメント | rdlabo',
    ),
    description: text(
      'Integrate Stripe PaymentSheet, Apple Pay, and Google Pay in Capacitor apps with @capacitor-community/stripe for iOS, Android, and web.',
      'Capacitorアプリに@capacitor-community/stripeを導入し、iOS・Android・WebでPaymentSheet、Apple Pay、Google Payを実装するためのドキュメント。',
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
        {
          seoTitle: text(
            'Configure Capacitor Stripe for iOS, Android, and Web | rdlabo',
            'Capacitor StripeのiOS・Android・Web設定 | rdlabo',
          ),
          seoDescription: text(
            'Configure @capacitor-community/stripe with a publishable key and platform settings before presenting PaymentSheet, Apple Pay, or Google Pay.',
            '@capacitor-community/stripeに公開可能キーと各Platformの設定を追加し、PaymentSheet、Apple Pay、Google Payを利用する準備をします。',
          ),
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page(
        'Vanilla JS',
        'Vanilla JS',
        'vanilla-js',
        'vanilla-js.md',
        'Quickstart',
        'クイックスタート',
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page('Angular', 'Angular', 'angular', 'angular.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('React', 'React', 'react', 'react.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
      page('Initialize', '初期化', 'initialize', 'initialize.md', 'Methods', 'メソッド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
          updatedAt: text('2026-09-06', '2026-09-06'),
        },
      ),
      page('PaymentFlow', 'PaymentFlow', 'payment-flow', 'payment-flow.md', 'Methods', 'メソッド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Apple Pay', 'Apple Pay', 'apple-pay', 'apple-pay.md', 'Methods', 'メソッド', {
        seoTitle: text(
          'Capacitor Stripe Apple Pay Integration | rdlabo',
          'Capacitor StripeでApple Payを実装 | rdlabo',
        ),
        seoDescription: text(
          'Create, present, and confirm Apple Pay payments in a Capacitor app with @capacitor-community/stripe on supported Apple devices.',
          '@capacitor-community/stripeを使い、対応するApple端末のCapacitorアプリでApple Pay決済を作成・表示・確定します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Google Pay', 'Google Pay', 'google-pay', 'google-pay.md', 'Methods', 'メソッド', {
        seoTitle: text(
          'Capacitor Stripe Google Pay Integration | rdlabo',
          'Capacitor StripeでGoogle Payを実装 | rdlabo',
        ),
        seoDescription: text(
          'Create, present, and confirm Google Pay payments in a Capacitor app with @capacitor-community/stripe on supported Android devices.',
          '@capacitor-community/stripeを使い、対応するAndroid端末のCapacitorアプリでGoogle Pay決済を作成・表示・確定します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Identity Verification Sheet',
        '本人確認シート',
        'identity-verification-sheet',
        'identity-verification-sheet.md',
        'Guide',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
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
        { updatedAt: text('2026-09-06', '2026-09-06') },
      ),
      page(
        'Collect a Payment',
        '支払いを受け付ける',
        'collect-a-payment',
        'collect-a-payment.md',
        'Guides',
        'ガイド',
        { updatedAt: text('2026-09-06', '2026-09-06') },
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
    englishDocsRef: '1fe972b041d068a97c08fa7b305d97b51901aa08',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        seoTitle: text(
          'Capacitor AdMob Plugin Setup Guide | rdlabo',
          'Capacitor AdMob プラグイン導入ガイド | rdlabo',
        ),
        seoDescription: text(
          'Install and configure @capacitor-community/admob to initialize Google Mobile Ads and display native ads in Capacitor apps on iOS and Android.',
          '@capacitor-community/admobを導入し、iOS・AndroidのCapacitorアプリでGoogle Mobile Adsを初期化してネイティブ広告を表示します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page(
        'Initialize',
        '初期化',
        'configuration',
        'configuration.md',
        'Quickstart',
        'クイックスタート',
      ),
      page('Consent', '同意管理', 'consent', 'consent.md', 'Guides', 'ガイド'),
      page('Testing', 'テスト', 'testing', 'testing.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Banner Ads', 'バナー広告', 'banner', 'banner.md', 'Ad formats', '広告フォーマット'),
      page(
        'Interstitial Ads',
        'インタースティシャル広告',
        'interstitial',
        'interstitial.md',
        'Ad formats',
        '広告フォーマット',
        {
          seoTitle: text(
            'Capacitor AdMob Interstitial Ads Guide | rdlabo',
            'Capacitor AdMobインタースティシャル広告ガイド | rdlabo',
          ),
          seoDescription: text(
            'Prepare, show, and handle interstitial ad events in Capacitor apps with @capacitor-community/admob on iOS and Android.',
            '@capacitor-community/admobを使い、iOS・AndroidのCapacitorアプリでインタースティシャル広告の準備・表示・Event処理を実装します。',
          ),
          updatedAt: text('2026-08-31', '2026-08-31'),
        },
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
    englishDocsRef: '2c44cd5cc9dc34f254ac3941c172e03c99af149a',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Configuration', '設定', 'configuration', 'configuration.md', 'Guides', 'ガイド'),
      page('Authentication', '認証', 'authentication', 'authentication.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('App Events', 'App Events', 'app-events', 'app-events.md', 'Guides', 'ガイド'),
    ],
  },
  {
    id: 'capacitor-local-llm',
    slug: 'capacitor-local-llm',
    sourceDirectory: 'capacitor-local-llm',
    name: 'rdlabo Capacitor Local LLM',
    shortName: 'Local LLM',
    packageName: '@rdlabo/capacitor-local-llm',
    repositoryUrl: 'https://github.com/rdlabo-dev/capacitor-local-llm',
    englishDocsRef: 'baa34363b142f8224467b1d964d502e340d8d05e',
    seoTitle: text(
      'Capacitor Local LLM for iOS, Android and Chrome | rdlabo',
      'Capacitor Local LLM：iOS・Android・ChromeでAIを実行 | rdlabo',
    ),
    category: 'capacitor-plugins',
    icon: 'app',
    description: text(
      'On-device text generation for Capacitor iOS, Android, and supported desktop Chrome, plus native image features.',
      'CapacitorのiOS・Android・対応デスクトップChromeでオンデバイステキスト生成。ネイティブの画像機能も提供します。',
    ),
    headline: text('Run AI on the device', 'デバイス上でAIを実行する'),
    overview: text(
      'Use one chat API for native apps and supported desktop Chrome, with streaming, cancellation, and availability checks. Image features use native backends. Independently maintained fork of Ionic Local LLM.',
      'ネイティブアプリと対応デスクトップChromeで共通のチャットAPIを使い、ストリーミング、キャンセル、利用可否を扱えます。画像機能はネイティブのバックエンドを利用します。Ionic Local LLMの独立管理フォークです。',
    ),
    featuresHeading: text('On-device AI features', 'オンデバイスAI機能'),
    features: [
      {
        title: text('Text generation in Chrome', 'Chromeでテキスト生成'),
        description: text(
          'Use Chrome’s built-in Prompt API without a server or API key. Check model availability before starting.',
          'Chrome内蔵のPrompt APIで、サーバーやAPIキーなしに生成します。開始前にモデルの利用可否を確認します。',
        ),
      },
      {
        title: text('Chat lifecycle', 'チャットのライフサイクル'),
        description: text(
          'Create chats, stream responses, observe generation state, and cancel work.',
          'チャット作成、応答のストリーミング、生成状態の監視、キャンセルに対応します。',
        ),
      },
      {
        title: text('Availability first', '利用可否を先に確認'),
        description: text(
          'Check text and image capabilities separately before generation.',
          '生成前にテキストと画像それぞれの利用可否を確認します。',
        ),
      },
      {
        title: text('Explicit Android fallback', '明示的なAndroidフォールバック'),
        description: text(
          'Configure an app-managed LiteRT-LM model when needed; validate on physical devices.',
          '必要に応じてアプリ管理のLiteRT-LMモデルを設定します。実機検証が必要です。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Setup', 'セットアップ', 'setup', 'setup.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Web (Chrome)', 'Web（Chrome）', 'web', 'web.md', 'Guides', 'ガイド', {
        seoTitle: text(
          'On-device AI in Chrome with Capacitor Local LLM | rdlabo',
          'Capacitor Local LLMでChromeのオンデバイスAIを使う | rdlabo',
        ),
        seoDescription: text(
          'Set up Chrome Prompt API text generation with Capacitor Local LLM: model availability, downloads, streaming, cancellation, and Web limitations.',
          'Capacitor Local LLMでChrome Prompt APIを利用。モデルの利用可否・ダウンロード、ストリーミング、キャンセル、Webの制約を解説します。',
        ),
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Availability', '利用可否', 'availability', 'availability.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Chat', 'チャット', 'chat', 'chat.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Images', '画像', 'images', 'images.md', 'Guides', 'ガイド'),
      page(
        'Android fallback model',
        'Androidフォールバックモデル',
        'android-fallback',
        'android-fallback.md',
        'Guides',
        'ガイド',
      ),
      page('Events', 'イベント', 'events', 'events.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Error Handling', 'エラー処理', 'errors', 'errors.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Migration', '移行', 'migration', 'migration.md', 'Guides', 'ガイド'),
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
    englishDocsRef: 'c892241e308bdafad9c043c25f9b7f4b74cc1149',
    category: 'capacitor-plugins',
    icon: 'app',
    adapter: 'markdown',
    description: text(
      'Barcode and QR scanning for Capacitor through a native modal.',
      'ネイティブモーダルでバーコード・QRコードをスキャンするCapacitorプラグイン。',
    ),
    headline: text(
      'Scan QR codes and barcodes in a native modal',
      'QR・バーコードをネイティブモーダルで読み取る',
    ),
    overview: text(
      'Read a code into your app, or keep the camera open for consecutive scans. Configure the detection area, light, and feedback.',
      '読み取ったコードをアプリで受け取り、連続スキャンにも対応。検出エリア、ライト、読み取り時のフィードバックを設定できます。',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      groupPage('CodeScanner', 'code-scanner', { updatedAt: text('2026-09-06', '2026-09-06') }),
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
    englishDocsRef: '2b6c185faade51cc5cae3eb569ad12288d3bb6ac',
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
        title: text('React after a capture', '撮影後の案内'),
        description: text(
          'Show a message or update app UI when a screenshot event arrives.',
          'スクリーンショットの通知を受けて、メッセージやアプリ内の表示を更新します。',
        ),
      },
      {
        title: text('Watch while a screen is open', '画面に合わせて監視'),
        description: text(
          'Start watching on entry and release the watcher and listener when leaving.',
          '画面を開いたら監視を開始し、離れるときに監視とリスナーを解放します。',
        ),
      },
    ],
    pages: [
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      groupPage('ScreenshotEvent', 'screenshot-event', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
    englishDocsRef: 'c3e2ed59b345207d3c451cc656fecdf2bb084685',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Print the WebView', 'WebViewを印刷', 'web', 'web.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Print PDF and files', 'PDF・ファイルを印刷', 'pdf', 'pdf.md', 'Guides', 'ガイド', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
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
    englishDocsRef: 'c3486da72432a88512d8870a634f0c6a6868f901',
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
      page('Getting Started', 'はじめに', 'readme', 'readme.md', 'Quickstart', 'クイックスタート', {
        updatedAt: text('2026-09-10', '2026-09-10'),
      }),
      page(
        'Installation',
        'インストール',
        'installation',
        'installation.md',
        'Quickstart',
        'クイックスタート',
        {
          updatedAt: text('2026-09-10', '2026-09-10'),
        },
      ),
      page(
        'JavaScript printer helpers',
        'JavaScriptプリンターヘルパー',
        'connection-management',
        'connection-management.md',
        'JavaScript helpers',
        'JavaScriptヘルパー',
        { updatedAt: text('2026-09-10', '2026-09-10') },
      ),
      page(
        'Helper design decisions',
        'ヘルパーの設計方針',
        'helper-design',
        'helper-design.md',
        'JavaScript helpers',
        'JavaScriptヘルパー',
        { updatedAt: text('2026-09-10', '2026-09-10') },
      ),
      page('Search', 'Search', 'search', 'search.md', 'Plugin API', 'プラグインAPI', {
        updatedAt: text('2026-09-10', '2026-09-10'),
      }),
      page('Print', 'Print', 'print', 'print.md', 'Plugin API', 'プラグインAPI', {
        updatedAt: text('2026-09-06', '2026-09-06'),
      }),
      page('Events', 'Events', 'events', 'events.md', 'Plugin API', 'プラグインAPI'),
    ],
  },
];

export const localize = (value: LocalizedText, locale: Locale): string => value[locale];
