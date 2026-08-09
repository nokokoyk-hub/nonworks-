# LUMEN 追加導線 作業ダイジェスト 2026-08-09

作成: 2026-08-09 17:20 JST

## 目的

LUMEN単体でも作品の目的とNON WORKSの制作範囲が分かり、公式トップ・他作品・サイト制作相談へ迷わず移動できる状態にする。

## 反映

- 最新 `origin/main` から `codex/lumen-site-links-preview` を作成。
- LUMEN静的出力33ファイルを更新し、未使用NORDLYS画像13点は引き続き除外。
- ヘッダーへ `NON WORKS ↗` を追加。
- INFOへ作品概要、制作範囲、公式トップ、制作相談を追加。
- Informationへ作品説明、公式トップ、他作品、制作相談CTAを追加。
- 旧ダミーリンクを実URLへ置換。

## Git / Vercel

- 静的出力コミット: `e9311e4`
- PR: `https://github.com/nokokoyk-hub/nonworks-/pull/5`（Ready化・Squash merge済み）
- Vercel deployment: `dpl_7geat1gRTrcQqvogAxZ3CzXe8xZK`
- 状態: READY、GitHub Vercel status success
- Preview: `https://nonworks-git-codex-lumen-site-l-cde76e-kannari-norikos-projects.vercel.app/lumen/`

## 検証

- 必須文言・3種の外部リンクを静的HTMLで確認。
- HTMLが参照する `/lumen/` 配下10アセットの欠落0件。
- Preview 1280×720でH1、WebGL canvas 1点、INFO、Information、公式トップ遷移、横はみ出し0、ブラウザログ0件。
- 正確な375×812端末エミュレーションでOpening、INFO実クリック、Information 1カラム、CTA幅335px、横はみ出し0。
- のんがPreviewを受け入れ、PR #5のマージを承認。
- 本番コミット `13ff9ea`、Production `dpl_nXhCGBwnUoLnbR3LUyZGmHzB8beb` はREADY、`nonworks.online` alias反映済み。
- 本番1280×720でWebGL、SOUND OFF、INFO、Information、公式トップ帰還、制作相談からお問い合わせ入力欄まで確認。横はみ出し0、ブラウザログ0件。
- Vercelの直近1時間runtime error 0件。

## 残り

- 実機Mobile Safari / Android Chrome / reduced-motion / 低GPU端末の公開後確認。
- Lighthouse、OGP、404、Sitemapの公開後監査。
