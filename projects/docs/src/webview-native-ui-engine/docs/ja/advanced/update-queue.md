---
title: "更新の直列化と復旧"
sourceRevision: "04fa29373a7332571832d110c95c91ce905742829895c92dfdffcd1c43ac0a4b"
---
# 状態更新を直列化し、失われた確認応答から復旧する

レンダラーがDOM状態を非同期に読み取り、ネイティブへ更新を送る場合、`createNativeUpdateQueue`を使えます。イベントが集中しても、現在の状態を1回読み取り、次の読み取りが前の処理と重ならないようにします。このヘルパーは任意であり、ネイティブ登録や他の投影APIの動作を変えません。異なる更新間隔や復旧方針が必要な場合は、既存のスケジューラーを維持してください。キューは`requestAnimationFrame`で要求をまとめ、処理中に届いた要求は、その後の1回の処理を起動します。

たとえば、前のネイティブ更新がまだ確認応答を待っている間に、リサイズ、選択更新、DOM変更が同じフレームで届いたとします。重複する読み取りを開始せず、最新状態を読む処理を1回キューへ入れます。ブリッジの確認応答が失われた場合は、更新を再開する前に現在の状態を再調整します。購入、クリック、広告読み込みの再試行に、このキューを使ってはいけません。

```ts
import { createNativeUpdateQueue } from '@webview-native-ui/engine';

const updates = createNativeUpdateQueue(window, {
  async update(send) {
    const state = await renderer.readCurrentState();
    const reply = await send(
      () => renderer.sendState(state),
      (reply) => {
        if (reply.revision !== state.revision) throw new Error('Revision mismatch');
      },
    );
    if (reply) renderer.accept(state, reply);
  },
  retry: () => renderer.invalidateLastAcceptedState(),
  failed: (error) => renderer.stopAndRestoreFallback(error),
  reconnect: true,
});

// 既存のレイアウト・コンテンツ通知から:
updates.request();
// 既存の接続確認でネイティブのセッションとリビジョンを調整した後:
updates.reconnected();
// レンダラーの終了処理時:
updates.destroy();
```

`renderer`は連携側の既存コードです。`send`は置き換え可能な状態専用で、1回の更新処理内で順番に呼び出します。クリック、選択操作、購入、SDK要求には使いません。送信に失敗すると、その処理内の残りの送信を省略し、ペイロードを再送するのではなく、新しい状態を読む処理を1回要求します。それも失敗した場合、`reconnect: true`なら外部のハンドシェイクを待ち、指定がなければ最終的な失敗を通知します。無効な確認応答では、直ちに再調整待ちになります。再調整後の再試行が再び失敗するか、確認応答が無効なら、最終的な失敗になります。1回の更新処理がすべて成功すると、復旧の試行枠がリセットされます。キューは接続のポーリングや購読を追加しません。

操作のタイムアウトは転送層に残します。タイムアウトしても、実行中のネイティブ呼び出しは取り消されません。ネイティブレンダラーは古いリビジョンを拒否し、接続確認は復旧を宣言する前に現在の状態を再調整する必要があります。破棄すると、遅れた送信結果と今後の処理は抑制されますが、送信済みのネイティブ操作は取り消せません。`dirty`で古いDOM計測を拒否し、`running`で処理中の接続再調整を遅らせ、`waiting`で保留中の復旧を検出します。リビジョンの割り当て、受理したジオメトリ、フォールバック方針は、引き続きレンダラーが所有します。
