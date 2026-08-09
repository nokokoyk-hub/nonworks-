# AI Handoff

最終更新: 2026-08-09 17:20 JST

## 次回の開始地点

1. `git status -sb` と現在ブランチを確認する
2. 公式 `main`、PR #5、最新Vercel Productionの状態を確認する
3. `docs/current_state.md` と `docs/north_star.md` を読む
4. LUMENを更新する場合は、`main` と新しい `codex/` 作業ブランチの差分を再確認する

NORDLYSはPR #1で公開済み。本番コミットは `3db5129`。

LUMENはPR #3で初回公開後、作品説明・公式帰還・制作相談導線をPR #5でSquash mergeし、公式 `main` の `13ff9ea` として本番公開済み。最新Vercel ProductionはREADYで、WebGL、SOUND、INFO、Information、公式トップ帰還、制作相談からお問い合わせ入力欄まで確認した。

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

現時点のLUMEN Next.js追加導線ソースはローカル側の `43ead82`、Preview検証記録は `067d5af` にあり、この公開リポジトリには静的出力だけが入っている。

音響改善のソースコミットは `f252e4d`。実スピーカーの聞こえ方は自動検証できないため人間の試聴を受け入れ条件とし、2026-08-08にのんが最新Previewで起動音とアンビエントが聞こえることを確認済み。

初回本番コミット `a73993b` と初回検証済みPreviewのGit tree SHAは一致する。追加導線はPR #5のPreviewを375×812、Productionを1280×720で確認。実機Mobile Safari / Android Chromeは未検証。

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
- LUMEN Production deployment: `dpl_ZZq6jvRDP7xPJJS9GDDm9dJbCEp4`
- LUMEN Production URL: `https://nonworks.online/lumen/`
- LUMEN追加導線は公式リポ `e9311e4`、PR #5、Vercel Preview `dpl_7geat1gRTrcQqvogAxZ3CzXe8xZK` で検証済み
- のんの受け入れ後にPR #5をReady化・Squash mergeし、`13ff9ea` として本番公開済み
- Production `dpl_nXhCGBwnUoLnbR3LUyZGmHzB8beb` はREADY。本番ブラウザログ0件、Vercel直近1時間runtime error 0件

## LUMEN 追加導線の本番状況

- ブランチ: `codex/lumen-site-links-preview`
- PR: `https://github.com/nokokoyk-hub/nonworks-/pull/5`（Squash merge済み）
- Preview: `https://nonworks-git-codex-lumen-site-l-cde76e-kannari-norikos-projects.vercel.app/lumen/`
- Vercel: READY、GitHub status success
- 1280×720: Opening、INFO、Information、公式トップ遷移、WebGL canvas 1点、横はみ出し0、ブラウザログ0件
- 375×812: ヘッダー全操作、INFO実クリック、Information 1カラム、CTA幅335px、横はみ出し0
- 本番コミット: `13ff9ea`
- Production: `dpl_nXhCGBwnUoLnbR3LUyZGmHzB8beb`、READY、`nonworks.online` alias反映済み
- 次の候補: 実機Mobile Safari / Android Chrome / reduced-motion / 低GPU端末とLighthouseを追加確認する
