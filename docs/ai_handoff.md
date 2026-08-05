# AI Handoff

最終更新: 2026-08-05 21:06 JST

## 次回の開始地点

1. `git status -sb` と現在ブランチを確認する
2. `docs/current_state.md` と `docs/north_star.md` を読む
3. Vercel Previewで公式トップと `/nordlys/` の両方を確認する
4. のんの承認後にのみ `main` へ統合する

## NORDLYSの更新方法

NORDLYSはNext.jsの静的出力。ソース側で以下を行う。

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `out/` の中身をこのリポジトリの `nordlys/` へ同期
5. 公式トップからの導線と `/nordlys/` をローカル静的サーバーで確認

`basePath` と `assetPrefix` は `/nordlys`。ここを変えると画像・CSS・JSの配信パスが壊れるため、公開パス変更時以外は触らない。

## 注意

- NORDLYSは架空施設。フッターの `Fictional property — portfolio demonstration only.` を削除しない
- 予約フォームはデモで、外部送信処理を追加していない
- 公式トップのFormspreeフォームや法務ページは今回の変更対象外
