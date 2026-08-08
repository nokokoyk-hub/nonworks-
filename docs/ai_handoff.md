# AI Handoff

最終更新: 2026-08-08 19:54 JST

## 次回の開始地点

1. `git status -sb` と現在ブランチを確認する
2. PR #3とVercel Previewの最新状態を確認する
3. `docs/current_state.md` と `docs/north_star.md` を読む
4. LUMENを本番へ統合する場合は、`main` とPreviewブランチの差分を再確認する

NORDLYSはPR #1で公開済み。本番コミットは `3db5129`。

LUMENは `codex/lumen-preview`、Draft PR #3でPreview確認済み。最新コミットは `36020d3`。サウンド改善と公式トップのLUMENカードまで反映済みで、まだ `main` へは統合していない。

## LUMENの更新方法

LUMENはNext.jsの静的出力。ソース側で以下を行う。

1. `npm run typecheck`
2. `npm run lint`
3. `npm run build`
4. `out/` からLUMENに必要なファイルをこのリポジトリの `lumen/` へ同期
5. `lumen/images/nordlys/` は旧NORDLYSの未使用画像なので公開物へ含めない
6. Vercel Previewの `/lumen/` でデスクトップ、モバイル、INDEX、INFO、SOUND、ブラウザログを確認
7. 公式トップのLUMENカードから `/lumen/` へ遷移し、SOUND ONがAudioContext running確認後に表示されることを確認

`basePath` と `assetPrefix` は `/lumen`。WebGLフォントの実URLは `/lumen/lumen/fonts/helvetiker_regular.typeface.json` なので、静的出力内の `lumen/lumen/` を誤って削除しない。

現時点のLUMEN Next.jsソースはローカル側のコミット `7af84ff` にあり、この公開リポジトリには静的出力だけが入っている。

音響改善のソースコミットは `f252e4d`。実スピーカーの聞こえ方は自動検証できないため、マージ前にのんが最新Previewで起動音とアンビエントを確認する。

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
