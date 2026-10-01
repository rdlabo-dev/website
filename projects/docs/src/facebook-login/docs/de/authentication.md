---
title: "Authentifizierung"
sourceRevision: "876a29c09664c032c29acad5e4b1750831ef35bc8859978d94134a10822c3b50"
---
# Authentifizierung

Schließen Sie [Konfiguration](https://docs.rdlabo.dev/projects/capacitor-facebook-login/docs/configuration) ab, bevor Sie die Authentifizierungsmethoden verwenden.

## Plattformverhalten

| Methode                  | Android   | iOS                      | Web             |
| ----------------------- | --------- | ------------------------ | --------------- |
| `login`                 | Unterstützt | Standardmäßig Limited Login | Unterstützt       |
| `logout`                | Unterstützt | Unterstützt                | Unterstützt       |
| `reauthorize`           | Unterstützt | Unterstützt                | Nicht implementiert |
| `getCurrentAccessToken` | Unterstützt | Limited-Login-Token      | Unterstützt       |
| `getProfile`            | Unterstützt | Benötigt ein Graph-Token   | Unterstützt       |

Die Anmeldeoption `tracking` ist ausschließlich für iOS verfügbar und hat den Standardwert `limited`. Bei Limited Login gibt iOS ein OIDC-Authentifizierungstoken (JWT) zurück, kein Graph-API-Zugriffstoken. Das Plugin gibt das mit `tracking: 'enabled'` erhaltene Graph-Zugriffstoken derzeit nicht zurück.

Die Option `nonce` wird von Android und iOS verwendet und im Web ignoriert. Übergeben Sie die rohe Nonce; die nativen Implementierungen hashen sie vor der Übergabe an das Facebook SDK.

## Anmeldung

Fordern Sie ausschließlich die Berechtigungen an, die Ihre Anwendung verwendet. Rufen Sie `login` aus einer Nutzeraktion wie einem Schaltflächenklick auf:

```ts
import { FacebookLogin } from '@capacitor-community/facebook-login';

const result = await FacebookLogin.login({
  permissions: ['email'],
});

if (result.accessToken) {
  console.log('Facebook login succeeded.');
} else {
  // Abgebrochen oder von der nativen Plattform kein Token zurückgegeben.
  console.log('Facebook login canceled or returned no token.');
}
```

Protokollieren Sie `accessToken.token` nicht. Im Web wird login zurückgewiesen, wenn Facebook kein nutzbares Token zurückgibt. Unter Android und iOS wird eine abgebrochene Anmeldung ohne Token aufgelöst.

### iOS-Tracking-Modus und Nonce

```ts
const result = await FacebookLogin.login({
  permissions: ['email'],
  tracking: 'limited',
  nonce: crypto.randomUUID(),
});
```

Limited-Login-Tokens sollten von Ihrem Backend als OIDC-Tokens validiert werden. Behandeln Sie sie nicht als Graph-API-Zugriffstokens.

## Aktuelles Token

```ts
const result = await FacebookLogin.getCurrentAccessToken();

if (result.accessToken) {
  console.log('Current Facebook token is available.', {
    isExpired: result.accessToken.isExpired,
    permissions: result.accessToken.permissions,
  });
}
```

Native Plattformen lösen bei abgemeldetem Zustand ohne Token auf. Das Web weist zurück, wenn keine verbundene Facebook-Sitzung vorhanden ist.

## Profilfelder

```ts
const profile = await FacebookLogin.getProfile<{
  id: string;
  email?: string;
}>({ fields: ['id', 'email'] });
```

Die Felder müssen für Ihre Meta-App zulässig und vom Nutzer freigegeben sein. Das zurückgegebene Objekt enthält nur von der Graph API gelieferte Felder. Unter iOS erfordert dies ein Graph-Zugriffstoken und funktioniert nicht mit dem standardmäßigen Limited-Login-Token.

## Datenzugriff erneut autorisieren

Erneute Autorisierung ist ausschließlich unter Android und iOS verfügbar.

```ts
const result = await FacebookLogin.reauthorize();

if (result.accessToken) {
  console.log('Data access was renewed.');
}
```

## Abmeldung

```ts
await FacebookLogin.logout();
```

Die Abmeldung entfernt die vom Plattform-SDK verwaltete Facebook-Sitzung.
