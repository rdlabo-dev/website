---
title: CLI API
---

`@rdlabo/ionic-angular-collect-icons` v3.0.2 のコマンドリファレンスです。

## Command

#### `command` npx @rdlabo/ionic-angular-collect-icons

Angularのsourceとtemplateをscanし、Applicationが使用するIoniconsを既定では `src/use-icons.ts` へ出力します。

| Option               | Type      | Description                                                    | Default            |
| -------------------- | --------- | -------------------------------------------------------------- | ------------------ |
| **`--dry-run`**      | `boolean` | Fileを書き込まず変更内容を表示します。                         | `false`            |
| **`--interactive`**  | `boolean` | Promptですべてのoptionを指定し、結果を確認します。             | `false`            |
| **`--initialize`**   | `boolean` | `initializeIonicons` の初期化を追加し、Component単位の登録を削除します。 | `false`            |
| **`--migrate`** | `boolean` | 認識されたソースの移行を明示的に許可または拒否します。未設定の場合、対話形式のターミナルでは確認を求めます。 | 未設定 |
| **`--project-path`** | `string`  | `src` をscanするProject directoryです。                        | 現在のdirectory    |
| **`--icon-path`**    | `string`  | 生成するicon登録fileです。                                     | `src/use-icons.ts` |
