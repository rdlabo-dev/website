import { localizedFragmentPath } from './locale-path';

describe('localizedFragmentPath', () => {
  it('builds an English site-local docs contents link', () => {
    expect(localizedFragmentPath('en', '/projects/ionic-theme-md3/docs/readme', 'overview')).toBe(
      '/projects/ionic-theme-md3/docs/readme#overview',
    );
  });

  it('adds exactly one Japanese locale prefix to docs contents links', () => {
    expect(localizedFragmentPath('ja', '/projects/ionic-theme-md3/docs/readme', 'overview')).toBe(
      '/ja/projects/ionic-theme-md3/docs/readme#overview',
    );
  });
});
