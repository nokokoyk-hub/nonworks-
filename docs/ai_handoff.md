# AI Handoff

最終更新: 2026-08-05 21:35 JST

## 次回の開始地点

1. `git status -sb` と現在ブランチを確認する
2. `main` を `origin/main` へfast-forwardする
3. `docs/current_state.md` と `docs/north_star.md` を読む
4. `https://nonworks.online/` と `https://nonworks.online/nordlys/` の現行表示を確認する

NORDLYSはPR #1で公開済み。本番コミットは `3db5129`。

## NORDLYSの更新方法

NORDLYSはNext.jsの静的出力。ソース側で以下を行う。

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `out/` の中身をこのリポジトリの `nordlys/` へ同期
5. 公式トップからの導線と `/nordlys/` をローカル静的サーバーで確認

`basePath` と `assetPrefix` は `/nordlys`。ここを変えると画像・CSS・JSの配信パスが壊れるため、公開パス変更時以外は触らない。

現時点のNext.jsソースはローカル側のコミット `0ffdf6e` にあり、この公開リポジトリには静的出力だけが入っている。次の機能変更前に、ソースをGitHub上の永続的な正本へ移す方針を決めること。

## 注意

- NORDLYSは架空施設。フッターの `Fictional property — portfolio demonstration only.` を削除しない
- 予約フォームはデモで、外部送信処理を追加していない
- 公式トップのFormspreeフォームや法務ページは今回の変更対象外
- 本番画像13点、公式トップからの導線、横方向のはみ出し、ブラウザエラーを2026-08-05に確認済み
