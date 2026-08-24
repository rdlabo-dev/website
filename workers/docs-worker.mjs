const legacyJapaneseStripeAngularPath = '/ja/stripe/docs/angular/';
const canonicalJapaneseStripeAngularPath = '/ja/projects/capacitor-stripe/docs/angular';

export default {
  fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === legacyJapaneseStripeAngularPath) {
      url.pathname = canonicalJapaneseStripeAngularPath;
      return Response.redirect(url, 301);
    }

    return env.ASSETS.fetch(request);
  },
};
