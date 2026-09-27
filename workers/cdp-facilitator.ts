import { HTTPFacilitatorClient } from '@x402/core/server';
import { importJWK, SignJWT } from 'jose';

function base64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function createCdpFacilitatorClient(options: {
  apiKeyId: string;
  apiKeySecret: string;
  baseUrl: string;
}): HTTPFacilitatorClient {
  const url = new URL(options.baseUrl);
  const basePath = url.pathname.replace(/\/$/, '');
  const rawKey = Uint8Array.from(atob(options.apiKeySecret), (character) =>
    character.charCodeAt(0),
  );
  if (rawKey.length !== 64) throw new Error('CDP Ed25519 key must be 64 bytes');

  const key = importJWK(
    {
      kty: 'OKP',
      crv: 'Ed25519',
      d: base64url(rawKey.subarray(0, 32)),
      x: base64url(rawKey.subarray(32)),
    },
    'EdDSA',
  );

  const auth = async (path: string, method: 'GET' | 'POST') => {
    const now = Math.floor(Date.now() / 1000);
    const nonce = base64url(globalThis.crypto.getRandomValues(new Uint8Array(16)));
    const jwt = await new SignJWT({
      sub: options.apiKeyId,
      iss: 'cdp',
      uris: [`${method} ${url.host}${path}`],
    })
      .setProtectedHeader({ alg: 'EdDSA', kid: options.apiKeyId, typ: 'JWT', nonce })
      .setIssuedAt(now)
      .setNotBefore(now)
      .setExpirationTime(now + 120)
      .sign(await key);
    return { Authorization: `Bearer ${jwt}` };
  };

  return new HTTPFacilitatorClient({
    url: options.baseUrl,
    createAuthHeaders: async () => ({
      verify: await auth(`${basePath}/verify`, 'POST'),
      settle: await auth(`${basePath}/settle`, 'POST'),
      supported: await auth(`${basePath}/supported`, 'GET'),
    }),
  });
}
